const test = require('node:test');
const assert = require('node:assert/strict');
const { createMicrosoftMailer } = require('../server/microsoft-mail.cjs');
const { createHandler } = require('../server/contact.cjs');
const env = {
  MAIL_PROVIDER: 'microsoft365',
  MICROSOFT_TENANT_ID: '11111111-1111-4111-8111-111111111111',
  MICROSOFT_CLIENT_ID: '22222222-2222-4222-8222-222222222222',
  MICROSOFT_MAILBOX_ID: '33333333-3333-4333-8333-333333333333',
  MICROSOFT_CLIENT_SECRET: 'test-only-secret-not-a-real-credential',
  CONTACT_FORM_SECRET: 'test-only-form-key-with-at-least-32-characters',
  NODE_ENV: 'production'
};
const mail = {
  from: { address: 'info@nijtec.nl' }, to: 'info@nijtec.nl',
  replyTo: { name: 'Élise & Bouw', address: 'klant@example.invalid' },
  subject: 'Nijtec: Productinformatie', text: 'Naam: Élise & Bouw\r\nBericht: <b>geen HTML</b>'
};
function setup({ settings = env, tokenStatus = 200, graphStatus = 202, tokenData, throwOn, fetchImpl } = {}) {
  const calls = []; let clock = 1000000;
  const fetcher = fetchImpl || (async (url, options) => {
    calls.push({url,options});
    if (throwOn && url.includes(throwOn)) throw new Error('Private response / access token');
    if (url.includes('login.microsoftonline.com')) return { ok: tokenStatus === 200, status: tokenStatus, json: async () => tokenData || { token_type: 'Bearer', expires_in: 3600, access_token: 'test-only-access-token' } };
    return {status:graphStatus};
  });
  const create = () => createMicrosoftMailer({env:settings,now:()=>clock,fetchImpl:fetcher});
  const handler = createHandler({ env:settings,now:()=>clock,fetchImpl:fetcher,createTransport(){throw new Error('Microsoft must never use Strato SMTP');} });
  async function request(method='GET',body,headers={}) {
    const res = {headers:{},setHeader(k,v){this.headers[k]=v;},end(value){this.body=JSON.parse(value);}};
    await handler({method,body,headers:{origin:'https://nijtec.nl','content-type':'application/json','x-vercel-forwarded-for':'192.0.2.20',...headers}},res);
    return res;
  }
  async function payload() {
    const config=await request(); clock+=3000;
    return {token:config.body.token,naam:'Élise & Bouw',bedrijf:'Testbedrijf',email:'klant@example.invalid',onderwerp:'Productinformatie',bericht:'Graag informatie over Quickbond.',website:''};
  }
  return {create,calls,request,payload,advance(ms){clock+=ms;}};
}

test('Microsoft credentials require valid tenant/client IDs and a separate app secret',async()=>{
  for(const changes of [{MICROSOFT_TENANT_ID:undefined},{MICROSOFT_TENANT_ID:'common'},{MICROSOFT_TENANT_ID:'../other'},{MICROSOFT_CLIENT_ID:'https://evil.example'},{MICROSOFT_MAILBOX_ID:undefined},{MICROSOFT_MAILBOX_ID:'other@example.invalid'},{MICROSOFT_CLIENT_SECRET:''}]) {
    const h=setup({settings:{...env,...changes}}),provider=h.create();
    assert.equal(provider.configured,false);
    assert.deepEqual((await h.request()).body,{enabled:false});
    await assert.rejects(provider.sendMail(mail));assert.equal(h.calls.length,0);
  }
});

test('Microsoft sends via fixed HTTPS OAuth and Graph endpoints, with only the customer as Reply-To',async()=>{
  const h=setup(),provider=h.create();
  assert.deepEqual(await provider.sendMail(mail),{accepted:['info@nijtec.nl']});
  assert.equal(h.calls.length,2);
  const [auth,send]=h.calls;
  assert.equal(auth.url,'https://login.microsoftonline.com/'+env.MICROSOFT_TENANT_ID+'/oauth2/v2.0/token');
  const credentials=new URLSearchParams(auth.options.body);
  assert.equal(credentials.get('client_id'),env.MICROSOFT_CLIENT_ID);
  assert.equal(credentials.get('client_secret'),env.MICROSOFT_CLIENT_SECRET);
  assert.equal(credentials.get('scope'),'https://graph.microsoft.com/.default');
  assert.equal(credentials.get('grant_type'),'client_credentials');
  assert.equal(send.url,'https://graph.microsoft.com/v1.0/users/'+env.MICROSOFT_MAILBOX_ID+'/sendMail');
  assert.equal(send.options.headers.Authorization,'Bearer test-only-access-token');
  const body=JSON.parse(send.options.body);
  assert.deepEqual(body.message.toRecipients,[{emailAddress:{address:'info@nijtec.nl'}}]);
  assert.equal(body.message.from.emailAddress.address,'info@nijtec.nl');
  assert.equal(body.message.replyTo[0].emailAddress.address,mail.replyTo.address);
  assert.equal(body.message.body.contentType,'Text');assert.equal(body.message.body.content,mail.text);
  assert.equal(body.saveToSentItems,true);assert.equal(body.message.attachments,undefined);
  for(const call of h.calls){assert.equal(call.options.redirect,'error');assert.equal(call.options.cache,'no-store');assert.ok(call.options.signal instanceof AbortSignal);}
});

test('Microsoft adapter refuses other recipients or senders before any network call',async()=>{
  const h=setup(),provider=h.create();
  await assert.rejects(provider.sendMail({...mail,to:'other@example.invalid'}));
  await assert.rejects(provider.sendMail({...mail,from:{address:'other@example.invalid'}}));
  assert.equal(h.calls.length,0);
});

test('Microsoft token is cached only in memory, refreshed before expiry and shared by concurrent requests',async()=>{
  const h=setup(),provider=h.create();
  await Promise.all([provider.sendMail(mail),provider.sendMail(mail)]);
  assert.equal(h.calls.filter(c=>c.url.includes('/token')).length,1);
  h.advance(3541*1000);await provider.sendMail(mail);
  assert.equal(h.calls.filter(c=>c.url.includes('/token')).length,2);
});

test('Microsoft auth failure and malformed tokens cannot trigger sendMail',async()=>{
  for(const options of [{tokenStatus:401},{tokenData:{access_token:'token',token_type:'Bearer',expires_in:30}},{tokenData:{access_token:'token\r\nheader',token_type:'Bearer',expires_in:3600}},{throwOn:'login.microsoftonline.com'}]){
    const h=setup(options);await assert.rejects(h.create().sendMail(mail));
    assert.ok(h.calls.every(c=>!c.url.includes('graph.microsoft.com/v1.0')));
  }
});

test('Microsoft accepts only 202 and never automatically retries a send or timeout',async()=>{
  for(const options of [{graphStatus:200},{graphStatus:401},{graphStatus:403},{graphStatus:429},{graphStatus:500},{throwOn:'graph.microsoft.com/v1.0'}]){
    const h=setup(options),response=await h.request('POST',await h.payload());
    assert.equal(response.statusCode,502);assert.deepEqual(response.body,{code:'SEND_FAILED'});
    assert.equal(h.calls.filter(c=>c.url.includes('/sendMail')).length,1);
    assert.ok(!JSON.stringify(response.body).includes('Private'));
  }
});

test('Microsoft form route preserves validation, origin, token, duplicate and rate-limit protection',async()=>{
  const h=setup(),input=await h.payload();
  assert.equal((await h.request('POST',input,{origin:'https://evil.example'})).statusCode,403);
  assert.equal((await h.request('POST',{...input,email:'a@example.invalid\r\nBcc: other@example.invalid'})).statusCode,400);
  assert.equal((await h.request('POST',{...input,website:'bot.example'})).statusCode,400);
  assert.equal(h.calls.length,0);
  assert.equal((await h.request('POST',{...input,to:'other@example.invalid',from:'other@example.invalid'})).statusCode,200);
  assert.equal((await h.request('POST',input)).statusCode,400);
  for(let i=0;i<2;i++)assert.equal((await h.request('POST',await h.payload())).statusCode,200);
  assert.equal((await h.request('POST',await h.payload())).statusCode,429);
  const sent=h.calls.filter(c=>c.url.includes('/sendMail'));
  assert.equal(sent.length,3);
  assert.equal(JSON.parse(sent[0].options.body).message.toRecipients[0].emailAddress.address,'info@nijtec.nl');
});

test('Microsoft sending stays disabled in Vercel preview/development and with no form secret',async()=>{
  for(const changes of [{VERCEL:'1',VERCEL_ENV:'preview'},{VERCEL:'1',VERCEL_ENV:'development'},{CONTACT_FORM_SECRET:''}]){
    const h=setup({settings:{...env,...changes}});
    assert.deepEqual((await h.request()).body,{enabled:false});
    assert.equal((await h.request('POST',{})).statusCode,503);assert.equal(h.calls.length,0);
  }
});

test('Microsoft send is awaited before the handler reports server acceptance, without exposing secrets',async()=>{
  let resolveSend,sendStarted;
  const started=new Promise(resolve=>{sendStarted=resolve;});
  const h=setup({fetchImpl:async url=>url.includes('/token')?{ok:true,json:async()=>({access_token:'test-only-access-token',token_type:'Bearer',expires_in:3600})}:new Promise(resolve=>{resolveSend=resolve;sendStarted();})});
  let completed=false;
  const pending=h.request('POST',await h.payload()).then(response=>{completed=true;return response;});
  await started;assert.equal(completed,false);
  resolveSend({status:202});const response=await pending;
  assert.deepEqual(response.body,{ok:true});
  for(const secret of [env.MICROSOFT_CLIENT_SECRET,'test-only-access-token'])assert.ok(!JSON.stringify(response.body).includes(secret));
});

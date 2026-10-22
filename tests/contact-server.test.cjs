const test = require('node:test');
const assert = require('node:assert/strict');
const { createHandler } = require('../server/contact.cjs');

function setup({ configured = true, result = { accepted: ['info@nijtec.nl'] }, fails = false } = {}) {
  let clock = 1000000;
  const sent = [], transports = [];
  const handler = createHandler({
    env: configured ? { SMTP_PASS: 'not-a-real-password', CONTACT_FORM_SECRET: 'test-only-form-signing-key-with-32-plus-characters', NODE_ENV: 'production' } : {},
    now: () => clock,
    createTransport(options) {
      transports.push(options);
      return { async sendMail(mail) { sent.push(mail); if(fails) throw new Error('Private SMTP details'); return result; } };
    }
  });
  async function request(method = 'GET', body, headers = {}) {
    const response = { statusCode: 0, headers: {}, setHeader(k,v) { this.headers[k]=v; }, end(body) { this.body=JSON.parse(body); this.ended=true; } };
    await handler({method,body,headers:{origin:'https://nijtec.nl','content-type':'application/json','x-vercel-forwarded-for':'192.0.2.10',...headers}},response);
    return response;
  }
  async function payload() {
    const response=await request(); clock+=3000;
    return {token:response.body.token,naam:'Élise & Bouw',bedrijf:'Testbedrijf',email:'klant@example.invalid',onderwerp:'Bestelling aanvragen',bericht:'Quickbond: 10 kokers. Prijs & levering?',website:''};
  }
  return {request,payload,sent,transports,advance(ms){clock+=ms;}};
}

test('unconfigured server advertises fallback and cannot send', async()=>{
  const h=setup({configured:false});
  assert.deepEqual((await h.request()).body,{enabled:false});
  assert.equal((await h.request('POST',{})).statusCode,503);
  assert.equal(h.sent.length,0);
});

test('Strato send uses verified TLS, fixed recipient and sender; client email is Reply-To only', async()=>{
  const h=setup(),body=await h.payload();
  const response=await h.request('POST',{...body,to:'attacker@example.invalid',from:'attacker@example.invalid'});
  assert.equal(response.statusCode,200); assert.deepEqual(response.body,{ok:true});
  const mail=h.sent[0],smtp=h.transports[0];
  assert.equal(smtp.host,'smtp.strato.com'); assert.equal(smtp.port,465); assert.equal(smtp.secure,true);
  assert.equal(smtp.tls.rejectUnauthorized,true);
  assert.equal(smtp.disableFileAccess,true); assert.equal(smtp.disableUrlAccess,true);
  assert.equal(mail.from.address,'info@nijtec.nl'); assert.equal(mail.to,'info@nijtec.nl');
  assert.equal(mail.replyTo.address,body.email); assert.equal(mail.html,undefined);
  for(const key of ['naam','bedrijf','email','bericht']) assert.ok(mail.text.includes(body[key]));
  assert.ok(!JSON.stringify(response).includes('not-a-real-password'));
  assert.equal(response.headers['Cache-Control'],'no-store');
});

test('cross-origin, absent origin, wrong method/content type and oversized body are rejected',async()=>{
  const h=setup(),body=await h.payload();
  assert.equal((await h.request('POST',body,{origin:'https://evil.example'})).statusCode,403);
  assert.equal((await h.request('POST',body,{origin:undefined})).statusCode,403);
  assert.equal((await h.request('DELETE')).statusCode,405);
  assert.equal((await h.request('POST',body,{'content-type':'text/plain'})).statusCode,415);
  assert.equal((await h.request('POST',body,{'content-length':'25000'})).statusCode,413);
  assert.equal((await h.request('POST',{...body,bericht:'x'.repeat(25000)})).statusCode,413);
  assert.equal(h.sent.length,0);
});

test('invalid fields, spam trap and mail header injection cannot send',async()=>{
  const h=setup(),body=await h.payload();
  for(const changes of [{naam:' '},{naam:'Name\r\nBcc: victim@example.invalid'},{email:'a@example.invalid,b@example.invalid'},{email:'a@example.invalid\r\nBcc:b@example.invalid'},{onderwerp:'arbitrary'},{bericht:''},{bericht:'x'.repeat(6001)},{website:'spam.example'},{bedrijf:42}]) {
    assert.equal((await h.request('POST',{...body,...changes})).statusCode,400);
  }
  assert.equal(h.sent.length,0);
});

test('signed form token is required, bound to requester, time-limited and single-use',async()=>{
  const h=setup(),body=await h.payload();
  assert.equal((await h.request('POST',{...body,token:'tampered'})).statusCode,400);
  assert.equal((await h.request('POST',{...body,token:body.token.split('.')[0]+'.'+'é'.repeat(43)})).statusCode,400);
  assert.equal((await h.request('POST',body,{'x-vercel-forwarded-for':'192.0.2.11'})).statusCode,400);
  assert.equal((await h.request('POST',body)).statusCode,200);
  assert.equal((await h.request('POST',body)).statusCode,400);
  const expired=await h.payload();h.advance(31*60*1000);
  assert.equal((await h.request('POST',expired)).statusCode,400);
  assert.equal(h.sent.length,1);
});

test('warm-instance rate limit stops fourth send and allows later window',async()=>{
  const h=setup();
  for(let i=0;i<3;i++) assert.equal((await h.request('POST',await h.payload())).statusCode,200);
  const limited=await h.request('POST',await h.payload());
  assert.equal(limited.statusCode,429);assert.equal(limited.headers['Retry-After'],'900');
  h.advance(16*60*1000);
  assert.equal((await h.request('POST',await h.payload())).statusCode,200);
});

test('SMTP failure or rejected recipient never returns success or private server detail',async()=>{
  for(const options of [{fails:true},{result:{accepted:[]}}]) {
    const h=setup(options),response=await h.request('POST',await h.payload());
    assert.equal(response.statusCode,502);assert.deepEqual(response.body,{code:'SEND_FAILED'});
    assert.ok(!JSON.stringify(response.body).includes('Private'));
  }
});

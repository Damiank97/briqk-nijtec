const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'analytics.js'),'utf8').replace(/^import[^\n]+\n/,'');
const publicConfig=require('../seo/analytics-config.cjs');

function harness({url='https://www.nijtec.nl/contact/',canonical='https://nijtec.nl/contact/',dnt,windowDnt,gpc=false}={}){
  const calls=[],node={dataset:{}};
  const context={
    window:{location:new URL(url),doNotTrack:windowDnt},
    navigator:{doNotTrack:dnt,globalPrivacyControl:gpc},URL,Set,
    document:{getElementById:id=>id==='nijtec-analytics'?node:{textContent:'{"analytics":{}}'},querySelector:()=>({href:canonical})},
    inject:(...args)=>calls.push(args)
  };
  const run=()=>vm.runInNewContext(source,context);
  run();return{calls,node,run};
}

test('analytics is limited to HTTPS production domains, not localhost, preview or another site',()=>{
  for(const url of ['http://127.0.0.1:4173/','http://nijtec.nl/','https://briqk-nijtec.vercel.app/','https://preview.example/'])assert.equal(harness({url}).calls.length,0,url);
  assert.equal(harness().calls.length,1);
  assert.equal(harness({url:'https://nijtec.nl/contact/'}).calls.length,1);
});

test('browser privacy opt-outs prevent the tracker from starting',()=>{
  for(const options of [{dnt:'1'},{dnt:'yes'},{windowDnt:'1'},{gpc:true}])assert.equal(harness(options).calls.length,0);
});

test('pageview URLs are canonical and contain no query or fragment data',()=>{
  const h=harness(),before=h.calls[0][0].beforeSend;
  const result=before({type:'pageview',url:'https://www.nijtec.nl/contact/?email=private%40example.invalid&token=secret#private-name',data:{email:'private@example.invalid'}});
  assert.equal(JSON.stringify(result),JSON.stringify({type:'pageview',url:'https://nijtec.nl/contact/'}));
  assert.equal(before({type:'event',url:'https://www.nijtec.nl/contact/',name:'Form',data:{message:'private'}}),null);
  assert.equal(before({type:'pageview',url:'https://evil.example/contact/'}),null);
  assert.equal(before({type:'pageview',url:'https://www.nijtec.nl/private/customer-123/'}),null);
  assert.equal(before({type:'pageview',url:'not a URL'}),null);
});

test('the analytics bootstrap does not initialize twice',()=>{
  const h=harness();h.run();assert.equal(h.calls.length,1);
});

test('only public same-origin Vercel intake paths enter build configuration',()=>{
  const data=JSON.parse(publicConfig(JSON.stringify({analytics:{scriptSrc:'/abc/script.js',viewEndpoint:'/abc/view',eventEndpoint:'https://external.example/track',sessionEndpoint:'//external.example/session',secret:'NEVER-PUBLISH'},SMTP_PASS:'NEVER-PUBLISH'})));
  assert.deepEqual(data,{analytics:{scriptSrc:'/abc/script.js',viewEndpoint:'/abc/view'}});
  assert.deepEqual(JSON.parse(publicConfig('not-json')),{analytics:{}});
  assert.ok(!publicConfig('{"analytics":{"scriptSrc":"/../private","secret":"NEVER-PUBLISH"}}').includes('NEVER-PUBLISH'));
});

test('all generated pages load the official locally pinned SDK and disclose statistics',()=>{
  assert.equal(require('../package.json').dependencies['@vercel/analytics'],'2.0.1');
  assert.ok(fs.existsSync(path.join(root,'dist/assets/vendor/vercel-analytics.js')));
  for(const route of ['/',...require('../seo/pages.cjs').map(p=>p.path)]){
    const html=fs.readFileSync(path.join(root,'dist',route,'index.html'),'utf8');
    assert.equal((html.match(/id="nijtec-analytics"/g)||[]).length,1,route);
    assert.ok(html.includes('src="/analytics.js?v=1"'),route);
    assert.ok(html.includes('id="analytics-config"'),route);
    assert.ok(html.includes('<summary>Bezoekersstatistieken</summary>'),route);
  }
  assert.equal(require('../vercel.json').headers.flatMap(rule=>rule.headers).find(header=>header.key==='Referrer-Policy').value,'strict-origin');
});

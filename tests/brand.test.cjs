const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
test('Product-brand logo remains byte-identical in source and deploy output',()=>{
 for(const folder of ['','dist']){
  const data=fs.readFileSync(path.join(root,folder,'assets/nijtec-logo-nav.png'));
  assert.equal(crypto.createHash('sha256').update(data).digest('hex'),'0204ee7d364bb1baf466c42a8953a4d576848c35ccf1f977e5923016cdff71ef');
  assert.equal(data.readUInt32BE(16),512);
  assert.equal(data.readUInt32BE(20),341);
 }
});
test('Every generated page uses the original logo without a separate contrast plate',()=>{
 const routes=['/',...require('../seo/pages.cjs').map(p=>p.path)];
 for(const route of routes){
  const html=fs.readFileSync(path.join(root,'dist',route,'index.html'),'utf8');
  assert.ok(html.includes('<span class="nav-logo-frame"><img src="/assets/nijtec-logo-nav.png"'),route);
  assert.ok(!html.includes('nav-logo-plate'),route);
 }
});

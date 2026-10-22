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

test('Square light favicon embeds unchanged transparent artwork without external requests',()=>{
 const svg=fs.readFileSync(path.join(root,'dist/assets/favicon.svg'),'utf8');
 assert.match(svg,/width="64" height="64" viewBox="0 0 64 64"/);
 assert.ok(svg.includes('<rect width="64" height="64" fill="'+require('../NIJTEC-DESIGN-TOKENS.json').color.paperLight+'"/>'));
 assert.match(svg,/preserveAspectRatio="xMidYMid meet"/);
 const embedded=Buffer.from(svg.match(/href="data:image\/png;base64,([^"]+)"/)[1],'base64');
 assert.deepEqual(embedded,fs.readFileSync(path.join(root,'assets/nijtec-logo-nav.png')));
 assert.doesNotMatch(svg,/<script|<foreignObject|onload=|href="https?:|filter=/i);
});

test('All generated pages use the new cache-keyed SVG tab icon',()=>{
 for(const route of ['/',...require('../seo/pages.cjs').map(p=>p.path)]){
  const html=fs.readFileSync(path.join(root,'dist',route,'index.html'),'utf8');
  assert.match(html,/<link rel="icon" href="\/assets\/favicon.svg\?v=1" type="image\/svg\+xml" sizes="any">/);
  assert.doesNotMatch(html,/<link rel="icon" href="\/NijTec_logo.png"/);
 }
});

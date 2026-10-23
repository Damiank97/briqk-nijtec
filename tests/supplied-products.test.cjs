const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
const featured=require('../seo/featured-products.cjs');
const supplied=require('../seo/supplied-assets.cjs');
const pages=require('../seo/pages.cjs'),config=require('../vercel.json');
const html=route=>fs.readFileSync(path.join(dist,route,'index.html'),'utf8');

test('all five supplied files are unchanged, correctly identified originals in source and deploy output',()=>{
 for(const item of supplied){
  for(const base of [root,dist]){
   const bytes=fs.readFileSync(path.join(base,item.path));
   assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256,item.path);
   if(item.width){assert.equal(bytes.readUInt32BE(16),item.width);assert.equal(bytes.readUInt32BE(20),item.height);}
   else assert.equal(bytes.subarray(0,5).toString(),'%PDF-');
  }
 }
});

test('owner-confirmed 478, 479 and 720 content is visible crawlable text with correct photos and product sheets',()=>{
 const pu=html('/producten/vullende-lijmende-pu-schuimen/'),anker=html('/producten/chemisch-anker/');
 for(const product of Object.values(featured)){
  const page=product===featured.anchor?anker:pu;
  for(const text of [product.name,product.src,product.description,...product.features])assert.ok(page.includes(text),text);
  if(product.document)assert.ok(page.includes('href="'+product.document.src+'"'));
 }
 assert.match(pu,/watervaste polyurethaanlijm/);assert.match(pu,/Niet UV-bestendig/);
 assert.ok(pu.includes('Nijtec is de enige dealer van Seal-it 479 PU-Foam Gun Black in Noord-Nederland.'));
 assert.doesNotMatch(pu,/<a class="modal-photo-link"[^>]*target="_blank"/);
 assert.match(anker,/ETA 19\/0799/);assert.match(anker,/Niet geschikt voor constante waterbelasting/);
 assert.doesNotMatch(anker,/Instelbare verwerkingstijd|Diverse mengverhoudingen|Marine toepassingen/);
 const home=html('/');assert.match(home,/een selectie uit ons assortiment/);
 assert.match(home,/data-modal="anker"/);assert.doesNotMatch(home,/data-modal="2comp"|2-component lijmen|2-comp lijmen/);
});

test('old category moves once to canonical chemical anchor page and its former product image is unpublished',()=>{
 assert.ok(!pages.some(p=>p.path==='/producten/2-componenten-lijmen/'));
 assert.ok(!fs.existsSync(path.join(dist,'producten/2-componenten-lijmen')));
 assert.ok(config.redirects.some(r=>r.source==='/producten/2-componenten-lijmen'&&r.destination==='/producten/chemisch-anker/'&&r.permanent));
 assert.ok(config.redirects.some(r=>r.source==='/producten/2-componenten-lijmen/'&&r.destination==='/producten/chemisch-anker/'&&r.permanent));
 assert.ok(!fs.existsSync(path.join(dist,'wp-content/uploads/2023/10/poxyfix.png')));
 assert.ok(!config.redirects.some(r=>/poxyfix/i.test(r.source+r.destination)));
 const xml=fs.readFileSync(path.join(dist,'sitemap.xml'),'utf8');
 assert.match(xml,/<loc>https:\/\/nijtec.nl\/producten\/chemisch-anker\/<\/loc>/);
 assert.doesNotMatch(xml,/2-componenten-lijmen|poxyfix/);
 for(const p of Object.values(featured))assert.ok(xml.includes(p.src));
});

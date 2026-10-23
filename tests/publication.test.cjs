const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
const policy=require('../seo/publication-policy.cjs');
const inventory=require('../seo/legacy-inventory.json');
const pages=require('../seo/pages.cjs');
const config=require('../vercel.json');
const forbidden=/zettex|zetex|zwaluw|den[ -]braven|luchtdicht|elastic-gunfoam|compressband|butylband/i;

test('retired category, competitor originals and every known alias are absent from the public build and redirects',()=>{
  assert.equal(pages.length+1,17);
  for(const route of policy.retiredRoutes)assert.ok(!fs.existsSync(path.join(dist,route)),route);
  for(const original of inventory.media.filter(m=>policy.excludedPaths.includes(m.path))){
    for(const url of [original.path,...original.variants,original.attachment]){
      assert.ok(!fs.existsSync(path.join(dist,url)),url);
      assert.ok(!config.redirects.some(r=>r.source===url.replace(/\/$/,'')||r.source===url||r.destination===url),url);
    }
  }
  for(const route of ['/',...pages.map(p=>p.path)])assert.doesNotMatch(fs.readFileSync(path.join(dist,route,'index.html'),'utf8'),forbidden,route);
  for(const name of ['sitemap.xml','robots.txt','contact.js','motion.js','quickbond-viewer.js'])assert.doesNotMatch(fs.readFileSync(path.join(dist,name),'utf8'),forbidden,name);
  assert.doesNotMatch(JSON.stringify(config),forbidden);
});

test('historical records remain private and new unreviewed imports fail closed',()=>{
  assert.equal(inventory.pages.length,17);
  assert.equal(inventory.media.length,108);
  assert.equal(policy.publishedMedia(inventory).length,104);
  for(const name of ['seo','legacy-assets','tests','__qa'])assert.ok(!fs.existsSync(path.join(dist,name)),name);
  assert.throws(()=>policy.publishedMedia({media:[...inventory.media,{path:'/wp-content/uploads/2023/10/new-unreviewed.png'}]}),/Media review required/);
  assert.throws(()=>policy.publishedMedia({media:[{...inventory.media[0],source:'https://other.example/image.png'}]}),/Unexpected original media path/);
});

test('published popup data only uses approved originals and remaining index numbering is sequential',()=>{
  const media=require('../seo/product-media.cjs');
  const approved=new Set(policy.publishedMedia(inventory).map(m=>m.path));
  for(const image of Object.values(media).flat())assert.ok(approved.has(image.src),image.src);
  const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  const numbers=[...html.matchAll(/class="product-card-icon">(\d{2}) \/ /g)].map(m=>m[1]);
  assert.deepEqual(numbers,['01','02','03','04','05','06','07']);
  assert.match(html,/acrylaten:\{icon:'07'/);
});

const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const pages=require('../seo/pages.cjs');
const media=require('../seo/product-media.cjs');
const inventory=require('../seo/legacy-inventory.json');
const htmlFor=route=>fs.readFileSync(path.join(root,'dist',route,'index.html'),'utf8');
const section=(html,id)=>html.match(new RegExp('<section[^>]*id="'+id+'"[^>]*>[\\s\\S]*?<\\/section>'))?.[0];

test('all 17 contact sections show the supplied VAT number directly after KvK',()=>{
  for(const route of ['/',...pages.map(p=>p.path)]){
    const html=htmlFor(route),contact=section(html,'contact');
    assert.match(contact,/KvK<\/div><div>95043780<\/div><\/div>\s*<div class="contact-item"><div class="contact-item-icon">BTW<\/div><div>NL866979001\.B01<\/div>/,route);
    const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
    assert.equal(graph.find(x=>x['@type']==='LocalBusiness').vatID,'NL866979001.B01');
  }
});

test('home and existing about URL share the factual company story and contact person',()=>{
  const home=htmlFor('/'),about=section(home,'over-nijtec');
  assert.ok(about);
  for(const text of ['Over Nijtec','Dalen','Nijtec Montage Team','André Nijhof','technisch advies']) assert.ok(about.includes(text),text);
  assert.ok(home.indexOf('id="projecten"')<home.indexOf('id="over-nijtec"'));
  assert.ok(home.indexOf('id="over-nijtec"')<home.indexOf('id="contact"'));
  assert.ok(htmlFor('/over-ons/').includes(about));
  assert.ok(home.includes('href="#over-nijtec">Over Nijtec</a>'));
  assert.ok(htmlFor('/over-ons/').includes('href="/over-ons/">Over Nijtec</a>'));
});

test('all eight popup categories use original preserved media and accurate dimensions',()=>{
  assert.deepEqual(Object.keys(media),['lijmen','kitten','pu','coatings','2comp','steenstrips','luchtdicht','acrylaten']);
  let count=0;
  for(const photos of Object.values(media)){
    assert.ok(photos.length);
    for(const photo of photos){
      count++;
      const original=inventory.media.find(m=>m.path===photo.src);
      assert.ok(original,photo.src);
      assert.equal(original.width,photo.width);assert.equal(original.height,photo.height);
      assert.ok(fs.statSync(path.join(root,'dist',photo.src)).size>0);
      assert.ok(photo.name.length>6);
    }
  }
  assert.equal(count,14);
  assert.ok(media.lijmen.find(photo=>photo.src.endsWith('super-all-360.png')).name.includes('350'));
});

test('all generated pages carry the same popup photo data',()=>{
  for(const route of ['/',...pages.map(p=>p.path)]){
    const html=htmlFor(route);
    const data=html.match(/<script type="application\/json" id="product-media-data">([\s\S]*?)<\/script>/);
    assert.ok(data,route);
    assert.deepEqual(JSON.parse(data[1]),media,route);
    assert.ok(html.includes('id="modal-gallery"'),route);
  }
});

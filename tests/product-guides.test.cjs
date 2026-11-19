const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const pages=require('../seo/pages.cjs');
const html=route=>fs.readFileSync(path.join(__dirname,'../dist',route,'index.html'),'utf8');

test('guides enrich the existing product URLs in static HTML, without new search-only pages',()=>{
  assert.equal(pages.length+1,17);
  for(const route of ['/producten/quickbond/','/producten/chemisch-anker/']){
    const page=html(route),guide=page.match(/<article class="detail-copy product-guide"[\s\S]*?<\/article>/)?.[0];
    assert.ok(guide,route);
    assert.ok(guide.includes('href="#contact" data-inquiry='));
    assert.ok(page.indexOf(guide)<page.indexOf('<section class="contact"'));
    assert.doesNotMatch(guide,/FAQPage|veelgestelde|klanten vragen|Zettex|Hercuseal|—/i);
  }
});

test('Quickbond explains application limits and links readers to real projects and the existing article',()=>{
  const guide=pages.find(p=>p.path==='/producten/quickbond/').guide;
  assert.match(guide,/href="\/projecten\/"/);
  assert.match(guide,/href="\/blog\/quickbond-gevelbeplating-verlijmen\/"/);
  assert.match(guide,/verwerkingsinstructie/);
  assert.match(guide,/kokers, worsten van 600 ml en vaten van 200 kg/);
  assert.doesNotMatch(guide,/\b\d+ (minuten|uur)\b|voor iedere ondergrond/i);
});

test('anchor guide distinguishes polyester from epoxy and links curing times to the unchanged technical sheet',()=>{
  const guide=pages.find(p=>p.path==='/producten/chemisch-anker/').guide;
  for(const term of ['ankerlijm','verankeringslijm','styreenvrije polyesterhars','statische mixer','temperatuur van het basismateriaal','pas na volledige uitharding'])assert.ok(guide.includes(term),term);
  assert.match(guide,/Seal-it 720 Chem-Fix is een polyesteranker/);
  assert.match(guide,/href="\/assets\/documents\/seal-it-720-chem-fix.pdf"/);
  assert.doesNotMatch(guide,/\b\d+ (minuten|uur|kg)\b/);
});

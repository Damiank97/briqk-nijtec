const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const page=require('../seo/quickbond-article.cjs');
const read=route=>fs.readFileSync(path.join(__dirname,'../dist',route,'index.html'),'utf8');
test('Quickbond article is crawlable HTML with honest organization attribution and article metadata',()=>{
  const html=read(page.path);
  assert.ok(html.includes(require('../seo/responsive-images.cjs').optimizeHtml(page.article.html)));assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.ok(html.includes('href="https://nijtec.nl'+page.path+'"'));assert.ok(html.includes('property="og:type" content="article"'));
  const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  const article=graph.find(x=>x['@type']==='BlogPosting');assert.ok(article);
  assert.equal(article.author.name,'Nijtec B.V.');assert.equal(article.author['@type'],'Organization');
  assert.equal(article.datePublished,'2026-10-23');assert.equal(article.headline,page.title);
  assert.ok(!article.reviewedBy&&!article.aggregateRating&&!article.review);
});
test('Article is reachable from homepage, product page, footer and sitemap without replacing old URLs',()=>{
  for(const route of ['/','/producten/quickbond/'])assert.ok(read(route).includes('class="qb-article-link" href="'+page.path+'"'));
  for(const route of ['/',...require('../seo/pages.cjs').map(p=>p.path)])assert.ok(read(route).includes('href="'+page.path+'"'));
  assert.ok(fs.readFileSync(path.join(__dirname,'../dist/sitemap.xml'),'utf8').includes('<loc>https://nijtec.nl'+page.path+'</loc>'));
});
test('Article uses the real project image, factual scope and advice CTA rather than invented client questions',()=>{
  const article=page.article.html;
  assert.match(article,/width="1600" height="1200"/);assert.ok(article.includes('href="#contact"'));
  for(const text of ['Quickbond','HDPL','600 ml','verwerkingsinstructie','geen bijlagefunctie','geen montagevoorschrift'])assert.ok(article.includes(text),text);
  assert.doesNotMatch(article,/klanten vragen|veelgestelde|klant vertelt|beoordeeld door André|\b24 uur\b|\b48 uur\b|—/i);
});

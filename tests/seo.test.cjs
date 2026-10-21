const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const dist=path.join(root,'dist');
const inventory=require('../seo/legacy-inventory.json');
const config=require('../vercel.json');
const pages=require('../seo/pages.cjs');
const htmlFor=route=>fs.readFileSync(path.join(dist,route,'index.html'),'utf8');
const exists=url=>{const p=new URL(url,'https://nijtec.nl').pathname;return fs.existsSync(path.join(dist,p))||fs.existsSync(path.join(dist,p,'index.html'));};
test('All 17 meaningful original page addresses have real, uniquely titled HTML',()=>{
 const titles=[];
 assert.equal(inventory.pages.length,17);
 for(const page of inventory.pages){
  const html=htmlFor(page.path);
  assert.equal((html.match(/<h1\b/g)||[]).length,1,page.path);
  assert.match(html,/<html lang="nl">/);
  assert.ok(html.includes('rel="canonical" href="https://nijtec.nl'+page.path+'"'),page.path);
  assert.ok(!html.includes('name="robots" content="noindex'),page.path);
  titles.push(html.match(/<title>(.*?)<\/title>/)[1]);
 }
 assert.equal(new Set(titles).size,17);
});
test('Generated static pages have usable internal links, anchors, media and structured data',()=>{
 for(const route of ['/',...pages.map(p=>p.path)]){
  const html=htmlFor(route);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size,route+' duplicate IDs');
  for(const [,href] of html.matchAll(/(?:href|src)="([^"<>]*)"/g)){
   if(!href||/^(?:mailto:|tel:|https?:|data:)/.test(href))continue;
   const url=new URL(href,'https://nijtec.nl'+route);
   if(url.pathname===route&&url.hash)assert.ok(ids.includes(url.hash.slice(1)),route+' '+href);
   else if(href.startsWith('/'))assert.ok(exists(url.href),route+' '+href);
  }
  const scripts=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length,1,route);
  const graph=JSON.parse(scripts[0][1])['@graph'];
  const business=graph.find(x=>x['@type']==='LocalBusiness');
  assert.equal(business.telephone,'+31615588843');
  assert.equal(business.address.addressLocality,'Dalen');
  assert.equal(business.address.postalCode,'7751 DN');
  assert.ok(!business.aggregateRating&&!business.openingHours);
  if(route!=='/')assert.ok(graph.find(x=>x['@type']==='BreadcrumbList'));
 }
});
test('108 original image URLs exist; every variant/attachment redirect resolves without chains',()=>{
 assert.equal(inventory.media.length,108);
 const redirects=config.redirects.filter(r=>!r.has);
 const sources=new Set(redirects.map(r=>r.source));
 assert.equal(sources.size,redirects.length);
 for(const m of inventory.media){
  assert.ok(exists(m.path),m.path);
  assert.ok(fs.statSync(path.join(dist,m.path)).size>0);
  for(const v of m.variants)assert.ok(redirects.some(r=>r.source===v&&r.destination===m.path),v);
 }
 for(const redirect of redirects){
  assert.equal(redirect.permanent,true);
  assert.ok(!sources.has(redirect.destination.replace(/\/$/,'')),redirect.source+' redirect chain');
  assert.ok(exists(redirect.destination),redirect.destination);
 }
});
test('Sitemap covers the real pages and images, and robots exposes only the production sitemap',()=>{
 const xml=fs.readFileSync(path.join(dist,'sitemap.xml'),'utf8');
 assert.equal((xml.match(/<url>/g)||[]).length,17);
 for(const p of inventory.pages)assert.ok(xml.includes('<loc>https://nijtec.nl'+p.path+'</loc>'));
 for(const m of inventory.media)assert.ok(xml.includes('https://nijtec.nl'+m.path));
 const robots=fs.readFileSync(path.join(dist,'robots.txt'),'utf8');
 assert.match(robots,/Sitemap: https:\/\/nijtec.nl\/sitemap.xml/);
 assert.ok(!robots.includes('Disallow: /\n'));
});
test('Published legal page and homepage accordion retain all 20 original articles',()=>{
 const legal=require('../seo/legacy-terms.json');
 assert.equal(legal.articles.length,20);
 assert.ok(htmlFor('/algemene-voorwaarden/').includes(legal.html));
 const homepage=htmlFor('/');
 for(const article of legal.articles)assert.ok(homepage.includes(JSON.stringify(article.title).slice(1,-1)),article.title);
 assert.ok(!legal.html.match(/<(script|iframe|style)\b/i));
});
test('Vercel preview hosts cannot be indexed; production remains indexable; unknown routes are not soft 404s',()=>{
 const rule=config.headers.find(r=>r.headers.some(h=>h.key==='X-Robots-Tag'));
 assert.ok(rule);
 const hostRegex=new RegExp('^'+rule.has[0].value+'$');
 assert.ok(hostRegex.test('briqk-nijtec.vercel.app'));
 assert.ok(hostRegex.test('briqk-nijtec-git-dev-example.vercel.app'));
 assert.ok(!hostRegex.test('nijtec.nl'));
 assert.ok(!hostRegex.test('www.nijtec.nl'));
 assert.ok(!config.rewrites);
 assert.match(fs.readFileSync(path.join(dist,'404.html'),'utf8'),/noindex/);
 for(const route of inventory.excluded)assert.ok(!exists(route));
});

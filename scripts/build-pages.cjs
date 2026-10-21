const fs = require('node:fs/promises');
const path = require('node:path');
const pages = require('../seo/pages.cjs');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'dist');
const origin = 'https://nijtec.nl';
const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const business = { '@type':'LocalBusiness', '@id':origin+'/#bedrijf', name:'Nijtec B.V.', alternateName:['Nijtec','Nijtec Montage Team'], url:origin+'/', telephone:'+31615588843', email:'info@nijtec.nl', logo:origin+'/NijTec_logo.png', image:origin+'/assets/hero-project.jpg', address:{'@type':'PostalAddress',streetAddress:'Laveringsveen 10',postalCode:'7751 DN',addressLocality:'Dalen',addressCountry:'NL'} };
function schema(page) {
  const url=origin+(page?.path || '/');
  const graph=[business,{'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'Nijtec',alternateName:'Nijtec & Montage Team',inLanguage:'nl-NL',publisher:{'@id':business['@id']}}];
  if(page){
    graph.push({'@type':'WebPage','@id':url+'#pagina',url,name:page.title,description:page.intro,inLanguage:'nl-NL',isPartOf:{'@id':origin+'/#website'},about:{'@id':business['@id']}});
    const crumbs=[{name:'Home',item:origin+'/'}];
    if(page.path.startsWith('/producten/') && page.path!=='/producten/')crumbs.push({name:'Producten',item:origin+'/producten/'});
    crumbs.push({name:page.title,item:url});
    graph.push({'@type':'BreadcrumbList',itemListElement:crumbs.map((c,i)=>({'@type':'ListItem',position:i+1,...c}))});
  }
  return JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c');
}
async function run(){
  const inventory=JSON.parse(await fs.readFile(path.join(root,'seo/legacy-inventory.json'),'utf8'));
  let source=await fs.readFile(path.join(root,'index.html'),'utf8');
  const legal=JSON.parse(await fs.readFile(path.join(root,'seo/legacy-terms.json'),'utf8'));
  source=source.replace(/const avData = \[[\s\S]*?\n\];/,'const avData = '+JSON.stringify(legal.articles).replace(/</g,'\\u003c')+';');
  const pageLinks='<div class="footer-pages" aria-label="Pagina’s van Nijtec">'+pages.map(p=>'<a href="'+p.path+'">'+escape(p.title)+'</a>').join('')+'</div>';
  source=source.replace('<!-- PAGE_LINKS -->',pageLinks);
  // Keep the original photograph addresses used by the existing Google results.
  source=source.replace(/\/assets\/projects\/(\d{2})\.jpg/g,'/wp-content/uploads/2023/10/$1.jpg');
  const head=source.match(/<head>([\s\S]*?)<\/head>/)[1];
  const header=source.match(/<nav aria-label="Hoofdnavigatie">[\s\S]*?<\/nav>/)[0];
  const footer=source.match(/<footer>[\s\S]*?<\/footer>/)[0].replace('href="#voorwaarden"','href="/algemene-voorwaarden/"');
  const tail=source.slice(source.indexOf('<!-- PRODUCT MODAL -->'),source.indexOf('</body>'));
  const section=id=>{const match=source.match(new RegExp('<section[^>]*id="'+id+'"[^>]*>[\\s\\S]*?<\\/section>'));if(!match)throw new Error('Missing section '+id);return match[0];};
  const contacts=section('contact');
  function pageHead(page){
    let html=head.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,'<script type="application/ld+json">'+schema(page)+'</script>');
    if(!page)return html;
    html=html.replace(/<title>.*?<\/title>/,'<title>'+escape(page.title)+' | Nijtec B.V. Dalen</title>');
    html=html.replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="'+escape(page.intro)+'">');
    html=html.replace(/<link rel="canonical" href="[^"]*">/,'<link rel="canonical" href="'+origin+page.path+'">');
    html=html.replace(/<meta property="og:url" content="[^"]*">/,'<meta property="og:url" content="'+origin+page.path+'">');
    html=html.replace(/<meta property="og:title" content="[^"]*">/,'<meta property="og:title" content="'+escape(page.title)+' | Nijtec">');
    html=html.replace(/<meta property="og:description" content="[^"]*">/,'<meta property="og:description" content="'+escape(page.intro)+'">');
    return html;
  }
  await fs.mkdir(out,{recursive:true});
  for(const name of ['assets','NijTec_logo.png','redesign.css','quickbond-viewer.js','motion.js','contact.js'])await fs.cp(path.join(root,name),path.join(out,name),{recursive:true});
  await fs.cp(path.join(root,'legacy-assets'),out,{recursive:true});
  await fs.writeFile(path.join(out,'index.html'),source.replace(/<head>[\s\S]*?<\/head>/,'<head>'+pageHead()+'</head>'));
  const routeMap={'#top':'/','#producten':'/producten/','#quickbond':'/producten/quickbond/','#projecten':'/projecten/','#zzp':'/zzp-pakket/','#contact':'/contact/','#toepassingen':'/#toepassingen'};
  const detailHeader=header.replace(/href="(#[^"]*)"/g,(_,hash)=>'href="'+(routeMap[hash]||'/'+hash)+'"');
  for(const page of pages){
    let content='';
    if(page.section)content=section(page.section);
    else if(page.index)content='<div class="detail-index">'+pages.filter(p=>p.path.startsWith('/producten/')&&p.path!=='/producten/').map(p=>'<a href="'+p.path+'"><h2>'+escape(p.title)+'</h2><p>'+escape(p.intro)+'</p><span>Bekijk '+escape(p.title.toLowerCase())+' →</span></a>').join('')+'</div>';
    else if(page.terms)content='<article class="detail-copy legal-copy">'+legal.html+'</article>';
    else content='<article class="detail-copy"><h2>'+escape(page.heading)+'</h2><p>'+escape(page.text)+'</p><ul>'+page.items.map(t=>'<li>'+escape(t)+'</li>').join('')+'</ul><p><a href="'+page.related+'">Bekijk ook '+escape(pages.find(p=>p.path===page.related)?.title || 'de toepassing')+' →</a></p><p>Vraag Nijtec naar actuele beschikbaarheid en de verwerkingsinformatie voor uw toepassing.</p></article>';
    if(!page.section && !page.index && !page.terms){
      const photos=inventory.media.filter(m=>m.usedOn.includes(page.path));
      if(photos.length)content+='<div class="detail-media">'+photos.map(m=>'<a href="'+escape(m.path)+'"><img src="'+escape(m.path)+'" alt="'+escape(page.title+': '+path.basename(m.path).replace(/\.[^.]+$/,'').replace(/[-_]/g,' '))+'" width="'+m.width+'" height="'+m.height+'" loading="lazy"><span>'+escape(path.basename(m.path).replace(/\.[^.]+$/,'').replace(/[-_]/g,' '))+'</span></a>').join('')+'</div>';
    }
    const intro='<header class="detail-intro"><div class="detail-breadcrumb"><a href="/">Home</a> / '+(page.path.startsWith('/producten/')&&page.path!=='/producten/'?'<a href="/producten/">Producten</a> / ':'')+'<span>'+escape(page.title)+'</span></div><h1>'+escape(page.title)+'</h1><p>'+escape(page.intro)+'</p></header>';
    const main='<main id="top" class="detail-page">'+intro+(page.section?content:'<div class="detail-body">'+content+'</div>')+(page.section==='contact'?'':contacts)+'</main>';
    const pageTail=page.section==='quickbond'?tail:tail.replace(/<script type="module" src="\/quickbond-viewer\.js[^\"]*"><\/script>/,'');
    const html='<!DOCTYPE html><html lang="nl"><head>'+pageHead(page)+'</head><body><div class="scroll-progress" aria-hidden="true"></div>'+detailHeader+main+footer+pageTail+'</body></html>';
    const dir=path.join(out,page.path);await fs.mkdir(dir,{recursive:true});await fs.writeFile(path.join(dir,'index.html'),html);
  }
  const urls=['/',...pages.map(p=>p.path)];
  const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'+urls.map(route=>'<url><loc>'+origin+route+'</loc>'+inventory.media.filter(m=>m.usedOn.includes(route)).map(m=>'<image:image><image:loc>'+escape(origin+m.path)+'</image:loc></image:image>').join('')+'</url>').join('')+'</urlset>\n';
  await fs.writeFile(path.join(out,'sitemap.xml'),sitemap);
  await fs.writeFile(path.join(out,'robots.txt'),'User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: https://nijtec.nl/sitemap.xml\n');
  await fs.writeFile(path.join(out,'404.html'),'<!doctype html><html lang="nl"><meta charset="utf-8"><meta name="robots" content="noindex"><title>Pagina niet gevonden | Nijtec</title><link rel="stylesheet" href="/redesign.css?v=16"><main class="detail-intro"><h1>Deze pagina bestaat niet.</h1><p><a href="/">Ga naar Nijtec</a> of bekijk <a href="/producten/">het assortiment</a>.</p></main></html>');
  console.log('Built '+urls.length+' pages; preserved '+inventory.media.length+' original image URLs.');
}
run().catch(e=>{console.error(e);process.exitCode=1;});

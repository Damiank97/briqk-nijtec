// Mechanical generation of explicit, reviewable redirects from the URL inventory.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const inventory = require('../seo/legacy-inventory.json');
// Host canonicalization belongs in Vercel Domains, not a second application
// rule that can redirect assets back against the platform's primary domain.
const redirects = [
  {source:'/wp-sitemap.xml',destination:'/sitemap.xml',permanent:true},
  {source:'/wp-sitemap-posts-page-1.xml',destination:'/sitemap.xml',permanent:true},
  {source:'/producten/pu-lijmen',destination:'/producten/vullende-lijmende-pu-schuimen/',permanent:true}
];
const sources = new Set(redirects.map(r=>r.source));
for(const media of inventory.media){
  for(const variant of media.variants){if(!sources.has(variant)){redirects.push({source:variant,destination:media.path,permanent:true});sources.add(variant);}}
  const attachment=media.attachment.replace(/\/$/,'');
  if(attachment && !sources.has(attachment)){redirects.push({source:attachment,destination:media.path,permanent:true});sources.add(attachment);}
}
const config = {
  $schema:'https://openapi.vercel.sh/vercel.json',
  framework:null,
  buildCommand:'node scripts/build-pages.cjs',
  outputDirectory:'dist',
  installCommand:'',
  cleanUrls:true,
  trailingSlash:true,
  headers:[
    {source:'/(.*)',has:[{type:'host',value:'.*\\.vercel\\.app'}],headers:[{key:'X-Robots-Tag',value:'noindex, follow'}]},
    {source:'/(.*)',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'}]}
  ],
  redirects
};
fs.writeFileSync(path.join(root,'vercel.json'), JSON.stringify(config,null,2)+'\n');
console.log('Prepared '+redirects.length+' explicit redirects.');

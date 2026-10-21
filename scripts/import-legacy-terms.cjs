// Preserve the published legal wording; do not substitute an AI-written summary.
const fs=require('node:fs/promises');
const path=require('node:path');
async function run(){
 const response=await fetch('https://nijtec.nl/wp-json/wp/v2/pages/180?_fields=link,content',{signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw new Error('Cannot read existing terms: '+response.status);
 const page=await response.json();
 const original=page.content.rendered.slice(page.content.rendered.indexOf('<p>'));
 if(/<(script|style|iframe)\b/i.test(original))throw new Error('Unexpected executable content');
 const html=original.replace(/<\/?([a-z0-9]+)\b[^>]*>/gi,(tag,name)=>['p','ol','li','strong'].includes(name.toLowerCase())?(tag.startsWith('</')?'</':'<')+name.toLowerCase()+'>':'').trim();
 const text=s=>s.replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
 if(text(original)!==text(html))throw new Error('Legal text changed while removing layout');
 const articles=[...html.matchAll(/<p><strong>([\s\S]*?)<\/strong><\/p>([\s\S]*?)(?=<p><strong>|$)/g)].map(m=>({title:m[1],body:m[2].trim()}));
 if(articles.length<15)throw new Error('Incomplete legal extraction');
 const archive={source:page.link,checkedAt:new Date().toISOString(),note:'Published wording copied without legal revision; André must confirm currency before launch.',html,articles};
 await fs.writeFile(path.join(__dirname,'../seo/legacy-terms.json'),JSON.stringify(archive,null,2)+'\n');
 console.log('Preserved '+articles.length+' complete articles; visible wording unchanged.');
}
run().catch(e=>{console.error(e);process.exitCode=1;});

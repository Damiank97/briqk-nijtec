const manifest = require('../assets/optimized/manifest.json');
function attributes(src, sizes = '(min-width: 900px) 40vw, 100vw') {
  const variants = manifest[src];
  if (!variants) return '';
  return ' srcset="'+variants.map(v=>v.src+' '+v.width+'w').join(', ')+'" sizes="'+sizes+'" decoding="async"';
}
function optimizeHtml(html) {
  return html.replace(/<img\b[^>]*>/g, tag => {
    if (tag.includes('srcset=')) return tag;
    const src=tag.match(/\bsrc="([^"]+)"/)?.[1];
    let sizes='(min-width: 900px) 40vw, 100vw';
    if(src==='/assets/hero-project.jpg')sizes='(min-width: 1280px) 935px, (min-width: 900px) 75vw, 100vw';
    if(src?.includes('/wp-content/'))sizes='(min-width: 900px) 420px, (min-width: 600px) 50vw, 100vw';
    return tag.replace(/\s*\/?>$/,attributes(src,sizes)+'>');
  });
}
module.exports={attributes,optimizeHtml,manifest};

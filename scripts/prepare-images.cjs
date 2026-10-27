// One-off asset preparation, using sharp from the authoring runtime.
// Commit the derivatives and manifest: deployment needs no image library.
const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const policy = require('../seo/publication-policy.cjs');
const inventory = require('../seo/legacy-inventory.json');
async function run() {
  const sources = [
    ...policy.publishedMedia(inventory).map(m => ({src:m.path,file:path.join(root,'legacy-assets',m.path)})),
    ...['hero-project.jpg','quickbond-render-v1.png'].map(name => ({src:'/assets/'+name,file:path.join(root,'assets',name)}))
  ];
  const manifest = {};
  await fs.mkdir(path.join(root,'assets/optimized'),{recursive:true});
  for (const {src,file} of sources) {
    // Never derive brand artwork. Its source and display remain byte-identical.
    if (/logo/i.test(src)) continue;
    const meta = await sharp(file).metadata();
    if (meta.width < 400 || (await fs.stat(file)).size < 30000) continue;
    const key = createHash('sha256').update(src).digest('hex').slice(0,16);
    const widths = [...new Set([320,640,960,1600].map(w=>Math.min(w,meta.width)))];
    const variants = [];
    for (const width of widths) {
      const target='/assets/optimized/'+key+'-'+width+'.webp';
      const info=await sharp(file).resize({width,withoutEnlargement:true}).webp({quality:82,effort:5}).toFile(path.join(root,target));
      variants.push({src:target,width:info.width,height:info.height,bytes:info.size});
    }
    manifest[src]=variants;
  }
  await fs.writeFile(path.join(root,'assets/optimized/manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log('Prepared responsive images for '+Object.keys(manifest).length+' approved originals.');
}
run().catch(e=>{console.error(e);process.exitCode=1;});

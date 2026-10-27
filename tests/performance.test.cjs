const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const images=require('../seo/responsive-images.cjs');
const policy=require('../seo/publication-policy.cjs');
const approved=new Set([...policy.publishedMedia(require('../seo/legacy-inventory.json')).map(m=>m.path),'/assets/hero-project.jpg','/assets/quickbond-render-v1.png']);
test('responsive derivatives only use approved non-brand originals and never upscale',()=>{
  for(const [src,variants] of Object.entries(images.manifest)){
    assert.ok(approved.has(src),src);assert.doesNotMatch(src,/logo/i);
    assert.ok(variants.length>0);
    for(const v of variants){
      assert.ok(fs.statSync(path.join(root,'dist',v.src)).size>0,v.src);
      assert.equal(fs.statSync(path.join(root,v.src)).size,v.bytes);
      assert.ok(v.width<=1600&&v.height>0);
    }
  }
  const hero=images.manifest['/assets/hero-project.jpg'].find(v=>v.width===960);
  assert.ok(hero.bytes<fs.statSync(path.join(root,'assets/hero-project.jpg')).size*.5);
});
test('all pages retain original photo addresses and add responsive previews and explicit image dimensions',()=>{
  for(const route of ['/',...require('../seo/pages.cjs').map(p=>p.path)]){
    const html=fs.readFileSync(path.join(root,'dist',route,'index.html'),'utf8');
    for(const [,tag] of html.matchAll(/(<img\b[^>]*>)/g)){
      if(tag.includes('id="image-viewer-image"'))continue;
      assert.match(tag,/\bwidth="\d+"/,route+' '+tag);assert.match(tag,/\bheight="\d+"/,route+' '+tag);
      const src=tag.match(/\bsrc="([^"]+)"/)?.[1];
      if(images.manifest[src])assert.ok(tag.includes('srcset="')&&tag.includes('sizes="'),route+' '+src);
    }
    assert.ok(html.includes('id="responsive-media-data"'));
    assert.ok(!html.includes('<!-- RESPONSIVE_MEDIA_DATA -->'));
  }
});
test('3D dependencies are dynamically imported near the viewport and rendering is demand-driven',()=>{
  const js=fs.readFileSync(path.join(root,'quickbond-viewer.js'),'utf8');
  assert.doesNotMatch(js,/^import\s/m);
  assert.match(js,/import\('\/assets\/vendor\/three/);
  assert.match(js,/rootMargin: '400px 0px'/);
  assert.match(js,/stage\.addEventListener\('focusin', load\)/);
  assert.match(js,/cancelAnimationFrame\(renderFrame\)/);
  assert.match(js,/if \(!renderFrame && viewerVisible && !document.hidden\)/);
  assert.doesNotMatch(js,/function render\(\)\s*\{\s*requestAnimationFrame\(render\)/);
});
test('text contrast tokens pass on the lightest and darkest relevant surfaces',()=>{
  const colors=require('../NIJTEC-DESIGN-TOKENS.json').color;
  const lum=hex=>{const c=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
  const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
  for(const bg of [colors.paper,colors.paperLight,colors.nijtecBlueSoft,'#e1e6f2']){
    for(const fg of [colors.muted,colors.nijtecOrangeDark])assert.ok(ratio(fg,bg)>=4.5,fg+' '+bg);
  }
  assert.ok(ratio(colors.nijtecOrange,colors.ink)>=4.5);
});

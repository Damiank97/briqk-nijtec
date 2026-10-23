// Historical import is provenance, not permission to publish the current offer.
// Visually reviewed on 2026-10-23. New imports require an explicit review here.
const retiredRoutes = Object.freeze(['/producten/luchtdicht-bouwen/']);
const excludedFiles = Object.freeze(['elastic-gunfoam-b2.png','compressband-2d.png','BUTYLBAND-FLEECE.jpg','zwaluw.png']);
const reviewedOctoberFiles = [
  'xample11.png','example10.png','example09.png','example08.jpg','example07.jpg','example06.jpg','example05.jpg','example04.jpg','example03.jpg','example02.jpg','example01.jpg',
  '23.jpg','22.png','21.jpg','20.jpg','19.jpg','18.jpg','17.jpg','16-1.jpg','15.png','15-1.jpg','14.png','13.png','12.png','11.png','10.png','09.png','08.png','07.png','06-1.jpg','05.png','04.png','03.png','02.png','01.png',
  'resultaat-epoxyvloer.jpg','ral-kleuren-epoxy.png','flakes.png','epoxy-vlokken.png','epoxy-toplaag.jpg','epoxy-op-tegelvloer.jpg','epoxy-met-vlokken.png','epoxy-aanbrengen.jpg','betonlook.png',
  'uni-acryl110.png','top-acryl115.png','spaster-fill125.png','spac-cryl120.png','cement-fix130.png','tape.png','ready-mixed-finish-spray-550.png','primer.png','pistool3.png','pistool2.png','pistool.png','lucht.png','cleaner510.png','poxyfix.png',
  'pu-stonefix-478.png','pur-cleaner-450.png','pu-foam-gun-470.png','pu-foam-flex-471.png','fire_foam-472.png','pu-lijmen.jpg','topflex-p230.png','silocon-nf215.png','silocon-ht211.png','silicon-sa216.png','silicon-gr210.png','silicon-cl218.png','silicon-all250.png','silicon-315.png','unnamed-1.jpg',
  'super-pro-352.png','super-all-360.png','pro-paint-325.png','high-tack-360.png','crystal-340.png','315-facade-lm.png','unnamed.jpg','connectproducts.png','quick_bond.png','pu_foam_flex.png','pro_paint.png','connect_products.png',
  '16.jpg','15.jpg','14.jpg','13.jpg','12.jpg','11.jpg','10.jpg','09.jpg','08.jpg','07.jpg','06.jpg','05.jpg','04.jpg','03.jpg','02.jpg','01.jpg','NijTec_slider2.jpg','NijTec_logo.png'
];
const prefix = '/wp-content/uploads/2023/10/';
const reviewedPaths = new Set([...reviewedOctoberFiles.map(file => prefix + file), '/wp-content/uploads/2023/11/Silicon-ep-217.png']);
const excludedPaths = Object.freeze(excludedFiles.map(file => prefix + file));
const isPagePublished = route => !retiredRoutes.includes(route);
function publishedMedia(inventory) {
  for (const media of inventory.media) {
    if (!reviewedPaths.has(media.path) && !excludedPaths.includes(media.path)) throw new Error('Media review required: ' + media.path);
    if (media.source !== 'https://nijtec.nl' + media.path || !/^\/wp-content\/uploads\/2023\/(10|11)\/[A-Za-z0-9_.-]+$/.test(media.path)) throw new Error('Unexpected original media path');
  }
  return inventory.media.filter(media => reviewedPaths.has(media.path) && media.usedOn.some(isPagePublished));
}
module.exports = {retiredRoutes, excludedPaths, isPagePublished, publishedMedia};

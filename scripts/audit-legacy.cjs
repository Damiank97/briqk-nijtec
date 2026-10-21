// Read-only inventory of the existing public website. No WordPress credentials.
const fs = require('node:fs/promises');
const path = require('node:path');
const origin = 'https://nijtec.nl';
const root = path.resolve(__dirname, '..');
async function get(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(url + ': ' + response.status);
  return response;
}
async function run() {
  const pages = await (await get(origin + '/wp-json/wp/v2/pages?per_page=100&_fields=id,link,slug,title,content')).json();
  const excluded = new Set(['demopagina', 'voorbeeld-pagina']);
  const useful = pages.filter(page => !excluded.has(page.slug));
  const media = [];
  const first = await get(origin + '/wp-json/wp/v2/media?per_page=100');
  media.push(...await first.json());
  const total = Number(first.headers.get('x-wp-totalpages') || 1);
  for (let page = 2; page <= Math.min(total, 5); page++) media.push(...await (await get(origin + '/wp-json/wp/v2/media?per_page=100&page=' + page)).json());
  const home = await (await get(origin + '/')).text();
  const inventory = {
    checkedAt: new Date().toISOString(),
    origin,
    pages: useful.map(page => ({ id:page.id, path:new URL(page.link).pathname, title:page.title.rendered.replace(/&#038;/g,'&') })),
    excluded: pages.filter(page => excluded.has(page.slug)).map(page => new URL(page.link).pathname),
    media: media.filter(item => /image\/(jpeg|png|webp)/.test(item.mime_type)).map(item => {
      const variants = Object.values(item.media_details?.sizes || {}).map(size => size.source_url).filter(Boolean);
      const urls = [item.source_url, ...variants];
      const usedOn = useful.filter(page => urls.some(url => page.content.rendered.includes(new URL(url).pathname))).map(page => new URL(page.link).pathname);
      if (urls.some(url => home.includes(new URL(url).pathname)) && !usedOn.includes('/')) usedOn.push('/');
      return { source:item.source_url, path:new URL(item.source_url).pathname, attachment:new URL(item.link).pathname, width:item.media_details?.width, height:item.media_details?.height, variants:variants.map(url => new URL(url).pathname).filter(url => url !== new URL(item.source_url).pathname), usedOn };
    }).filter(item => item.usedOn.length)
  };
  await fs.mkdir(path.join(root, 'seo'), { recursive:true });
  await fs.writeFile(path.join(root, 'seo/legacy-inventory.json'), JSON.stringify(inventory, null, 2) + '\n');
  console.log(JSON.stringify({ pages:inventory.pages, media:inventory.media.length, projectImages:inventory.media.filter(item => item.usedOn.includes('/projecten/')), excluded:inventory.excluded }, null, 2));
}
run().catch(error => { console.error(error); process.exitCode = 1; });

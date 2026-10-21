const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'legacy-assets');
async function run() {
  const inventory = JSON.parse(await fs.readFile(path.join(root, 'seo/legacy-inventory.json'), 'utf8'));
  const queue = [...inventory.media];
  let bytes = 0, count = 0;
  async function worker() {
    while (queue.length) {
      const item = queue.shift();
      const url = new URL(item.source);
      const target = path.resolve(output, '.' + decodeURIComponent(url.pathname));
      if (url.origin !== 'https://nijtec.nl' || !target.startsWith(output + path.sep) || !/\.(jpg|jpeg|png|webp)$/i.test(target)) throw new Error('Unexpected media target');
      try { const stat = await fs.stat(target); if (stat.size) { count++; continue; } } catch {}
      const response = await fetch(url, { signal:AbortSignal.timeout(30000) });
      if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(item.path + ': invalid image response');
      const data = Buffer.from(await response.arrayBuffer());
      bytes += data.length;
      if (data.length > 8 * 1024 * 1024 || bytes > 100 * 1024 * 1024) throw new Error('Media size limit exceeded');
      await fs.mkdir(path.dirname(target), { recursive:true });
      await fs.writeFile(target, data);
      count++;
    }
  }
  await Promise.all([worker(), worker(), worker(), worker()]);
  console.log(JSON.stringify({ imported:count, megabytes:Math.round(bytes / 1048576 * 10) / 10 }));
}
run().catch(error => { console.error(error); process.exitCode = 1; });

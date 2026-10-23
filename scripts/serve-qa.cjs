const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const root = path.resolve(__dirname, '../dist');
const config = require('../vercel.json');
const contact = require('../api/contact.js');
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.png':'image/png', '.svg':'image/svg+xml', '.woff2':'font/woff2', '.xml':'application/xml', '.txt':'text/plain', '.json':'application/json' };
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://127.0.0.1:4173');
    if (url.pathname === '/api/contact') return await contact(req, res);
    if (req.method === 'POST' && url.pathname === '/__qa/report') {
      let data = '';
      for await (const chunk of req) { data += chunk; if (data.length > 100000) throw new Error('Too large'); }
      const report = JSON.parse(data);
      console.log(JSON.stringify(report));
      res.writeHead(200, { 'Content-Type':'application/json' }); return res.end('{"ok":true}');
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
    // Local audit only: this server binds to loopback; these routes are never built.
    if (url.pathname === '/__qa/media-inventory') {
      res.writeHead(200, {'Content-Type':'application/json', 'Cache-Control':'no-store'});
      return res.end(JSON.stringify(require('../seo/legacy-inventory.json').media));
    }
    if (url.pathname.startsWith('/__qa/archive/')) {
      const original = url.pathname.slice('/__qa/archive'.length);
      if (!require('../seo/legacy-inventory.json').media.some(m => m.path === original)) throw new Error('Unknown archive image');
      res.writeHead(200, {'Content-Type':types[path.extname(original)], 'Cache-Control':'no-store'});
      return res.end(await fs.readFile(path.join(__dirname, '../legacy-assets', original)));
    }
    const redirect=config.redirects.find(r=>!r.has&&r.source.replace(/\/$/,'')===url.pathname.replace(/\/$/,''));
    if(redirect){res.writeHead(308,{Location:redirect.destination});return res.end();}
    const qaPage = new Map([['/__qa', 'browser-qa.html'], ['/__qa/branding', 'branding-qa.html'], ['/__qa/media', 'media-audit.html']]).get(url.pathname);
    let target = qaPage ? path.join(__dirname, '../tests', qaPage) : path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!qaPage && !target.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
    if((await fs.stat(target)).isDirectory())target=path.join(target,'index.html');
    let body = await fs.readFile(target);
    if (path.extname(target)==='.html' && url.searchParams.has('qa')) {
      const instrument = '<script>history.scrollRestoration="manual";window.__qaErrors=[];window.__qaCLS=0;addEventListener("error",e=>__qaErrors.push(e.message||e.target.src),true);addEventListener("unhandledrejection",e=>__qaErrors.push(String(e.reason)));new PerformanceObserver(list=>list.getEntries().forEach(e=>{if(!e.hadRecentInput)__qaCLS+=e.value})).observe({type:"layout-shift",buffered:true});<\/script>';
      body = Buffer.from(body.toString().replace('<head>', '<head>' + instrument));
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control':'no-store' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'}); res.end(await fs.readFile(path.join(root,'404.html'))); }
}).listen(4173, '127.0.0.1', () => console.log('Nijtec QA: http://127.0.0.1:4173/__qa'));

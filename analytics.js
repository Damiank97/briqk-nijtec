import { inject } from '/assets/vendor/vercel-analytics.js';

(() => {
  const hosts = new Set(['nijtec.nl', 'www.nijtec.nl']);
  if (window.location.protocol !== 'https:' || !hosts.has(window.location.hostname)) return;
  if (navigator.globalPrivacyControl === true || ['1', 'yes'].includes(navigator.doNotTrack) || window.doNotTrack === '1') return;
  const bootstrap = document.getElementById('nijtec-analytics');
  if (!bootstrap || bootstrap.dataset.initialized) return;
  const canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) return;
  let page;
  try { page = new URL(canonical.href); } catch { return; }
  if (page.protocol !== 'https:' || !hosts.has(page.hostname)) return;
  page.search = '';
  page.hash = '';
  bootstrap.dataset.initialized = 'true';
  inject({
    mode: 'production',
    debug: false,
    beforeSend(event) {
      // No form content, custom events, query parameters or anchor values.
      if (event.type !== 'pageview') return null;
      try {
        const url = new URL(event.url);
        if (url.origin !== window.location.origin || url.pathname !== page.pathname) return null;
        return { type: 'pageview', url: page.href };
      } catch { return null; }
    }
  }, document.getElementById('analytics-config')?.textContent || '{}');
})();

// Only public same-origin intake paths may enter the static site. Never copy an
// entire environment object (mail credentials and other secrets stay server-side).
module.exports = raw => {
  let input;
  try { input = JSON.parse(raw || '{}')?.analytics; } catch { input = null; }
  const analytics = {};
  for (const key of ['scriptSrc', 'viewEndpoint', 'eventEndpoint', 'sessionEndpoint']) {
    const value = input?.[key];
    if (typeof value === 'string' && /^\/(?!\/)[a-zA-Z0-9_./-]+$/.test(value) && !value.split('/').includes('..')) analytics[key] = value;
  }
  return JSON.stringify({ analytics });
};

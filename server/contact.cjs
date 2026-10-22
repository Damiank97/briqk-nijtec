const { createHmac, timingSafeEqual, randomBytes } = require('node:crypto');
const nodemailer = require('nodemailer');

const recipient = 'info@nijtec.nl';
const subjects = new Set(['Productinformatie', 'Offerte aanvragen', 'Bestelling aanvragen', 'Technisch advies', 'ZZP-pakket', 'Montage opdracht']);
const emailPattern = /^[^\s<>@,;\r\n]+@[^\s<>@,;\r\n]+\.[^\s<>@,;\r\n]+$/;
const maximumBytes = 24000;

function createHandler({ env = process.env, now = Date.now, createTransport = nodemailer.createTransport } = {}) {
  // These counters are per warm function instance, not a distributed firewall.
  // Set the documented Vercel WAF rule before enabling a high-volume public form.
  const limits = new Map();
  const used = new Map();
  let transport;
  const username = env.SMTP_USER || recipient;
  const enabled = Boolean(env.SMTP_PASS && env.CONTACT_FORM_SECRET?.length >= 32 && emailPattern.test(username) && username.endsWith('@nijtec.nl'));
  // Do not expose a public HMAC oracle based on the mailbox password.
  const secret = env.CONTACT_FORM_SECRET || 'disabled';
  const digest = text => createHmac('sha256', secret).update(text).digest('base64url');
  const origins = new Set(['https://nijtec.nl', 'https://www.nijtec.nl']);
  for (const host of [env.VERCEL_URL, env.VERCEL_BRANCH_URL]) if (host) origins.add('https://' + host);
  if (!env.VERCEL && env.NODE_ENV !== 'production') origins.add('http://127.0.0.1:4173');
  const identity = req => digest('ip:' + (req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim());
  function tokenFor(ip) {
    const value = Buffer.from(JSON.stringify({ time: now(), ip, nonce: randomBytes(16).toString('hex') })).toString('base64url');
    return value + '.' + digest('form:' + value);
  }
  function validToken(token, ip) {
    if (typeof token !== 'string' || token.length > 1024) return false;
    const [data, signature, extra] = token.split('.');
    const expected = digest('form:' + data);
    if (extra || !signature || Buffer.byteLength(signature) !== Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
    try {
      const value = JSON.parse(Buffer.from(data, 'base64url'));
      const age = now() - value.time;
      return value.ip === ip && age >= 2000 && age < 30 * 60 * 1000;
    } catch { return false; }
  }
  function overLimit(ip) {
    const time = now();
    for (const [key, value] of limits) if (value.until <= time) limits.delete(key);
    for (const [key, expiry] of used) if (expiry <= time) used.delete(key);
    const key = 'ip:' + ip;
    const local = limits.get(key) || { count: 0, until: time + 15 * 60 * 1000 };
    const global = limits.get('global') || { count: 0, until: time + 60 * 60 * 1000 };
    if (local.count >= 3 || global.count >= 30 || limits.size > 5000) return true;
    limits.set(key, { ...local, count: local.count + 1 });
    limits.set('global', { ...global, count: global.count + 1 });
    return false;
  }
  return async function handler(req, res) {
    const reply = (status, body) => {
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(body));
    };
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Robots-Tag', 'noindex');
    const ip = identity(req);
    if (req.method === 'GET') return reply(200, enabled ? { enabled: true, token: tokenFor(ip) } : { enabled: false });
    if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return reply(405, { code: 'METHOD_NOT_ALLOWED' }); }
    if (!origins.has(req.headers.origin)) return reply(403, { code: 'FORBIDDEN' });
    if (!enabled) return reply(503, { code: 'NOT_CONFIGURED' });
    if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) return reply(415, { code: 'JSON_REQUIRED' });
    if (Number(req.headers['content-length']) > maximumBytes) return reply(413, { code: 'TOO_LARGE' });
    let input;
    try {
      if (req.body !== undefined) {
        const raw = typeof req.body === 'string' || Buffer.isBuffer(req.body) ? req.body.toString() : JSON.stringify(req.body);
        if (Buffer.byteLength(raw) > maximumBytes) return reply(413, { code: 'TOO_LARGE' });
        input = JSON.parse(raw);
      } else {
        const chunks = []; let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > maximumBytes) return reply(413, { code: 'TOO_LARGE' });
          chunks.push(chunk);
        }
        input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      }
    } catch { return reply(400, { code: 'INVALID_INPUT' }); }
    if (!input || typeof input !== 'object' || Array.isArray(input)) return reply(400, { code: 'INVALID_INPUT' });
    if (input.website) return reply(400, { code: 'INVALID_INPUT' });
    if (!validToken(input.token, ip) || used.has(input.token)) return reply(400, { code: 'EXPIRED_TOKEN' });
    const validField = (name, max, required = false, singleLine = true) => typeof input[name] === 'string' && input[name].length <= max && (!required || input[name].trim().length > 0) && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(input[name]) && (!singleLine || !/[\r\n]/.test(input[name]));
    if (!validField('naam', 120, true) || !validField('bedrijf', 160) || !validField('email', 254, true) || !emailPattern.test(input.email.trim()) || !subjects.has(input.onderwerp) || !validField('bericht', 6000, true, false)) return reply(400, { code: 'INVALID_INPUT' });
    if (overLimit(ip)) { res.setHeader('Retry-After', '900'); return reply(429, { code: 'RATE_LIMIT' }); }
    // Consume before awaiting SMTP: duplicate clicks cannot enqueue the same token.
    used.set(input.token, now() + 30 * 60 * 1000);
    try {
      transport ||= createTransport({
        host: 'smtp.strato.com', port: 465, secure: true,
        auth: { user: username, pass: env.SMTP_PASS },
        tls: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
        connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 15000,
        disableFileAccess: true, disableUrlAccess: true, logger: false, debug: false
      });
      const info = await transport.sendMail({
        from: { name: 'Nijtec website', address: username },
        to: recipient,
        replyTo: { name: input.naam.trim(), address: input.email.trim() },
        subject: 'Nijtec: ' + input.onderwerp,
        text: ['Aanvraag via nijtec.nl', '', 'Naam: ' + input.naam.trim(), 'Bedrijf: ' + input.bedrijf.trim(), 'E-mailadres: ' + input.email.trim(), '', input.bericht.trim(), '', 'Een bestelaanvraag is nog geen bevestigde bestelling.'].join('\r\n'),
        disableFileAccess: true, disableUrlAccess: true
      });
      if (!info.accepted?.some(address => String(address).toLowerCase() === recipient)) return reply(502, { code: 'SEND_FAILED' });
      return reply(200, { ok: true });
    } catch {
      // Never expose SMTP credentials, mailbox responses or visitor data in logs.
      return reply(502, { code: 'SEND_FAILED' });
    }
  };
}

module.exports = { createHandler };

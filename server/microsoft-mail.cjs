// Server-only Microsoft 365 delivery. Fixed HTTPS hosts and a fixed mailbox.
// This app needs scoped Exchange Application RBAC, not tenant-wide mail access.
const mailbox = 'info@nijtec.nl';
const guid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

function createMicrosoftMailer({ env = process.env, now = Date.now, fetchImpl = globalThis.fetch } = {}) {
  const configured = Boolean(guid.test(env.MICROSOFT_TENANT_ID || '') && guid.test(env.MICROSOFT_CLIENT_ID || '') && guid.test(env.MICROSOFT_MAILBOX_ID || '') && typeof env.MICROSOFT_CLIENT_SECRET === 'string' && env.MICROSOFT_CLIENT_SECRET.length >= 16);
  let token, expires = 0, pending;
  async function accessToken() {
    if (token && now() < expires) return token;
    if (!pending) pending = (async () => {
      const response = await fetchImpl('https://login.microsoftonline.com/' + env.MICROSOFT_TENANT_ID + '/oauth2/v2.0/token', {
        method: 'POST', redirect: 'error', cache: 'no-store',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: env.MICROSOFT_CLIENT_ID, client_secret: env.MICROSOFT_CLIENT_SECRET, scope: 'https://graph.microsoft.com/.default', grant_type: 'client_credentials' }).toString(),
        signal: AbortSignal.timeout(8000)
      });
      if (!response.ok) throw new Error('MICROSOFT_AUTH_FAILED');
      const data = await response.json();
      if (typeof data.access_token !== 'string' || !data.access_token || /[\s\x00-\x1f\x7f]/.test(data.access_token) || String(data.token_type).toLowerCase() !== 'bearer' || !Number.isFinite(data.expires_in) || data.expires_in <= 60) throw new Error('MICROSOFT_AUTH_FAILED');
      token = data.access_token;
      expires = now() + (Math.min(data.expires_in, 3600) - 60) * 1000;
      return token;
    })().finally(() => { pending = undefined; });
    return pending;
  }
  return {
    configured,
    async sendMail(mail) {
      if (!configured || mail.to !== mailbox || mail.from?.address !== mailbox) throw new Error('MICROSOFT_NOT_CONFIGURED');
      const bearer = await accessToken();
      // Use the verified mailbox object ID: its SMTP address may not be its UPN.
      const response = await fetchImpl('https://graph.microsoft.com/v1.0/users/' + env.MICROSOFT_MAILBOX_ID + '/sendMail', {
        method: 'POST', redirect: 'error', cache: 'no-store',
        headers: { Authorization: 'Bearer ' + bearer, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: {
            subject: mail.subject,
            body: { contentType: 'Text', content: mail.text },
            from: { emailAddress: { name: 'Nijtec website', address: mailbox } },
            toRecipients: [{ emailAddress: { address: mailbox } }],
            replyTo: [{ emailAddress: { name: mail.replyTo.name, address: mail.replyTo.address } }]
          },
          saveToSentItems: true
        }),
        signal: AbortSignal.timeout(12000)
      });
      if (response.status === 401) { token = undefined; expires = 0; }
      // Never retry a POST automatically: a timeout may still have sent the mail.
      // A 202 means accepted for processing, not proven delivery to the inbox.
      if (response.status !== 202) throw new Error('MICROSOFT_SEND_FAILED');
      return { accepted: [mailbox] };
    }
  };
}

module.exports = { createMicrosoftMailer };

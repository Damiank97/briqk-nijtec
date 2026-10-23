(function (root, factory) {
  const validation = factory();
  if (typeof module === 'object' && module.exports) module.exports = validation;
  else root.NijtecEmailValidation = validation;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  // Syntax for one public internet address, not proof that a mailbox exists.
  // Keep plus aliases, long/new TLDs and punycode domains; do not whitelist providers.
  function isValid(value) {
    if (typeof value !== 'string' || /[\r\n\u0000-\u001f\u007f]/.test(value)) return false;
    const address = value.trim();
    if (address.length > 254) return false;
    const parts = address.split('@');
    if (parts.length !== 2) return false;
    const [local, domain] = parts;
    if (!local || local.length > 64 || !/^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+$/i.test(local) || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
    const labels = domain.split('.');
    if (labels.length < 2 || labels.some(label => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label))) return false;
    return /^(?:[a-z]{2,63}|xn--[a-z0-9-]{2,59})$/i.test(labels[labels.length - 1]);
  }
  return { isValid };
});

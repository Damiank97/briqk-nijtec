(() => {
  const form = document.getElementById('contact-fields');
  if (!form) return;

  const status = document.getElementById('contact-handoff');
  const fallback = document.getElementById('contact-copy-fallback');
  const copyText = document.getElementById('contact-copy-text');
  const submit = document.getElementById('form-submit-btn');
  const copy = document.getElementById('contact-copy-btn');
  const recipient = 'info@nijtec.nl';
  let delivery = { enabled: false };
  let sending = false;

  async function configure() {
    try {
      const response = await fetch('/api/contact', { cache: 'no-store', signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error('Unavailable');
      delivery = await response.json();
    } catch { delivery = { enabled: false }; }
    if (delivery.enabled) {
      submit.textContent = 'Verstuur bericht →';
      document.getElementById('contact-help').textContent = 'Uw bericht wordt rechtstreeks naar info@nijtec.nl verzonden. Nijtec neemt contact met u op. Een bestelaanvraag is nog geen bevestigde bestelling.';
    }
  }
  const ready = configure();

  document.querySelectorAll('[data-order]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const product = link.dataset.order;
      document.getElementById('f-onderwerp').value = 'Bestelling aanvragen';
      const input = document.getElementById('f-bericht');
      const request = 'Ik wil graag het ' + product + ' aanvragen.\n\nGewenste producten en aantallen:\n\nGewenste levering of afhalen:\n\nKunt u de prijs, beschikbaarheid en levering bevestigen?';
      // Never discard a message the visitor has already written.
      input.value = input.value.trim() ? input.value + '\n\n' + request : request;
      document.getElementById('prefill-product-naam').textContent = product;
      document.getElementById('product-prefill-banner').style.display = 'flex';
      document.querySelector('.contact-form').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      document.getElementById('f-naam').focus({ preventScroll: true });
    });
  });

  function message() {
    const values = new FormData(form);
    const name = String(values.get('naam') || '').trim();
    const company = String(values.get('bedrijf') || '').trim();
    const email = String(values.get('email') || '').trim();
    const subject = 'Nijtec: ' + values.get('onderwerp');
    const body = [
      'Naam: ' + name,
      ...(company ? ['Bedrijf: ' + company] : []),
      'E-mailadres: ' + email,
      '',
      String(values.get('bericht') || '').trim()
    ].join('\r\n');
    return { subject, body, text: 'Aan: ' + recipient + '\r\nOnderwerp: ' + subject + '\r\n\r\n' + body };
  }

  function showStatus(text) {
    status.textContent = text;
    status.hidden = false;
  }

  function validate() {
    ['f-naam', 'f-bericht'].forEach(id => {
      const input = document.getElementById(id);
      input.setCustomValidity(input.value.trim() ? '' : 'Vul dit veld in.');
    });
    return form.reportValidity();
  }

  form.addEventListener('input', event => event.target.setCustomValidity?.(''));
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending || !validate()) return;
    sending = true;
    submit.disabled = true;
    await ready;
    const draft = message();
    if (delivery.enabled) {
      submit.textContent = 'Bezig met versturen…';
      try {
        const values = new FormData(form);
        const payload = Object.fromEntries(['naam', 'bedrijf', 'email', 'onderwerp', 'bericht', 'website'].map(key => [key, String(values.get(key) || '')]));
        const response = await fetch('/api/contact', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, token: delivery.token }),
          signal: AbortSignal.timeout(25000)
        });
        const result = await response.json();
        if (!response.ok || result.ok !== true) throw new Error(result.code || 'SEND_FAILED');
        showStatus('Uw bericht is aangeboden aan de mailserver van Nijtec. Een bestelaanvraag is pas definitief na bevestiging door Nijtec.');
        // Keep all inputs intact. Do not automatically retry an uncertain send.
        fallback.hidden = true;
        await configure();
      } catch (error) {
        copyText.value = draft.text;
        fallback.hidden = false;
        const reason = error.message === 'RATE_LIMIT' ? 'Er zijn te veel aanvragen gedaan. Probeer het later opnieuw.' : error.message === 'EXPIRED_TOKEN' ? 'Het formulier stond lang open. Probeer het nogmaals.' : 'We konden de verzending niet bevestigen. Controleer bij Nijtec of het bericht is aangekomen voordat u opnieuw verstuurt.';
        showStatus(reason + ' Uw ingevulde gegevens blijven bewaard. U kunt uw bericht ook kopiëren en mailen naar ' + recipient + '.');
        await configure();
      } finally {
        sending = false;
        submit.disabled = false;
        submit.textContent = delivery.enabled ? 'Verstuur bericht →' : 'Open e-mailprogramma →';
      }
      return;
    }
    sending = false;
    submit.disabled = false;
    const mailto = 'mailto:' + recipient + '?subject=' + encodeURIComponent(draft.subject) + '&body=' + encodeURIComponent(draft.body);
    // Long links are not handled consistently by mail applications. Preserve the
    // full message in a selectable field instead of silently truncating it.
    if (mailto.length > 1800) {
      copyText.value = draft.text;
      fallback.hidden = false;
      showStatus('Uw bericht is te lang om betrouwbaar in uw e-mailprogramma klaar te zetten. Kopieer het volledige bericht hieronder en mail het naar ' + recipient + '. Het is nog niet verzonden.');
      copyText.focus({ preventScroll: true });
      copyText.select();
      return;
    }
    showStatus('Verstuur uw bericht zelf in uw e-mailprogramma. Opent er niets? Kies Kopieer bericht en mail naar ' + recipient + '. Uw gegevens blijven hieronder staan.');
    window.location.href = mailto;
  });

  copy.addEventListener('click', async () => {
    if (!validate()) return;
    const draft = message();
    try {
      await navigator.clipboard.writeText(draft.text);
      showStatus('Bericht gekopieerd. Plak het in uw e-mailprogramma en verstuur het naar ' + recipient + '. Het is nog niet verzonden.');
      fallback.hidden = true;
    } catch {
      copyText.value = draft.text;
      fallback.hidden = false;
      showStatus('Kopieer het bericht hieronder en verstuur het naar ' + recipient + '. Het is nog niet verzonden.');
      copyText.focus({ preventScroll: true });
      copyText.select();
    }
  });

  submit.disabled = false;
  copy.disabled = false;
})();

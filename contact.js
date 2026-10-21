(() => {
  const form = document.getElementById('contact-fields');
  if (!form) return;

  const status = document.getElementById('contact-handoff');
  const fallback = document.getElementById('contact-copy-fallback');
  const copyText = document.getElementById('contact-copy-text');
  const submit = document.getElementById('form-submit-btn');
  const copy = document.getElementById('contact-copy-btn');
  const recipient = 'info@nijtec.nl';

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
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validate()) return;
    const draft = message();
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

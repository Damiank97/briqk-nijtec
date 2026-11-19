(() => {
  const form = document.getElementById('contact-fields');
  if (!form) return;

  const status = document.getElementById('contact-handoff');
  const fallback = document.getElementById('contact-copy-fallback');
  const copyText = document.getElementById('contact-copy-text');
  const submit = document.getElementById('form-submit-btn');
  const copy = document.getElementById('contact-copy-btn');
  const email = document.getElementById('f-email');
  const emailError = document.getElementById('f-email-error');
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

  const messageField = document.getElementById('f-bericht');
  const defaultPlaceholder = messageField.placeholder;
  let requestContext = null;

  function prefill(product, subject, context) {
    requestContext = { product, legacy: [
      'Ik heb interesse in: ' + product + '.\n\nKunt u mij meer informatie en een offerte sturen?',
      'Ik wil graag het ' + product + ' aanvragen.\n\nGewenste producten en aantallen:\n\nGewenste levering of afhalen:\n\nKunt u de prijs, beschikbaarheid en levering bevestigen?',
      'Ik wil graag advies of een offerte voor ' + product + '.\n\nMijn toepassing:\n\n' + context + '\n\nKunt u de passende uitvoering, prijs en levering met mij bespreken?'
    ] };
    document.getElementById('f-onderwerp').value = subject;
    messageField.placeholder = 'Beschrijf kort uw toepassing en ondergrond.\n\n' + context;
    messageField.maxLength = 6000 - ('Aanvraag voor: ' + product + '\n\n').length;
    messageField.setCustomValidity('');
    document.getElementById('prefill-product-naam').textContent = product;
    document.getElementById('product-prefill-banner').style.display = 'flex';
    document.querySelector('.contact-form').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    document.getElementById('f-naam').focus({ preventScroll: true });
  }

  document.querySelectorAll('[data-order], [data-inquiry]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      prefill(link.dataset.inquiry || link.dataset.order,
        link.dataset.inquiry ? 'Technisch advies' : 'Bestelling aanvragen',
        link.dataset.inquiryContext || 'Welke producten en aantallen zoekt u? Vermeld ook levering of afhalen en de gewenste planning.');
    });
  });
  document.addEventListener('nijtec:product-request', event => {
    prefill(event.detail.product, 'Offerte aanvragen', 'Waarvoor wilt u het product gebruiken? Vermeld de hoeveelheid en gewenste planning.');
  });
  document.getElementById('prefill-clear-btn').addEventListener('click', () => {
    requestContext = null;
    messageField.placeholder = defaultPlaceholder;
    messageField.maxLength = 6000;
    document.getElementById('product-prefill-banner').style.display = 'none';
    document.getElementById('f-onderwerp').selectedIndex = 0;
  });
  function requestMessage(values) {
    const text = String(values.get('bericht') || '').trim();
    return (requestContext ? 'Aanvraag voor: ' + requestContext.product + '\n\n' : '') + text;
  }

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
      requestMessage(values)
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
      const personal = input.value.trim() && (id !== 'f-bericht' || !requestContext?.legacy.includes(input.value.trim()));
      input.setCustomValidity(personal ? '' : (id === 'f-bericht' ? 'Beschrijf kort uw toepassing en ondergrond.' : 'Vul dit veld in.'));
    });
    checkEmail(true);
    return form.reportValidity();
  }

  function checkEmail(showError = false) {
    const valid = window.NijtecEmailValidation.isValid(email.value);
    email.setCustomValidity(valid ? '' : 'Vul een geldig e-mailadres in, bijvoorbeeld naam@bedrijf.nl.');
    if (valid || showError || !emailError.hidden) {
      emailError.hidden = valid;
      email.setAttribute('aria-invalid', String(!valid));
    }
    return valid;
  }

  messageField.addEventListener('invalid', () => { if (!messageField.value.trim()) messageField.setCustomValidity('Beschrijf kort uw toepassing en ondergrond.'); });
  email.addEventListener('blur', () => { if (email.value || !emailError.hidden) checkEmail(true); });
  email.addEventListener('input', () => checkEmail());
  email.addEventListener('change', () => checkEmail());
  email.addEventListener('invalid', () => checkEmail(true));
  form.addEventListener('reset', () => {
    email.setCustomValidity('');
    email.removeAttribute('aria-invalid');
    emailError.hidden = true;
  });

  form.addEventListener('input', event => {
    if (event.target === messageField && requestContext?.legacy.includes(messageField.value.trim())) messageField.setCustomValidity('Beschrijf kort uw toepassing en ondergrond.');
    else if (event.target !== email) event.target.setCustomValidity?.('');
  });
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
        payload.bericht = requestMessage(values);
        const response = await fetch('/api/contact', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, token: delivery.token }),
          signal: AbortSignal.timeout(25000)
        });
        const result = await response.json();
        if (!response.ok && result.code === 'INVALID_EMAIL') {
          email.setCustomValidity('Controleer uw e-mailadres, bijvoorbeeld naam@bedrijf.nl.');
          emailError.hidden = false;
          email.setAttribute('aria-invalid', 'true');
          email.focus();
          email.reportValidity();
          return;
        }
        if (!response.ok || result.ok !== true) throw new Error(result.code || 'SEND_FAILED');
        showStatus('Uw bericht is aangeboden aan de mailserver van Nijtec. Een bestelaanvraag is pas definitief na bevestiging door Nijtec.');
        // Keep all inputs intact. Do not automatically retry an uncertain send.
        fallback.hidden = true;
        await configure();
      } catch (error) {
        copyText.value = draft.text;
        fallback.hidden = false;
        const reason = error.message === 'RATE_LIMIT' ? 'Er zijn te veel aanvragen gedaan. Probeer het later opnieuw.' : error.message === 'EXPIRED_TOKEN' ? 'Het formulier stond lang open. Probeer het nogmaals.' : 'We konden de verzending niet bevestigen. Controleer bij Nijtec of het bericht is aangekomen voordat u opnieuw verstuurt.';
        showStatus(reason + ' U kunt Nijtec ook bellen op 06-155 888 43. Uw ingevulde gegevens blijven bewaard. U kunt uw bericht ook kopiëren en mailen naar ' + recipient + '.');
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

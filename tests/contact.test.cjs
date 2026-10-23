const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../contact.js'), 'utf8');

function harness({ valid = true, clipboardFails = false, values = {}, enabled = false, sendStatus = 200, sendResult = {ok:true}, sendThrows = false } = {}) {
  const input = { naam: 'Test & Élise', bedrijf: 'Bouw #1', email: 'qa@example.invalid', onderwerp: 'Offerte aanvragen', bericht: 'Gevelpanelen? Prijs & levering graag.', ...values };
  const nodes = new Map();
  for (const id of ['contact-fields', 'contact-handoff', 'contact-copy-fallback', 'contact-copy-text', 'form-submit-btn', 'contact-copy-btn', 'f-naam', 'f-bericht', 'f-email', 'f-email-error', 'contact-help']) {
    nodes.set(id, { hidden: true, value: '', textContent: '', handlers: {}, attributes: {}, addEventListener(type, cb) { this.handlers[type] = cb; }, focus() { this.focused = true; }, select() { this.selected = true; }, setCustomValidity(text) { this.error = text; }, setAttribute(key,value) { this.attributes[key]=value; }, removeAttribute(key) { delete this.attributes[key]; }, reportValidity() { return !this.error; } });
  }
  nodes.get('f-naam').value = input.naam;
  nodes.get('f-bericht').value = input.bericht;
  nodes.get('f-email').value = input.email;
  nodes.get('contact-fields').hidden = false;
  nodes.get('contact-fields').reportValidity = () => valid && !nodes.get('f-naam').error && !nodes.get('f-bericht').error && !nodes.get('f-email').error;
  const location = { href: '' }, copied = [], requests = [];
  vm.runInNewContext(source, {
    document: { getElementById: id => nodes.get(id), querySelectorAll: () => [] },
    window: { location, NijtecEmailValidation: require('../email-validation.js') },
    navigator: { clipboard: { async writeText(text) { if (clipboardFails) throw new Error('Denied'); copied.push(text); } } },
    FormData: class { get(key) { return input[key]; } },
    AbortSignal,
    fetch: async (url, options) => {
      if(options.method === 'POST') {
        requests.push(JSON.parse(options.body));
        if(sendThrows) throw new Error('Timeout');
        return {ok:sendStatus===200,json:async()=>sendResult};
      }
      return {ok:true,json:async()=>({enabled,token:'test-token'})};
    }
  });
  return { nodes, location, input, copied, requests, submit: () => nodes.get('contact-fields').handlers.submit({ preventDefault() {} }), copy: () => nodes.get('contact-copy-btn').handlers.click() };
}

test('invalid form never opens mail or claims receipt', () => {
  const h = harness({ valid: false }); h.submit();
  assert.equal(h.location.href, '');
  assert.equal(h.nodes.get('contact-handoff').hidden, true);
});

test('mail URI preserves every field, Unicode and reserved characters', async () => {
  const h = harness(); await h.submit();
  const mail = new URL(h.location.href);
  assert.equal(mail.protocol, 'mailto:');
  assert.equal(mail.pathname, 'info@nijtec.nl');
  assert.deepEqual([...mail.searchParams.keys()], ['subject', 'body']);
  assert.equal(mail.searchParams.get('subject'), 'Nijtec: Offerte aanvragen');
  for (const key of ['naam', 'bedrijf', 'email', 'bericht']) assert.ok(mail.searchParams.get('body').includes(h.input[key]));
  assert.equal(h.nodes.get('contact-fields').hidden, false);
  assert.ok(!h.nodes.get('contact-handoff').textContent.includes('ontvangen'));
});

test('long draft is never truncated or sent through an unreliable URL', async () => {
  const h = harness({ values: { bericht: 'Vraag over lijm é & ? # '.repeat(150) } }); await h.submit();
  assert.equal(h.location.href, '');
  const field = h.nodes.get('contact-copy-text');
  assert.ok(field.value.endsWith(h.input.bericht.trim()));
  assert.equal(field.selected, true);
  assert.equal(h.nodes.get('contact-copy-fallback').hidden, false);
  assert.match(h.nodes.get('contact-handoff').textContent, /nog niet verzonden/);
});

test('copy action includes recipient and complete message', async () => {
  const h = harness(); await h.copy();
  assert.equal(h.copied.length, 1);
  assert.ok(h.copied[0].includes('Aan: info@nijtec.nl'));
  assert.ok(h.copied[0].endsWith(h.input.bericht));
  assert.match(h.nodes.get('contact-handoff').textContent, /nog niet verzonden/);
});

test('clipboard denial provides a selected manual copy fallback', async () => {
  const h = harness({ clipboardFails: true }); await h.copy();
  assert.equal(h.copied.length, 0);
  assert.equal(h.nodes.get('contact-copy-fallback').hidden, false);
  assert.equal(h.nodes.get('contact-copy-text').selected, true);
  assert.ok(h.nodes.get('contact-copy-text').value.includes(h.input.bericht));
});

test('whitespace-only name cannot generate an empty contact request', () => {
  const h = harness({ values: { naam: '   ' } }); h.submit();
  assert.equal(h.location.href, '');
  assert.ok(h.nodes.get('f-naam').error);
  h.nodes.get('contact-fields').handlers.input({ target: h.nodes.get('f-naam') });
  assert.equal(h.nodes.get('f-naam').error, '');
});

test('configured form sends all fields to own server and preserves inputs', async () => {
  const h = harness({enabled:true}); await h.submit();
  assert.equal(h.requests.length,1);
  for(const key of ['naam','bedrijf','email','onderwerp','bericht']) assert.equal(h.requests[0][key],h.input[key]);
  assert.equal(h.requests[0].token,'test-token');
  assert.equal(h.location.href,'');
  assert.match(h.nodes.get('contact-handoff').textContent,/aangeboden aan de mailserver/);
  assert.equal(h.nodes.get('contact-fields').hidden,false);
});

test('failed or uncertain delivery never claims success or opens another app', async () => {
  for(const options of [{sendStatus:502,sendResult:{code:'SEND_FAILED'}},{sendThrows:true}]) {
    const h=harness({enabled:true,...options}); await h.submit();
    assert.match(h.nodes.get('contact-handoff').textContent,/niet bevestigen/);
    assert.equal(h.location.href,'');
    assert.equal(h.nodes.get('contact-copy-fallback').hidden,false);
    assert.ok(h.nodes.get('contact-copy-text').value.includes(h.input.bericht));
    assert.equal(h.nodes.get('form-submit-btn').disabled,false);
  }
});

test('double submit sends only once while pending', async () => {
  const h=harness({enabled:true}); await Promise.all([h.submit(),h.submit()]);
  assert.equal(h.requests.length,1);
});

test('invalid email blocks send, mail handoff and copy even with a syntactically permissive browser',async()=>{
  for(const email of ['naam@bedrijf','naam@bedrijf.','a..b@example.nl','naam@-bedrijf.nl','naam@bedrijf..nl']){
    const h=harness({enabled:true,values:{email}});await h.submit();await h.copy();
    assert.equal(h.requests.length,0,email);assert.equal(h.location.href,'');assert.equal(h.copied.length,0);
    assert.equal(h.nodes.get('f-email-error').hidden,false);assert.equal(h.nodes.get('f-email').attributes['aria-invalid'],'true');
  }
});

test('email error clears immediately after correction and after form reset',()=>{
  const h=harness({values:{email:'naam@bedrijf'}}),field=h.nodes.get('f-email'),error=h.nodes.get('f-email-error');
  field.handlers.blur();assert.equal(error.hidden,false);
  field.value='naam+offerte@bedrijf.nl';field.handlers.input();assert.equal(error.hidden,true);assert.equal(field.error,'');
  field.value='fout';field.handlers.blur();h.nodes.get('contact-fields').handlers.reset();assert.equal(error.hidden,true);assert.equal(field.error,'');
});

test('server email rejection focuses the address without claiming success or opening mail',async()=>{
  const h=harness({enabled:true,sendStatus:400,sendResult:{code:'INVALID_EMAIL'}});await h.submit();
  assert.equal(h.nodes.get('f-email').focused,true);assert.equal(h.nodes.get('f-email-error').hidden,false);
  assert.equal(h.nodes.get('contact-handoff').hidden,true);assert.equal(h.location.href,'');
  assert.equal(h.nodes.get('form-submit-btn').disabled,false);
});

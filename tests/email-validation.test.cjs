const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {isValid}=require('../email-validation.js');
const invalid=['','geen-email','naam@bedrijf','naam@bedrijf.','naam@bedrijf.c','naam@@bedrijf.nl','.naam@bedrijf.nl','naam.@bedrijf.nl','a..b@bedrijf.nl','naam@-bedrijf.nl','naam@bedrijf-.nl','naam@bedrijf..nl','naam@bed_rijf.nl','naam@192.0.2.1','a@b.nl,c@d.nl','Naam <a@b.nl>','a b@bedrijf.nl','a\r\n@bedrijf.nl','a'.repeat(65)+'@bedrijf.nl','a@'+'b'.repeat(64)+'.nl'];
const valid=['naam@bedrijf.nl','naam+offerte@sub.bedrijf.nl','A.B@BEDRIJF.COM','x@y.de',"o'connor@bedrijf.nl",'naam@bedrijf.technology','naam@xn--bcher-kva.de','naam@bedrijf.xn--p1ai',' naam@bedrijf.nl '];
test('email syntax rejects malformed and incomplete internet addresses without a provider whitelist',()=>{
  for(const value of invalid)assert.equal(isValid(value),false,value);
  for(const value of valid)assert.equal(isValid(value),true,value);
});
test('browser and server execute the identical email policy without a network request',()=>{
  const browser={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../email-validation.js'),'utf8'),browser);
  for(const value of [...invalid,...valid])assert.equal(browser.NijtecEmailValidation.isValid(value),isValid(value),value);
});
test('all generated contact forms load validation before contact code and retain native constraints',()=>{
  for(const route of ['/',...require('../seo/pages.cjs').map(p=>p.path)]){
    const html=fs.readFileSync(path.join(__dirname,'../dist',route,'index.html'),'utf8');
    assert.ok(html.indexOf('/email-validation.js?v=1')<html.indexOf('/contact.js?v=4'),route);
    assert.match(html,/<input type="email" id="f-email"[^>]* required pattern=/);
    assert.ok(html.includes('aria-describedby="f-email-error"'));
  }
});

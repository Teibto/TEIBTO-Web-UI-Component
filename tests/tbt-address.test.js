import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-address.js';

const axe = window.axe;

describe('tbt-address', () => {
  it('renders five inner tbt-input fields', async () => {
    const el = await fixture(html`<tbt-address label="Address"></tbt-address>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelectorAll('tbt-input')).to.have.length(5);
  });

  it('reflects .value onto inner fields', async () => {
    const el = await fixture(html`
      <tbt-address .value=${{ street: '123 Main', city: 'BKK', state: 'BKK', postcode: '10110', country: 'TH' }}>
      </tbt-address>`);
    await el.updateComplete;
    const inputs = el.shadowRoot.querySelectorAll('tbt-input');
    expect(inputs[0].value).to.equal('123 Main'); // street
    expect(inputs[1].value).to.equal('BKK');      // city
    expect(inputs[4].value).to.equal('TH');       // country
  });

  it('fires tbt-change with full object when a sub-field updates', async () => {
    const el = await fixture(html`<tbt-address></tbt-address>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-change', e => { detail = e.detail; });
    const cityInput = el.shadowRoot.querySelectorAll('tbt-input')[1];
    cityInput.dispatchEvent(new CustomEvent('tbt-input',
      { detail: { value: 'Bangkok' }, bubbles: true, composed: true }));
    expect(detail.value.city).to.equal('Bangkok');
    expect(detail.value).to.have.all.keys('street', 'city', 'state', 'postcode', 'country');
  });

  it('passes FormData with prefixed keys to setFormValue when name is set', async () => {
    const el = await fixture(html`<tbt-address name="ship_to"></tbt-address>`);
    await el.updateComplete;
    let captured = null;
    el._internals.setFormValue = v => { captured = v; };
    const street = el.shadowRoot.querySelectorAll('tbt-input')[0];
    street.dispatchEvent(new CustomEvent('tbt-input',
      { detail: { value: '99/9 Sukhumvit' }, bubbles: true, composed: true }));
    expect(captured).to.be.instanceOf(FormData);
    expect(captured.get('ship_to.street')).to.equal('99/9 Sukhumvit');
    expect(captured.get('ship_to.city')).to.equal('');
  });

  it('reports valueMissing when required and street/city/country missing', async () => {
    const el = await fixture(html`<tbt-address required></tbt-address>`);
    await el.updateComplete;
    expect(el._internals.validity.valueMissing).to.be.true;
    el.value = { street: '1 A', city: 'BKK', state: '', postcode: '', country: 'TH' };
    await el.updateComplete;
    expect(el._internals.validity.valueMissing).to.be.false;
  });

  it('shows error message when error prop is set', async () => {
    const el = await fixture(html`<tbt-address error="Invalid"></tbt-address>`);
    await el.updateComplete;
    const msg = el.shadowRoot.querySelector('.error-msg');
    expect(msg).to.exist;
    expect(msg.textContent).to.include('Invalid');
  });

  it('passes axe', async () => {
    const el = await fixture(html`<tbt-address label="Shipping address"></tbt-address>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

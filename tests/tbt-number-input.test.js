import { fixture, html, expect } from '@open-wc/testing';
import '../components/tbt-number-input.js';

const axe = window.axe;

describe('tbt-number-input', () => {
  it('displays formatted value with commas', async () => {
    const el = await fixture(html`<tbt-number-input label="Amount" value="1250000"></tbt-number-input>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('input').value).to.equal('1,250,000');
  });

  it('shows empty string when no value', async () => {
    const el = await fixture(html`<tbt-number-input label="Amount"></tbt-number-input>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('input').value).to.equal('');
  });

  it('shows raw number on focus, formatted on blur', async () => {
    const el = await fixture(html`<tbt-number-input label="Amount" value="1250000"></tbt-number-input>`);
    await el.updateComplete;
    const input = el.shadowRoot.querySelector('input');
    input.dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;
    expect(input.value).to.equal('1250000');
    input.dispatchEvent(new FocusEvent('blur'));
    await el.updateComplete;
    expect(input.value).to.equal('1,250,000');
  });

  it('fires tbt-change with numeric value on blur', async () => {
    const el = await fixture(html`<tbt-number-input label="Amount"></tbt-number-input>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-change', e => { detail = e.detail; });
    const input = el.shadowRoot.querySelector('input');
    input.dispatchEvent(new FocusEvent('focus'));
    input.value = '5000';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new FocusEvent('blur'));
    expect(detail).to.not.be.null;
    expect(detail.value).to.equal(5000);
  });

  it('fires tbt-change with null when cleared', async () => {
    const el = await fixture(html`<tbt-number-input label="Amount" value="100"></tbt-number-input>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-change', e => { detail = e.detail; });
    const input = el.shadowRoot.querySelector('input');
    input.dispatchEvent(new FocusEvent('focus'));
    input.value = '';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new FocusEvent('blur'));
    expect(detail.value).to.be.null;
  });

  it('clamps to min on blur', async () => {
    const el = await fixture(html`<tbt-number-input label="Qty" min="1" max="100"></tbt-number-input>`);
    await el.updateComplete;
    const input = el.shadowRoot.querySelector('input');
    input.dispatchEvent(new FocusEvent('focus'));
    input.value = '-5';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new FocusEvent('blur'));
    await el.updateComplete;
    expect(parseFloat(el.value)).to.equal(1);
  });

  it('clamps to max on blur', async () => {
    const el = await fixture(html`<tbt-number-input label="Qty" min="1" max="100"></tbt-number-input>`);
    await el.updateComplete;
    const input = el.shadowRoot.querySelector('input');
    input.dispatchEvent(new FocusEvent('focus'));
    input.value = '999';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new FocusEvent('blur'));
    await el.updateComplete;
    expect(parseFloat(el.value)).to.equal(100);
  });

  it('increments by step on ArrowUp', async () => {
    const el = await fixture(html`<tbt-number-input label="Qty" value="10" step="5"></tbt-number-input>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-change', e => { detail = e.detail; });
    el.shadowRoot.querySelector('input').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })
    );
    expect(detail.value).to.equal(15);
  });

  it('decrements by step on ArrowDown', async () => {
    const el = await fixture(html`<tbt-number-input label="Qty" value="10" step="5"></tbt-number-input>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-change', e => { detail = e.detail; });
    el.shadowRoot.querySelector('input').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    );
    expect(detail.value).to.equal(5);
  });

  it('formats decimal places correctly', async () => {
    const el = await fixture(html`<tbt-number-input label="Price" value="1234.5" decimal="2"></tbt-number-input>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('input').value).to.equal('1,234.50');
  });

  it('renders prefix and suffix', async () => {
    const el = await fixture(html`<tbt-number-input label="Amount" prefix="฿" suffix="THB"></tbt-number-input>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.prefix').textContent.trim()).to.equal('฿');
    expect(el.shadowRoot.querySelector('.suffix').textContent.trim()).to.equal('THB');
  });

  it('shows error message', async () => {
    const el = await fixture(html`<tbt-number-input label="Amount" error="Amount is required"></tbt-number-input>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.error-msg').textContent).to.include('Amount is required');
  });

  it('disabled prevents input', async () => {
    const el = await fixture(html`<tbt-number-input label="Amount" disabled></tbt-number-input>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('input').disabled).to.be.true;
  });

  it('strips commas from pasted value on blur', async () => {
    const el = await fixture(html`<tbt-number-input label="Amount"></tbt-number-input>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-change', e => { detail = e.detail; });
    const input = el.shadowRoot.querySelector('input');
    input.dispatchEvent(new FocusEvent('focus'));
    input.value = '1,250,000';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new FocusEvent('blur'));
    expect(detail.value).to.equal(1250000);
  });

  it('passes axe', async () => {
    const el = await fixture(html`
      <tbt-number-input label="Amount" prefix="฿" value="1250000" decimal="2" required></tbt-number-input>
    `);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

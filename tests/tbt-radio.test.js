import { html, fixture, expect, oneEvent } from '@open-wc/testing';
import '../components/tbt-radio.js';

const axe = window.axe;
const OPTS = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit', label: 'Credit' },
  { value: 'transfer', label: 'Transfer' },
];

describe('tbt-radio', () => {
  it('renders one radio input per option', async () => {
    const el = await fixture(html`<tbt-radio label="Pay" .options=${OPTS}></tbt-radio>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelectorAll('input[type="radio"]')).to.have.length(3);
  });

  it('renders the group label and a radiogroup role', async () => {
    const el = await fixture(html`<tbt-radio label="Payment method" .options=${OPTS}></tbt-radio>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.group-label').textContent).to.include('Payment method');
    expect(el.shadowRoot.querySelector('[role="radiogroup"]')).to.exist;
  });

  it('checks the input matching value', async () => {
    const el = await fixture(html`<tbt-radio .options=${OPTS} value="credit"></tbt-radio>`);
    await el.updateComplete;
    const checked = [...el.shadowRoot.querySelectorAll('input')].find(i => i.checked);
    expect(checked.value).to.equal('credit');
  });

  it('fires tbt-change with the selected value on click', async () => {
    const el = await fixture(html`<tbt-radio .options=${OPTS}></tbt-radio>`);
    await el.updateComplete;
    setTimeout(() => { el.shadowRoot.querySelectorAll('input')[2].click(); });
    const ev = await oneEvent(el, 'tbt-change');
    expect(ev.detail.value).to.equal('transfer');
    expect(el.value).to.equal('transfer');
  });

  it('does not change when readonly', async () => {
    const el = await fixture(html`<tbt-radio .options=${OPTS} value="cash" readonly></tbt-radio>`);
    await el.updateComplete;
    el.shadowRoot.querySelectorAll('input')[1].dispatchEvent(new Event('change', { bubbles: true }));
    expect(el.value).to.equal('cash');
  });

  it('passes axe', async () => {
    const el = await fixture(html`<tbt-radio label="Pay" .options=${OPTS} value="cash"></tbt-radio>`);
    await el.updateComplete;
    const results = await axe.run(el, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

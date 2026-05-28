import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-summary.js';

describe('tbt-summary', () => {
  it('renders a slot in shadow DOM (slotted usage)', async () => {
    const el = await fixture(html`<tbt-summary></tbt-summary>`);
    expect(el.shadowRoot.querySelector('slot')).to.exist;
  });

  it('renders auto-summary block when subtotal prop is set', async () => {
    const el = await fixture(html`<tbt-summary subtotal="100000" vat="7000"></tbt-summary>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.auto-summary')).to.exist;
  });

  it('auto-summary shows formatted currency values', async () => {
    const el = await fixture(html`<tbt-summary subtotal="100000" vat="7000" currency="฿"></tbt-summary>`);
    await el.updateComplete;
    const vals = [...el.shadowRoot.querySelectorAll('.val')].map(v => v.textContent.trim());
    expect(vals.some(v => v.includes('100,000'))).to.be.true;
    expect(vals.some(v => v.includes('7,000'))).to.be.true;
  });

  it('defaults currency to ฿ and vatRate to 7', async () => {
    const el = await fixture(html`<tbt-summary></tbt-summary>`);
    expect(el.currency).to.equal('฿');
    expect(el.vatRate).to.equal(7);
  });

  it('uses grand-total-label prop for grand total row label', async () => {
    const el = await fixture(html`<tbt-summary subtotal="1000" vat="70" grand-total-label="Net total"></tbt-summary>`);
    await el.updateComplete;
    const grandRow = el.shadowRoot.querySelector('.grand-row');
    expect(grandRow.textContent).to.include('Net total');
  });

  it('passes slotted tbt-summary-item elements through', async () => {
    const el = await fixture(html`
      <tbt-summary>
        <span id="item1">Subtotal</span>
      </tbt-summary>`);
    await el.updateComplete;
    expect(el.querySelector('#item1')).to.exist;
  });
});

import { fixture, html, expect } from '@open-wc/testing';
import '../components/tbt-lines-block.js';

describe('tbt-lines-block', () => {
  it('renders tbt-section with given title', async () => {
    const el = await fixture(html`<tbt-lines-block title="My items"></tbt-lines-block>`);
    await el.updateComplete;
    const section = el.shadowRoot.querySelector('tbt-section');
    expect(section).to.exist;
    expect(section.title).to.equal('My items');
  });

  it('renders tbt-line-items with showSummary disabled', async () => {
    const el = await fixture(html`<tbt-lines-block></tbt-lines-block>`);
    await el.updateComplete;
    const li = el.shadowRoot.querySelector('tbt-line-items');
    expect(li).to.exist;
    expect(li.showSummary).to.be.false;
  });

  it('renders Add button with custom add-label', async () => {
    const el = await fixture(html`<tbt-lines-block add-label="Add service"></tbt-lines-block>`);
    await el.updateComplete;
    const btn = el.shadowRoot.querySelector('tbt-button');
    expect(btn).to.exist;
    expect(btn.textContent.trim()).to.equal('Add service');
  });

  it('sets and reads rows via delegation to tbt-line-items', async () => {
    const el = await fixture(html`<tbt-lines-block></tbt-lines-block>`);
    await el.updateComplete;
    el.rows = [{ item: 'Widget', qty: 2, price: 500 }];
    await el.updateComplete;
    const rows = el.rows;
    expect(rows).to.have.length(1);
    expect(rows[0].item).to.equal('Widget');
  });

  it('getTotal() returns correct totals after setting rows', async () => {
    const el = await fixture(html`<tbt-lines-block vat-rate="0.1"></tbt-lines-block>`);
    await el.updateComplete;
    el.rows = [{ item: 'A', qty: 1, price: 1000 }];
    await el.updateComplete;
    const { subtotal, vat, total } = el.getTotal();
    expect(subtotal).to.equal(1000);
    expect(vat).to.be.closeTo(100, 0.01);
    expect(total).to.be.closeTo(1100, 0.01);
  });

  it('forwards tbt-change from inner tbt-line-items and updates _totals', async () => {
    const el = await fixture(html`<tbt-lines-block></tbt-lines-block>`);
    await el.updateComplete;

    let emitted = null;
    el.addEventListener('tbt-change', e => { emitted = e.detail; });

    const li = el.shadowRoot.querySelector('tbt-line-items');
    const mockDetail = { rows: [{ item: 'A' }], subtotal: 1000, vat: 70, total: 1070 };
    li.dispatchEvent(new CustomEvent('tbt-change', { detail: mockDetail, bubbles: true, composed: true }));

    await el.updateComplete;
    expect(emitted).to.deep.equal(mockDetail);
    expect(el._totals).to.deep.equal({ subtotal: 1000, vat: 70, total: 1070 });
  });
});

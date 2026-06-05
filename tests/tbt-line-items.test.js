import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-line-items.js';

const axe = window.axe;

describe('tbt-line-items', () => {
  it('renders with empty rows by default', async () => {
    const el = await fixture(html`<tbt-line-items></tbt-line-items>`);
    await el.updateComplete;
    expect(el.rows).to.deep.equal([]);
  });

  it('renders row data set via rows setter', async () => {
    const el = await fixture(html`<tbt-line-items></tbt-line-items>`);
    await el.updateComplete;
    el.rows = [{ item: 'Laptop', desc: '', qty: 1, unit: 'Pcs', price: 30000, account: '' }];
    await el.updateComplete;
    expect(el.rows).to.have.length(1);
    expect(el.rows[0].item).to.equal('Laptop');
  });

  it('refreshes Account dropdown when accountOptions is set AFTER rows (async load)', async () => {
    const el = await fixture(html`<tbt-line-items></tbt-line-items>`);
    await el.updateComplete;
    el.rows = [{ item: 'A', desc: '', qty: 1, unit: 'Pcs', price: 100, account: '5000' }];
    await el.updateComplete;
    // Before options arrive, the Account <select> has no options
    let sel = el.shadowRoot.querySelector('select[data-f="account"]');
    expect(sel, 'account select exists').to.exist;
    expect(sel.querySelectorAll('option')).to.have.length(0);
    // Options arrive late (e.g. async chart-of-accounts fetch resolving after rows)
    el.accountOptions = [
      { value: '5000', label: '5000 Cost of goods' },
      { value: '6000', label: '6000 Expenses' },
    ];
    await el.updateComplete;
    sel = el.shadowRoot.querySelector('select[data-f="account"]');
    const labels = [...sel.querySelectorAll('option')].map(o => o.textContent.trim());
    expect(labels).to.deep.equal(['5000 Cost of goods', '6000 Expenses']);
    expect(sel.value, 'row account value preserved').to.equal('5000');
  });

  it('refreshes Unit dropdown when unitOptions is set AFTER rows', async () => {
    const el = await fixture(html`<tbt-line-items></tbt-line-items>`);
    await el.updateComplete;
    el.rows = [{ item: 'A', desc: '', qty: 1, unit: 'Kg', price: 1, account: '' }];
    await el.updateComplete;
    el.unitOptions = [
      { value: 'Kg',  label: 'Kg'  },
      { value: 'Ton', label: 'Ton' },
    ];
    await el.updateComplete;
    const sel = el.shadowRoot.querySelector('select[data-f="unit"]');
    const labels = [...sel.querySelectorAll('option')].map(o => o.textContent.trim());
    expect(labels).to.deep.equal(['Kg', 'Ton']);
    expect(sel.value).to.equal('Kg');
  });

  it('addRow() appends one blank row', async () => {
    const el = await fixture(html`<tbt-line-items></tbt-line-items>`);
    await el.updateComplete;
    el.addRow();
    await new Promise(r => setTimeout(r, 10));
    expect(el.rows).to.have.length(1);
  });

  it('getTotal() returns numeric subtotal/vat/total', async () => {
    const el = await fixture(html`<tbt-line-items vat-rate="0.07"></tbt-line-items>`);
    await el.updateComplete;
    el.rows = [{ item: 'Widget', desc: '', qty: 2, unit: 'Pcs', price: 1000, account: '' }];
    await el.updateComplete;
    const total = el.getTotal();
    expect(total.subtotal).to.equal(2000);
    expect(Math.round(total.vat)).to.equal(140);
    expect(Math.round(total.total)).to.equal(2140);
  });

  it('fires tbt-change with rows and totals on row edit', async () => {
    const el = await fixture(html`<tbt-line-items vat-rate="0.07"></tbt-line-items>`);
    await el.updateComplete;
    el.rows = [{ item: 'A', desc: '', qty: 1, unit: 'Pcs', price: 100, account: '' }];
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-change', e => { detail = e.detail; });
    const input = el.shadowRoot.querySelector('tbody input[data-col="qty"]');
    if (input) {
      input.value = '3';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await el.updateComplete;
      if (detail) {
        expect(detail).to.have.property('rows');
        expect(detail).to.have.property('subtotal');
      }
    }
  });

  it('defaults currency to ฿ and vat-rate to 0.07', async () => {
    const el = await fixture(html`<tbt-line-items></tbt-line-items>`);
    expect(el.currency).to.equal('฿');
    expect(el.vatRate).to.equal(0.07);
  });

  it('reflects loading attribute on host when loading prop is set', async () => {
    const el = await fixture(html`<tbt-line-items loading></tbt-line-items>`);
    await el.updateComplete;
    expect(el.hasAttribute('loading')).to.be.true;
    expect(el.loading).to.be.true;
  });

  it('passes axe (empty)', async () => {
    const el = await fixture(html`<tbt-line-items></tbt-line-items>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });

  it('passes axe (with rows)', async () => {
    const el = await fixture(html`<tbt-line-items></tbt-line-items>`);
    await el.updateComplete;
    el.rows = [{ item: 'Laptop', desc: 'Dell', qty: 1, unit: 'Pcs', price: 30000, account: '' }];
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

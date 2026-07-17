import { expect } from '@open-wc/testing';
import { initListPage } from '../components/tbt-list-page.js';
import '../components/tbt-table.js';
import '../components/tbt-search.js';
import '../components/tbt-dropdown.js';
import '../components/tbt-stat.js';
import '../components/tbt-button.js';
import '../components/tbt-badge.js';

// Minimal runtime stub — the pieces of tbt-page-runtime the controller uses
const rt = {
  currency: (n) => '฿' + Number(n).toLocaleString('en-US'),
  sumBy: (rows, k) => rows.reduce((a, r) => a + (r[k] || 0), 0),
  badge: (label, variant) => `<tbt-badge variant="${variant}">${label}</tbt-badge>`,
  rowActions: (id) => `<span data-id="${id}">actions</span>`,
  wireRowActions: () => {},
};

const RECORDS = [
  { id: 1, tranid: 'INV-001', customerId: '100', status: 'Paid',  amount: 100 },
  { id: 2, tranid: 'INV-002', customerId: '200', status: 'Draft', amount: 250 },
  { id: 3, tranid: 'XX-003',  customerId: '100', status: 'Paid',  amount: 50 },
];

// Build the page skeleton manually — fixture() on a plain-<div> root hangs on
// concurrent (hidden) wtr pages because open-wc falls back to nextFrame/rAF
// there and headless Chrome never fires rAF in hidden tabs (see wtr config).
let currentWrap = null;
afterEach(() => { currentWrap?.remove(); currentWrap = null; });

async function listFixture() {
  const wrap = document.createElement('div');
  currentWrap = wrap;
  wrap.innerHTML = `
      <tbt-badge id="hdr-count"></tbt-badge>
      <tbt-dropdown id="f-customer"></tbt-dropdown>
      <tbt-stat id="stat-total"></tbt-stat>
      <tbt-stat id="stat-value"></tbt-stat>
      <tbt-search id="f-search"></tbt-search>
      <tbt-button id="new-btn"></tbt-button>
      <tbt-table id="rec-table"></tbt-table>
      <tbt-button id="export-btn"></tbt-button>
      <tbt-button id="print-btn"></tbt-button>
  `;
  document.body.appendChild(wrap);
  await Promise.all([...wrap.children].map((el) => el.updateComplete));
  const data = { records: JSON.parse(JSON.stringify(RECORDS)), formUrl: '/x/form' };
  const api = initListPage({
    data,
    runtime: rt,
    countNoun: 'invoices',
    filters: [{ id: 'f-customer', field: 'customerId',
                options: [{ value: '100', label: 'A' }, { value: '200', label: 'B' }],
                allLabel: 'All customers' }],
    searchText: (r) => r.tranid,
    statusVariant: { Paid: 'success', Draft: 'warning' },
    derive: (r, rtx) => ({ amountText: rtx.currency(r.amount) }),
    columns: [{ key: 'tranid', label: 'No.' }],
    stats: [
      { id: 'stat-total', value: (rows) => String(rows.length) },
      { id: 'stat-value', value: (rows, rtx) => rtx.currency(rtx.sumBy(rows, 'amount')) },
    ],
    deleteNoun: 'invoice',
    deleteLabel: (r) => r.tranid,
    csv: { header: 'No.', row: (r) => r.tranid, filename: 'invoices' },
  });
  return { wrap, data, api };
}

describe('initListPage', () => {
  it('renders all rows with derived fields, badges, and running no.', async () => {
    const { wrap } = await listFixture();
    const table = wrap.querySelector('#rec-table');
    expect(table.rows).to.have.length(3);
    expect(table.rows[0].no).to.equal(1);
    expect(table.rows[1].amountText).to.equal('฿250');
    expect(table.rows[0].statusBadge).to.contain('success');
    expect(table.rows[0].actions).to.contain('data-id="1"');
  });

  it('computes stats and header count', async () => {
    const { wrap } = await listFixture();
    expect(wrap.querySelector('#stat-total').value).to.equal('3');
    expect(wrap.querySelector('#stat-value').value).to.equal('฿400');
    expect(wrap.querySelector('#hdr-count').textContent).to.equal('3 invoices');
  });

  it('prepends the all-option and filters by dropdown value', async () => {
    const { wrap } = await listFixture();
    const dd = wrap.querySelector('#f-customer');
    expect(dd.options[0]).to.deep.equal({ value: '', label: 'All customers' });

    dd.value = '100';
    dd.dispatchEvent(new CustomEvent('tbt-change'));
    const table = wrap.querySelector('#rec-table');
    expect(table.rows).to.have.length(2);
    expect(wrap.querySelector('#hdr-count').textContent).to.equal('2 invoices');
  });

  it('filters by search text (case-insensitive)', async () => {
    const { wrap } = await listFixture();
    const search = wrap.querySelector('#f-search');
    search.value = 'inv';
    search.dispatchEvent(new CustomEvent('tbt-search'));
    expect(wrap.querySelector('#rec-table').rows).to.have.length(2);
  });

  it('re-renders from mutated data via returned applyFilter', async () => {
    const { wrap, data, api } = await listFixture();
    data.records = data.records.filter((r) => r.id !== 1);
    api.applyFilter();
    expect(wrap.querySelector('#rec-table').rows).to.have.length(2);
    expect(wrap.querySelector('#stat-total').value).to.equal('2');
  });
});

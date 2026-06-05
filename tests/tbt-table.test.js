import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-table.js';

const axe = window.axe;

const COLS = [
  { key: 'id',   label: 'ID',   sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'amt',  label: 'Amount', align: 'right' },
];
const ROWS = [
  { id: '1', name: 'Apple',  amt: '100' },
  { id: '2', name: 'Banana', amt: '200' },
  { id: '3', name: 'Cherry', amt: '300' },
];

describe('tbt-table', () => {
  it('renders a <table> element in shadow DOM', async () => {
    const el = await fixture(html`<tbt-table .columns=${COLS} .rows=${ROWS}></tbt-table>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('table')).to.exist;
  });

  it('renders one <th> per column', async () => {
    const el = await fixture(html`<tbt-table .columns=${COLS} .rows=${ROWS}></tbt-table>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelectorAll('thead th')).to.have.length(3);
  });

  it('renders one <tr> per row in tbody', async () => {
    const el = await fixture(html`<tbt-table .columns=${COLS} .rows=${ROWS}></tbt-table>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelectorAll('tbody tr')).to.have.length(3);
  });

  it('shows empty-message when rows array is empty', async () => {
    const el = await fixture(html`<tbt-table .columns=${COLS} .rows=${[]} empty-message="No data found"></tbt-table>`);
    await el.updateComplete;
    expect(el.shadowRoot.textContent).to.include('No data found');
  });

  it('renders column header labels', async () => {
    const el = await fixture(html`<tbt-table .columns=${COLS} .rows=${ROWS}></tbt-table>`);
    await el.updateComplete;
    const headerText = el.shadowRoot.querySelector('thead').textContent;
    expect(headerText).to.include('ID');
    expect(headerText).to.include('Name');
    expect(headerText).to.include('Amount');
  });

  it('sortable column headers have scope="col"', async () => {
    const el = await fixture(html`<tbt-table .columns=${COLS} .rows=${ROWS}></tbt-table>`);
    await el.updateComplete;
    const ths = el.shadowRoot.querySelectorAll('thead th');
    ths.forEach(th => expect(th.getAttribute('scope')).to.equal('col'));
  });

  it('clicking sortable header fires tbt-sort event in server-sort mode', async () => {
    const el = await fixture(html`<tbt-table .columns=${COLS} .rows=${ROWS} server-sort></tbt-table>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-sort', e => { detail = e.detail; });
    el.shadowRoot.querySelectorAll('thead th')[0].click();
    expect(detail).to.exist;
    expect(detail.key).to.equal('id');
  });

  it('clicking a body row fires tbt-row-click with the row data', async () => {
    const el = await fixture(html`<tbt-table .columns=${COLS} .rows=${ROWS}></tbt-table>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-row-click', e => { detail = e.detail; });
    el.shadowRoot.querySelectorAll('tbody tr')[1].click();
    expect(detail).to.exist;
    expect(detail.row).to.deep.equal(ROWS[1]);
  });

  it('shows "Loading…" text when loading prop is set and rows are empty', async () => {
    const el = await fixture(html`<tbt-table .columns=${COLS} .rows=${[]} loading></tbt-table>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.empty').textContent.trim()).to.equal('Loading…');
  });

  it('paginates rows when paginate is set', async () => {
    const manyRows = Array.from({ length: 15 }, (_, i) => ({ id: String(i + 1), name: `Item ${i + 1}`, amt: '0' }));
    const el = await fixture(html`<tbt-table .columns=${COLS} .rows=${manyRows} paginate page-size="5"></tbt-table>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelectorAll('tbody tr')).to.have.length(5);
  });

  it('passes axe with data', async () => {
    const el = await fixture(html`<tbt-table .columns=${COLS} .rows=${ROWS}></tbt-table>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

import { fixture, html, expect, waitUntil } from '@open-wc/testing';
import '../components/tbt-data-table.js';

const axe = window.axe;

const COLS = [
  { key: 'id',   label: 'ID' },
  { key: 'name', label: 'Name', sortable: true },
];

function mockFetch(rows, total) {
  return async () => ({ rows, total });
}

describe('tbt-data-table', () => {
  it('shows skeleton while loading', async () => {
    let resolve;
    const el = await fixture(html`<tbt-data-table></tbt-data-table>`);
    el.columns = COLS;
    el.fetch = () => new Promise(r => { resolve = r; });
    await waitUntil(() => el.shadowRoot.querySelector('tbt-skeleton'), 'Skeleton not shown', { timeout: 500 });
    expect(el.shadowRoot.querySelector('tbt-skeleton')).to.exist;
    resolve({ rows: [], total: 0 });
  });

  it('renders tbt-table with fetched rows', async () => {
    const rows = [{ id: '1', name: 'Alpha' }, { id: '2', name: 'Beta' }];
    const el = await fixture(html`<tbt-data-table></tbt-data-table>`);
    el.columns = COLS;
    el.fetch = mockFetch(rows, 2);
    await waitUntil(() => el.shadowRoot.querySelector('tbt-table'), 'Table not rendered', { timeout: 500 });
    expect(el.shadowRoot.querySelector('tbt-table')).to.exist;
  });

  it('shows error alert when fetch throws', async () => {
    const el = await fixture(html`<tbt-data-table></tbt-data-table>`);
    el.columns = COLS;
    el.fetch = async () => { throw new Error('Network error'); };
    await waitUntil(() => el.shadowRoot.querySelector('tbt-alert'), 'Alert not shown', { timeout: 500 });
    expect(el.shadowRoot.querySelector('tbt-alert').getAttribute('variant')).to.equal('danger');
  });

  it('calls fetch with updated sort on tbt-sort event', async () => {
    const calls = [];
    const el = await fixture(html`<tbt-data-table></tbt-data-table>`);
    el.columns = COLS;
    el.fetch = async (params) => { calls.push(params); return { rows: [], total: 0 }; };
    await waitUntil(() => !el._loading, 'Initial load timed out', { timeout: 500 });
    const table = el.shadowRoot.querySelector('tbt-table');
    table.dispatchEvent(new CustomEvent('tbt-sort', { detail: { key: 'name', asc: true }, bubbles: true, composed: true }));
    await waitUntil(() => calls.length >= 2, 'Sort fetch not triggered', { timeout: 500 });
    expect(calls[1].sort).to.equal('name');
    expect(calls[1].order).to.equal('asc');
    expect(calls[1].page).to.equal(1);
  });

  it('exposes refresh() method that re-fetches', async () => {
    let count = 0;
    const el = await fixture(html`<tbt-data-table></tbt-data-table>`);
    el.columns = COLS;
    el.fetch = async () => { count++; return { rows: [], total: 0 }; };
    await waitUntil(() => count >= 1, 'Initial fetch not called', { timeout: 500 });
    el.refresh();
    await waitUntil(() => count >= 2, 'Refresh not triggered', { timeout: 500 });
    expect(count).to.be.at.least(2);
  });

  it('passes axe after load with rows', async () => {
    const rows = [{ id: '1', name: 'Alpha' }, { id: '2', name: 'Beta' }];
    const el = await fixture(html`<tbt-data-table></tbt-data-table>`);
    el.columns = COLS;
    el.fetch = async () => ({ rows, total: 2 });
    await waitUntil(() => el.shadowRoot.querySelector('tbt-table'), 'Table not rendered', { timeout: 500 });
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

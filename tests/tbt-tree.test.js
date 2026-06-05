import { html, fixture, expect, oneEvent } from '@open-wc/testing';
import '../components/tbt-tree.js';

const axe = window.axe;
const NODES = [
  { id: '1', label: 'Assets', icon: 'folder', children: [
    { id: '1-1', label: 'Cash' },
    { id: '1-2', label: 'Accounts receivable' },
  ]},
  { id: '2', label: 'Liabilities', children: [
    { id: '2-1', label: 'Accounts payable' },
  ]},
];

describe('tbt-tree', () => {
  it('renders a tree role with treeitems', async () => {
    const el = await fixture(html`<tbt-tree .nodes=${NODES}></tbt-tree>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('[role="tree"]')).to.exist;
    expect(el.shadowRoot.querySelectorAll('[role="treeitem"]').length).to.be.greaterThan(0);
  });

  it('opens the root level by default so children are visible', async () => {
    const el = await fixture(html`<tbt-tree .nodes=${NODES}></tbt-tree>`);
    await el.updateComplete;
    expect(el.shadowRoot.textContent).to.include('Cash');
    expect(el.shadowRoot.textContent).to.include('Accounts payable');
  });

  it('collapses a branch when its chevron is toggled', async () => {
    const el = await fixture(html`<tbt-tree .nodes=${NODES}></tbt-tree>`);
    await el.updateComplete;
    // First treeitem is "Assets" (a branch) — click its chevron.
    const chevron = el.shadowRoot.querySelector('.row[aria-expanded] .chevron');
    chevron.click();
    await el.updateComplete;
    expect(el.shadowRoot.textContent).to.not.include('Cash');
  });

  it('selects a node and fires tbt-select on click', async () => {
    const el = await fixture(html`<tbt-tree .nodes=${NODES}></tbt-tree>`);
    await el.updateComplete;
    const rows = [...el.shadowRoot.querySelectorAll('.row')];
    const cashRow = rows.find(r => r.textContent.trim() === 'Cash');
    setTimeout(() => cashRow.click());
    const ev = await oneEvent(el, 'tbt-select');
    expect(ev.detail.node.id).to.equal('1-1');
    expect(el.selected).to.equal('1-1');
    expect(el.shadowRoot.querySelector('[aria-selected="true"]').textContent.trim()).to.equal('Cash');
  });

  it('marks branches with aria-expanded and leaves without', async () => {
    const el = await fixture(html`<tbt-tree .nodes=${NODES}></tbt-tree>`);
    await el.updateComplete;
    const rows = [...el.shadowRoot.querySelectorAll('.row')];
    const assets = rows.find(r => r.textContent.includes('Assets'));
    const cash = rows.find(r => r.textContent.trim() === 'Cash');
    expect(assets.getAttribute('aria-expanded')).to.equal('true');
    expect(cash.hasAttribute('aria-expanded')).to.be.false;
  });

  it('passes axe', async () => {
    const el = await fixture(html`<tbt-tree .nodes=${NODES} selected="1-1"></tbt-tree>`);
    await el.updateComplete;
    const results = await axe.run(el, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

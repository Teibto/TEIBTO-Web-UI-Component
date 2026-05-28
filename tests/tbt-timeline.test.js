import { fixture, html, expect } from '@open-wc/testing';
import '../components/tbt-timeline.js';

const axe = window.axe;

const ENTRIES = [
  { label: 'Order created',   timestamp: '2026-05-20T09:00:00', user: 'Wichit', icon: 'plus',  variant: 'primary' },
  { label: 'Submitted',       timestamp: '2026-05-20T10:30:00', user: 'Wichit', icon: 'send',  variant: 'info',
    content: 'Sent to manager for review' },
  { label: 'Approved',        timestamp: '2026-05-21T14:00:00', user: 'Manager', icon: 'check', variant: 'success' },
  { label: 'Pending payment', timestamp: '2026-05-22T08:00:00', variant: 'warning' },
];

describe('tbt-timeline', () => {
  it('renders one list item per entry', async () => {
    const el = await fixture(html`<tbt-timeline .entries=${ENTRIES}></tbt-timeline>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelectorAll('.entry')).to.have.length(4);
  });

  it('renders label text for each entry', async () => {
    const el = await fixture(html`<tbt-timeline .entries=${ENTRIES}></tbt-timeline>`);
    await el.updateComplete;
    const labels = [...el.shadowRoot.querySelectorAll('.label')].map(l => l.textContent.trim());
    expect(labels[0]).to.equal('Order created');
    expect(labels[2]).to.equal('Approved');
  });

  it('renders dot with correct variant class', async () => {
    const el = await fixture(html`<tbt-timeline .entries=${ENTRIES}></tbt-timeline>`);
    await el.updateComplete;
    const dots = el.shadowRoot.querySelectorAll('.dot');
    expect(dots[0].classList.contains('dot--primary')).to.be.true;
    expect(dots[2].classList.contains('dot--success')).to.be.true;
    expect(dots[3].classList.contains('dot--warning')).to.be.true;
  });

  it('uses neutral variant when variant is omitted', async () => {
    const el = await fixture(html`<tbt-timeline .entries=${[{ label: 'Event' }]}></tbt-timeline>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.dot').classList.contains('dot--neutral')).to.be.true;
  });

  it('renders icon when provided', async () => {
    const el = await fixture(html`<tbt-timeline .entries=${ENTRIES}></tbt-timeline>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.ti-plus')).to.exist;
    expect(el.shadowRoot.querySelector('.ti-check')).to.exist;
  });

  it('renders dot-inner fallback when no icon', async () => {
    const el = await fixture(html`<tbt-timeline .entries=${[{ label: 'No icon' }]}></tbt-timeline>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.dot-inner')).to.exist;
  });

  it('renders content block when content is provided', async () => {
    const el = await fixture(html`<tbt-timeline .entries=${ENTRIES}></tbt-timeline>`);
    await el.updateComplete;
    const contents = el.shadowRoot.querySelectorAll('.content');
    expect(contents).to.have.length(1);
    expect(contents[0].textContent.trim()).to.equal('Sent to manager for review');
  });

  it('renders meta with timestamp and user', async () => {
    const el = await fixture(html`<tbt-timeline .entries=${ENTRIES}></tbt-timeline>`);
    await el.updateComplete;
    const meta = el.shadowRoot.querySelectorAll('.meta')[0];
    expect(meta.textContent).to.include('Wichit');
  });

  it('last entry has no visible connector line', async () => {
    const el = await fixture(html`<tbt-timeline .entries=${ENTRIES}></tbt-timeline>`);
    await el.updateComplete;
    const entries = el.shadowRoot.querySelectorAll('.entry');
    const lastLine = entries[entries.length - 1].querySelector('.line');
    expect(getComputedStyle(lastLine).display).to.equal('none');
  });

  it('compact mode hides meta and content', async () => {
    const el = await fixture(html`<tbt-timeline compact .entries=${ENTRIES}></tbt-timeline>`);
    await el.updateComplete;
    const meta = el.shadowRoot.querySelector('.meta');
    const content = el.shadowRoot.querySelector('.content');
    expect(getComputedStyle(meta).display).to.equal('none');
    expect(getComputedStyle(content).display).to.equal('none');
  });

  it('renders empty with no entries', async () => {
    const el = await fixture(html`<tbt-timeline></tbt-timeline>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelectorAll('.entry')).to.have.length(0);
  });

  it('formats ISO timestamp as human-readable string', async () => {
    const el = await fixture(html`
      <tbt-timeline .entries=${[{ label: 'Event', timestamp: '2026-05-20T09:00:00' }]}>
      </tbt-timeline>`);
    await el.updateComplete;
    const meta = el.shadowRoot.querySelector('.meta');
    expect(meta.textContent).to.include('May 20, 2026');
  });

  it('uses raw string when timestamp is not a valid ISO date', async () => {
    const el = await fixture(html`
      <tbt-timeline .entries=${[{ label: 'Event', timestamp: 'Yesterday' }]}>
      </tbt-timeline>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.meta').textContent).to.include('Yesterday');
  });

  it('passes axe', async () => {
    const el = await fixture(html`<tbt-timeline .entries=${ENTRIES}></tbt-timeline>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

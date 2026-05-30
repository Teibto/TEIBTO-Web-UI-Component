import { html, fixture, expect, oneEvent } from '@open-wc/testing';
import '../components/tbt-chart.js';

const axe = window.axe;

const DATA = [
  { label: 'Jan', value: 120 },
  { label: 'Feb', value: 98 },
  { label: 'Mar', value: 150 },
];
const SERIES = [
  { name: '2025', data: [{ label: 'Q1', value: 10 }, { label: 'Q2', value: 20 }] },
  { name: '2026', data: [{ label: 'Q1', value: 15 }, { label: 'Q2', value: 25 }] },
];

describe('tbt-chart', () => {
  it('renders an <svg> for a bar chart', async () => {
    const el = await fixture(html`<tbt-chart type="bar" .data=${DATA}></tbt-chart>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('svg')).to.exist;
  });

  it('renders one bar <rect> per data point', async () => {
    const el = await fixture(html`<tbt-chart type="bar" .data=${DATA}></tbt-chart>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelectorAll('rect.bar')).to.have.length(3);
  });

  it('renders a polyline for a line chart', async () => {
    const el = await fixture(html`<tbt-chart type="line" .data=${DATA}></tbt-chart>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('polyline.line-path')).to.exist;
  });

  it('renders an area polygon for type="area"', async () => {
    const el = await fixture(html`<tbt-chart type="area" .data=${DATA}></tbt-chart>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('polygon.area-fill')).to.exist;
  });

  it('multi-series line renders one polyline per series', async () => {
    const el = await fixture(html`<tbt-chart type="line" .series=${SERIES}></tbt-chart>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelectorAll('polyline.line-path')).to.have.length(2);
  });

  it('renders one slice <path> per slice for a donut', async () => {
    const el = await fixture(html`<tbt-chart type="donut" .data=${DATA}></tbt-chart>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelectorAll('path.slice')).to.have.length(3);
  });

  it('shows a legend for donut charts', async () => {
    const el = await fixture(html`<tbt-chart type="donut" .data=${DATA}></tbt-chart>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelectorAll('.legend .legend-item')).to.have.length(3);
  });

  it('sparkline renders a single polyline and no axis labels', async () => {
    const el = await fixture(html`<tbt-chart type="sparkline" .data=${DATA}></tbt-chart>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelectorAll('polyline.line-path')).to.have.length(1);
    expect(el.shadowRoot.querySelectorAll('.axis-label')).to.have.length(0);
  });

  it('shows "No data" when data is empty', async () => {
    const el = await fixture(html`<tbt-chart type="bar" .data=${[]}></tbt-chart>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.empty')).to.exist;
    expect(el.shadowRoot.textContent).to.include('No data');
  });

  it('fires tbt-chart-select with index + datum when a bar is clicked', async () => {
    const el = await fixture(html`<tbt-chart type="bar" .data=${DATA}></tbt-chart>`);
    await el.updateComplete;
    setTimeout(() => el.shadowRoot.querySelectorAll('rect.bar')[1].dispatchEvent(new MouseEvent('click', { bubbles: true })));
    const ev = await oneEvent(el, 'tbt-chart-select');
    expect(ev.detail.index).to.equal(1);
    expect(ev.detail.datum.label).to.equal('Feb');
  });

  it('formats axis labels with value-prefix', async () => {
    const el = await fixture(html`<tbt-chart type="bar" value-prefix="฿" .data=${DATA}></tbt-chart>`);
    await el.updateComplete;
    const labels = [...el.shadowRoot.querySelectorAll('.axis-label')].map(t => t.textContent);
    expect(labels.some(l => l.includes('฿'))).to.be.true;
  });

  it('passes axe with data', async () => {
    const el = await fixture(html`<tbt-chart type="bar" .data=${DATA}></tbt-chart>`);
    await el.updateComplete;
    const results = await axe.run(el, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

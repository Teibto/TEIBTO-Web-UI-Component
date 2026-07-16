import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-section.js';

const axe = window.axe;

describe('tbt-section', () => {
  it('renders without throwing', async () => {
    const el = await fixture(html`<tbt-section title="Line items"></tbt-section>`);
    expect(el.shadowRoot).to.exist;
  });

  it('renders title text in shadow DOM', async () => {
    const el = await fixture(html`<tbt-section title="Document info"></tbt-section>`);
    expect(el.shadowRoot.textContent).to.include('Document info');
  });

  it('renders slotted content', async () => {
    const el = await fixture(html`
      <tbt-section title="Test">
        <p id="child">Hello</p>
      </tbt-section>
    `);
    expect(el.querySelector('#child')).to.exist;
  });

  it('renders without title (plain card)', async () => {
    const el = await fixture(html`<tbt-section></tbt-section>`);
    expect(el.shadowRoot).to.exist;
  });

  it('reflects collapsed attribute', async () => {
    const el = await fixture(html`<tbt-section title="Info" collapsed></tbt-section>`);
    expect(el.getAttribute('collapsed')).to.not.be.null;
  });

  it('passes axe', async () => {
    const el = await fixture(html`<tbt-section title="Document info"></tbt-section>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });

  it('toggle button gets an aria-label fallback when title is empty (axe button-name)', async () => {
    const el = await fixture(html`<tbt-section></tbt-section>`);
    await el.updateComplete;
    const btn = el.shadowRoot.querySelector('.toggle-btn');
    expect(btn.getAttribute('aria-label')).to.equal('Toggle section');
  });

  it('toggle button has no aria-label override when title is present', async () => {
    const el = await fixture(html`<tbt-section title="Info"></tbt-section>`);
    await el.updateComplete;
    const btn = el.shadowRoot.querySelector('.toggle-btn');
    expect(btn.hasAttribute('aria-label')).to.be.false;
  });

  it('passes axe with empty title (chevron-only header)', async () => {
    const el = await fixture(html`<tbt-section></tbt-section>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });

  it('not-collapsible without title hides the empty header strip', async () => {
    const el = await fixture(html`<tbt-section not-collapsible></tbt-section>`);
    await el.updateComplete;
    const header = el.shadowRoot.querySelector('header');
    expect(getComputedStyle(header).display).to.equal('none');
  });

  it('not-collapsible WITH title keeps its header', async () => {
    const el = await fixture(html`<tbt-section not-collapsible title="Info"></tbt-section>`);
    await el.updateComplete;
    const header = el.shadowRoot.querySelector('header');
    expect(getComputedStyle(header).display).to.not.equal('none');
  });
});

import { fixture, html, expect } from '@open-wc/testing';
import '../components/tbt-empty-state.js';

const axe = window.axe;

describe('tbt-empty-state', () => {
  it('renders icon wrap', async () => {
    const el = await fixture(html`<tbt-empty-state></tbt-empty-state>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.icon-wrap')).to.exist;
  });

  it('default icon is inbox', async () => {
    const el = await fixture(html`<tbt-empty-state></tbt-empty-state>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.icon-wrap i').classList.contains('ti-inbox')).to.be.true;
  });

  it('uses custom icon', async () => {
    const el = await fixture(html`<tbt-empty-state icon="search"></tbt-empty-state>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.icon-wrap i').classList.contains('ti-search')).to.be.true;
  });

  it('renders title', async () => {
    const el = await fixture(html`<tbt-empty-state title="No results found"></tbt-empty-state>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.title').textContent.trim()).to.equal('No results found');
  });

  it('default title is "No data"', async () => {
    const el = await fixture(html`<tbt-empty-state></tbt-empty-state>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.title').textContent.trim()).to.equal('No data');
  });

  it('renders description when provided', async () => {
    const el = await fixture(html`
      <tbt-empty-state title="Empty" description="Try adjusting your search filters."></tbt-empty-state>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.description').textContent.trim()).to.equal('Try adjusting your search filters.');
  });

  it('omits description element when not provided', async () => {
    const el = await fixture(html`<tbt-empty-state title="Empty"></tbt-empty-state>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.description')).to.be.null;
  });

  it('renders named actions slot', async () => {
    const el = await fixture(html`
      <tbt-empty-state title="No items">
        <button slot="actions">Create new</button>
      </tbt-empty-state>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('slot[name="actions"]')).to.exist;
  });

  it('applies size="sm" attribute', async () => {
    const el = await fixture(html`<tbt-empty-state title="Empty" size="sm"></tbt-empty-state>`);
    await el.updateComplete;
    expect(el.getAttribute('size')).to.equal('sm');
  });

  it('applies size="lg" attribute', async () => {
    const el = await fixture(html`<tbt-empty-state title="Empty" size="lg"></tbt-empty-state>`);
    await el.updateComplete;
    expect(el.getAttribute('size')).to.equal('lg');
  });

  it('icon wrap has aria-hidden', async () => {
    const el = await fixture(html`<tbt-empty-state title="No data"></tbt-empty-state>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.icon-wrap').getAttribute('aria-hidden')).to.equal('true');
  });

  it('passes axe', async () => {
    const el = await fixture(html`
      <tbt-empty-state
        title="No documents found"
        description="Try adjusting your filters or create a new document."
        icon="file-off">
      </tbt-empty-state>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

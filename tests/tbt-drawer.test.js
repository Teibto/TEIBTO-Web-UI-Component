import { fixture, html, expect } from '@open-wc/testing';
import '../components/tbt-drawer.js';

const axe = window.axe;

describe('tbt-drawer', () => {
  it('dialog is closed by default', async () => {
    const el = await fixture(html`<tbt-drawer title="Filters"></tbt-drawer>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('dialog').open).to.be.false;
  });

  it('open=true shows dialog', async () => {
    const el = await fixture(html`<tbt-drawer title="Filters"></tbt-drawer>`);
    el.open = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('dialog').open).to.be.true;
  });

  it('open attribute reflects', async () => {
    const el = await fixture(html`<tbt-drawer title="Filters"></tbt-drawer>`);
    el.open = true;
    await el.updateComplete;
    expect(el.hasAttribute('open')).to.be.true;
    el.open = false;
    await el.updateComplete;
    expect(el.hasAttribute('open')).to.be.false;
  });

  it('renders title', async () => {
    const el = await fixture(html`<tbt-drawer title="Filter options"></tbt-drawer>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.title').textContent.trim()).to.equal('Filter options');
  });

  it('renders body slot', async () => {
    const el = await fixture(html`
      <tbt-drawer title="Test">
        <p id="body-content">Body text</p>
      </tbt-drawer>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('slot:not([name])')).to.exist;
    expect(el.querySelector('#body-content')).to.exist;
  });

  it('renders footer slot', async () => {
    const el = await fixture(html`
      <tbt-drawer title="Test">
        <button slot="footer">Save</button>
      </tbt-drawer>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('slot[name="footer"]')).to.exist;
  });

  it('shows close button when closable=true (default)', async () => {
    const el = await fixture(html`<tbt-drawer title="Test"></tbt-drawer>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.close-btn')).to.exist;
  });

  it('hides close button when closable=false', async () => {
    const el = await fixture(html`<tbt-drawer title="Test" .closable=${false}></tbt-drawer>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.close-btn')).to.be.null;
  });

  it('fires tbt-close when close button clicked', async () => {
    const el = await fixture(html`<tbt-drawer title="Test"></tbt-drawer>`);
    el.open = true;
    await el.updateComplete;
    let closed = false;
    el.addEventListener('tbt-close', () => { closed = true; });
    el.shadowRoot.querySelector('.close-btn').click();
    expect(closed).to.be.true;
  });

  it('fires tbt-close on Escape when closable', async () => {
    const el = await fixture(html`<tbt-drawer title="Test"></tbt-drawer>`);
    el.open = true;
    await el.updateComplete;
    let closed = false;
    el.addEventListener('tbt-close', () => { closed = true; });
    el.shadowRoot.querySelector('dialog').dispatchEvent(
      new Event('cancel', { cancelable: true, bubbles: true })
    );
    expect(closed).to.be.true;
  });

  it('does not fire tbt-close on Escape when not closable', async () => {
    const el = await fixture(html`<tbt-drawer title="Test" .closable=${false}></tbt-drawer>`);
    el.open = true;
    await el.updateComplete;
    let closed = false;
    el.addEventListener('tbt-close', () => { closed = true; });
    el.shadowRoot.querySelector('dialog').dispatchEvent(
      new Event('cancel', { cancelable: true, bubbles: true })
    );
    expect(closed).to.be.false;
  });

  it('reflects placement attribute', async () => {
    const el = await fixture(html`<tbt-drawer title="Test" placement="left"></tbt-drawer>`);
    await el.updateComplete;
    expect(el.getAttribute('placement')).to.equal('left');
  });

  it('reflects size attribute', async () => {
    const el = await fixture(html`<tbt-drawer title="Test" size="lg"></tbt-drawer>`);
    await el.updateComplete;
    expect(el.getAttribute('size')).to.equal('lg');
  });

  it('passes axe when open', async () => {
    const el = await fixture(html`
      <tbt-drawer title="Filter options">
        <p>Apply filters to narrow your search results.</p>
        <button slot="footer">Apply</button>
        <button slot="footer">Reset</button>
      </tbt-drawer>`);
    el.open = true;
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

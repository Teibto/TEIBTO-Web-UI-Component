import { fixture, html, expect } from '@open-wc/testing';
import '../components/tbt-list.js';

const axe = window.axe;

describe('tbt-list + tbt-list-item', () => {
  it('tbt-list renders a <ul>', async () => {
    const el = await fixture(html`<tbt-list></tbt-list>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('ul')).to.exist;
  });

  it('tbt-list-item renders label', async () => {
    const el = await fixture(html`<tbt-list-item label="Name" value="Wichit"></tbt-list-item>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.label').textContent.trim()).to.equal('Name');
  });

  it('tbt-list-item renders value from prop as slot fallback', async () => {
    const el = await fixture(html`<tbt-list-item label="Name" value="Wichit"></tbt-list-item>`);
    await el.updateComplete;
    const slot = el.shadowRoot.querySelector('.value-col slot');
    expect(slot.assignedNodes().length).to.equal(0);
    expect(el.shadowRoot.querySelector('.value-col').textContent.trim()).to.equal('Wichit');
  });

  it('tbt-list-item accepts slotted value content', async () => {
    const el = await fixture(html`
      <tbt-list-item label="Status">
        <span id="badge-val">Approved</span>
      </tbt-list-item>`);
    await el.updateComplete;
    const slot = el.shadowRoot.querySelector('.value-col slot');
    expect(slot.assignedElements().length).to.equal(1);
    expect(el.querySelector('#badge-val')).to.exist;
  });

  it('renders icon when provided', async () => {
    const el = await fixture(html`<tbt-list-item label="Name" value="Wichit" icon="user"></tbt-list-item>`);
    await el.updateComplete;
    const icon = el.shadowRoot.querySelector('.icon-col i');
    expect(icon).to.exist;
    expect(icon.classList.contains('ti-user')).to.be.true;
  });

  it('omits icon-col when icon not provided', async () => {
    const el = await fixture(html`<tbt-list-item label="Name" value="Wichit"></tbt-list-item>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.icon-col')).to.be.null;
  });

  it('renders action slot', async () => {
    const el = await fixture(html`
      <tbt-list-item label="Email" value="w@t.com">
        <button slot="action">Copy</button>
      </tbt-list-item>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('slot[name="action"]')).to.exist;
    expect(el.querySelector('[slot="action"]')).to.exist;
  });

  it('muted attribute reflects', async () => {
    const el = await fixture(html`<tbt-list-item label="Notes" value="—" muted></tbt-list-item>`);
    await el.updateComplete;
    expect(el.hasAttribute('muted')).to.be.true;
  });

  it('tbt-list-item has role="listitem"', async () => {
    const el = await fixture(html`<tbt-list-item label="X" value="Y"></tbt-list-item>`);
    await el.updateComplete;
    expect(el.getAttribute('role')).to.equal('listitem');
  });

  it('compact attribute reflects on tbt-list', async () => {
    const el = await fixture(html`<tbt-list compact></tbt-list>`);
    await el.updateComplete;
    expect(el.hasAttribute('compact')).to.be.true;
  });

  it('divided attribute reflects on tbt-list', async () => {
    const el = await fixture(html`<tbt-list divided></tbt-list>`);
    await el.updateComplete;
    expect(el.hasAttribute('divided')).to.be.true;
  });

  it('passes axe — full list', async () => {
    const el = await fixture(html`
      <tbt-list divided>
        <tbt-list-item label="Name"       value="Wichit Wongta"     icon="user"></tbt-list-item>
        <tbt-list-item label="Department" value="Finance"            icon="building"></tbt-list-item>
        <tbt-list-item label="Status">
          <span>Active</span>
        </tbt-list-item>
      </tbt-list>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

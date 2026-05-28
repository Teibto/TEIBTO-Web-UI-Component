import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-sidebar.js';

const axe = window.axe;

describe('tbt-sidebar', () => {
  it('renders <nav> with slot, defaults collapsed and collapsible to false', async () => {
    const el = await fixture(html`<tbt-sidebar></tbt-sidebar>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('nav')).to.exist;
    expect(el.shadowRoot.querySelector('slot')).to.exist;
    expect(el.collapsed).to.be.false;
    expect(el.collapsible).to.be.false;
  });

  it('reflects collapsed attribute', async () => {
    const el = await fixture(html`<tbt-sidebar collapsed></tbt-sidebar>`);
    await el.updateComplete;
    expect(el.collapsed).to.be.true;
    expect(el.hasAttribute('collapsed')).to.be.true;
  });

  it('shows .toggle-btn and fires tbt-sidebar-toggle when collapsible', async () => {
    const el = await fixture(html`<tbt-sidebar collapsible></tbt-sidebar>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.toggle-btn')).to.exist;
    let detail = null;
    el.addEventListener('tbt-sidebar-toggle', e => { detail = e.detail; });
    el._toggle();
    expect(detail).to.exist;
    expect(detail.collapsed).to.be.true;
    expect(el.collapsed).to.be.true;
  });
});

describe('tbt-sidebar-item', () => {
  it('renders anchor with label and href', async () => {
    const el = await fixture(html`<tbt-sidebar-item label="Dashboard" href="/dash"></tbt-sidebar-item>`);
    await el.updateComplete;
    const a = el.shadowRoot.querySelector('a');
    expect(a).to.exist;
    expect(a.textContent.trim()).to.include('Dashboard');
    expect(a.getAttribute('href')).to.equal('/dash');
  });

  it('reflects active attribute', async () => {
    const el = await fixture(html`<tbt-sidebar-item label="Active" active></tbt-sidebar-item>`);
    await el.updateComplete;
    expect(el.active).to.be.true;
    expect(el.hasAttribute('active')).to.be.true;
  });

  it('href defaults to "#" when not set', async () => {
    const el = await fixture(html`<tbt-sidebar-item label="No href"></tbt-sidebar-item>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('a').getAttribute('href')).to.equal('#');
  });
});

describe('tbt-sidebar-item a11y', () => {
  it('has aria-current="page" when active', async () => {
    const el = await fixture(html`<tbt-sidebar-item label="Dashboard" active></tbt-sidebar-item>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('a').getAttribute('aria-current')).to.equal('page');
  });

  it('no aria-current attribute when not active', async () => {
    const el = await fixture(html`<tbt-sidebar-item label="Dashboard"></tbt-sidebar-item>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('a').hasAttribute('aria-current')).to.be.false;
  });

  it('passes axe (active item)', async () => {
    const el = await fixture(html`<tbt-sidebar-item label="Dashboard" icon="home" active href="/dash"></tbt-sidebar-item>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

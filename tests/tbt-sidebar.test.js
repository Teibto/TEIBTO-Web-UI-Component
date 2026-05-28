import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-sidebar.js';

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

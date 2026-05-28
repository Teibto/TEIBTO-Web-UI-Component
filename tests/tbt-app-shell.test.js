import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-app-shell.js';

describe('tbt-app-shell', () => {
  it('renders menubar, sidebar and content named slots', async () => {
    const el = await fixture(html`<tbt-app-shell></tbt-app-shell>`);
    await el.updateComplete;
    const slotNames = [...el.shadowRoot.querySelectorAll('slot')].map(s => s.getAttribute('name'));
    expect(slotNames).to.include('menubar');
    expect(slotNames).to.include('sidebar');
    expect(slotNames).to.include('content');
  });

  it('no-sidebar attribute not present by default', async () => {
    const el = await fixture(html`<tbt-app-shell></tbt-app-shell>`);
    expect(el.hasAttribute('no-sidebar')).to.be.false;
  });

  it('reflects no-sidebar attribute', async () => {
    const el = await fixture(html`<tbt-app-shell no-sidebar></tbt-app-shell>`);
    await el.updateComplete;
    expect(el.noSidebar).to.be.true;
    expect(el.hasAttribute('no-sidebar')).to.be.true;
  });

  it('has .body wrapper for sidebar + content layout', async () => {
    const el = await fixture(html`<tbt-app-shell></tbt-app-shell>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.body')).to.exist;
  });

  it('has .content-slot wrapper', async () => {
    const el = await fixture(html`<tbt-app-shell></tbt-app-shell>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.content-slot')).to.exist;
  });

  it('no backdrop visible by default', async () => {
    const el = await fixture(html`<tbt-app-shell></tbt-app-shell>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.backdrop')).to.not.exist;
  });

  it('shows backdrop when tbt-menu-toggle event fires', async () => {
    const el = await fixture(html`<tbt-app-shell></tbt-app-shell>`);
    await el.updateComplete;
    el.dispatchEvent(new CustomEvent('tbt-menu-toggle', { bubbles: true }));
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.backdrop')).to.exist;
  });

  it('closes backdrop when backdrop is clicked', async () => {
    const el = await fixture(html`<tbt-app-shell></tbt-app-shell>`);
    await el.updateComplete;
    el.dispatchEvent(new CustomEvent('tbt-menu-toggle', { bubbles: true }));
    await el.updateComplete;
    el.shadowRoot.querySelector('.backdrop').click();
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.backdrop')).to.not.exist;
  });
});

import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-menubar.js';

describe('tbt-menubar', () => {
  it('renders <nav> in shadow DOM', async () => {
    const el = await fixture(html`<tbt-menubar title="Teibto ERP"></tbt-menubar>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('nav')).to.exist;
  });

  it('renders brand title text', async () => {
    const el = await fixture(html`<tbt-menubar title="Teibto ERP"></tbt-menubar>`);
    await el.updateComplete;
    const title = el.shadowRoot.querySelector('.brand-title');
    expect(title).to.exist;
    expect(title.textContent.trim()).to.equal('Teibto ERP');
  });

  it('renders logo img when logo prop is set', async () => {
    const el = await fixture(html`<tbt-menubar logo="/logo.png" title="Test"></tbt-menubar>`);
    await el.updateComplete;
    const img = el.shadowRoot.querySelector('.brand img');
    expect(img).to.exist;
    expect(img.getAttribute('src')).to.equal('/logo.png');
  });

  it('no logo img when logo prop is not set', async () => {
    const el = await fixture(html`<tbt-menubar title="Test"></tbt-menubar>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.brand img')).to.not.exist;
  });

  it('_toggleNav() fires tbt-menu-toggle event', async () => {
    const el = await fixture(html`<tbt-menubar title="Test"></tbt-menubar>`);
    await el.updateComplete;
    let fired = false;
    el.addEventListener('tbt-menu-toggle', () => { fired = true; });
    el._toggleNav();
    expect(fired).to.be.true;
  });
});

describe('tbt-menu-item', () => {
  it('renders anchor with label and href', async () => {
    const el = await fixture(html`<tbt-menu-item label="Dashboard" href="/dashboard"></tbt-menu-item>`);
    await el.updateComplete;
    const a = el.shadowRoot.querySelector('a');
    expect(a).to.exist;
    expect(a.textContent.trim()).to.include('Dashboard');
    expect(a.getAttribute('href')).to.equal('/dashboard');
  });

  it('reflects active attribute', async () => {
    const el = await fixture(html`<tbt-menu-item label="Active" active></tbt-menu-item>`);
    await el.updateComplete;
    expect(el.active).to.be.true;
    expect(el.hasAttribute('active')).to.be.true;
  });

  it('href defaults to "#" when not set', async () => {
    const el = await fixture(html`<tbt-menu-item label="No href"></tbt-menu-item>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('a').getAttribute('href')).to.equal('#');
  });
});

describe('tbt-menu-group', () => {
  it('renders .trigger button with label', async () => {
    const el = await fixture(html`<tbt-menu-group label="ขาย"></tbt-menu-group>`);
    await el.updateComplete;
    const trigger = el.shadowRoot.querySelector('.trigger');
    expect(trigger).to.exist;
    expect(trigger.textContent.trim()).to.include('ขาย');
  });

  it('starts closed (_open = false)', async () => {
    const el = await fixture(html`<tbt-menu-group label="Test"></tbt-menu-group>`);
    expect(el._open).to.be.false;
    expect(el.hasAttribute('open')).to.be.false;
  });

  it('_toggle() opens and sets open attribute', async () => {
    const el = await fixture(html`<tbt-menu-group label="Test"></tbt-menu-group>`);
    await el.updateComplete;
    el._toggle();
    await el.updateComplete;
    expect(el._open).to.be.true;
    expect(el.hasAttribute('open')).to.be.true;
  });
});

describe('tbt-menu-item a11y', () => {
  it('has aria-current="page" when active', async () => {
    const el = await fixture(html`<tbt-menu-item label="Dashboard" active></tbt-menu-item>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('a').getAttribute('aria-current')).to.equal('page');
  });

  it('no aria-current attribute when not active', async () => {
    const el = await fixture(html`<tbt-menu-item label="Dashboard"></tbt-menu-item>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('a').hasAttribute('aria-current')).to.be.false;
  });
});

describe('tbt-menu-group a11y', () => {
  it('trigger has aria-haspopup="true"', async () => {
    const el = await fixture(html`<tbt-menu-group label="ขาย"></tbt-menu-group>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.trigger').getAttribute('aria-haspopup')).to.equal('true');
  });

  it('aria-expanded="false" when closed', async () => {
    const el = await fixture(html`<tbt-menu-group label="ขาย"></tbt-menu-group>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.trigger').getAttribute('aria-expanded')).to.equal('false');
  });

  it('aria-expanded="true" after _toggle()', async () => {
    const el = await fixture(html`<tbt-menu-group label="ขาย"></tbt-menu-group>`);
    await el.updateComplete;
    el._toggle();
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.trigger').getAttribute('aria-expanded')).to.equal('true');
  });

  it('dropdown div has role="menu"', async () => {
    const el = await fixture(html`<tbt-menu-group label="ขาย"></tbt-menu-group>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.dropdown').getAttribute('role')).to.equal('menu');
  });
});

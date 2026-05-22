import { fixture, html, expect } from '@open-wc/testing';
import '../components/tbt-breadcrumb.js';

describe('tbt-breadcrumb', () => {
  it('renders links for non-last items', async () => {
    const el = await fixture(html`<tbt-breadcrumb></tbt-breadcrumb>`);
    el.items = [{ label: 'Home', href: '/home' }, { label: 'Sales', href: '/sales' }, { label: 'Current' }];
    await el.updateComplete;
    const links = el.shadowRoot.querySelectorAll('a');
    expect(links.length).to.equal(2);
    expect(links[0].textContent.trim()).to.equal('Home');
  });

  it('renders last item as non-link with aria-current', async () => {
    const el = await fixture(html`<tbt-breadcrumb></tbt-breadcrumb>`);
    el.items = [{ label: 'Home', href: '/home' }, { label: 'Page' }];
    await el.updateComplete;
    const current = el.shadowRoot.querySelector('[aria-current="page"]');
    expect(current).to.exist;
    expect(current.textContent.trim()).to.equal('Page');
  });

  it('renders nothing for empty items', async () => {
    const el = await fixture(html`<tbt-breadcrumb></tbt-breadcrumb>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('nav')).to.not.exist;
  });
});

import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-dropdown.js';

const OPTIONS = [
  { value: 'A', label: 'Apple' },
  { value: 'B', label: 'Banana' },
  { value: 'C', label: 'Cherry' },
  { value: 'D', label: 'Durian' },
];

describe('tbt-dropdown', () => {
  it('renders native <select> by default', async () => {
    const el = await fixture(html`<tbt-dropdown .options=${OPTIONS}></tbt-dropdown>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('select')).to.exist;
    expect(el.shadowRoot.querySelector('.trigger')).to.not.exist;
  });

  it('renders custom popover when searchable', async () => {
    const el = await fixture(html`<tbt-dropdown searchable .options=${OPTIONS}></tbt-dropdown>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('select')).to.not.exist;
    expect(el.shadowRoot.querySelector('.trigger')).to.exist;
    expect(el.shadowRoot.querySelector('.dropdown')).to.exist;
  });

  it('opens popover and shows search input on click (searchable)', async () => {
    const el = await fixture(html`<tbt-dropdown searchable .options=${OPTIONS}></tbt-dropdown>`);
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').click();
    await el.updateComplete;
    expect(el.hasAttribute('open')).to.be.true;
    expect(el.shadowRoot.querySelector('.search input')).to.exist;
  });

  it('filters options by search query (case-insensitive)', async () => {
    const el = await fixture(html`<tbt-dropdown searchable .options=${OPTIONS}></tbt-dropdown>`);
    await el.updateComplete;
    el._open = true;
    el._query = 'BAN';
    await el.updateComplete;
    const opts = el.shadowRoot.querySelectorAll('.option');
    const labels = [...opts].map(o => o.textContent.trim());
    expect(labels).to.deep.equal(['Banana']);
  });

  it('shows "no options match" when filter yields zero', async () => {
    const el = await fixture(html`<tbt-dropdown searchable .options=${OPTIONS}></tbt-dropdown>`);
    await el.updateComplete;
    el._open = true;
    el._query = 'zzz';
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.empty-msg')).to.exist;
    expect(el.shadowRoot.querySelectorAll('.option')).to.have.length(0);
  });

  it('picking an option sets value, closes, and fires tbt-change', async () => {
    const el = await fixture(html`<tbt-dropdown searchable .options=${OPTIONS}></tbt-dropdown>`);
    await el.updateComplete;
    el._open = true;
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-change', e => { detail = e.detail; });
    el.shadowRoot.querySelectorAll('.option')[1].click();
    await el.updateComplete;
    expect(el.value).to.equal('B');
    expect(detail.value).to.equal('B');
    expect(detail.label).to.equal('Banana');
    expect(el._open).to.be.false;
  });
});

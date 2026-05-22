import { fixture, html, expect } from '@open-wc/testing';
import '../components/tbt-pagination.js';

describe('tbt-pagination', () => {
  it('renders nothing when total fits on one page', async () => {
    const el = await fixture(html`<tbt-pagination total="10" page="1" page-size="50"></tbt-pagination>`);
    expect(el.shadowRoot.querySelector('.pagination')).to.not.exist;
  });

  it('renders pagination when total exceeds page-size', async () => {
    const el = await fixture(html`<tbt-pagination total="120" page="1" page-size="25"></tbt-pagination>`);
    expect(el.shadowRoot.querySelector('.pagination')).to.exist;
    expect(el.shadowRoot.querySelector('.page-info').textContent).to.include('1–25 of 120');
  });

  it('fires tbt-page-change with correct page on next click', async () => {
    const el = await fixture(html`<tbt-pagination total="100" page="1" page-size="20"></tbt-pagination>`);
    let detail = null;
    el.addEventListener('tbt-page-change', e => { detail = e.detail; });
    el.shadowRoot.querySelector('[aria-label="Next page"]').click();
    expect(detail).to.deep.equal({ page: 2 });
  });

  it('disables prev button on first page', async () => {
    const el = await fixture(html`<tbt-pagination total="100" page="1" page-size="20"></tbt-pagination>`);
    const prev = el.shadowRoot.querySelector('[aria-label="Previous page"]');
    expect(prev.disabled).to.be.true;
  });

  it('disables next button on last page', async () => {
    const el = await fixture(html`<tbt-pagination total="100" page="5" page-size="20"></tbt-pagination>`);
    const next = el.shadowRoot.querySelector('[aria-label="Next page"]');
    expect(next.disabled).to.be.true;
  });
});

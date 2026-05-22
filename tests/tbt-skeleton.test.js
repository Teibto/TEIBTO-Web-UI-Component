import { fixture, html, expect } from '@open-wc/testing';
import '../components/tbt-skeleton.js';

describe('tbt-skeleton', () => {
  it('renders a single text line by default', async () => {
    const el = await fixture(html`<tbt-skeleton></tbt-skeleton>`);
    expect(el.shadowRoot.querySelectorAll('.bone').length).to.equal(1);
  });

  it('renders multiple text lines', async () => {
    const el = await fixture(html`<tbt-skeleton variant="text" lines="3"></tbt-skeleton>`);
    expect(el.shadowRoot.querySelectorAll('.bone').length).to.equal(3);
  });

  it('renders block variant', async () => {
    const el = await fixture(html`<tbt-skeleton variant="block"></tbt-skeleton>`);
    expect(el.shadowRoot.querySelector('.bone')).to.exist;
  });

  it('renders circle variant', async () => {
    const el = await fixture(html`<tbt-skeleton variant="circle"></tbt-skeleton>`);
    expect(el.shadowRoot.querySelector('.bone')).to.exist;
  });

  it('renders card variant with header and lines', async () => {
    const el = await fixture(html`<tbt-skeleton variant="card"></tbt-skeleton>`);
    expect(el.shadowRoot.querySelector('.card')).to.exist;
    expect(el.shadowRoot.querySelector('.card-avatar')).to.exist;
    expect(el.shadowRoot.querySelectorAll('.card-line').length).to.equal(3);
  });
});

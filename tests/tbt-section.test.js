import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-section.js';

describe('tbt-section', () => {
  it('renders without throwing', async () => {
    const el = await fixture(html`<tbt-section title="Line items"></tbt-section>`);
    expect(el.shadowRoot).to.exist;
  });

  it('renders title text in shadow DOM', async () => {
    const el = await fixture(html`<tbt-section title="Document info"></tbt-section>`);
    expect(el.shadowRoot.textContent).to.include('Document info');
  });

  it('renders slotted content', async () => {
    const el = await fixture(html`
      <tbt-section title="Test">
        <p id="child">Hello</p>
      </tbt-section>
    `);
    expect(el.querySelector('#child')).to.exist;
  });

  it('renders without title (plain card)', async () => {
    const el = await fixture(html`<tbt-section></tbt-section>`);
    expect(el.shadowRoot).to.exist;
  });

  it('reflects collapsed attribute', async () => {
    const el = await fixture(html`<tbt-section title="Info" collapsed></tbt-section>`);
    expect(el.getAttribute('collapsed')).to.not.be.null;
  });
});

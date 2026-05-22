import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-field.js';

describe('tbt-field', () => {
  it('renders without throwing', async () => {
    const el = await fixture(html`<tbt-field label="Vendor" value="ABC Co."></tbt-field>`);
    expect(el.shadowRoot).to.exist;
  });

  it('renders label text in shadow DOM', async () => {
    const el = await fixture(html`<tbt-field label="Document no." value="PO-001"></tbt-field>`);
    expect(el.shadowRoot.textContent).to.include('Document no.');
  });

  it('renders value text in shadow DOM', async () => {
    const el = await fixture(html`<tbt-field label="Status" value="Approved"></tbt-field>`);
    expect(el.shadowRoot.textContent).to.include('Approved');
  });

  it('reflects required attribute', async () => {
    const el = await fixture(html`<tbt-field label="Vendor" required></tbt-field>`);
    expect(el.getAttribute('required')).to.not.be.null;
  });

  it('renders with empty value without throwing', async () => {
    const el = await fixture(html`<tbt-field label="Notes"></tbt-field>`);
    expect(el.shadowRoot).to.exist;
  });
});

import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-badge.js';

describe('tbt-badge', () => {
  it('renders slot content', async () => {
    const el = await fixture(html`<tbt-badge>Approved</tbt-badge>`);
    expect(el.shadowRoot).to.exist;
    expect(el.textContent.trim()).to.equal('Approved');
  });

  it('defaults to success variant', async () => {
    const el = await fixture(html`<tbt-badge>OK</tbt-badge>`);
    expect(el.variant).to.equal('success');
    expect(el.getAttribute('variant')).to.equal('success');
  });

  it('reflects variant attribute for all supported variants', async () => {
    for (const variant of ['success', 'warning', 'danger', 'info', 'primary', 'neutral']) {
      const el = await fixture(html`<tbt-badge variant="${variant}">Label</tbt-badge>`);
      expect(el.getAttribute('variant')).to.equal(variant);
    }
  });

  it('renders with no children without throwing', async () => {
    const el = await fixture(html`<tbt-badge variant="info"></tbt-badge>`);
    expect(el.shadowRoot).to.exist;
  });
});

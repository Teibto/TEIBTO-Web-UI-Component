import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-badge.js';

const axe = window.axe;

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

  it('passes axe', async () => {
    const el = await fixture(html`<tbt-badge variant="success">Approved</tbt-badge>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

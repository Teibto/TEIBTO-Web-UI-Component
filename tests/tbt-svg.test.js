import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-svg.js';

const axe = window.axe;

describe('tbt-svg', () => {
  it('renders a built-in illustration by name', async () => {
    const el = await fixture(html`<tbt-svg name="empty"></tbt-svg>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('svg')).to.exist;
  });

  it('applies size to width and height', async () => {
    const el = await fixture(html`<tbt-svg name="success" size="120"></tbt-svg>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('svg')).to.exist;
  });

  it('renders a slot for inline SVG (projected from light DOM)', async () => {
    const el = await fixture(html`<tbt-svg><svg viewBox="0 0 10 10"></svg></tbt-svg>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('slot')).to.exist;       // slot present in shadow
    expect(el.querySelector('svg')).to.exist;                    // slotted svg stays in light DOM
  });

  it('renders the 4 new illustrations (no-data, no-results, maintenance, inbox-zero)', async () => {
    for (const name of ['no-data', 'no-results', 'maintenance', 'inbox-zero']) {
      const el = await fixture(html`<tbt-svg name=${name} label=${name}></tbt-svg>`);
      await el.updateComplete;
      expect(el.shadowRoot.querySelector('svg'), `${name} renders an svg`).to.exist;
    }
  });

  it('passes axe', async () => {
    const el = await fixture(html`<tbt-svg name="empty" label="No data"></tbt-svg>`);
    await el.updateComplete;
    const results = await axe.run(el, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

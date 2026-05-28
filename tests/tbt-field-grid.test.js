import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-field-grid.js';
import '../components/tbt-field.js';

const axe = window.axe;

describe('tbt-field-grid', () => {
  it('renders a slot element in shadow DOM', async () => {
    const el = await fixture(html`<tbt-field-grid></tbt-field-grid>`);
    expect(el.shadowRoot.querySelector('slot')).to.exist;
  });

  it('defaults to 2 columns', async () => {
    const el = await fixture(html`<tbt-field-grid></tbt-field-grid>`);
    expect(el.columns).to.equal(2);
  });

  it('reflects columns prop and sets --cols CSS custom property', async () => {
    const el = await fixture(html`<tbt-field-grid columns="4"></tbt-field-grid>`);
    await el.updateComplete;
    expect(el.columns).to.equal(4);
    expect(el.style.getPropertyValue('--cols')).to.equal('4');
  });

  it('updates --cols when columns prop changes', async () => {
    const el = await fixture(html`<tbt-field-grid columns="2"></tbt-field-grid>`);
    await el.updateComplete;
    el.columns = 3;
    await el.updateComplete;
    expect(el.style.getPropertyValue('--cols')).to.equal('3');
  });

  it('slots children through to light DOM', async () => {
    const el = await fixture(html`
      <tbt-field-grid columns="2">
        <span id="a">A</span>
        <span id="b">B</span>
      </tbt-field-grid>`);
    await el.updateComplete;
    expect(el.querySelector('#a')).to.exist;
    expect(el.querySelector('#b')).to.exist;
  });

  it('passes axe with tbt-field children', async () => {
    const el = await fixture(html`
      <tbt-field-grid columns="2">
        <tbt-field label="Vendor" value="ABC Co."></tbt-field>
        <tbt-field label="Status" value="Approved"></tbt-field>
      </tbt-field-grid>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

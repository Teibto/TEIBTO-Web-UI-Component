import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-field-grid.js';

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
});

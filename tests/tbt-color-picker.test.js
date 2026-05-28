import { fixture, html, expect } from '@open-wc/testing';
import '../components/tbt-color-picker.js';

const axe = window.axe;

describe('tbt-color-picker', () => {
  it('renders trigger with "None" when no value', async () => {
    const el = await fixture(html`<tbt-color-picker></tbt-color-picker>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.hex-label').textContent.trim()).to.equal('None');
    expect(el.shadowRoot.querySelector('.swatch-preview').classList.contains('empty')).to.be.true;
  });

  it('shows value in trigger when value is set', async () => {
    const el = await fixture(html`<tbt-color-picker value="#0D1171"></tbt-color-picker>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.hex-label').textContent.trim()).to.equal('#0D1171');
    expect(el.shadowRoot.querySelector('.swatch-preview').classList.contains('empty')).to.be.false;
  });

  it('popup is hidden by default and opens on click', async () => {
    const el = await fixture(html`<tbt-color-picker></tbt-color-picker>`);
    await el.updateComplete;
    expect(getComputedStyle(el.shadowRoot.querySelector('.popup')).display).to.equal('none');
    el.shadowRoot.querySelector('.trigger').click();
    await el.updateComplete;
    expect(el.hasAttribute('open')).to.be.true;
  });

  it('selects a swatch and closes popup', async () => {
    const el = await fixture(html`<tbt-color-picker></tbt-color-picker>`);
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').click();
    await el.updateComplete;
    el.shadowRoot.querySelectorAll('.swatch')[0].click();
    await el.updateComplete;
    expect(el.value).to.equal('#EF4444');
    expect(el.hasAttribute('open')).to.be.false;
  });

  it('fires tbt-change with hex value on swatch selection', async () => {
    const el = await fixture(html`<tbt-color-picker></tbt-color-picker>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-change', e => { detail = e.detail; });
    el.shadowRoot.querySelector('.trigger').click();
    await el.updateComplete;
    el.shadowRoot.querySelectorAll('.swatch')[1].click();
    expect(detail).to.not.be.null;
    expect(detail.value).to.equal('#F97316');
  });

  it('selected swatch gets .selected class', async () => {
    const el = await fixture(html`<tbt-color-picker value="#EF4444"></tbt-color-picker>`);
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').click();
    await el.updateComplete;
    const firstSwatch = el.shadowRoot.querySelectorAll('.swatch')[0];
    expect(firstSwatch.classList.contains('selected')).to.be.true;
    expect(firstSwatch.getAttribute('aria-selected')).to.equal('true');
  });

  it('closes popup on Escape key', async () => {
    const el = await fixture(html`<tbt-color-picker></tbt-color-picker>`);
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').click();
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );
    await el.updateComplete;
    expect(el.hasAttribute('open')).to.be.false;
  });

  it('allow-custom shows hex input', async () => {
    const el = await fixture(html`<tbt-color-picker allow-custom></tbt-color-picker>`);
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').click();
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.hex-row')).to.exist;
    expect(el.shadowRoot.querySelector('.hex-row input')).to.exist;
  });

  it('accepts valid hex from custom input', async () => {
    const el = await fixture(html`<tbt-color-picker allow-custom></tbt-color-picker>`);
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').click();
    await el.updateComplete;
    const input = el.shadowRoot.querySelector('.hex-row input');
    input.value = '#AABBCC';
    input.dispatchEvent(new Event('input'));
    await el.updateComplete;
    el.shadowRoot.querySelector('.apply-btn').click();
    await el.updateComplete;
    expect(el.value).to.equal('#AABBCC');
  });

  it('does not accept invalid hex from custom input', async () => {
    const el = await fixture(html`<tbt-color-picker value="#EF4444" allow-custom></tbt-color-picker>`);
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').click();
    await el.updateComplete;
    const input = el.shadowRoot.querySelector('.hex-row input');
    input.value = 'notacolor';
    input.dispatchEvent(new Event('input'));
    await el.updateComplete;
    el.shadowRoot.querySelector('.apply-btn').click();
    await el.updateComplete;
    expect(el.value).to.equal('#EF4444');
  });

  it('disabled state prevents opening', async () => {
    const el = await fixture(html`<tbt-color-picker disabled></tbt-color-picker>`);
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').click();
    await el.updateComplete;
    expect(el.hasAttribute('open')).to.be.false;
  });

  it('shows error message when error prop is set', async () => {
    const el = await fixture(html`<tbt-color-picker error="Color is required"></tbt-color-picker>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.error-msg')).to.exist;
    expect(el.shadowRoot.querySelector('.error-msg').textContent).to.include('Color is required');
  });

  it('accepts custom palette', async () => {
    const palette = ['#FF0000', '#00FF00', '#0000FF'];
    const el = await fixture(html`<tbt-color-picker></tbt-color-picker>`);
    el.palette = palette;
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').click();
    await el.updateComplete;
    expect(el.shadowRoot.querySelectorAll('.swatch')).to.have.length(3);
  });

  it('trigger aria-expanded reflects open state', async () => {
    const el = await fixture(html`<tbt-color-picker></tbt-color-picker>`);
    await el.updateComplete;
    const trigger = el.shadowRoot.querySelector('.trigger');
    expect(trigger.getAttribute('aria-expanded')).to.equal('false');
    trigger.click();
    await el.updateComplete;
    expect(trigger.getAttribute('aria-expanded')).to.equal('true');
  });

  it('passes axe', async () => {
    const el = await fixture(html`
      <tbt-color-picker label="Category color" value="#0D1171"></tbt-color-picker>
    `);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

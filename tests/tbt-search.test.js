import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-search.js';

const axe = window.axe;

describe('tbt-search', () => {
  it('renders a text input in shadow DOM', async () => {
    const el = await fixture(html`<tbt-search></tbt-search>`);
    expect(el.shadowRoot.querySelector('input')).to.exist;
  });

  it('input has role="searchbox"', async () => {
    const el = await fixture(html`<tbt-search></tbt-search>`);
    expect(el.shadowRoot.querySelector('input').getAttribute('role')).to.equal('searchbox');
  });

  it('uses placeholder prop on native input', async () => {
    const el = await fixture(html`<tbt-search placeholder="Find document..."></tbt-search>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('input').placeholder).to.equal('Find document...');
  });

  it('fires tbt-search event after debounce when input changes', async () => {
    const el = await fixture(html`<tbt-search debounce="0"></tbt-search>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-search', e => { detail = e.detail; });
    const input = el.shadowRoot.querySelector('input');
    input.value = 'INV-001';
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    await new Promise(r => setTimeout(r, 10));
    expect(detail).to.exist;
    expect(detail.value).to.equal('INV-001');
  });

  it('shows clear button when value is non-empty', async () => {
    const el = await fixture(html`<tbt-search></tbt-search>`);
    el.value = 'something';
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.clear')).to.exist;
  });

  it('hides clear button when value is empty', async () => {
    const el = await fixture(html`<tbt-search></tbt-search>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.clear')).to.not.exist;
  });

  it('clear button resets value and fires tbt-search with empty string', async () => {
    const el = await fixture(html`<tbt-search></tbt-search>`);
    el.value = 'test';
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-search', e => { detail = e.detail; });
    el.shadowRoot.querySelector('.clear').click();
    await el.updateComplete;
    expect(el.value).to.equal('');
    expect(detail.value).to.equal('');
  });

  it('disables native input when disabled prop is set', async () => {
    const el = await fixture(html`<tbt-search disabled></tbt-search>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('input').disabled).to.be.true;
  });

  it('passes axe', async () => {
    const el = await fixture(html`<tbt-search placeholder="Search documents..."></tbt-search>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-checkbox.js';

describe('tbt-checkbox', () => {
  it('renders a native checkbox input in shadow DOM', async () => {
    const el = await fixture(html`<tbt-checkbox></tbt-checkbox>`);
    expect(el.shadowRoot.querySelector('input[type="checkbox"]')).to.exist;
  });

  it('defaults to unchecked', async () => {
    const el = await fixture(html`<tbt-checkbox></tbt-checkbox>`);
    expect(el.checked).to.be.false;
    expect(el.shadowRoot.querySelector('input').checked).to.be.false;
  });

  it('reflects checked attribute', async () => {
    const el = await fixture(html`<tbt-checkbox checked></tbt-checkbox>`);
    await el.updateComplete;
    expect(el.checked).to.be.true;
  });

  it('renders label text when label prop is set', async () => {
    const el = await fixture(html`<tbt-checkbox label="Agree to terms"></tbt-checkbox>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.lbl').textContent.trim()).to.include('Agree to terms');
  });

  it('fires tbt-change with correct checked state when clicked', async () => {
    const el = await fixture(html`<tbt-checkbox label="Accept"></tbt-checkbox>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-change', e => { detail = e.detail; });
    const input = el.shadowRoot.querySelector('input');
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    expect(detail.checked).to.be.true;
    expect(el.checked).to.be.true;
  });

  it('clears indeterminate state after change event', async () => {
    const el = await fixture(html`<tbt-checkbox indeterminate></tbt-checkbox>`);
    await el.updateComplete;
    const input = el.shadowRoot.querySelector('input');
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    expect(el.indeterminate).to.be.false;
  });

  it('shows error message when error prop is set', async () => {
    const el = await fixture(html`<tbt-checkbox error="Required field"></tbt-checkbox>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.error-msg')).to.exist;
  });

  it('shows helper text when helper is set and no error', async () => {
    const el = await fixture(html`<tbt-checkbox helper="Optional selection"></tbt-checkbox>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.helper')).to.exist;
  });

  it('value getter returns checked state', async () => {
    const el = await fixture(html`<tbt-checkbox checked></tbt-checkbox>`);
    await el.updateComplete;
    expect(el.value).to.be.true;
  });

  it('value setter updates checked state', async () => {
    const el = await fixture(html`<tbt-checkbox></tbt-checkbox>`);
    el.value = true;
    await el.updateComplete;
    expect(el.checked).to.be.true;
  });

  it('native input is disabled when disabled prop is set', async () => {
    const el = await fixture(html`<tbt-checkbox disabled></tbt-checkbox>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('input').disabled).to.be.true;
  });
});

import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-input.js';

describe('tbt-input', () => {
  it('renders a native input in shadow DOM', async () => {
    const el = await fixture(html`<tbt-input></tbt-input>`);
    expect(el.shadowRoot.querySelector('input')).to.exist;
  });

  it('defaults to type="text"', async () => {
    const el = await fixture(html`<tbt-input></tbt-input>`);
    expect(el.shadowRoot.querySelector('input').type).to.equal('text');
  });

  it('reflects type attribute to native input', async () => {
    const el = await fixture(html`<tbt-input type="email"></tbt-input>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('input').type).to.equal('email');
  });

  it('renders label element when label prop is set', async () => {
    const el = await fixture(html`<tbt-input label="Vendor name"></tbt-input>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('label')).to.exist;
    expect(el.shadowRoot.querySelector('label').textContent.trim()).to.equal('Vendor name');
  });

  it('shows required asterisk when required', async () => {
    const el = await fixture(html`<tbt-input label="Name" required></tbt-input>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.required')).to.exist;
  });

  it('shows error message when error prop is set', async () => {
    const el = await fixture(html`<tbt-input error="Field is required"></tbt-input>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.error-msg')).to.exist;
    expect(el.shadowRoot.querySelector('.error-msg').textContent).to.include('Field is required');
  });

  it('shows helper text when helper prop is set (no error)', async () => {
    const el = await fixture(html`<tbt-input helper="Enter your full name"></tbt-input>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.helper')).to.exist;
  });

  it('hides helper text when error is also set', async () => {
    const el = await fixture(html`<tbt-input helper="hint" error="wrong"></tbt-input>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.helper')).to.not.exist;
    expect(el.shadowRoot.querySelector('.error-msg')).to.exist;
  });

  it('fires tbt-input event on keystroke with correct value', async () => {
    const el = await fixture(html`<tbt-input></tbt-input>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-input', e => { detail = e.detail; });
    const input = el.shadowRoot.querySelector('input');
    input.value = 'hello';
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    expect(detail).to.exist;
    expect(detail.value).to.equal('hello');
  });

  it('fires tbt-change event on blur with correct value', async () => {
    const el = await fixture(html`<tbt-input></tbt-input>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-change', e => { detail = e.detail; });
    const input = el.shadowRoot.querySelector('input');
    input.value = 'world';
    input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    expect(detail.value).to.equal('world');
  });

  it('reflects disabled prop to native input', async () => {
    const el = await fixture(html`<tbt-input disabled></tbt-input>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('input').disabled).to.be.true;
  });

  it('reflects readonly prop to native input', async () => {
    const el = await fixture(html`<tbt-input readonly></tbt-input>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('input').readOnly).to.be.true;
  });
});

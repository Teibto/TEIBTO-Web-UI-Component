import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-toggle.js';

describe('tbt-toggle', () => {
  it('renders a checkbox input with role="switch" in shadow DOM', async () => {
    const el = await fixture(html`<tbt-toggle></tbt-toggle>`);
    const input = el.shadowRoot.querySelector('input[type="checkbox"]');
    expect(input).to.exist;
    expect(input.getAttribute('role')).to.equal('switch');
  });

  it('defaults to unchecked', async () => {
    const el = await fixture(html`<tbt-toggle></tbt-toggle>`);
    expect(el.checked).to.be.false;
  });

  it('reflects checked attribute', async () => {
    const el = await fixture(html`<tbt-toggle checked></tbt-toggle>`);
    await el.updateComplete;
    expect(el.checked).to.be.true;
    expect(el.shadowRoot.querySelector('input').checked).to.be.true;
  });

  it('renders label text when label prop is set', async () => {
    const el = await fixture(html`<tbt-toggle label="Dark mode"></tbt-toggle>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.lbl').textContent.trim()).to.equal('Dark mode');
  });

  it('fires tbt-change with correct checked state', async () => {
    const el = await fixture(html`<tbt-toggle></tbt-toggle>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-change', e => { detail = e.detail; });
    const input = el.shadowRoot.querySelector('input');
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    expect(detail.checked).to.be.true;
    expect(el.checked).to.be.true;
  });

  it('shows status label when checked with label-on prop', async () => {
    const el = await fixture(html`<tbt-toggle label="Status" label-on="Active" label-off="Inactive" checked></tbt-toggle>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.status').textContent.trim()).to.equal('Active');
  });

  it('shows off label when unchecked with label-off prop', async () => {
    const el = await fixture(html`<tbt-toggle label="Status" label-on="Active" label-off="Inactive"></tbt-toggle>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.status').textContent.trim()).to.equal('Inactive');
  });

  it('does not render status span when no label-on/label-off', async () => {
    const el = await fixture(html`<tbt-toggle label="Toggle"></tbt-toggle>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.status')).to.not.exist;
  });

  it('value getter returns checked state', async () => {
    const el = await fixture(html`<tbt-toggle checked></tbt-toggle>`);
    await el.updateComplete;
    expect(el.value).to.be.true;
  });

  it('value setter updates checked state', async () => {
    const el = await fixture(html`<tbt-toggle></tbt-toggle>`);
    el.value = true;
    await el.updateComplete;
    expect(el.checked).to.be.true;
  });

  it('native input is disabled when disabled prop is set', async () => {
    const el = await fixture(html`<tbt-toggle disabled></tbt-toggle>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('input').disabled).to.be.true;
  });
});

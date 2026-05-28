import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-modal.js';

describe('tbt-modal', () => {
  it('renders a <dialog> element in shadow DOM', async () => {
    const el = await fixture(html`<tbt-modal title="Test"></tbt-modal>`);
    expect(el.shadowRoot.querySelector('dialog')).to.exist;
  });

  it('defaults to closed (open=false)', async () => {
    const el = await fixture(html`<tbt-modal title="Test"></tbt-modal>`);
    expect(el.open).to.be.false;
  });

  it('renders title in modal header', async () => {
    const el = await fixture(html`<tbt-modal title="Delete record" open></tbt-modal>`);
    await el.updateComplete;
    const h3 = el.shadowRoot.querySelector('h3');
    expect(h3).to.exist;
    expect(h3.textContent.trim()).to.equal('Delete record');
  });

  it('defaults to variant="default" and size="md"', async () => {
    const el = await fixture(html`<tbt-modal title="Test"></tbt-modal>`);
    expect(el.variant).to.equal('default');
    expect(el.size).to.equal('md');
  });

  it('reflects variant attribute', async () => {
    const el = await fixture(html`<tbt-modal title="Test" variant="danger"></tbt-modal>`);
    await el.updateComplete;
    expect(el.getAttribute('variant')).to.equal('danger');
  });

  it('fires tbt-close when close button is clicked', async () => {
    const el = await fixture(html`<tbt-modal title="Test" open></tbt-modal>`);
    await el.updateComplete;
    let fired = false;
    el.addEventListener('tbt-close', () => { fired = true; });
    el.shadowRoot.querySelector('.close-btn').click();
    expect(fired).to.be.true;
    expect(el.open).to.be.false;
  });

  it('fires tbt-confirm when _confirm() is called directly', async () => {
    const el = await fixture(html`<tbt-modal title="Test" variant="confirm"></tbt-modal>`);
    await el.updateComplete;
    let fired = false;
    el.addEventListener('tbt-confirm', () => { fired = true; });
    el._confirm();
    expect(fired).to.be.true;
  });

  it('fires tbt-cancel and sets open=false when _cancel() is called', async () => {
    const el = await fixture(html`<tbt-modal title="Test"></tbt-modal>`);
    await el.updateComplete;
    el.open = true;
    let fired = false;
    el.addEventListener('tbt-cancel', () => { fired = true; });
    el._cancel();
    expect(fired).to.be.true;
    expect(el.open).to.be.false;
  });

  it('has aria-labelledby wiring between h3 and dialog', async () => {
    const el = await fixture(html`<tbt-modal title="Aria test" open></tbt-modal>`);
    await el.updateComplete;
    const dialog = el.shadowRoot.querySelector('dialog');
    const h3 = el.shadowRoot.querySelector('h3');
    expect(dialog.getAttribute('aria-labelledby')).to.equal(h3.id);
  });
});

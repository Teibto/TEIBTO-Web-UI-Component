import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-modal.js';

const axe = window.axe;

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

  it('dialog has aria-modal="true"', async () => {
    const el = await fixture(html`<tbt-modal title="Test"></tbt-modal>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('dialog').getAttribute('aria-modal')).to.equal('true');
  });


  // ── backdrop close (#96) ────────────────────────────────────────────────────
  //
  // `click` is dispatched on the nearest common ancestor of pointerdown and pointerup, so a
  // drag that starts inside the form and ends past the dialog's edge reaches the dialog with
  // `target === dialog` — indistinguishable from a backdrop click on the click event alone.
  // These cases drive the pointer sequence rather than calling .click(), because the sequence
  // is the whole bug.

  const down = (node) => node.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
  const up   = (node) => node.dispatchEvent(new PointerEvent('pointerup',   { bubbles: true, composed: true }));
  const clickOn = (node) => node.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));

  async function openModal() {
    const el = await fixture(html`<tbt-modal title="Test" open><div slot="content">body</div></tbt-modal>`);
    await el.updateComplete;
    return { el, dialog: el.shadowRoot.querySelector('dialog'), body: el.shadowRoot.querySelector('.modal-body') };
  }

  it('closes when the backdrop is both pressed and released', async () => {
    const { el, dialog } = await openModal();
    let fired = false;
    el.addEventListener('tbt-cancel', () => { fired = true; });
    down(dialog); up(dialog); clickOn(dialog);
    expect(fired).to.be.true;
    expect(el.open).to.be.false;
  });

  it('stays open when a drag starts inside the content and ends on the backdrop', async () => {
    const { el, dialog, body } = await openModal();
    let fired = false;
    el.addEventListener('tbt-cancel', () => { fired = true; });
    down(body); up(dialog); clickOn(dialog);
    expect(fired).to.be.false;
    expect(el.open).to.be.true;
  });

  it('stays open when a drag starts on the backdrop and ends inside the content', async () => {
    const { el, dialog, body } = await openModal();
    let fired = false;
    el.addEventListener('tbt-cancel', () => { fired = true; });
    down(dialog); up(body); clickOn(dialog);
    expect(fired).to.be.false;
    expect(el.open).to.be.true;
  });

  it('no-backdrop-close keeps a real backdrop click from closing it', async () => {
    const el = await fixture(html`<tbt-modal title="Test" open no-backdrop-close><div slot="content">body</div></tbt-modal>`);
    await el.updateComplete;
    const dialog = el.shadowRoot.querySelector('dialog');
    let fired = false;
    el.addEventListener('tbt-cancel', () => { fired = true; });
    down(dialog); up(dialog); clickOn(dialog);
    expect(fired).to.be.false;
    expect(el.open).to.be.true;
  });

  it('no-backdrop-close still closes from the X button', async () => {
    const el = await fixture(html`<tbt-modal title="Test" open no-backdrop-close></tbt-modal>`);
    await el.updateComplete;
    let fired = false;
    el.addEventListener('tbt-close', () => { fired = true; });
    el.shadowRoot.querySelector('.close-btn').click();
    expect(fired).to.be.true;
    expect(el.open).to.be.false;
  });

  it('no-backdrop-close still closes from ESC (native cancel)', async () => {
    const el = await fixture(html`<tbt-modal title="Test" open no-backdrop-close></tbt-modal>`);
    await el.updateComplete;
    let fired = false;
    el.addEventListener('tbt-cancel', () => { fired = true; });
    el.shadowRoot.querySelector('dialog').dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(fired).to.be.true;
    expect(el.open).to.be.false;
  });

  it('defaults to no-backdrop-close being off', async () => {
    const el = await fixture(html`<tbt-modal title="Test"></tbt-modal>`);
    expect(el.noBackdropClose).to.be.false;
  });

  it('passes axe (open)', async () => {
    const el = await fixture(html`<tbt-modal title="Confirm action" open></tbt-modal>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

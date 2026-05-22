import { html, fixture, expect, oneEvent } from '@open-wc/testing';
import '../components/tbt-button.js';

describe('tbt-button', () => {
  it('renders a button element in shadow DOM', async () => {
    const el = await fixture(html`<tbt-button>Save</tbt-button>`);
    expect(el.shadowRoot.querySelector('button')).to.exist;
  });

  it('defaults to primary variant', async () => {
    const el = await fixture(html`<tbt-button>Save</tbt-button>`);
    expect(el.variant).to.equal('primary');
    expect(el.getAttribute('variant')).to.equal('primary');
  });

  it('reflects variant attribute', async () => {
    const el = await fixture(html`<tbt-button variant="danger">Delete</tbt-button>`);
    expect(el.getAttribute('variant')).to.equal('danger');
  });

  it('shows spinner and disables native button when loading', async () => {
    const el = await fixture(html`<tbt-button loading>Saving</tbt-button>`);
    expect(el.shadowRoot.querySelector('.spinner')).to.exist;
    expect(el.shadowRoot.querySelector('button').disabled).to.be.true;
  });

  it('disables native button when disabled', async () => {
    const el = await fixture(html`<tbt-button disabled>Save</tbt-button>`);
    expect(el.shadowRoot.querySelector('button').disabled).to.be.true;
  });

  it('does not fire click when disabled', async () => {
    const el = await fixture(html`<tbt-button disabled>Save</tbt-button>`);
    let fired = false;
    el.addEventListener('click', () => { fired = true; });
    el.shadowRoot.querySelector('button').click();
    expect(fired).to.be.false;
  });
});

import { html, fixture, expect, oneEvent } from '@open-wc/testing';
import '../components/tbt-alert.js';

describe('tbt-alert', () => {
  it('renders message content', async () => {
    const el = await fixture(html`<tbt-alert variant="success">Saved</tbt-alert>`);
    expect(el.shadowRoot).to.exist;
    expect(el.textContent.trim()).to.equal('Saved');
  });

  it('reflects variant attribute', async () => {
    const el = await fixture(html`<tbt-alert variant="danger">Error</tbt-alert>`);
    expect(el.getAttribute('variant')).to.equal('danger');
  });

  it('renders dismiss button when dismissible', async () => {
    const el = await fixture(html`<tbt-alert variant="info" dismissible>Note</tbt-alert>`);
    expect(el.shadowRoot.querySelector('.dismiss')).to.exist;
  });

  it('does not render dismiss button without dismissible prop', async () => {
    const el = await fixture(html`<tbt-alert variant="info">Note</tbt-alert>`);
    expect(el.shadowRoot.querySelector('.dismiss')).to.not.exist;
  });

  it('fires tbt-dismiss event when dismiss button clicked', async () => {
    const el = await fixture(html`<tbt-alert variant="warning" dismissible>Watch out</tbt-alert>`);
    const btn = el.shadowRoot.querySelector('.dismiss');
    expect(btn).to.exist;
    const eventPromise = oneEvent(el, 'tbt-dismiss');
    btn.click();
    const event = await eventPromise;
    expect(event).to.exist;
  });
});

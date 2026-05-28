import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-subtab.js';

describe('tbt-subtab', () => {
  it('renders a button for each tbt-tab child', async () => {
    const el = await fixture(html`
      <tbt-subtab active="a">
        <tbt-tab name="a" label="Tab A">Content A</tbt-tab>
        <tbt-tab name="b" label="Tab B">Content B</tbt-tab>
      </tbt-subtab>`);
    await el.updateComplete;
    const buttons = el.shadowRoot.querySelectorAll('button[role="tab"]');
    expect(buttons).to.have.length(2);
    expect(buttons[0].textContent.trim()).to.equal('Tab A');
    expect(buttons[1].textContent.trim()).to.equal('Tab B');
  });

  it('sets aria-selected="true" on the active tab button', async () => {
    const el = await fixture(html`
      <tbt-subtab active="b">
        <tbt-tab name="a" label="A">A</tbt-tab>
        <tbt-tab name="b" label="B">B</tbt-tab>
      </tbt-subtab>`);
    await el.updateComplete;
    const buttons = el.shadowRoot.querySelectorAll('button[role="tab"]');
    expect(buttons[0].getAttribute('aria-selected')).to.equal('false');
    expect(buttons[1].getAttribute('aria-selected')).to.equal('true');
  });

  it('sets active attribute on the corresponding tbt-tab', async () => {
    const el = await fixture(html`
      <tbt-subtab active="a">
        <tbt-tab name="a" label="A">A</tbt-tab>
        <tbt-tab name="b" label="B">B</tbt-tab>
      </tbt-subtab>`);
    await el.updateComplete;
    expect(el.querySelector('[name="a"]').hasAttribute('active')).to.be.true;
    expect(el.querySelector('[name="b"]').hasAttribute('active')).to.be.false;
  });

  it('switching tabs updates active prop and tbt-tab state', async () => {
    const el = await fixture(html`
      <tbt-subtab active="a">
        <tbt-tab name="a" label="A">A</tbt-tab>
        <tbt-tab name="b" label="B">B</tbt-tab>
      </tbt-subtab>`);
    await el.updateComplete;
    el.shadowRoot.querySelectorAll('button[role="tab"]')[1].click();
    await el.updateComplete;
    expect(el.active).to.equal('b');
    expect(el.querySelector('[name="b"]').hasAttribute('active')).to.be.true;
    expect(el.querySelector('[name="a"]').hasAttribute('active')).to.be.false;
  });

  it('fires tbt-tab-change event with correct name on click', async () => {
    const el = await fixture(html`
      <tbt-subtab active="a">
        <tbt-tab name="a" label="A">A</tbt-tab>
        <tbt-tab name="b" label="B">B</tbt-tab>
      </tbt-subtab>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-tab-change', e => { detail = e.detail; });
    el.shadowRoot.querySelectorAll('button[role="tab"]')[1].click();
    expect(detail.name).to.equal('b');
  });

  it('tablist has role="tablist"', async () => {
    const el = await fixture(html`
      <tbt-subtab active="a">
        <tbt-tab name="a" label="A">A</tbt-tab>
      </tbt-subtab>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('[role="tablist"]')).to.exist;
  });
});

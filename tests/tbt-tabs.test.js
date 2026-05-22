import { fixture, html, expect } from '@open-wc/testing';
import '../components/tbt-tabs.js';

describe('tbt-tabs', () => {
  it('renders a tab button for each tbt-tab child', async () => {
    const el = await fixture(html`
      <tbt-tabs>
        <tbt-tab label="A">Content A</tbt-tab>
        <tbt-tab label="B">Content B</tbt-tab>
        <tbt-tab label="C">Content C</tbt-tab>
      </tbt-tabs>`);
    await el.updateComplete;
    const buttons = el.shadowRoot.querySelectorAll('[role="tab"]');
    expect(buttons).to.have.length(3);
    expect(buttons[0].textContent.trim()).to.equal('A');
    expect(buttons[1].textContent.trim()).to.equal('B');
  });

  it('shows first tab active by default', async () => {
    const el = await fixture(html`
      <tbt-tabs>
        <tbt-tab label="First">First</tbt-tab>
        <tbt-tab label="Second">Second</tbt-tab>
      </tbt-tabs>`);
    await el.updateComplete;
    const tabs = el.querySelectorAll('tbt-tab');
    expect(tabs[0].active).to.be.true;
    expect(tabs[1].active).to.be.false;
  });

  it('switches active panel on click', async () => {
    const el = await fixture(html`
      <tbt-tabs>
        <tbt-tab label="A">A</tbt-tab>
        <tbt-tab label="B">B</tbt-tab>
      </tbt-tabs>`);
    await el.updateComplete;
    el.shadowRoot.querySelectorAll('[role="tab"]')[1].click();
    await el.updateComplete;
    const tabs = el.querySelectorAll('tbt-tab');
    expect(tabs[0].active).to.be.false;
    expect(tabs[1].active).to.be.true;
  });

  it('fires tbt-change with active index and label', async () => {
    const el = await fixture(html`
      <tbt-tabs>
        <tbt-tab label="Alpha">A</tbt-tab>
        <tbt-tab label="Beta">B</tbt-tab>
      </tbt-tabs>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-change', e => { detail = e.detail; });
    el.shadowRoot.querySelectorAll('[role="tab"]')[1].click();
    expect(detail.active).to.equal(1);
    expect(detail.label).to.equal('Beta');
  });

  it('hides inactive tbt-tab via display:none', async () => {
    const el = await fixture(html`
      <tbt-tabs>
        <tbt-tab label="X">X</tbt-tab>
        <tbt-tab label="Y">Y</tbt-tab>
      </tbt-tabs>`);
    await el.updateComplete;
    const tabs = el.querySelectorAll('tbt-tab');
    expect(getComputedStyle(tabs[0]).display).to.not.equal('none');
    expect(getComputedStyle(tabs[1]).display).to.equal('none');
  });

  it('gives each tbt-tab role="tabpanel" and a unique id', async () => {
    const el = await fixture(html`
      <tbt-tabs>
        <tbt-tab label="A">A</tbt-tab>
        <tbt-tab label="B">B</tbt-tab>
      </tbt-tabs>`);
    await el.updateComplete;
    const tabs = el.querySelectorAll('tbt-tab');
    expect(tabs[0].getAttribute('role')).to.equal('tabpanel');
    expect(tabs[1].getAttribute('role')).to.equal('tabpanel');
    expect(tabs[0].id).to.match(/^tbt-tab-\d+$/);
    expect(tabs[1].id).to.match(/^tbt-tab-\d+$/);
    expect(tabs[0].id).to.not.equal(tabs[1].id);
  });

  it('wires aria-controls from each tab button to its panel id', async () => {
    const el = await fixture(html`
      <tbt-tabs>
        <tbt-tab label="A">A</tbt-tab>
        <tbt-tab label="B">B</tbt-tab>
      </tbt-tabs>`);
    await el.updateComplete;
    const tabs = el.querySelectorAll('tbt-tab');
    const buttons = el.shadowRoot.querySelectorAll('[role="tab"]');
    expect(buttons[0].getAttribute('aria-controls')).to.equal(tabs[0].id);
    expect(buttons[1].getAttribute('aria-controls')).to.equal(tabs[1].id);
  });

  it('moves focus to the newly active tab button on click', async () => {
    const el = await fixture(html`
      <tbt-tabs>
        <tbt-tab label="A">A</tbt-tab>
        <tbt-tab label="B">B</tbt-tab>
      </tbt-tabs>`);
    await el.updateComplete;
    el.shadowRoot.querySelectorAll('[role="tab"]')[1].click();
    await el.updateComplete;
    await Promise.resolve();
    const buttons = el.shadowRoot.querySelectorAll('[role="tab"]');
    expect(el.shadowRoot.activeElement).to.equal(buttons[1]);
  });

  it('clamps active when trailing tabs are removed', async () => {
    const el = await fixture(html`
      <tbt-tabs active="2">
        <tbt-tab label="A">A</tbt-tab>
        <tbt-tab label="B">B</tbt-tab>
        <tbt-tab label="C">C</tbt-tab>
      </tbt-tabs>`);
    await el.updateComplete;
    expect(el.active).to.equal(2);
    el.removeChild(el.querySelectorAll('tbt-tab')[2]);
    el.removeChild(el.querySelectorAll('tbt-tab')[1]);
    await el.updateComplete;
    expect(el.active).to.equal(0);
  });
});

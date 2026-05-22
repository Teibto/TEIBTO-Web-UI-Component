import { fixture, html, expect } from '@open-wc/testing';
import '../components/tbt-tabs.js';

describe('tbt-tabs', () => {
  it('renders a tab button for each tbt-tabs-panel child', async () => {
    const el = await fixture(html`
      <tbt-tabs>
        <tbt-tabs-panel label="A">Content A</tbt-tabs-panel>
        <tbt-tabs-panel label="B">Content B</tbt-tabs-panel>
        <tbt-tabs-panel label="C">Content C</tbt-tabs-panel>
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
        <tbt-tabs-panel label="First">First</tbt-tabs-panel>
        <tbt-tabs-panel label="Second">Second</tbt-tabs-panel>
      </tbt-tabs>`);
    await el.updateComplete;
    const panels = el.querySelectorAll('tbt-tabs-panel');
    expect(panels[0].active).to.be.true;
    expect(panels[1].active).to.be.false;
  });

  it('switches active panel on click', async () => {
    const el = await fixture(html`
      <tbt-tabs>
        <tbt-tabs-panel label="A">A</tbt-tabs-panel>
        <tbt-tabs-panel label="B">B</tbt-tabs-panel>
      </tbt-tabs>`);
    await el.updateComplete;
    el.shadowRoot.querySelectorAll('[role="tab"]')[1].click();
    await el.updateComplete;
    const panels = el.querySelectorAll('tbt-tabs-panel');
    expect(panels[0].active).to.be.false;
    expect(panels[1].active).to.be.true;
  });

  it('fires tbt-change with active index and label', async () => {
    const el = await fixture(html`
      <tbt-tabs>
        <tbt-tabs-panel label="Alpha">A</tbt-tabs-panel>
        <tbt-tabs-panel label="Beta">B</tbt-tabs-panel>
      </tbt-tabs>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-change', e => { detail = e.detail; });
    el.shadowRoot.querySelectorAll('[role="tab"]')[1].click();
    expect(detail.active).to.equal(1);
    expect(detail.label).to.equal('Beta');
  });

  it('hides inactive tbt-tabs-panel via display:none', async () => {
    const el = await fixture(html`
      <tbt-tabs>
        <tbt-tabs-panel label="X">X</tbt-tabs-panel>
        <tbt-tabs-panel label="Y">Y</tbt-tabs-panel>
      </tbt-tabs>`);
    await el.updateComplete;
    const panels = el.querySelectorAll('tbt-tabs-panel');
    expect(getComputedStyle(panels[0]).display).to.not.equal('none');
    expect(getComputedStyle(panels[1]).display).to.equal('none');
  });

  it('gives each tbt-tabs-panel role="tabpanel" and a unique id', async () => {
    const el = await fixture(html`
      <tbt-tabs>
        <tbt-tabs-panel label="A">A</tbt-tabs-panel>
        <tbt-tabs-panel label="B">B</tbt-tabs-panel>
      </tbt-tabs>`);
    await el.updateComplete;
    const panels = el.querySelectorAll('tbt-tabs-panel');
    expect(panels[0].getAttribute('role')).to.equal('tabpanel');
    expect(panels[1].getAttribute('role')).to.equal('tabpanel');
    expect(panels[0].id).to.match(/^tbt-tabs-panel-\d+$/);
    expect(panels[1].id).to.match(/^tbt-tabs-panel-\d+$/);
    expect(panels[0].id).to.not.equal(panels[1].id);
  });

  it('wires aria-controls from each tab button to its panel id', async () => {
    const el = await fixture(html`
      <tbt-tabs>
        <tbt-tabs-panel label="A">A</tbt-tabs-panel>
        <tbt-tabs-panel label="B">B</tbt-tabs-panel>
      </tbt-tabs>`);
    await el.updateComplete;
    const panels = el.querySelectorAll('tbt-tabs-panel');
    const buttons = el.shadowRoot.querySelectorAll('[role="tab"]');
    expect(buttons[0].getAttribute('aria-controls')).to.equal(panels[0].id);
    expect(buttons[1].getAttribute('aria-controls')).to.equal(panels[1].id);
  });

  it('moves focus to the newly active tab button on click', async () => {
    const el = await fixture(html`
      <tbt-tabs>
        <tbt-tabs-panel label="A">A</tbt-tabs-panel>
        <tbt-tabs-panel label="B">B</tbt-tabs-panel>
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
        <tbt-tabs-panel label="A">A</tbt-tabs-panel>
        <tbt-tabs-panel label="B">B</tbt-tabs-panel>
        <tbt-tabs-panel label="C">C</tbt-tabs-panel>
      </tbt-tabs>`);
    await el.updateComplete;
    expect(el.active).to.equal(2);
    el.removeChild(el.querySelectorAll('tbt-tabs-panel')[2]);
    el.removeChild(el.querySelectorAll('tbt-tabs-panel')[1]);
    await el.updateComplete;
    expect(el.active).to.equal(0);
  });
});

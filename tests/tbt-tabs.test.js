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
});

import { fixture, html, expect } from '@open-wc/testing';
import '../components/tbt-tooltip.js';

const axe = window.axe;

describe('tbt-tooltip', () => {
  it('tooltip is hidden by default', async () => {
    const el = await fixture(html`
      <tbt-tooltip content="Save document">
        <button>Save</button>
      </tbt-tooltip>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.tip').classList.contains('visible')).to.be.false;
  });

  it('renders tooltip content', async () => {
    const el = await fixture(html`
      <tbt-tooltip content="Save document">
        <button>Save</button>
      </tbt-tooltip>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.tip').textContent.trim()).to.equal('Save document');
  });

  it('shows tooltip on mouseenter (delay=0)', async () => {
    const el = await fixture(html`
      <tbt-tooltip content="Hint" delay="0">
        <button>Btn</button>
      </tbt-tooltip>`);
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').dispatchEvent(new MouseEvent('mouseenter'));
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.tip').classList.contains('visible')).to.be.true;
  });

  it('hides tooltip on mouseleave', async () => {
    const el = await fixture(html`
      <tbt-tooltip content="Hint" delay="0">
        <button>Btn</button>
      </tbt-tooltip>`);
    await el.updateComplete;
    const trigger = el.shadowRoot.querySelector('.trigger');
    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    await el.updateComplete;
    trigger.dispatchEvent(new MouseEvent('mouseleave'));
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.tip').classList.contains('visible')).to.be.false;
  });

  it('shows tooltip on focusin (delay=0)', async () => {
    const el = await fixture(html`
      <tbt-tooltip content="Hint" delay="0">
        <button>Btn</button>
      </tbt-tooltip>`);
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.tip').classList.contains('visible')).to.be.true;
  });

  it('hides tooltip on focusout', async () => {
    const el = await fixture(html`
      <tbt-tooltip content="Hint" delay="0">
        <button>Btn</button>
      </tbt-tooltip>`);
    await el.updateComplete;
    const trigger = el.shadowRoot.querySelector('.trigger');
    trigger.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await el.updateComplete;
    trigger.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.tip').classList.contains('visible')).to.be.false;
  });

  it('does not show when content is empty', async () => {
    const el = await fixture(html`
      <tbt-tooltip delay="0">
        <button>Btn</button>
      </tbt-tooltip>`);
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').dispatchEvent(new MouseEvent('mouseenter'));
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.tip').classList.contains('visible')).to.be.false;
  });

  it('tooltip has role="tooltip"', async () => {
    const el = await fixture(html`<tbt-tooltip content="Help"><button>x</button></tbt-tooltip>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.tip').getAttribute('role')).to.equal('tooltip');
  });

  it('trigger aria-describedby matches tooltip id', async () => {
    const el = await fixture(html`<tbt-tooltip content="Help"><button>x</button></tbt-tooltip>`);
    await el.updateComplete;
    const tipId = el.shadowRoot.querySelector('.tip').id;
    expect(el.shadowRoot.querySelector('.trigger').getAttribute('aria-describedby')).to.equal(tipId);
  });

  it('applies placement attribute', async () => {
    const el = await fixture(html`<tbt-tooltip content="Hint" placement="bottom"><button>x</button></tbt-tooltip>`);
    await el.updateComplete;
    expect(el.getAttribute('placement')).to.equal('bottom');
  });

  it('default placement is top', async () => {
    const el = await fixture(html`<tbt-tooltip content="Hint"><button>x</button></tbt-tooltip>`);
    await el.updateComplete;
    expect(el.getAttribute('placement')).to.equal('top');
  });

  it('passes axe', async () => {
    const el = await fixture(html`
      <tbt-tooltip content="Save document (Ctrl+S)" delay="0">
        <button aria-label="Save">💾</button>
      </tbt-tooltip>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

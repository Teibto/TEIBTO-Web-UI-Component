import { fixture, html, expect } from '@open-wc/testing';
import '../components/tbt-popover.js';

const axe = window.axe;

describe('tbt-popover', () => {
  it('popover is closed by default', async () => {
    const el = await fixture(html`
      <tbt-popover>
        <button>Options</button>
        <div slot="content"><p>Content</p></div>
      </tbt-popover>`);
    await el.updateComplete;
    expect(el.open).to.be.false;
    expect(el.shadowRoot.querySelector('.popover').getAttribute('aria-hidden')).to.equal('true');
  });

  it('click trigger opens popover', async () => {
    const el = await fixture(html`
      <tbt-popover>
        <button>Options</button>
        <div slot="content"><p>Content</p></div>
      </tbt-popover>`);
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').click();
    await el.updateComplete;
    expect(el.open).to.be.true;
  });

  it('click trigger again closes popover', async () => {
    const el = await fixture(html`
      <tbt-popover>
        <button>Options</button>
        <div slot="content"><p>Content</p></div>
      </tbt-popover>`);
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').click();
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').click();
    await el.updateComplete;
    expect(el.open).to.be.false;
  });

  it('fires tbt-open when opened', async () => {
    const el = await fixture(html`
      <tbt-popover>
        <button>Options</button>
        <div slot="content"><p>Content</p></div>
      </tbt-popover>`);
    await el.updateComplete;
    let opened = false;
    el.addEventListener('tbt-open', () => { opened = true; });
    el.shadowRoot.querySelector('.trigger').click();
    await el.updateComplete;
    expect(opened).to.be.true;
  });

  it('fires tbt-close when closed', async () => {
    const el = await fixture(html`
      <tbt-popover>
        <button>Options</button>
        <div slot="content"><p>Content</p></div>
      </tbt-popover>`);
    el.open = true;
    await el.updateComplete;
    let closed = false;
    el.addEventListener('tbt-close', () => { closed = true; });
    el.shadowRoot.querySelector('.trigger').click();
    await el.updateComplete;
    expect(closed).to.be.true;
  });

  it('Escape closes popover', async () => {
    const el = await fixture(html`
      <tbt-popover>
        <button>Options</button>
        <div slot="content"><p>Content</p></div>
      </tbt-popover>`);
    el.open = true;
    await el.updateComplete;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await el.updateComplete;
    expect(el.open).to.be.false;
  });

  it('aria-hidden is "true" when closed', async () => {
    const el = await fixture(html`
      <tbt-popover>
        <button>Options</button>
        <div slot="content"><p>Content</p></div>
      </tbt-popover>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.popover').getAttribute('aria-hidden')).to.equal('true');
  });

  it('aria-hidden removed when open', async () => {
    const el = await fixture(html`
      <tbt-popover>
        <button>Options</button>
        <div slot="content"><p>Content</p></div>
      </tbt-popover>`);
    el.open = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.popover').hasAttribute('aria-hidden')).to.be.false;
  });

  it('sets aria-expanded on slotted trigger', async () => {
    const el = await fixture(html`
      <tbt-popover>
        <button id="trig">Options</button>
        <div slot="content"><p>Content</p></div>
      </tbt-popover>`);
    await el.updateComplete;
    el.open = true;
    await el.updateComplete;
    expect(document.getElementById('trig').getAttribute('aria-expanded')).to.equal('true');
  });

  it('applies placement attribute', async () => {
    const el = await fixture(html`
      <tbt-popover placement="top">
        <button>Options</button>
        <div slot="content"><p>Content</p></div>
      </tbt-popover>`);
    await el.updateComplete;
    expect(el.getAttribute('placement')).to.equal('top');
  });

  it('default placement is bottom', async () => {
    const el = await fixture(html`
      <tbt-popover>
        <button>Options</button>
        <div slot="content"><p>Content</p></div>
      </tbt-popover>`);
    await el.updateComplete;
    expect(el.getAttribute('placement')).to.equal('bottom');
  });

  it('renders content slot', async () => {
    const el = await fixture(html`
      <tbt-popover>
        <button>Options</button>
        <div slot="content"><p id="pcontent">Hello</p></div>
      </tbt-popover>`);
    await el.updateComplete;
    expect(el.querySelector('#pcontent')).to.exist;
  });

  it('passes axe when open', async () => {
    const el = await fixture(html`
      <tbt-popover>
        <button aria-label="More options">⋯</button>
        <div slot="content">
          <button>Edit</button>
          <button>Delete</button>
        </div>
      </tbt-popover>`);
    el.open = true;
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

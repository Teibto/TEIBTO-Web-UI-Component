import { fixture, html, expect } from '@open-wc/testing';
import '../components/tbt-chip.js';

const axe = window.axe;

describe('tbt-chip', () => {
  it('renders body with role="button"', async () => {
    const el = await fixture(html`<tbt-chip>Category</tbt-chip>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.body').getAttribute('role')).to.equal('button');
  });

  it('aria-pressed is false by default', async () => {
    const el = await fixture(html`<tbt-chip>Tag</tbt-chip>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.body').getAttribute('aria-pressed')).to.equal('false');
  });

  it('click toggles selected and sets aria-pressed', async () => {
    const el = await fixture(html`<tbt-chip>Tag</tbt-chip>`);
    await el.updateComplete;
    el.shadowRoot.querySelector('.body').click();
    await el.updateComplete;
    expect(el.selected).to.be.true;
    expect(el.shadowRoot.querySelector('.body').getAttribute('aria-pressed')).to.equal('true');
  });

  it('fires tbt-toggle with selected detail', async () => {
    const el = await fixture(html`<tbt-chip>Tag</tbt-chip>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-toggle', e => { detail = e.detail; });
    el.shadowRoot.querySelector('.body').click();
    await el.updateComplete;
    expect(detail).to.not.be.null;
    expect(detail.selected).to.be.true;
  });

  it('Enter key toggles chip', async () => {
    const el = await fixture(html`<tbt-chip>Tag</tbt-chip>`);
    await el.updateComplete;
    el.shadowRoot.querySelector('.body').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    );
    await el.updateComplete;
    expect(el.selected).to.be.true;
  });

  it('Space key toggles chip', async () => {
    const el = await fixture(html`<tbt-chip>Tag</tbt-chip>`);
    await el.updateComplete;
    el.shadowRoot.querySelector('.body').dispatchEvent(
      new KeyboardEvent('keydown', { key: ' ', bubbles: true })
    );
    await el.updateComplete;
    expect(el.selected).to.be.true;
  });

  it('shows remove button when removable', async () => {
    const el = await fixture(html`<tbt-chip removable>Tag</tbt-chip>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.remove')).to.exist;
  });

  it('hides remove button when not removable', async () => {
    const el = await fixture(html`<tbt-chip>Tag</tbt-chip>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.remove')).to.be.null;
  });

  it('fires tbt-remove when × clicked', async () => {
    const el = await fixture(html`<tbt-chip removable>Tag</tbt-chip>`);
    await el.updateComplete;
    let removed = false;
    el.addEventListener('tbt-remove', () => { removed = true; });
    el.shadowRoot.querySelector('.remove').click();
    await el.updateComplete;
    expect(removed).to.be.true;
  });

  it('remove button does not trigger tbt-toggle', async () => {
    const el = await fixture(html`<tbt-chip removable>Tag</tbt-chip>`);
    await el.updateComplete;
    let toggleFired = false;
    el.addEventListener('tbt-toggle', () => { toggleFired = true; });
    el.shadowRoot.querySelector('.remove').click();
    await el.updateComplete;
    expect(toggleFired).to.be.false;
  });

  it('reflects variant attribute', async () => {
    const el = await fixture(html`<tbt-chip variant="success">Tag</tbt-chip>`);
    await el.updateComplete;
    expect(el.getAttribute('variant')).to.equal('success');
  });

  it('reflects size attribute', async () => {
    const el = await fixture(html`<tbt-chip size="lg">Tag</tbt-chip>`);
    await el.updateComplete;
    expect(el.getAttribute('size')).to.equal('lg');
  });

  it('selected attribute reflects', async () => {
    const el = await fixture(html`<tbt-chip>Tag</tbt-chip>`);
    await el.updateComplete;
    el.shadowRoot.querySelector('.body').click();
    await el.updateComplete;
    expect(el.hasAttribute('selected')).to.be.true;
  });

  it('passes axe — unselected', async () => {
    const el = await fixture(html`<tbt-chip>Category</tbt-chip>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });

  it('passes axe — selected + removable', async () => {
    const el = await fixture(html`<tbt-chip selected removable>Category</tbt-chip>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

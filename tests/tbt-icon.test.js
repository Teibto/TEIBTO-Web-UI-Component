import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-icon.js';

const axe = window.axe;

describe('tbt-icon', () => {
  it('renders an <i> element with Tabler class in shadow DOM', async () => {
    const el = await fixture(html`<tbt-icon name="save"></tbt-icon>`);
    await el.updateComplete;
    const i = el.shadowRoot.querySelector('i.ti');
    expect(i).to.exist;
  });

  it('resolves ERP alias "save" to ti-device-floppy', async () => {
    const el = await fixture(html`<tbt-icon name="save"></tbt-icon>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('i').classList.contains('ti-device-floppy')).to.be.true;
  });

  it('uses raw Tabler name as fallback when no alias exists', async () => {
    const el = await fixture(html`<tbt-icon name="circle-check"></tbt-icon>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('i').classList.contains('ti-circle-check')).to.be.true;
  });

  it('reflects spin attribute on host when spin prop is set', async () => {
    const el = await fixture(html`<tbt-icon name="loader" spin></tbt-icon>`);
    await el.updateComplete;
    expect(el.hasAttribute('spin')).to.be.true;
  });

  it('does not have spin attribute by default', async () => {
    const el = await fixture(html`<tbt-icon name="save"></tbt-icon>`);
    await el.updateComplete;
    expect(el.hasAttribute('spin')).to.be.false;
  });

  it('renders aria-label attribute when label prop is set', async () => {
    const el = await fixture(html`<tbt-icon name="user" label="User profile"></tbt-icon>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('[aria-label]')).to.exist;
  });

  it('marks icon as aria-hidden when no label is set', async () => {
    const el = await fixture(html`<tbt-icon name="save"></tbt-icon>`);
    await el.updateComplete;
    const i = el.shadowRoot.querySelector('i');
    expect(i.getAttribute('aria-hidden')).to.equal('true');
  });

  it('passes axe with aria-hidden icon', async () => {
    const el = await fixture(html`<tbt-icon name="save"></tbt-icon>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });

  it('passes axe with labelled icon', async () => {
    const el = await fixture(html`<tbt-icon name="approve" label="Approved"></tbt-icon>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

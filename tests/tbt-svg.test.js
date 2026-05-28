import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-svg.js';

const axe = window.axe;

describe('tbt-svg', () => {
  it('renders .wrap div', async () => {
    const el = await fixture(html`<tbt-svg></tbt-svg>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.wrap')).to.exist;
  });

  it('defaults size to 80', async () => {
    const el = await fixture(html`<tbt-svg></tbt-svg>`);
    expect(el.size).to.equal(80);
  });

  it('renders built-in "empty" illustration as inline SVG', async () => {
    const el = await fixture(html`<tbt-svg name="empty"></tbt-svg>`);
    await el.updateComplete;
    const wrap = el.shadowRoot.querySelector('.wrap');
    expect(wrap.innerHTML).to.include('<svg');
  });

  it('sets aria-hidden="true" when no label', async () => {
    const el = await fixture(html`<tbt-svg name="success"></tbt-svg>`);
    await el.updateComplete;
    const wrap = el.shadowRoot.querySelector('.wrap');
    expect(wrap.getAttribute('aria-hidden')).to.equal('true');
  });

  it('sets role="img" and aria-label when label is set', async () => {
    const el = await fixture(html`<tbt-svg name="success" label="Success"></tbt-svg>`);
    await el.updateComplete;
    const wrap = el.shadowRoot.querySelector('.wrap');
    expect(wrap.getAttribute('role')).to.equal('img');
    expect(wrap.getAttribute('aria-label')).to.equal('Success');
  });

  it('applies size to wrap inline style', async () => {
    const el = await fixture(html`<tbt-svg name="error" size="120"></tbt-svg>`);
    await el.updateComplete;
    expect(el.size).to.equal(120);
    const wrap = el.shadowRoot.querySelector('.wrap');
    expect(wrap.getAttribute('style')).to.include('120px');
  });

  it('falls back to <slot> when name is unknown', async () => {
    const el = await fixture(html`<tbt-svg name="__unknown__"></tbt-svg>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('slot')).to.exist;
  });

  it('renders all 7 built-in names without throwing', async () => {
    const names = ['empty', 'search', 'success', 'error', 'warning', 'draft', 'no-access'];
    for (const name of names) {
      const el = await fixture(html`<tbt-svg name=${name}></tbt-svg>`);
      await el.updateComplete;
      expect(el.shadowRoot.querySelector('.wrap').innerHTML).to.include('<svg');
    }
  });

  it('passes axe (aria-hidden)', async () => {
    const el = await fixture(html`<tbt-svg name="empty"></tbt-svg>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });

  it('passes axe (labelled)', async () => {
    const el = await fixture(html`<tbt-svg name="success" label="Operation succeeded"></tbt-svg>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

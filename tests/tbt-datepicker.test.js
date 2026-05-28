import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-datepicker.js';

const axe = window.axe;

describe('tbt-datepicker', () => {
  it('renders a native date input in shadow DOM', async () => {
    const el = await fixture(html`<tbt-datepicker></tbt-datepicker>`);
    expect(el.shadowRoot.querySelector('input[type="date"]')).to.exist;
  });

  it('renders label element when label prop is set', async () => {
    const el = await fixture(html`<tbt-datepicker label="Document date"></tbt-datepicker>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('label')).to.exist;
    expect(el.shadowRoot.querySelector('label').textContent.trim()).to.equal('Document date');
  });

  it('reflects value prop to native input', async () => {
    const el = await fixture(html`<tbt-datepicker value="2026-05-21"></tbt-datepicker>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('input').value).to.equal('2026-05-21');
  });

  it('shows required asterisk when required prop is set', async () => {
    const el = await fixture(html`<tbt-datepicker label="Date" required></tbt-datepicker>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.required')).to.exist;
  });

  it('fires tbt-change with ISO date string on change', async () => {
    const el = await fixture(html`<tbt-datepicker></tbt-datepicker>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-change', e => { detail = e.detail; });
    const input = el.shadowRoot.querySelector('input');
    input.value = '2026-06-15';
    input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    expect(detail.value).to.equal('2026-06-15');
  });

  it('shows error message when error prop is set', async () => {
    const el = await fixture(html`<tbt-datepicker error="Date is required"></tbt-datepicker>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.error-msg')).to.exist;
  });

  it('disables native input when disabled prop is set', async () => {
    const el = await fixture(html`<tbt-datepicker disabled></tbt-datepicker>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('input').disabled).to.be.true;
  });

  it('applies min and max attributes to native input', async () => {
    const el = await fixture(html`<tbt-datepicker min="2026-01-01" max="2026-12-31"></tbt-datepicker>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('input').min).to.equal('2026-01-01');
    expect(el.shadowRoot.querySelector('input').max).to.equal('2026-12-31');
  });
});

describe('tbt-datepicker a11y', () => {
  it('label has for="dp-input" and input has matching id', async () => {
    const el = await fixture(html`<tbt-datepicker label="Document date"></tbt-datepicker>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('input').id).to.equal('dp-input');
    expect(el.shadowRoot.querySelector('label').getAttribute('for')).to.equal('dp-input');
  });

  it('aria-invalid="false" when no error', async () => {
    const el = await fixture(html`<tbt-datepicker></tbt-datepicker>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('input').getAttribute('aria-invalid')).to.equal('false');
  });

  it('aria-invalid="true" when error is set', async () => {
    const el = await fixture(html`<tbt-datepicker error="Required"></tbt-datepicker>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('input').getAttribute('aria-invalid')).to.equal('true');
  });

  it('aria-describedby points to error element when error is set', async () => {
    const el = await fixture(html`<tbt-datepicker error="Date required"></tbt-datepicker>`);
    await el.updateComplete;
    const input = el.shadowRoot.querySelector('input');
    expect(input.getAttribute('aria-describedby')).to.equal('dp-error');
    expect(el.shadowRoot.getElementById('dp-error')).to.exist;
  });

  it('aria-describedby points to helper element when helper is set', async () => {
    const el = await fixture(html`<tbt-datepicker helper="Pick a date"></tbt-datepicker>`);
    await el.updateComplete;
    const input = el.shadowRoot.querySelector('input');
    expect(input.getAttribute('aria-describedby')).to.equal('dp-helper');
    expect(el.shadowRoot.getElementById('dp-helper')).to.exist;
  });

  it('passes axe with label', async () => {
    const el = await fixture(html`<tbt-datepicker label="Document date"></tbt-datepicker>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

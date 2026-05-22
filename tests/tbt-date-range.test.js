import { fixture, html, expect } from '@open-wc/testing';
import '../components/tbt-date-range.js';

describe('tbt-date-range', () => {
  it('renders two tbt-datepicker inputs', async () => {
    const el = await fixture(html`<tbt-date-range label="Period"></tbt-date-range>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelectorAll('tbt-datepicker')).to.have.length(2);
  });

  it('reflects from/to values onto inner datepickers', async () => {
    const el = await fixture(html`
      <tbt-date-range from="2026-01-01" to="2026-12-31"></tbt-date-range>`);
    await el.updateComplete;
    const [fromPicker, toPicker] = el.shadowRoot.querySelectorAll('tbt-datepicker');
    expect(fromPicker.value).to.equal('2026-01-01');
    expect(toPicker.value).to.equal('2026-12-31');
  });

  it('fires tbt-change when from picker changes', async () => {
    const el = await fixture(html`<tbt-date-range></tbt-date-range>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-change', e => { detail = e.detail; });
    const [fromPicker] = el.shadowRoot.querySelectorAll('tbt-datepicker');
    fromPicker.dispatchEvent(new CustomEvent('tbt-change', { detail: { value: '2026-03-01' }, bubbles: true, composed: true }));
    expect(detail).to.exist;
    expect(detail.from).to.equal('2026-03-01');
    expect(detail.to).to.equal('');
  });

  it('fires tbt-change when to picker changes', async () => {
    const el = await fixture(html`<tbt-date-range from="2026-01-01"></tbt-date-range>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-change', e => { detail = e.detail; });
    const [, toPicker] = el.shadowRoot.querySelectorAll('tbt-datepicker');
    toPicker.dispatchEvent(new CustomEvent('tbt-change', { detail: { value: '2026-06-30' }, bubbles: true, composed: true }));
    expect(detail.from).to.equal('2026-01-01');
    expect(detail.to).to.equal('2026-06-30');
  });

  it('shows error message when error prop is set', async () => {
    const el = await fixture(html`<tbt-date-range error="Invalid range"></tbt-date-range>`);
    await el.updateComplete;
    const errMsg = el.shadowRoot.querySelector('.error-msg');
    expect(errMsg).to.exist;
    expect(errMsg.textContent).to.include('Invalid range');
  });

  it('passes FormData with name-from / name-to fields to setFormValue', async () => {
    const el = await fixture(html`
      <tbt-date-range name-from="period_from" name-to="period_to"></tbt-date-range>`);
    await el.updateComplete;
    let captured = null;
    el._internals.setFormValue = v => { captured = v; };
    const [fromPicker, toPicker] = el.shadowRoot.querySelectorAll('tbt-datepicker');
    fromPicker.dispatchEvent(new CustomEvent('tbt-change',
      { detail: { value: '2026-01-01' }, bubbles: true, composed: true }));
    toPicker.dispatchEvent(new CustomEvent('tbt-change',
      { detail: { value: '2026-12-31' }, bubbles: true, composed: true }));
    expect(captured).to.be.instanceOf(FormData);
    expect(captured.get('period_from')).to.equal('2026-01-01');
    expect(captured.get('period_to')).to.equal('2026-12-31');
  });

  it('reports valueMissing when required and dates are empty, valid once both set', async () => {
    const el = await fixture(html`<tbt-date-range required></tbt-date-range>`);
    await el.updateComplete;
    expect(el._internals.validity.valueMissing).to.be.true;
    const [fromPicker, toPicker] = el.shadowRoot.querySelectorAll('tbt-datepicker');
    fromPicker.dispatchEvent(new CustomEvent('tbt-change',
      { detail: { value: '2026-01-01' }, bubbles: true, composed: true }));
    toPicker.dispatchEvent(new CustomEvent('tbt-change',
      { detail: { value: '2026-12-31' }, bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el._internals.validity.valueMissing).to.be.false;
  });
});

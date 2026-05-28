import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-form.js';
import '../components/tbt-input.js';
import '../components/tbt-button.js';

const axe = window.axe;

describe('tbt-form', () => {
  it('renders a <form> element in shadow DOM', async () => {
    const el = await fixture(html`<tbt-form></tbt-form>`);
    expect(el.shadowRoot.querySelector('form')).to.exist;
  });

  it('collects named tbt-input values and fires tbt-submit', async () => {
    const el = await fixture(html`
      <tbt-form>
        <tbt-input name="vendor" value="ABC Co."></tbt-input>
        <tbt-button type="submit" variant="primary">Save</tbt-button>
      </tbt-form>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-submit', e => { detail = e.detail; });
    const btn = el.querySelector('tbt-button[type="submit"]');
    btn.click();
    expect(detail).to.exist;
    expect(detail.data.vendor).to.equal('ABC Co.');
  });

  it('ignores tbt-input without name attribute', async () => {
    const el = await fixture(html`
      <tbt-form>
        <tbt-input value="no-name-value"></tbt-input>
        <tbt-button type="submit" variant="primary">Save</tbt-button>
      </tbt-form>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-submit', e => { detail = e.detail; });
    el.querySelector('tbt-button').click();
    expect(Object.keys(detail.data)).to.have.length(0);
  });

  it('shows error summary alert when errors array is non-empty', async () => {
    const el = await fixture(html`<tbt-form .errors=${['Field is required']}></tbt-form>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.error-summary')).to.exist;
  });

  it('hides error summary when errors array is empty', async () => {
    const el = await fixture(html`<tbt-form .errors=${[]}></tbt-form>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.error-summary')).to.not.exist;
  });

  it('does not fire tbt-submit when loading prop is set', async () => {
    const el = await fixture(html`
      <tbt-form loading>
        <tbt-button type="submit" variant="primary">Save</tbt-button>
      </tbt-form>`);
    await el.updateComplete;
    let fired = false;
    el.addEventListener('tbt-submit', () => { fired = true; });
    el.querySelector('tbt-button').click();
    expect(fired).to.be.false;
  });

  it('excludes inputs from nested tbt-form', async () => {
    const el = await fixture(html`
      <tbt-form>
        <tbt-input name="outer" value="outer-val"></tbt-input>
        <tbt-form>
          <tbt-input name="inner" value="inner-val"></tbt-input>
        </tbt-form>
        <tbt-button type="submit" variant="primary">Save</tbt-button>
      </tbt-form>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-submit', e => { detail = e.detail; });
    el.querySelector('tbt-button').click();
    expect(detail.data.outer).to.equal('outer-val');
    expect(detail.data.inner).to.be.undefined;
  });

  it('passes axe with labeled input', async () => {
    const el = await fixture(html`
      <tbt-form>
        <tbt-input name="vendor" label="Vendor" value="ABC Co."></tbt-input>
        <tbt-button type="submit" variant="primary">Save</tbt-button>
      </tbt-form>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

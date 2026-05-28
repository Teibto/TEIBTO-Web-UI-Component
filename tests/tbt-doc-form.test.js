import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-doc-form.js';

const axe = window.axe;

const SIMPLE = {
  title: 'Test',
  sections: [
    {
      title: 'Info',
      columns: 2,
      fields: [
        { name: 'tranid', label: 'Doc No.', type: 'text' },
        { name: 'memo',   label: 'Memo',    type: 'textarea' },
        { name: 'vendor', label: 'Vendor',  type: 'dropdown', options: 'vendors' },
      ],
    },
  ],
  actions: [
    { name: 'cancel', label: 'Cancel', variant: 'secondary' },
    { name: 'save',   label: 'Save',   variant: 'primary', submit: true },
  ],
};

describe('tbt-doc-form', () => {
  it('renders sections + fields from schema', async () => {
    const el = await fixture(html`<tbt-doc-form .schema=${SIMPLE}></tbt-doc-form>`);
    await el.updateComplete;
    const sections = el.shadowRoot.querySelectorAll('tbt-section');
    expect(sections).to.have.length(1);
    expect(el.shadowRoot.querySelector('tbt-input[name="tranid"]')).to.exist;
    expect(el.shadowRoot.querySelector('tbt-textarea[name="memo"]')).to.exist;
    expect(el.shadowRoot.querySelector('tbt-dropdown[name="vendor"]')).to.exist;
  });

  it('renders action buttons from schema', async () => {
    const el = await fixture(html`<tbt-doc-form .schema=${SIMPLE}></tbt-doc-form>`);
    await el.updateComplete;
    const btns = el.shadowRoot.querySelectorAll('.actions tbt-button');
    expect(btns).to.have.length(2);
    expect(btns[0].textContent.trim()).to.equal('Cancel');
    expect(btns[1].textContent.trim()).to.equal('Save');
  });

  it('resolves dropdown options from optionLists map', async () => {
    const el = await fixture(html`
      <tbt-doc-form
        .schema=${SIMPLE}
        .optionLists=${{ vendors: [{ value: 'V001', label: 'Vendor A' }] }}>
      </tbt-doc-form>`);
    await el.updateComplete;
    const dd = el.shadowRoot.querySelector('tbt-dropdown[name="vendor"]');
    expect(dd.options).to.deep.equal([{ value: 'V001', label: 'Vendor A' }]);
  });

  it('cascades .value to inner fields after render', async () => {
    const el = await fixture(html`<tbt-doc-form .schema=${SIMPLE}></tbt-doc-form>`);
    await el.updateComplete;
    el.value = { tranid: 'PO-0001', memo: 'note' };
    await el.updateComplete;
    await Promise.resolve();
    const input = el.shadowRoot.querySelector('tbt-input[name="tranid"]');
    const ta = el.shadowRoot.querySelector('tbt-textarea[name="memo"]');
    expect(input.value).to.equal('PO-0001');
    expect(ta.value).to.equal('note');
  });

  it('collects data from named fields via .value getter', async () => {
    const el = await fixture(html`<tbt-doc-form .schema=${SIMPLE}></tbt-doc-form>`);
    await el.updateComplete;
    const input = el.shadowRoot.querySelector('tbt-input[name="tranid"]');
    input.value = 'PO-0042';
    expect(el.value.tranid).to.equal('PO-0042');
  });

  it('fires tbt-change when a field updates', async () => {
    const el = await fixture(html`<tbt-doc-form .schema=${SIMPLE}></tbt-doc-form>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-change', e => { detail = e.detail; });
    const input = el.shadowRoot.querySelector('tbt-input[name="tranid"]');
    input.value = 'PO-0099';
    input.dispatchEvent(new CustomEvent('tbt-change',
      { detail: { value: 'PO-0099' }, bubbles: true, composed: true }));
    expect(detail.name).to.equal('tranid');
    expect(detail.value).to.equal('PO-0099');
    expect(detail.data.tranid).to.equal('PO-0099');
  });

  it('fires tbt-action with current data on button click', async () => {
    const el = await fixture(html`<tbt-doc-form .schema=${SIMPLE}></tbt-doc-form>`);
    await el.updateComplete;
    let actionDetail = null;
    el.addEventListener('tbt-action', e => { actionDetail = e.detail; });
    el.shadowRoot.querySelectorAll('.actions tbt-button')[0].click();
    expect(actionDetail.action).to.equal('cancel');
    expect(actionDetail.data).to.be.an('object');
  });

  it('fires tbt-submit only when action has submit:true', async () => {
    const el = await fixture(html`<tbt-doc-form .schema=${SIMPLE}></tbt-doc-form>`);
    await el.updateComplete;
    let submitFired = false;
    el.addEventListener('tbt-submit', () => { submitFired = true; });
    el.shadowRoot.querySelectorAll('.actions tbt-button')[0].click();   // cancel
    expect(submitFired).to.be.false;
    el.shadowRoot.querySelectorAll('.actions tbt-button')[1].click();   // save (submit)
    expect(submitFired).to.be.true;
  });

  it('renders tbt-lines-block for type:"lines" section', async () => {
    const schema = {
      sections: [
        { title: 'Lines', type: 'lines', currency: '$', vatRate: 0.1 },
      ],
    };
    const el = await fixture(html`<tbt-doc-form .schema=${schema}></tbt-doc-form>`);
    await el.updateComplete;
    const lb = el.shadowRoot.querySelector('tbt-lines-block');
    expect(lb).to.exist;
    expect(lb.getAttribute('currency')).to.equal('$');
  });

  it('warns + renders placeholder for unknown field type', async () => {
    const schema = {
      sections: [{ title: 'X', fields: [{ name: 'mystery', type: 'wat' }] }],
    };
    const el = await fixture(html`<tbt-doc-form .schema=${schema}></tbt-doc-form>`);
    await el.updateComplete;
    expect(el.shadowRoot.textContent).to.include('unknown field type');
  });

  it('passes axe with schema', async () => {
    const el = await fixture(html`<tbt-doc-form .schema=${SIMPLE}></tbt-doc-form>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

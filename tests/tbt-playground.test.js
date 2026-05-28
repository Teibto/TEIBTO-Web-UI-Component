import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-playground.js';
import '../components/tbt-button.js';

const axe = window.axe;

describe('tbt-playground', () => {
  it('renders .pg wrapper', async () => {
    const el = await fixture(html`<tbt-playground></tbt-playground>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.pg')).to.exist;
  });

  it('shows .pg-header when label is set', async () => {
    const el = await fixture(html`<tbt-playground label="Button demo"></tbt-playground>`);
    await el.updateComplete;
    const header = el.shadowRoot.querySelector('.pg-header');
    expect(header).to.exist;
    expect(header.textContent.trim()).to.equal('Button demo');
  });

  it('hides .pg-header when no label', async () => {
    const el = await fixture(html`<tbt-playground></tbt-playground>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.pg-header')).to.not.exist;
  });

  it('renders checkbox control for boolean schema entry', async () => {
    const schema = [{ key: 'disabled', label: 'Disabled', type: 'boolean' }];
    const el = await fixture(html`<tbt-playground .schema=${schema}></tbt-playground>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('input[type="checkbox"]')).to.exist;
  });

  it('renders select control for select schema entry', async () => {
    const schema = [{ key: 'variant', label: 'Variant', type: 'select', options: ['primary', 'secondary'] }];
    const el = await fixture(html`<tbt-playground .schema=${schema}></tbt-playground>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('select')).to.exist;
  });

  it('select options match schema options array', async () => {
    const schema = [{ key: 'variant', label: 'Variant', type: 'select', options: ['primary', 'secondary', 'danger'] }];
    const el = await fixture(html`<tbt-playground .schema=${schema}></tbt-playground>`);
    await el.updateComplete;
    const options = el.shadowRoot.querySelectorAll('select option');
    expect(options).to.have.length(3);
  });

  it('renders text input for text schema entry', async () => {
    const schema = [{ key: '_text', label: 'Content', type: 'text', default: 'Hello' }];
    const el = await fixture(html`<tbt-playground .schema=${schema}></tbt-playground>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('input[type="text"]')).to.exist;
  });

  it('applies schema defaults to slotted element', async () => {
    const schema = [
      { key: 'variant', label: 'Variant', type: 'select', options: ['primary', 'secondary'], default: 'secondary' },
    ];
    const el = await fixture(html`
      <tbt-playground .schema=${schema}>
        <tbt-button>Click</tbt-button>
      </tbt-playground>
    `);
    await el.updateComplete;
    const btn = el.querySelector('tbt-button');
    expect(btn.variant).to.equal('secondary');
  });

  it('has .pg-preview slot for target element', async () => {
    const el = await fixture(html`<tbt-playground></tbt-playground>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.pg-preview')).to.exist;
    expect(el.shadowRoot.querySelector('.pg-preview slot')).to.exist;
  });

  it('passes axe with schema controls', async () => {
    const schema = [
      { key: 'variant', label: 'Variant', type: 'select', options: ['primary', 'secondary'] },
      { key: 'disabled', label: 'Disabled', type: 'boolean' },
    ];
    const el = await fixture(html`
      <tbt-playground label="Button demo" .schema=${schema}>
        <tbt-button>Click</tbt-button>
      </tbt-playground>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

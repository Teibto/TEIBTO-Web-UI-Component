import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-multiselect.js';

const axe = window.axe;

const OPTIONS = [
  { value: '1', label: 'Apple' },
  { value: '2', label: 'Banana' },
  { value: '3', label: 'Cherry' },
  { value: '4', label: 'Durian' },
];

describe('tbt-multiselect — search', () => {
  it('does not show a search input by default', async () => {
    const el = await fixture(html`<tbt-multiselect .options=${OPTIONS}></tbt-multiselect>`);
    await el.updateComplete;
    el._open = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.search input')).to.not.exist;
  });

  it('shows a search input when searchable and open', async () => {
    const el = await fixture(html`<tbt-multiselect searchable .options=${OPTIONS}></tbt-multiselect>`);
    await el.updateComplete;
    el._open = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.search input')).to.exist;
  });

  it('filters options by search query (case-insensitive)', async () => {
    const el = await fixture(html`<tbt-multiselect searchable .options=${OPTIONS}></tbt-multiselect>`);
    await el.updateComplete;
    el._open = true;
    el._query = 'BAN';
    await el.updateComplete;
    const labels = [...el.shadowRoot.querySelectorAll('.option')].map(o => o.textContent.trim());
    expect(labels).to.deep.equal(['Banana']);
  });

  it('shows empty message when no options match', async () => {
    const el = await fixture(html`<tbt-multiselect searchable .options=${OPTIONS}></tbt-multiselect>`);
    await el.updateComplete;
    el._open = true;
    el._query = 'zzz';
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.empty-msg')).to.exist;
  });

  it('clears search query when popover closes and reopens', async () => {
    const el = await fixture(html`<tbt-multiselect searchable .options=${OPTIONS}></tbt-multiselect>`);
    await el.updateComplete;
    el._open = true;
    el._query = 'app';
    await el.updateComplete;
    el._open = false;
    await el.updateComplete;
    el._open = true;
    await el.updateComplete;
    expect(el._query).to.equal('');
  });

  it('selection from filtered list still toggles value correctly', async () => {
    const el = await fixture(html`<tbt-multiselect searchable .options=${OPTIONS}></tbt-multiselect>`);
    await el.updateComplete;
    el._open = true;
    el._query = 'cherry';
    await el.updateComplete;
    el.shadowRoot.querySelector('.option').click();
    expect(el.value).to.deep.equal(['3']);
  });

  it('passes axe (open)', async () => {
    const el = await fixture(html`<tbt-multiselect label="Fruits" .options=${OPTIONS}></tbt-multiselect>`);
    await el.updateComplete;
    el._open = true;
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });

  it('passes axe (searchable, open)', async () => {
    const el = await fixture(html`<tbt-multiselect label="Fruits" searchable .options=${OPTIONS}></tbt-multiselect>`);
    await el.updateComplete;
    el._open = true;
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

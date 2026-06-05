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

describe('tbt-multiselect — keyboard navigation', () => {
  const kd = key => new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });

  it('ArrowDown opens the dropdown when closed', async () => {
    const el = await fixture(html`<tbt-multiselect .options=${OPTIONS}></tbt-multiselect>`);
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').dispatchEvent(kd('ArrowDown'));
    await el.updateComplete;
    expect(el._open).to.be.true;
  });

  it('ArrowDown moves _activeIdx from -1 to 0', async () => {
    const el = await fixture(html`<tbt-multiselect .options=${OPTIONS}></tbt-multiselect>`);
    await el.updateComplete;
    el._open = true;
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').dispatchEvent(kd('ArrowDown'));
    await el.updateComplete;
    expect(el._activeIdx).to.equal(0);
  });

  it('ArrowUp clamps at 0', async () => {
    const el = await fixture(html`<tbt-multiselect .options=${OPTIONS}></tbt-multiselect>`);
    await el.updateComplete;
    el._open = true;
    await el.updateComplete;
    el._activeIdx = 0;
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').dispatchEvent(kd('ArrowUp'));
    await el.updateComplete;
    expect(el._activeIdx).to.equal(0);
  });

  it('End moves to last option, Home back to first', async () => {
    const el = await fixture(html`<tbt-multiselect .options=${OPTIONS}></tbt-multiselect>`);
    await el.updateComplete;
    el._open = true;
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').dispatchEvent(kd('End'));
    await el.updateComplete;
    expect(el._activeIdx).to.equal(OPTIONS.length - 1);
    el.shadowRoot.querySelector('.trigger').dispatchEvent(kd('Home'));
    await el.updateComplete;
    expect(el._activeIdx).to.equal(0);
  });

  it('Enter toggles the highlighted option and keeps the list open', async () => {
    const el = await fixture(html`<tbt-multiselect .options=${OPTIONS}></tbt-multiselect>`);
    await el.updateComplete;
    el._open = true;
    await el.updateComplete;
    el._activeIdx = 2;
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-change', e => { detail = e.detail; });
    el.shadowRoot.querySelector('.trigger').dispatchEvent(kd('Enter'));
    await el.updateComplete;
    expect(el.value).to.deep.equal(['3']);
    expect(detail.values).to.deep.equal(['3']);
    expect(el._open).to.be.true;
  });

  it('Enter on an already-selected option removes it (toggle off)', async () => {
    const el = await fixture(html`<tbt-multiselect .value=${['3']} .options=${OPTIONS}></tbt-multiselect>`);
    await el.updateComplete;
    el._open = true;
    await el.updateComplete;
    el._activeIdx = 2;
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').dispatchEvent(kd('Enter'));
    await el.updateComplete;
    expect(el.value).to.deep.equal([]);
  });

  it('Escape closes the dropdown', async () => {
    const el = await fixture(html`<tbt-multiselect .options=${OPTIONS}></tbt-multiselect>`);
    await el.updateComplete;
    el._open = true;
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').dispatchEvent(kd('Escape'));
    await el.updateComplete;
    expect(el._open).to.be.false;
  });

  it('aria-activedescendant matches the highlighted option id', async () => {
    const el = await fixture(html`<tbt-multiselect .options=${OPTIONS}></tbt-multiselect>`);
    await el.updateComplete;
    el._open = true;
    await el.updateComplete;
    el._activeIdx = 1;
    await el.updateComplete;
    const opts = el.shadowRoot.querySelectorAll('[role="option"]');
    expect(el.shadowRoot.querySelector('.trigger').getAttribute('aria-activedescendant')).to.equal(opts[1].id);
  });

  it('no aria-activedescendant when nothing is highlighted', async () => {
    const el = await fixture(html`<tbt-multiselect .options=${OPTIONS}></tbt-multiselect>`);
    await el.updateComplete;
    el._open = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.trigger').hasAttribute('aria-activedescendant')).to.be.false;
  });

  it('options carry an id and role="option"', async () => {
    const el = await fixture(html`<tbt-multiselect .options=${OPTIONS}></tbt-multiselect>`);
    await el.updateComplete;
    el._open = true;
    await el.updateComplete;
    const opts = el.shadowRoot.querySelectorAll('[role="option"]');
    expect(opts.length).to.equal(OPTIONS.length);
    opts.forEach(opt => expect(opt.id).to.match(/^ms[a-z0-9]+-opt-/));
  });
});

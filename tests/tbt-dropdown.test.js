import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-dropdown.js';

const axe = window.axe;

const OPTIONS = [
  { value: 'A', label: 'Apple' },
  { value: 'B', label: 'Banana' },
  { value: 'C', label: 'Cherry' },
  { value: 'D', label: 'Durian' },
];

describe('tbt-dropdown', () => {
  it('renders native <select> by default', async () => {
    const el = await fixture(html`<tbt-dropdown .options=${OPTIONS}></tbt-dropdown>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('select')).to.exist;
    expect(el.shadowRoot.querySelector('.trigger')).to.not.exist;
  });

  it('renders custom popover when searchable', async () => {
    const el = await fixture(html`<tbt-dropdown searchable .options=${OPTIONS}></tbt-dropdown>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('select')).to.not.exist;
    expect(el.shadowRoot.querySelector('.trigger')).to.exist;
    expect(el.shadowRoot.querySelector('.dropdown')).to.exist;
  });

  it('opens popover and shows search input on click (searchable)', async () => {
    const el = await fixture(html`<tbt-dropdown searchable .options=${OPTIONS}></tbt-dropdown>`);
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').click();
    await el.updateComplete;
    expect(el.hasAttribute('open')).to.be.true;
    expect(el.shadowRoot.querySelector('.search input')).to.exist;
  });

  it('filters options by search query (case-insensitive)', async () => {
    const el = await fixture(html`<tbt-dropdown searchable .options=${OPTIONS}></tbt-dropdown>`);
    await el.updateComplete;
    el._open = true;
    el._query = 'BAN';
    await el.updateComplete;
    const opts = el.shadowRoot.querySelectorAll('.option');
    const labels = [...opts].map(o => o.textContent.trim());
    expect(labels).to.deep.equal(['Banana']);
  });

  it('shows "no options match" when filter yields zero', async () => {
    const el = await fixture(html`<tbt-dropdown searchable .options=${OPTIONS}></tbt-dropdown>`);
    await el.updateComplete;
    el._open = true;
    el._query = 'zzz';
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.empty-msg')).to.exist;
    expect(el.shadowRoot.querySelectorAll('.option')).to.have.length(0);
  });

  it('picking an option sets value, closes, and fires tbt-change', async () => {
    const el = await fixture(html`<tbt-dropdown searchable .options=${OPTIONS}></tbt-dropdown>`);
    await el.updateComplete;
    el._open = true;
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-change', e => { detail = e.detail; });
    el.shadowRoot.querySelectorAll('.option')[1].click();
    await el.updateComplete;
    expect(el.value).to.equal('B');
    expect(detail.value).to.equal('B');
    expect(detail.label).to.equal('Banana');
    expect(el._open).to.be.false;
  });

  it('auto-width sizes the select to its content instead of collapsing', async () => {
    const el = await fixture(html`<tbt-dropdown auto-width placeholder="ALL-STATUSES-LONG"></tbt-dropdown>`);
    await el.updateComplete;
    const select = el.shadowRoot.querySelector('select');
    expect(getComputedStyle(select).width, 'auto-width rule must apply').to.not.equal('');
    expect(select.offsetWidth, 'select must be wide enough for its placeholder').to.be.greaterThan(80);
  });
});

describe('tbt-dropdown a11y (searchable)', () => {
  it('trigger has role="combobox" and aria-haspopup="listbox"', async () => {
    const el = await fixture(html`<tbt-dropdown searchable .options=${OPTIONS}></tbt-dropdown>`);
    await el.updateComplete;
    const trigger = el.shadowRoot.querySelector('.trigger');
    expect(trigger.getAttribute('role')).to.equal('combobox');
    expect(trigger.getAttribute('aria-haspopup')).to.equal('listbox');
  });

  it('aria-expanded reflects open state', async () => {
    const el = await fixture(html`<tbt-dropdown searchable .options=${OPTIONS}></tbt-dropdown>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.trigger').getAttribute('aria-expanded')).to.equal('false');
    el._open = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.trigger').getAttribute('aria-expanded')).to.equal('true');
  });

  it('options have role="option", aria-selected, and id', async () => {
    const el = await fixture(html`<tbt-dropdown searchable .options=${OPTIONS}></tbt-dropdown>`);
    await el.updateComplete;
    el._open = true;
    await el.updateComplete;
    const opts = el.shadowRoot.querySelectorAll('[role="option"]');
    expect(opts.length).to.equal(OPTIONS.length);
    opts.forEach(opt => {
      expect(opt.id).to.match(/^dd[a-z0-9]+-opt-/);
      expect(opt.hasAttribute('aria-selected')).to.be.true;
    });
  });

  it('aria-activedescendant matches highlighted option id', async () => {
    const el = await fixture(html`<tbt-dropdown searchable .options=${OPTIONS}></tbt-dropdown>`);
    await el.updateComplete;
    el._open = true;
    await el.updateComplete;
    el._activeIdx = 1;
    await el.updateComplete;
    const opts = el.shadowRoot.querySelectorAll('[role="option"]');
    expect(el.shadowRoot.querySelector('.trigger').getAttribute('aria-activedescendant')).to.equal(opts[1].id);
  });

  it('no aria-activedescendant when _activeIdx is -1', async () => {
    const el = await fixture(html`<tbt-dropdown searchable .options=${OPTIONS}></tbt-dropdown>`);
    await el.updateComplete;
    el._open = true;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.trigger').hasAttribute('aria-activedescendant')).to.be.false;
  });

  it('passes axe (searchable, open)', async () => {
    const el = await fixture(html`<tbt-dropdown searchable .options=${OPTIONS}></tbt-dropdown>`);
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

describe('tbt-dropdown keyboard navigation (searchable)', () => {
  const kd = key => new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });

  it('ArrowDown opens dropdown when closed', async () => {
    const el = await fixture(html`<tbt-dropdown searchable .options=${OPTIONS}></tbt-dropdown>`);
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').dispatchEvent(kd('ArrowDown'));
    await el.updateComplete;
    expect(el._open).to.be.true;
  });

  it('ArrowDown moves _activeIdx from -1 to 0', async () => {
    const el = await fixture(html`<tbt-dropdown searchable .options=${OPTIONS}></tbt-dropdown>`);
    await el.updateComplete;
    el._open = true;
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').dispatchEvent(kd('ArrowDown'));
    await el.updateComplete;
    expect(el._activeIdx).to.equal(0);
  });

  it('ArrowDown advances to next option', async () => {
    const el = await fixture(html`<tbt-dropdown searchable .options=${OPTIONS}></tbt-dropdown>`);
    await el.updateComplete;
    el._open = true;
    await el.updateComplete;
    el._activeIdx = 1;
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').dispatchEvent(kd('ArrowDown'));
    await el.updateComplete;
    expect(el._activeIdx).to.equal(2);
  });

  it('ArrowUp clamps at 0', async () => {
    const el = await fixture(html`<tbt-dropdown searchable .options=${OPTIONS}></tbt-dropdown>`);
    await el.updateComplete;
    el._open = true;
    await el.updateComplete;
    el._activeIdx = 0;
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').dispatchEvent(kd('ArrowUp'));
    await el.updateComplete;
    expect(el._activeIdx).to.equal(0);
  });

  it('Home moves to first option', async () => {
    const el = await fixture(html`<tbt-dropdown searchable .options=${OPTIONS}></tbt-dropdown>`);
    await el.updateComplete;
    el._open = true;
    await el.updateComplete;
    el._activeIdx = 3;
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').dispatchEvent(kd('Home'));
    await el.updateComplete;
    expect(el._activeIdx).to.equal(0);
  });

  it('End moves to last option', async () => {
    const el = await fixture(html`<tbt-dropdown searchable .options=${OPTIONS}></tbt-dropdown>`);
    await el.updateComplete;
    el._open = true;
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').dispatchEvent(kd('End'));
    await el.updateComplete;
    expect(el._activeIdx).to.equal(OPTIONS.length - 1);
  });

  it('Enter commits highlighted option and closes', async () => {
    const el = await fixture(html`<tbt-dropdown searchable .options=${OPTIONS}></tbt-dropdown>`);
    await el.updateComplete;
    el._open = true;
    await el.updateComplete;
    el._activeIdx = 2;
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-change', e => { detail = e.detail; });
    el.shadowRoot.querySelector('.trigger').dispatchEvent(kd('Enter'));
    await el.updateComplete;
    expect(el.value).to.equal('C');
    expect(detail.label).to.equal('Cherry');
    expect(el._open).to.be.false;
  });

  it('Escape closes dropdown', async () => {
    const el = await fixture(html`<tbt-dropdown searchable .options=${OPTIONS}></tbt-dropdown>`);
    await el.updateComplete;
    el._open = true;
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').dispatchEvent(kd('Escape'));
    await el.updateComplete;
    expect(el._open).to.be.false;
  });

});

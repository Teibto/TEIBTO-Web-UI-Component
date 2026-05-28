import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-textarea.js';

const axe = window.axe;

describe('tbt-textarea', () => {
  it('renders a textarea in shadow DOM', async () => {
    const el = await fixture(html`<tbt-textarea label="Notes"></tbt-textarea>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('textarea')).to.exist;
  });

  it('renders label text', async () => {
    const el = await fixture(html`<tbt-textarea label="Memo"></tbt-textarea>`);
    await el.updateComplete;
    expect(el.shadowRoot.textContent).to.include('Memo');
  });

  it('reflects rows attribute onto the textarea', async () => {
    const el = await fixture(html`<tbt-textarea rows="5"></tbt-textarea>`);
    await el.updateComplete;
    const ta = el.shadowRoot.querySelector('textarea');
    expect(ta.rows).to.equal(5);
  });

  it('fires tbt-input on each keystroke and tbt-change on commit', async () => {
    const el = await fixture(html`<tbt-textarea></tbt-textarea>`);
    await el.updateComplete;
    const events = [];
    el.addEventListener('tbt-input', e => events.push(['input', e.detail.value]));
    el.addEventListener('tbt-change', e => events.push(['change', e.detail.value]));
    const ta = el.shadowRoot.querySelector('textarea');
    ta.value = 'hello';
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.dispatchEvent(new Event('change', { bubbles: true }));
    expect(events).to.deep.equal([['input', 'hello'], ['change', 'hello']]);
  });

  it('reports valueMissing when required and empty', async () => {
    const el = await fixture(html`<tbt-textarea required></tbt-textarea>`);
    await el.updateComplete;
    expect(el._internals.validity.valueMissing).to.be.true;
    el.value = 'something';
    await el.updateComplete;
    expect(el._internals.validity.valueMissing).to.be.false;
  });

  it('shows error message when error prop is set', async () => {
    const el = await fixture(html`<tbt-textarea error="Required"></tbt-textarea>`);
    await el.updateComplete;
    const msg = el.shadowRoot.querySelector('.error-msg');
    expect(msg).to.exist;
    expect(msg.textContent).to.include('Required');
  });

  it('passes axe with label', async () => {
    const el = await fixture(html`<tbt-textarea label="Notes" required></tbt-textarea>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

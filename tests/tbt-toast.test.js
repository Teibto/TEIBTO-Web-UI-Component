import { fixture, html, expect, waitUntil } from '@open-wc/testing';
import '../components/tbt-toast.js';

const axe = window.axe;

describe('tbt-toast', () => {
  it('adds and renders a toast', async () => {
    const el = await fixture(html`<tbt-toast></tbt-toast>`);
    el.add('Document saved', 'success');
    await el.updateComplete;
    const toast = el.shadowRoot.querySelector('.toast--success');
    expect(toast).to.exist;
    expect(toast.textContent).to.include('Document saved');
  });

  it('auto-dismisses after duration', async () => {
    const el = await fixture(html`<tbt-toast></tbt-toast>`);
    el.add('Temp message', 'info', { duration: 50 });
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.toast')).to.exist;
    await waitUntil(() => !el.shadowRoot.querySelector('.toast'), 'Toast did not dismiss', { timeout: 500 });
  });

  it('persistent toast does not auto-dismiss', async () => {
    const el = await fixture(html`<tbt-toast></tbt-toast>`);
    el.add('Stay here', 'warning', { persistent: true });
    await el.updateComplete;
    await new Promise(r => setTimeout(r, 200));
    expect(el.shadowRoot.querySelector('.toast')).to.exist;
  });

  it('caps visible toasts at 5', async () => {
    const el = await fixture(html`<tbt-toast></tbt-toast>`);
    for (let i = 0; i < 7; i++) el.add(`Message ${i}`, 'info', { duration: 60000 });
    await el.updateComplete;
    await new Promise(r => setTimeout(r, 250));
    await el.updateComplete;
    const toasts = el.shadowRoot.querySelectorAll('.toast:not(.toast--out)');
    expect(toasts.length).to.be.at.most(5);
  });

  it('dismiss button removes toast', async () => {
    const el = await fixture(html`<tbt-toast></tbt-toast>`);
    el.add('Close me', 'danger', { duration: 60000 });
    await el.updateComplete;
    el.shadowRoot.querySelector('.close').click();
    await waitUntil(() => !el.shadowRoot.querySelector('.toast--danger:not(.toast--out)'), 'Toast did not remove', { timeout: 500 });
  });

  it('passes axe with visible toast', async () => {
    const el = await fixture(html`<tbt-toast></tbt-toast>`);
    el.add('Document saved successfully', 'success', { duration: 60000 });
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

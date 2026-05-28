import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-audit-log.js';

const axe = window.axe;

describe('tbt-audit-log', () => {
  it('renders without throwing', async () => {
    const el = await fixture(html`<tbt-audit-log></tbt-audit-log>`);
    expect(el).to.exist;
  });

  it('defaults to empty entries array', async () => {
    const el = await fixture(html`<tbt-audit-log></tbt-audit-log>`);
    expect(el.entries).to.deep.equal([]);
  });

  it('defaults loading to false and compact to false', async () => {
    const el = await fixture(html`<tbt-audit-log></tbt-audit-log>`);
    expect(el.loading).to.be.false;
    expect(el.compact).to.be.false;
  });

  it('shows empty-message text when no entries', async () => {
    const el = await fixture(html`<tbt-audit-log empty-message="Nothing here"></tbt-audit-log>`);
    await el.updateComplete;
    expect(el.shadowRoot.textContent).to.include('Nothing here');
  });

  it('reflects loading attribute when loading prop is set', async () => {
    const el = await fixture(html`<tbt-audit-log loading></tbt-audit-log>`);
    await el.updateComplete;
    expect(el.loading).to.be.true;
    expect(el.hasAttribute('loading')).to.be.true;
  });

  it('reflects compact attribute when compact prop is set', async () => {
    const el = await fixture(html`<tbt-audit-log compact></tbt-audit-log>`);
    await el.updateComplete;
    expect(el.compact).to.be.true;
    expect(el.hasAttribute('compact')).to.be.true;
  });

  it('stores max-height prop correctly', async () => {
    const el = await fixture(html`<tbt-audit-log max-height="300px"></tbt-audit-log>`);
    await el.updateComplete;
    expect(el.maxHeight).to.equal('300px');
  });

  it('passes axe with entries', async () => {
    const el = await fixture(html`<tbt-audit-log></tbt-audit-log>`);
    el.entries = [
      { action: 'created',  user: 'Alice', timestamp: '2026-05-20T09:00:00' },
      { action: 'approved', user: 'Bob',   timestamp: '2026-05-21T10:30:00',
        changes: [{ field: 'Status', from: 'Pending', to: 'Approved' }] },
    ];
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

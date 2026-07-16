import { fixture, html, expect } from '@open-wc/testing';
import '../components/tbt-stat.js';

const axe = window.axe;

describe('tbt-stat', () => {
  it('renders label', async () => {
    const el = await fixture(html`<tbt-stat label="Revenue" value="฿1,200,000"></tbt-stat>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.label').textContent.trim()).to.equal('Revenue');
  });

  it('renders value', async () => {
    const el = await fixture(html`<tbt-stat label="Orders" value="42"></tbt-stat>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.value').textContent.trim()).to.equal('42');
  });

  it('shows em dash when value not provided', async () => {
    const el = await fixture(html`<tbt-stat label="Orders"></tbt-stat>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.value').textContent.trim()).to.equal('—');
  });

  it('renders trend text', async () => {
    const el = await fixture(html`<tbt-stat label="Revenue" value="฿1.2M" trend="+12%"></tbt-stat>`);
    await el.updateComplete;
    const trend = el.shadowRoot.querySelector('.trend');
    expect(trend).to.exist;
    expect(trend.textContent).to.include('+12%');
  });

  it('auto-detects success variant from + prefix', async () => {
    const el = await fixture(html`<tbt-stat label="Revenue" value="฿1M" trend="+5%"></tbt-stat>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.trend').classList.contains('success')).to.be.true;
  });

  it('auto-detects danger variant from - prefix', async () => {
    const el = await fixture(html`<tbt-stat label="Costs" value="฿500K" trend="-3%"></tbt-stat>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.trend').classList.contains('danger')).to.be.true;
  });

  it('uses neutral variant when no prefix', async () => {
    const el = await fixture(html`<tbt-stat label="Orders" value="100" trend="0%"></tbt-stat>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.trend').classList.contains('neutral')).to.be.true;
  });

  it('respects explicit trend-variant override', async () => {
    const el = await fixture(html`<tbt-stat label="Discount" value="-฿5K" trend="-5%" trend-variant="success"></tbt-stat>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.trend').classList.contains('success')).to.be.true;
  });

  it('omits trend block when trend not provided', async () => {
    const el = await fixture(html`<tbt-stat label="Orders" value="42"></tbt-stat>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.trend')).to.be.null;
  });

  it('renders icon when provided', async () => {
    const el = await fixture(html`<tbt-stat label="Revenue" value="฿1M" icon="cash"></tbt-stat>`);
    await el.updateComplete;
    const iconWrap = el.shadowRoot.querySelector('.icon-wrap');
    expect(iconWrap).to.exist;
    expect(iconWrap.querySelector('i.ti-cash')).to.exist;
  });

  it('resolves ERP alias icons through ICON_ALIASES (money → currency-baht)', async () => {
    const el = await fixture(html`<tbt-stat label="Net" value="฿1M" icon="money"></tbt-stat>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('i.ti-currency-baht'), 'alias "money" must map to a real Tabler glyph').to.exist;
    expect(el.shadowRoot.querySelector('i.ti-money')).to.be.null;
  });

  it('resolves ERP alias icons through ICON_ALIASES (payment → credit-card)', async () => {
    const el = await fixture(html`<tbt-stat label="Total" value="฿1M" icon="payment"></tbt-stat>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('i.ti-credit-card')).to.exist;
  });

  it('omits icon-wrap when icon not provided', async () => {
    const el = await fixture(html`<tbt-stat label="Revenue" value="฿1M"></tbt-stat>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.icon-wrap')).to.be.null;
  });

  it('variant attribute reflects', async () => {
    const el = await fixture(html`<tbt-stat label="Revenue" value="฿1M" variant="primary"></tbt-stat>`);
    await el.updateComplete;
    expect(el.getAttribute('variant')).to.equal('primary');
  });

  it('passes axe — full stat card', async () => {
    const el = await fixture(html`
      <tbt-stat
        label="Total revenue"
        value="฿1,200,000"
        trend="+12% vs last month"
        icon="cash"
        variant="primary">
      </tbt-stat>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

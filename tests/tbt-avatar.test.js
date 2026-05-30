import { html, fixture, expect, aTimeout } from '@open-wc/testing';
import '../components/tbt-avatar.js';

const axe = window.axe;

describe('tbt-avatar', () => {
  it('renders initials from the name when there is no image', async () => {
    const el = await fixture(html`<tbt-avatar name="Wichit Wongta"></tbt-avatar>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.initials').textContent.trim()).to.equal('WW');
  });

  it('uses one letter when name is a single word, "?" when empty', async () => {
    const a = await fixture(html`<tbt-avatar name="Mana"></tbt-avatar>`);
    await a.updateComplete;
    expect(a.shadowRoot.querySelector('.initials').textContent.trim()).to.equal('M');
    const b = await fixture(html`<tbt-avatar></tbt-avatar>`);
    await b.updateComplete;
    expect(b.shadowRoot.querySelector('.initials').textContent.trim()).to.equal('?');
  });

  it('renders an <img> when src is set', async () => {
    const el = await fixture(html`<tbt-avatar name="A B" src="/x.jpg"></tbt-avatar>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('img')).to.exist;
  });

  it('falls back to initials when the image errors', async () => {
    const el = await fixture(html`<tbt-avatar name="A B" src="/missing.jpg"></tbt-avatar>`);
    await el.updateComplete;
    el.shadowRoot.querySelector('img').dispatchEvent(new Event('error'));
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('img')).to.not.exist;
    expect(el.shadowRoot.querySelector('.initials').textContent.trim()).to.equal('AB');
  });

  it('assigns a deterministic colour class from the name', async () => {
    const a = await fixture(html`<tbt-avatar name="Same Name"></tbt-avatar>`);
    const b = await fixture(html`<tbt-avatar name="Same Name"></tbt-avatar>`);
    await a.updateComplete; await b.updateComplete;
    const ca = [...a.shadowRoot.querySelector('.av').classList].find(c => /^c\d$/.test(c));
    const cb = [...b.shadowRoot.querySelector('.av').classList].find(c => /^c\d$/.test(c));
    expect(ca).to.match(/^c[0-6]$/);
    expect(ca).to.equal(cb);
  });

  it('shows a status dot when status is set', async () => {
    const el = await fixture(html`<tbt-avatar name="A B" status="online"></tbt-avatar>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.dot.online')).to.exist;
  });

  it('passes axe', async () => {
    const el = await fixture(html`<tbt-avatar name="Wichit Wongta" status="online"></tbt-avatar>`);
    await el.updateComplete;
    const results = await axe.run(el, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

describe('tbt-avatar-group', () => {
  it('collapses avatars beyond max into a +N chip', async () => {
    const el = await fixture(html`
      <tbt-avatar-group max="2">
        <tbt-avatar name="A A"></tbt-avatar>
        <tbt-avatar name="B B"></tbt-avatar>
        <tbt-avatar name="C C"></tbt-avatar>
        <tbt-avatar name="D D"></tbt-avatar>
      </tbt-avatar-group>`);
    await el.updateComplete;
    await aTimeout(60); // let slotchange fire + re-render
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.more')?.textContent.trim()).to.equal('+2');
  });
});

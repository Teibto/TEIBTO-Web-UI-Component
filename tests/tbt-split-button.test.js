import { fixture, html, expect } from '@open-wc/testing';
import '../components/tbt-split-button.js';

const axe = window.axe;

const ACTIONS = [
  { value: 'submit', label: 'Save & Submit' },
  { value: 'print',  label: 'Save & Print', icon: 'printer' },
  { value: 'draft',  label: 'Save as Draft', disabled: true },
];

describe('tbt-split-button', () => {
  it('renders main button with label', async () => {
    const el = await fixture(html`
      <tbt-split-button label="Save" .actions=${ACTIONS}></tbt-split-button>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.main-btn').textContent.trim()).to.equal('Save');
  });

  it('fires tbt-click on main button click', async () => {
    const el = await fixture(html`
      <tbt-split-button label="Save" .actions=${ACTIONS}></tbt-split-button>`);
    await el.updateComplete;
    let fired = false;
    el.addEventListener('tbt-click', () => { fired = true; });
    el.shadowRoot.querySelector('.main-btn').click();
    expect(fired).to.be.true;
  });

  it('dropdown hidden by default, opens on chevron click', async () => {
    const el = await fixture(html`
      <tbt-split-button label="Save" .actions=${ACTIONS}></tbt-split-button>`);
    await el.updateComplete;
    expect(getComputedStyle(el.shadowRoot.querySelector('.dropdown')).display).to.equal('none');
    el.shadowRoot.querySelector('.chev-btn').click();
    await el.updateComplete;
    expect(el.hasAttribute('open')).to.be.true;
  });

  it('fires tbt-action with value and label on menu item click', async () => {
    const el = await fixture(html`
      <tbt-split-button label="Save" .actions=${ACTIONS}></tbt-split-button>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-action', e => { detail = e.detail; });
    el.shadowRoot.querySelector('.chev-btn').click();
    await el.updateComplete;
    el.shadowRoot.querySelectorAll('.menu-item')[0].click();
    expect(detail.value).to.equal('submit');
    expect(detail.label).to.equal('Save & Submit');
  });

  it('closes dropdown after action selected', async () => {
    const el = await fixture(html`
      <tbt-split-button label="Save" .actions=${ACTIONS}></tbt-split-button>`);
    await el.updateComplete;
    el.shadowRoot.querySelector('.chev-btn').click();
    await el.updateComplete;
    el.shadowRoot.querySelectorAll('.menu-item')[0].click();
    await el.updateComplete;
    expect(el.hasAttribute('open')).to.be.false;
  });

  it('disabled action does not fire tbt-action', async () => {
    const el = await fixture(html`
      <tbt-split-button label="Save" .actions=${ACTIONS}></tbt-split-button>`);
    await el.updateComplete;
    let fired = false;
    el.addEventListener('tbt-action', () => { fired = true; });
    el.shadowRoot.querySelector('.chev-btn').click();
    await el.updateComplete;
    el.shadowRoot.querySelectorAll('.menu-item')[2].click();
    expect(fired).to.be.false;
  });

  it('disabled state prevents main click and dropdown open', async () => {
    const el = await fixture(html`
      <tbt-split-button label="Save" .actions=${ACTIONS} disabled></tbt-split-button>`);
    await el.updateComplete;
    let clickFired = false;
    el.addEventListener('tbt-click', () => { clickFired = true; });
    el.shadowRoot.querySelector('.main-btn').click();
    el.shadowRoot.querySelector('.chev-btn').click();
    await el.updateComplete;
    expect(clickFired).to.be.false;
    expect(el.hasAttribute('open')).to.be.false;
  });

  it('renders all actions as menu items', async () => {
    const el = await fixture(html`
      <tbt-split-button label="Save" .actions=${ACTIONS}></tbt-split-button>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelectorAll('.menu-item')).to.have.length(3);
  });

  it('loading state shows spinner, disables buttons', async () => {
    const el = await fixture(html`
      <tbt-split-button label="Save" .actions=${ACTIONS} loading></tbt-split-button>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.spinner')).to.exist;
    expect(el.shadowRoot.querySelector('.main-btn').disabled).to.be.true;
    expect(el.shadowRoot.querySelector('.chev-btn').disabled).to.be.true;
  });

  it('chevron button has correct aria-expanded state', async () => {
    const el = await fixture(html`
      <tbt-split-button label="Save" .actions=${ACTIONS}></tbt-split-button>`);
    await el.updateComplete;
    const chev = el.shadowRoot.querySelector('.chev-btn');
    expect(chev.getAttribute('aria-expanded')).to.equal('false');
    chev.click();
    await el.updateComplete;
    expect(chev.getAttribute('aria-expanded')).to.equal('true');
  });

  it('closes on Escape key from chevron', async () => {
    const el = await fixture(html`
      <tbt-split-button label="Save" .actions=${ACTIONS}></tbt-split-button>`);
    await el.updateComplete;
    el.shadowRoot.querySelector('.chev-btn').click();
    await el.updateComplete;
    el.shadowRoot.querySelector('.chev-btn').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );
    await el.updateComplete;
    expect(el.hasAttribute('open')).to.be.false;
  });

  it('supports icon prop on main button', async () => {
    const el = await fixture(html`
      <tbt-split-button label="Save" icon="device-floppy" .actions=${ACTIONS}></tbt-split-button>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.main-btn .ti-device-floppy')).to.exist;
  });

  it('passes axe', async () => {
    const el = await fixture(html`
      <tbt-split-button label="Save" .actions=${ACTIONS}></tbt-split-button>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

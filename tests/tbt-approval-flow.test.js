import { html, fixture, expect } from '@open-wc/testing';
import '../components/tbt-approval-flow.js';

const axe = window.axe;

const STEPS = [
  { id: '1', label: 'Requestor',  approver: 'Alice', status: 'approved', timestamp: '2026-05-20T09:00:00' },
  { id: '2', label: 'Manager',    approver: 'Bob',   status: 'current' },
  { id: '3', label: 'Director',   approver: 'Carol', status: 'pending' },
];

describe('tbt-approval-flow', () => {
  it('renders one step per entry in steps array', async () => {
    const el = await fixture(html`<tbt-approval-flow .steps=${STEPS}></tbt-approval-flow>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelectorAll('.step-wrap')).to.have.length(3);
  });

  it('defaults to horizontal orientation', async () => {
    const el = await fixture(html`<tbt-approval-flow .steps=${STEPS}></tbt-approval-flow>`);
    expect(el.orientation).to.equal('horizontal');
  });

  it('reflects orientation attribute', async () => {
    const el = await fixture(html`<tbt-approval-flow .steps=${STEPS} orientation="vertical"></tbt-approval-flow>`);
    await el.updateComplete;
    expect(el.getAttribute('orientation')).to.equal('vertical');
  });

  it('applies approved class to dot for approved steps', async () => {
    const el = await fixture(html`<tbt-approval-flow .steps=${STEPS}></tbt-approval-flow>`);
    await el.updateComplete;
    const dots = el.shadowRoot.querySelectorAll('.dot');
    expect(dots[0].classList.contains('approved')).to.be.true;
  });

  it('applies current class to dot for current step', async () => {
    const el = await fixture(html`<tbt-approval-flow .steps=${STEPS}></tbt-approval-flow>`);
    await el.updateComplete;
    const dots = el.shadowRoot.querySelectorAll('.dot');
    expect(dots[1].classList.contains('current')).to.be.true;
  });

  it('applies pending class to dot for pending steps', async () => {
    const el = await fixture(html`<tbt-approval-flow .steps=${STEPS}></tbt-approval-flow>`);
    await el.updateComplete;
    const dots = el.shadowRoot.querySelectorAll('.dot');
    expect(dots[2].classList.contains('pending')).to.be.true;
  });

  it('shows skeleton when loading prop is set', async () => {
    const el = await fixture(html`<tbt-approval-flow loading></tbt-approval-flow>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.skel')).to.exist;
  });

  it('renders step label text in each step', async () => {
    const el = await fixture(html`<tbt-approval-flow .steps=${STEPS}></tbt-approval-flow>`);
    await el.updateComplete;
    const text = el.shadowRoot.textContent;
    expect(text).to.include('Requestor');
    expect(text).to.include('Manager');
  });

  it('step.statusLabel overrides the default English badge text', async () => {
    const steps = [
      { label: 'ผู้รับวางบิล', status: 'approved', statusLabel: 'อนุมัติแล้ว' },
      { label: 'หัวหน้าบัญชี', status: 'pending' },
    ];
    const el = await fixture(html`<tbt-approval-flow .steps=${steps}></tbt-approval-flow>`);
    await el.updateComplete;
    const text = el.shadowRoot.textContent;
    expect(text).to.include('อนุมัติแล้ว');
    expect(text).to.not.include('Approved');
    expect(text).to.include('Pending'); // no override → default kept
  });

  it('passes axe (horizontal)', async () => {
    const el = await fixture(html`<tbt-approval-flow .steps=${STEPS}></tbt-approval-flow>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

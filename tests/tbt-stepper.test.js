import { fixture, html, expect } from '@open-wc/testing';
import '../components/tbt-stepper.js';

const STEPS = [
  { label: 'Draft' },
  { label: 'Review' },
  { label: 'Approve' },
  { label: 'Done' },
];

describe('tbt-stepper', () => {
  it('renders correct number of step circles', async () => {
    const el = await fixture(html`<tbt-stepper .steps=${STEPS} active="0"></tbt-stepper>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelectorAll('.circle')).to.have.length(4);
  });

  it('marks steps before active as complete', async () => {
    const el = await fixture(html`<tbt-stepper .steps=${STEPS} active="2"></tbt-stepper>`);
    await el.updateComplete;
    const steps = el.shadowRoot.querySelectorAll('.step');
    expect(steps[0].classList.contains('complete')).to.be.true;
    expect(steps[1].classList.contains('complete')).to.be.true;
    expect(steps[2].classList.contains('active')).to.be.true;
    expect(steps[3].classList.contains('upcoming')).to.be.true;
  });

  it('shows step number in upcoming circles', async () => {
    const el = await fixture(html`<tbt-stepper .steps=${STEPS} active="0"></tbt-stepper>`);
    await el.updateComplete;
    const circles = el.shadowRoot.querySelectorAll('.circle');
    expect(circles[1].textContent.trim()).to.equal('2');
  });

  it('shows check icon in complete steps', async () => {
    const el = await fixture(html`<tbt-stepper .steps=${STEPS} active="2"></tbt-stepper>`);
    await el.updateComplete;
    const circles = el.shadowRoot.querySelectorAll('.circle');
    expect(circles[0].querySelector('.ti-check')).to.exist;
  });

  it('applies error class when step.error is true', async () => {
    const steps = [{ label: 'Draft' }, { label: 'Review', error: true }, { label: 'Done' }];
    const el = await fixture(html`<tbt-stepper .steps=${steps} active="1"></tbt-stepper>`);
    await el.updateComplete;
    const stepEls = el.shadowRoot.querySelectorAll('.step');
    expect(stepEls[1].classList.contains('error')).to.be.true;
  });

  it('marks only the active step with aria-current="step"', async () => {
    const el = await fixture(html`<tbt-stepper .steps=${STEPS} active="1"></tbt-stepper>`);
    await el.updateComplete;
    const steps = el.shadowRoot.querySelectorAll('.step');
    expect(steps[0].getAttribute('aria-current')).to.be.null;
    expect(steps[1].getAttribute('aria-current')).to.equal('step');
    expect(steps[2].getAttribute('aria-current')).to.be.null;
    expect(steps[3].getAttribute('aria-current')).to.be.null;
  });
});

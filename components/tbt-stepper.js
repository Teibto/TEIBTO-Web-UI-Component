/**
 * @component tbt-stepper
 * @version 1.45.0
 * @author Wichit Wongta
 *
 * Multi-step progress indicator. Steps before `active` are complete (checkmark),
 * the active step is highlighted, and remaining steps are upcoming (dimmed).
 *
 * Usage:
 *   <tbt-stepper
 *     .steps=${[
 *       { label: 'Draft' },
 *       { label: 'Review' },
 *       { label: 'Approve' },
 *       { label: 'Done' },
 *     ]}
 *     active="1">
 *   </tbt-stepper>
 *
 *   <!-- Error state on a specific step -->
 *   .steps=${[{ label: 'Draft' }, { label: 'Review', error: true }, { label: 'Done' }]}
 *
 * Properties:
 *   steps  Array<{ label: string, description?: string, error?: boolean }>
 *   active Number  0-indexed current step
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';

class TbtStepper extends LitElement {
  static properties = {
    steps:  { type: Array },
    active: { type: Number },
  };

  constructor() {
    super();
    this.steps  = [];
    this.active = 0;
  }

  _status(i, step) {
    if (step.error)    return 'error';
    if (i < this.active)  return 'complete';
    if (i === this.active) return 'active';
    return 'upcoming';
  }

  static styles = css`
    :host { display: block; font-family: var(--tbt-font); }

    .stepper {
      display: flex;
      align-items: flex-start;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      position: relative;
      min-width: 0;
    }

    /* Connector line — drawn from center of circle to the right */
    .step:not(:last-child)::after {
      content: '';
      position: absolute;
      top: 16px;
      left: calc(50% + 16px);
      right: calc(-50% + 16px);
      height: 2px;
      background: var(--tbt-border);
    }
    .step.complete:not(:last-child)::after { background: var(--tbt-primary); }

    /* Circle */
    .circle {
      width: 32px; height: 32px;
      border-radius: 50%;
      border: 2px solid var(--tbt-border);
      background: var(--tbt-bg-card);
      display: flex; align-items: center; justify-content: center;
      font-size: var(--tbt-size-sm);
      font-weight: var(--tbt-weight-semibold);
      color: var(--tbt-text-muted);
      position: relative; z-index: 1;
      flex-shrink: 0;
      transition:
        background var(--tbt-transition-base),
        border-color var(--tbt-transition-base),
        color var(--tbt-transition-base);
    }
    .step.active   .circle { border-color: var(--tbt-primary); background: var(--tbt-primary); color: var(--tbt-text-inverse); }
    .step.complete .circle { border-color: var(--tbt-primary); background: var(--tbt-primary); color: var(--tbt-text-inverse); }
    .step.error    .circle { border-color: var(--tbt-danger);  background: var(--tbt-danger);  color: var(--tbt-text-inverse); }

    /* Check icon — rendered via Tabler Icons */
    .check-icon { font-size: 14px; }

    /* Label */
    .lbl {
      margin-top: var(--tbt-space-2);
      font-size: var(--tbt-size-xs);
      font-weight: var(--tbt-weight-medium);
      text-align: center;
      color: var(--tbt-text-muted);
      line-height: var(--tbt-leading-tight);
      padding: 0 4px;
      word-break: break-word;
    }
    .step.active   .lbl { color: var(--tbt-primary-text); }
    .step.complete .lbl { color: var(--tbt-text-primary); }
    .step.error    .lbl { color: var(--tbt-danger-text);  }

    .desc {
      font-size: var(--tbt-size-xs);
      color: var(--tbt-text-muted);
      text-align: center;
      margin-top: 2px;
      padding: 0 4px;
    }
  `;

  render() {
    return html`
      ${tablerLink}
      <div class="stepper">
        ${this.steps.map((step, i) => {
          const status = this._status(i, step);
          return html`
            <div class="step ${status}" aria-current=${status === 'active' ? 'step' : nothing}>
              <div class="circle" role="img" aria-label="${step.label}: ${status}">
                ${status === 'complete'
                  ? html`<i class="ti ti-check check-icon" aria-hidden="true"></i>`
                  : status === 'error'
                  ? html`<i class="ti ti-x check-icon" aria-hidden="true"></i>`
                  : i + 1}
              </div>
              <span class="lbl">${step.label}</span>
              ${step.description ? html`<span class="desc">${step.description}</span>` : ''}
            </div>`;
        })}
      </div>
    `;
  }
}

customElements.define('tbt-stepper', TbtStepper);

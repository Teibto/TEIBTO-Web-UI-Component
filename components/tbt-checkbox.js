/**
 * @component tbt-checkbox
 * @version 1.46.0
 * @author Wichit Wongta
 *
 * Styled checkbox with label, indeterminate state, and validation.
 *
 * Usage:
 *   <tbt-checkbox name="agree" label="ยอมรับเงื่อนไข" required></tbt-checkbox>
 *   <tbt-checkbox label="Remember me" checked></tbt-checkbox>
 *   <tbt-checkbox label="Select all" indeterminate></tbt-checkbox>
 *   <tbt-checkbox label="Item" disabled checked></tbt-checkbox>
 *
 * Event: tbt-change → { checked: Boolean }
 * Value: Boolean — el.value reads this.checked, compatible with tbt-form
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';

/**
 * @fires tbt-change - Fired when checked state changes; detail: { checked: boolean }
 */
class TbtCheckbox extends LitElement {
  static formAssociated = true;

  static properties = {
    label:         { type: String },
    name:          { type: String },
    checked:       { type: Boolean, reflect: true },
    indeterminate: { type: Boolean, reflect: true },
    required:      { type: Boolean, reflect: true },
    disabled:      { type: Boolean, reflect: true },
    readonly:      { type: Boolean, reflect: true },
    error:         { type: String,  reflect: true },
    helper:        { type: String },
  };

  constructor() {
    super();
    this._internals = this.attachInternals();
    this.checked = false;
    this.indeterminate = false;
  }

  get value() { return this.checked; }
  set value(v) { this.checked = Boolean(v); }

  updated(changed) {
    if (changed.has('indeterminate')) {
      const input = this.shadowRoot?.querySelector('input');
      if (input) input.indeterminate = this.indeterminate;
    }
  }

  static styles = css`
    :host { display: block; font-family: var(--tbt-font); }

    label {
      display: inline-flex;
      align-items: flex-start;
      gap: var(--tbt-space-2);
      cursor: pointer;
      user-select: none;
    }
    :host([disabled]) label { cursor: not-allowed; opacity: 0.6; }
    :host([readonly]) label { cursor: default; pointer-events: none; }

    /* Hide native input — keep it focusable */
    input[type="checkbox"] {
      position: absolute;
      opacity: 0;
      width: 0; height: 0;
      margin: 0; padding: 0;
    }

    /* Custom box */
    .box {
      display: inline-block;
      width: 16px; height: 16px;
      border: 2px solid var(--tbt-border-strong);
      border-radius: 4px;
      background: var(--tbt-bg-card);
      flex-shrink: 0;
      margin-top: 1px; /* align with first text line */
      position: relative;
      transition:
        background var(--tbt-transition-fast),
        border-color var(--tbt-transition-fast),
        box-shadow var(--tbt-transition-fast);
    }
    input:focus-visible + .box {
      border-color: var(--tbt-primary-light);
      box-shadow: var(--tbt-shadow-focus);
    }
    input:checked + .box,
    input:indeterminate + .box {
      background: var(--tbt-primary);
      border-color: var(--tbt-primary);
    }
    :host([error]) .box { border-color: var(--tbt-danger); }
    :host([error]) input:focus-visible + .box {
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--tbt-danger) 18%, transparent);
    }

    /* Checkmark (CSS-drawn — no icon font dependency) */
    input:checked + .box::after {
      content: '';
      position: absolute;
      left: 3px; top: 0px;
      width: 6px; height: 10px;
      border: 2px solid white;
      border-top: 0; border-left: 0;
      transform: rotate(45deg);
    }

    /* Minus line for indeterminate */
    input:indeterminate + .box::after {
      content: '';
      position: absolute;
      left: 2px; top: 50%;
      margin-top: -1px;
      width: 8px; height: 2px;
      background: white;
      border: 0;
      transform: none;
    }

    /* Label text */
    .lbl {
      font-size: var(--tbt-size-base);
      color: var(--tbt-text-primary);
      line-height: var(--tbt-leading-normal);
    }
    .required { color: var(--tbt-text-required); margin-left: 2px; }

    /* Error + helper */
    .hint {
      margin-top: var(--tbt-space-1);
      padding-left: calc(16px + var(--tbt-space-2));
      font-size: var(--tbt-size-xs);
    }
    .error-msg {
      color: var(--tbt-danger-text);
      display: flex; align-items: center; gap: 4px;
    }
    .error-icon { font-size: 12px; }
    .helper { color: var(--tbt-text-muted); }
  `;

  _onChange(e) {
    this.checked = e.target.checked;
    this.indeterminate = false;
    this._internals.setFormValue(this.checked ? 'on' : null);
    this.dispatchEvent(new CustomEvent('tbt-change', {
      detail: { checked: this.checked },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      ${tablerLink}
      <label>
        <input
          type="checkbox"
          .checked=${this.checked}
          ?required=${this.required}
          ?disabled=${this.disabled}
          @change=${this._onChange}>
        <span class="box" aria-hidden="true"></span>
        ${this.label ? html`
          <span class="lbl">
            ${this.label}${this.required ? html`<span class="required">*</span>` : ''}
          </span>` : ''}
      </label>
      ${this.error ? html`
        <div class="hint error-msg" role="alert">
          <i class="ti ti-alert-circle error-icon" aria-hidden="true"></i>
          ${this.error}
        </div>` : ''}
      ${this.helper && !this.error ? html`
        <div class="hint helper">${this.helper}</div>` : ''}
    `;
  }
}

customElements.define('tbt-checkbox', TbtCheckbox);

/**
 * @component tbt-radio
 * @version 1.43.0
 * @author Wichit Wongta
 *
 * Radio group — choose one option from a small set with every choice visible.
 * Use instead of tbt-dropdown when there are roughly five options or fewer.
 *
 * Usage:
 *   <tbt-radio label="Payment method" name="paymethod"
 *     .options=${[{value:'cash',label:'Cash'},{value:'credit',label:'Credit'}]}
 *     value="cash" required></tbt-radio>
 *
 * Event: tbt-change → { value: String }
 * Value: String — el.value reads the selected value, compatible with tbt-form.
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';

/**
 * @fires tbt-change - Fired when selection changes; detail: { value: string }
 */
class TbtRadio extends LitElement {
  static formAssociated = true;

  static properties = {
    label:       { type: String },
    name:        { type: String },
    options:     { attribute: false },
    value:       { type: String,  reflect: true },
    orientation: { type: String,  reflect: true },
    required:    { type: Boolean, reflect: true },
    disabled:    { type: Boolean, reflect: true },
    readonly:    { type: Boolean, reflect: true },
    error:       { type: String,  reflect: true },
    helper:      { type: String },
  };

  constructor() {
    super();
    this._internals = this.attachInternals();
    this.options = [];
    this.value = '';
    this.orientation = 'vertical';
    this.required = false;
    this.disabled = false;
    this.readonly = false;
  }

  get value() { return this._value; }
  set value(v) {
    const old = this._value;
    this._value = v == null ? '' : String(v);
    this._internals?.setFormValue(this._value || null);
    this.requestUpdate('value', old);
  }

  static styles = css`
    :host { display: block; font-family: var(--tbt-font); }
    .group-label {
      display: block;
      font-size: var(--tbt-size-sm);
      color: var(--tbt-text-secondary);
      margin-bottom: var(--tbt-space-2);
    }
    .required { color: var(--tbt-text-required); margin-left: 2px; }

    .options { display: flex; flex-direction: column; gap: var(--tbt-space-2); }
    :host([orientation="horizontal"]) .options { flex-direction: row; flex-wrap: wrap; gap: var(--tbt-space-2) var(--tbt-space-5); }

    .opt { display: inline-flex; align-items: center; gap: var(--tbt-space-2); cursor: pointer; user-select: none; }
    .opt.is-disabled { cursor: not-allowed; opacity: 0.6; }
    :host([disabled]) .opt, :host([readonly]) .opt { cursor: default; pointer-events: none; }
    :host([disabled]) { opacity: 0.6; }
    :host([readonly]) .opt { opacity: 0.85; }

    input[type="radio"] { position: absolute; opacity: 0; width: 0; height: 0; margin: 0; }

    .dot {
      display: inline-block; width: 16px; height: 16px; flex-shrink: 0;
      border: 2px solid var(--tbt-border-strong); border-radius: var(--tbt-radius-pill);
      background: var(--tbt-bg-card); position: relative;
      transition: border-color var(--tbt-transition-fast), box-shadow var(--tbt-transition-fast);
    }
    input:focus-visible + .dot { border-color: var(--tbt-primary-light); box-shadow: var(--tbt-shadow-focus); }
    input:checked + .dot { border-color: var(--tbt-primary); }
    input:checked + .dot::after {
      content: ''; position: absolute; inset: 3px;
      border-radius: var(--tbt-radius-pill); background: var(--tbt-primary);
    }
    :host([error]) .dot { border-color: var(--tbt-danger); }

    .opt-lbl { font-size: var(--tbt-size-base); color: var(--tbt-text-primary); }

    .hint { margin-top: var(--tbt-space-1); font-size: var(--tbt-size-xs); }
    .error-msg { color: var(--tbt-danger-text); display: flex; align-items: center; gap: 4px; }
    .error-icon { font-size: 12px; }
    .helper { color: var(--tbt-text-muted); }
  `;

  _onChange(e) {
    if (this.disabled || this.readonly) return;
    this.value = e.target.value;
    this.dispatchEvent(new CustomEvent('tbt-change', {
      detail: { value: this.value }, bubbles: true, composed: true,
    }));
  }

  render() {
    const name = this.name || 'tbt-radio';
    return html`
      ${tablerLink}
      ${this.label ? html`<span class="group-label" id="grp">
        ${this.label}${this.required ? html`<span class="required">*</span>` : ''}
      </span>` : ''}
      <div class="options" role="radiogroup" aria-labelledby=${this.label ? 'grp' : nothing}>
        ${(this.options || []).map((o) => html`
          <label class="opt ${o.disabled ? 'is-disabled' : ''}">
            <input type="radio" name=${name} .value=${o.value}
              .checked=${this.value === String(o.value)}
              ?disabled=${this.disabled || o.disabled}
              @change=${this._onChange}>
            <span class="dot" aria-hidden="true"></span>
            <span class="opt-lbl">${o.label}</span>
          </label>`)}
      </div>
      ${this.error ? html`<div class="hint error-msg">
        <i class="ti ti-alert-circle error-icon" aria-hidden="true"></i>${this.error}
      </div>` : ''}
      ${this.helper && !this.error ? html`<div class="hint helper">${this.helper}</div>` : ''}
    `;
  }
}

customElements.define('tbt-radio', TbtRadio);

/**
 * @component tbt-number-input
 * @version 1.46.1
 * @author Wichit Wongta
 *
 * Formatted number input with comma thousands separator, prefix/suffix,
 * min/max clamping, and Arrow key increment/decrement.
 * Use instead of <tbt-input type="number"> when display formatting matters.
 *
 * Usage:
 *   <tbt-number-input
 *     label="Amount"
 *     value="1250000"
 *     prefix="฿"
 *     decimal="2"
 *     min="0"
 *     required
 *     @tbt-change=${e => console.log(e.detail.value)}>
 *   </tbt-number-input>
 *
 *   <tbt-number-input label="Discount" suffix="%" decimal="2" step="0.01"></tbt-number-input>
 *
 * Event: tbt-change → { value: number | null }  (null when input is cleared)
 *
 * @fires tbt-change - Fired on blur/Enter; detail: { value: number | null }
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';

/**
 * @fires tbt-change - Fired on blur/Enter; detail: { value: number | null }
 */
class TbtNumberInput extends LitElement {
  static formAssociated = true;

  static properties = {
    label:       { type: String },
    name:        { type: String },
    value:       { type: String },
    min:         { type: Number },
    max:         { type: Number },
    step:        { type: Number },
    decimal:     { type: Number },
    prefix:      { type: String },
    suffix:      { type: String },
    placeholder: { type: String },
    required:    { type: Boolean, reflect: true },
    disabled:    { type: Boolean, reflect: true },
    readonly:    { type: Boolean, reflect: true },
    error:       { type: String, reflect: true },
    helper:      { type: String },
    _editing:    { state: true },
    _raw:        { state: true },
  };

  constructor() {
    super();
    this._internals = this.attachInternals();
    this.value   = '';
    this.step    = 1;
    this.decimal = 0;
    this._editing = false;
    this._raw     = '';
    this._uid = `ni${Math.random().toString(36).slice(2, 8)}`;
  }

  /* ── Formatting ─────────────────────────────────────────────── */

  _format(val) {
    if (val === '' || val === null || val === undefined) return '';
    const num = Number(val);
    if (isNaN(num)) return '';
    const dp = this.decimal ?? 0;
    return num.toLocaleString('en-US', {
      minimumFractionDigits: dp,
      maximumFractionDigits: dp,
    });
  }

  _parse(str) {
    const clean = String(str).replace(/,/g, '').trim();
    if (clean === '') return null;
    const num = parseFloat(clean);
    return isNaN(num) ? null : num;
  }

  _clamp(num) {
    let v = num;
    if (this.min !== undefined && this.min !== null && v < this.min) v = this.min;
    if (this.max !== undefined && this.max !== null && v > this.max) v = this.max;
    const dp = this.decimal ?? 0;
    return parseFloat(v.toFixed(dp));
  }

  /* ── Validity ───────────────────────────────────────────────── */

  _syncValidity() {
    const anchor = this.shadowRoot?.querySelector('input') ?? this;
    const num = this._parse(this.value);
    if (this.required && num === null) {
      this._internals.setValidity({ valueMissing: true }, 'Value is required', anchor);
    } else if (num !== null && this.min !== undefined && this.min !== null && num < this.min) {
      this._internals.setValidity({ rangeUnderflow: true }, `Value must be at least ${this.min}`, anchor);
    } else if (num !== null && this.max !== undefined && this.max !== null && num > this.max) {
      this._internals.setValidity({ rangeOverflow: true }, `Value must be at most ${this.max}`, anchor);
    } else {
      this._internals.setValidity({});
    }
  }

  updated(changed) {
    if (changed.has('value') || changed.has('required') || changed.has('min') || changed.has('max')) {
      const num = this._parse(this.value);
      this._internals.setFormValue(num !== null ? String(num) : '');
      this._syncValidity();
    }
  }

  /* ── Event handlers ─────────────────────────────────────────── */

  _onFocus() {
    this._editing = true;
    const num = this._parse(this.value);
    this._raw = num !== null ? String(num) : '';
  }

  _onInput(e) {
    this._raw = e.target.value;
  }

  _onBlur() {
    this._editing = false;
    this._commit();
  }

  _commit() {
    const num = this._parse(this._raw);
    if (num === null) {
      this.value = '';
      this._internals.setFormValue('');
      this._syncValidity();
      this.dispatchEvent(new CustomEvent('tbt-change', {
        detail: { value: null }, bubbles: true, composed: true,
      }));
      return;
    }
    const clamped = this._clamp(num);
    this.value = String(clamped);
    this._internals.setFormValue(String(clamped));
    this._syncValidity();
    this.dispatchEvent(new CustomEvent('tbt-change', {
      detail: { value: clamped }, bubbles: true, composed: true,
    }));
  }

  _onKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.shadowRoot?.querySelector('input')?.blur();
    } else if (e.key === 'ArrowUp' && !this.readonly) {
      e.preventDefault(); this._step(1);
    } else if (e.key === 'ArrowDown' && !this.readonly) {
      e.preventDefault(); this._step(-1);
    }
  }

  _step(dir) {
    const step = this.step ?? 1;
    const current = this._parse(this.value) ?? 0;
    const dp = this.decimal ?? 0;
    const next = this._clamp(parseFloat((current + dir * step).toFixed(dp)));
    this.value = String(next);
    this._raw = String(next);
    this._internals.setFormValue(String(next));
    this._syncValidity();
    this.dispatchEvent(new CustomEvent('tbt-change', {
      detail: { value: next }, bubbles: true, composed: true,
    }));
  }

  /* ── Styles ─────────────────────────────────────────────────── */

  static styles = css`
    :host { display: block; font-family: var(--tbt-font); }

    .label-row {
      display: flex; align-items: baseline; gap: var(--tbt-space-1);
      margin-bottom: var(--tbt-space-1);
    }
    label {
      font-size: var(--tbt-size-xs); font-weight: var(--tbt-weight-medium);
      color: var(--tbt-text-secondary); letter-spacing: 0.04em;
    }
    .required { color: var(--tbt-text-required); font-size: var(--tbt-size-xs); }

    .wrap {
      display: flex; align-items: stretch;
      border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-md);
      background: var(--tbt-bg-card);
      overflow: hidden;
      transition: border-color var(--tbt-transition-fast), box-shadow var(--tbt-transition-fast);
    }
    .wrap:focus-within {
      border-color: var(--tbt-primary-light);
      box-shadow: var(--tbt-shadow-focus);
    }
    :host([error]) .wrap { border-color: var(--tbt-danger); }
    :host([disabled]) .wrap { background: var(--tbt-bg-hover); opacity: 0.65; }
    :host([readonly]) .wrap { background: var(--tbt-bg-hover); }

    .prefix, .suffix {
      display: flex; align-items: center;
      padding: 0 var(--tbt-space-3);
      font-size: var(--tbt-size-sm); font-family: var(--tbt-font-mono);
      color: var(--tbt-text-muted);
      background: var(--tbt-bg-hover);
      white-space: nowrap; user-select: none; flex-shrink: 0;
    }
    .prefix { border-right: 1px solid var(--tbt-border); }
    .suffix { border-left: 1px solid var(--tbt-border); }

    input {
      flex: 1; min-width: 0;
      padding: 8px var(--tbt-space-3);
      font-family: var(--tbt-font-mono);
      font-size: var(--tbt-size-base);
      color: var(--tbt-text-primary);
      background: transparent; border: none; outline: 0;
      text-align: right;
      min-height: 38px; box-sizing: border-box;
    }
    input::placeholder { color: var(--tbt-text-muted); font-family: var(--tbt-font); }
    input:disabled { cursor: not-allowed; }
    input[readonly] { cursor: default; }

    .helper {
      margin-top: var(--tbt-space-1);
      font-size: var(--tbt-size-xs); color: var(--tbt-text-muted);
    }
    .error-msg {
      margin-top: var(--tbt-space-1); font-size: var(--tbt-size-xs);
      color: var(--tbt-danger-text); display: flex; align-items: center; gap: 4px;
    }
    .error-icon { font-size: 12px; }
  `;

  render() {
    const displayVal = this._editing ? this._raw : this._format(this.value);
    const errorId  = `${this._uid}-error`;
    const helperId = `${this._uid}-helper`;
    const describedBy = this.error ? errorId : (this.helper ? helperId : nothing);

    return html`
      ${tablerLink}
      ${this.label ? html`
        <div class="label-row">
          <label for=${this._uid}>${this.label}</label>
          ${this.required ? html`<span class="required">*</span>` : ''}
        </div>` : ''}
      <div class="wrap">
        ${this.prefix ? html`<span class="prefix" aria-hidden="true">${this.prefix}</span>` : ''}
        <input
          id=${this._uid}
          type="text"
          inputmode="decimal"
          .value=${displayVal}
          placeholder=${this.placeholder || nothing}
          ?required=${this.required}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          aria-label=${this.label ? nothing : (this.placeholder || 'Number input')}
          aria-invalid=${this.error ? 'true' : 'false'}
          aria-describedby=${describedBy}
          @focus=${this._onFocus}
          @blur=${this._onBlur}
          @input=${this._onInput}
          @keydown=${this._onKeydown}>
        ${this.suffix ? html`<span class="suffix" aria-hidden="true">${this.suffix}</span>` : ''}
      </div>
      ${this.error ? html`
        <div id=${errorId} class="error-msg" role="alert">
          <i class="ti ti-alert-circle error-icon" aria-hidden="true"></i>
          ${this.error}
        </div>` : ''}
      ${this.helper && !this.error ? html`
        <div id=${helperId} class="helper">${this.helper}</div>` : ''}
    `;
  }
}

customElements.define('tbt-number-input', TbtNumberInput);

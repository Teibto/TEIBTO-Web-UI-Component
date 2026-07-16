/**
 * @component tbt-datepicker
 * @version 1.45.0
 * @author Wichit Wongta
 *
 * Styled date input with label and validation. Uses native <input type="date">
 * as the EDITOR (free calendar picker, mobile UX, ISO value) but overlays its
 * own display layer while the input is not focused, so the visible date is
 * always YYYY-MM-DD per R2 instead of the browser locale (RFC 0006, #29).
 *
 * Usage:
 *   <tbt-datepicker
 *     label="วันที่เอกสาร"
 *     value="2026-05-21"
 *     @tbt-change=${e => console.log(e.detail.value)}>
 *   </tbt-datepicker>
 *
 *   <tbt-datepicker label="Due date" min="2026-01-01" max="2026-12-31" required></tbt-datepicker>
 *   <tbt-datepicker era="be"></tbt-datepicker>  → displays 2569-05-21 (พ.ศ.); value stays ISO ค.ศ.
 *
 * Event: tbt-change → { value: string (YYYY-MM-DD) }
 * Value format: always ISO 8601 YYYY-MM-DD regardless of display locale/era.
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';

/**
 * @fires tbt-change - Fired when date selected; detail: { value: string } (ISO YYYY-MM-DD)
 */
class TbtDatepicker extends LitElement {
  static properties = {
    label:    { type: String },
    name:     { type: String },
    value:    { type: String },
    min:      { type: String },
    max:      { type: String },
    required: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    readonly: { type: Boolean, reflect: true },
    error:    { type: String, reflect: true },
    helper:   { type: String },
    era:      { type: String },   // "ce" (default) | "be" — displayed year only, value stays ISO ค.ศ.
    _focused: { state: true }
  };

  constructor() {
    super();
    this.value = '';
    this.era = 'ce';
    this._focused = false;
  }

  static styles = css`
    :host { display: block; font-family: var(--tbt-font); }
    .label-row {
      display: flex; align-items: baseline; gap: var(--tbt-space-1);
      margin-bottom: var(--tbt-space-1);
    }
    label { font-size: var(--tbt-size-xs); font-weight: var(--tbt-weight-medium);
      color: var(--tbt-text-secondary); letter-spacing: 0.04em; }
    .required { color: var(--tbt-text-required); font-size: var(--tbt-size-xs); }
    .wrap { position: relative; }
    input[type="date"] {
      display: block; width: 100%; box-sizing: border-box;
      font-family: inherit; font-size: var(--tbt-size-base);
      color: var(--tbt-text-primary); background: var(--tbt-bg-card);
      border: 1px solid var(--tbt-border); border-radius: var(--tbt-radius-md);
      padding: 8px var(--tbt-space-3); min-height: 38px; outline: 0;
      transition: border-color var(--tbt-transition-fast), box-shadow var(--tbt-transition-fast);
      cursor: pointer;
    }
    input[type="date"]::-webkit-calendar-picker-indicator {
      color: var(--tbt-text-secondary); cursor: pointer; opacity: 0.7;
    }
    input[type="date"]::-webkit-calendar-picker-indicator:hover { opacity: 1; }
    input[type="date"]:focus {
      border-color: var(--tbt-primary-light); box-shadow: var(--tbt-shadow-focus);
    }
    :host([error]) input { border-color: var(--tbt-danger); }
    :host([disabled]) input { background: var(--tbt-bg-hover); cursor: not-allowed; opacity: 0.65; }
    :host([readonly]) input { background: var(--tbt-bg-hover); cursor: default; pointer-events: none; }
    /* Display layer (RFC 0006): masks the native locale text while blurred so
       the visible date is always YYYY-MM-DD. pointer-events: none — clicks
       fall through to the input, which focuses and hides the layer. inset
       leaves the right edge open so the calendar indicator stays visible. */
    .display {
      position: absolute; inset: 1px 36px 1px 1px;
      display: flex; align-items: center;
      padding-left: var(--tbt-space-3);
      background: var(--tbt-bg-card);
      border-radius: var(--tbt-radius-md);
      font-size: var(--tbt-size-base); color: var(--tbt-text-primary);
      pointer-events: none;
    }
    .display.empty { color: var(--tbt-text-muted); }
    :host([readonly]) .display, :host([disabled]) .display { background: var(--tbt-bg-hover); }
    :host([disabled]) .display { opacity: 0.65; }
    .error-msg { margin-top: var(--tbt-space-1); font-size: var(--tbt-size-xs);
      color: var(--tbt-danger-text); display: flex; align-items: center; gap: 4px; }
    .error-icon { font-size: 12px; }
    .helper { margin-top: var(--tbt-space-1); font-size: var(--tbt-size-xs); color: var(--tbt-text-muted); }
  `;

  _onChange(e) {
    this.value = e.target.value;
    this.dispatchEvent(new CustomEvent('tbt-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }));
  }

  // "2026-07-16" → "2026-07-16" (ce) or "2569-07-16" (be). Display only —
  // the value/round-trip contract stays ISO ค.ศ.
  _formatDisplay() {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(this.value || '');
    if (!m) return this.value || '';
    const y = this.era === 'be' ? Number(m[1]) + 543 : Number(m[1]);
    return y + '-' + m[2] + '-' + m[3];
  }

  render() {
    return html`
      ${tablerLink}
      ${this.label ? html`
        <div class="label-row">
          <label for="dp-input">${this.label}</label>
          ${this.required ? html`<span class="required">*</span>` : ''}
        </div>` : ''}
      <div class="wrap">
        <input
          id="dp-input"
          type="date"
          .value=${this.value}
          min=${this.min || nothing}
          max=${this.max || nothing}
          aria-invalid=${this.error ? 'true' : 'false'}
          aria-describedby=${this.error ? 'dp-error' : this.helper ? 'dp-helper' : nothing}
          ?required=${this.required}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          @change=${this._onChange}
          @focus=${() => { this._focused = true; }}
          @blur=${() => { this._focused = false; }}>
        ${!this._focused ? html`
          <span class="display ${this.value ? '' : 'empty'}" aria-hidden="true">
            ${this.value ? this._formatDisplay() : 'YYYY-MM-DD'}
          </span>` : ''}
      </div>
      ${this.error ? html`
        <div id="dp-error" class="error-msg" role="alert">
          <i class="ti ti-alert-circle error-icon" aria-hidden="true"></i>
          ${this.error}
        </div>` : ''}
      ${this.helper && !this.error ? html`<div id="dp-helper" class="helper">${this.helper}</div>` : ''}
    `;
  }
}

customElements.define('tbt-datepicker', TbtDatepicker);

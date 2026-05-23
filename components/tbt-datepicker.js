/**
 * @component tbt-datepicker
 * @version 1.23.0
 * @author Wichit Wongta
 *
 * Styled date input with label and validation. Uses native <input type="date">
 * for maximum compatibility in NetSuite's browser environment.
 *
 * Usage:
 *   <tbt-datepicker
 *     label="วันที่เอกสาร"
 *     value="2026-05-21"
 *     @tbt-change=${e => console.log(e.detail.value)}>
 *   </tbt-datepicker>
 *
 *   <tbt-datepicker label="Due date" min="2026-01-01" max="2026-12-31" required></tbt-datepicker>
 *
 * Event: tbt-change → { value: string (YYYY-MM-DD) }
 * Value format: always ISO 8601 YYYY-MM-DD regardless of display locale.
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
    error:    { type: String, reflect: true },
    helper:   { type: String }
  };

  constructor() {
    super();
    this.value = '';
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

  render() {
    return html`
      ${tablerLink}
      ${this.label ? html`
        <div class="label-row">
          <label>${this.label}</label>
          ${this.required ? html`<span class="required">*</span>` : ''}
        </div>` : ''}
      <div class="wrap">
        <input
          type="date"
          .value=${this.value}
          min=${this.min || nothing}
          max=${this.max || nothing}
          ?required=${this.required}
          ?disabled=${this.disabled}
          @change=${this._onChange}>
      </div>
      ${this.error ? html`
        <div class="error-msg">
          <i class="ti ti-alert-circle error-icon"></i>
          ${this.error}
        </div>` : ''}
      ${this.helper && !this.error ? html`<div class="helper">${this.helper}</div>` : ''}
    `;
  }
}

customElements.define('tbt-datepicker', TbtDatepicker);

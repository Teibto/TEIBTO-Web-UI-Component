/**
 * @component tbt-date-range
 * @version 1.45.0
 * @author Wichit Wongta
 *
 * Date range picker: two tbt-datepicker inputs (From / To) in one field.
 * Value format: always ISO 8601 YYYY-MM-DD for both from/to.
 *
 * Usage:
 *   <tbt-date-range
 *     label="Period"
 *     from="2026-01-01"
 *     to="2026-12-31"
 *     @tbt-change=${e => console.log(e.detail.from, e.detail.to)}>
 *   </tbt-date-range>
 *
 * Event: tbt-change → { from: string, to: string }  (YYYY-MM-DD or '' if empty)
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';
import './tbt-datepicker.js';

/**
 * @fires tbt-change - Fired when either date changes; detail: { from: string, to: string }
 */
class TbtDateRange extends LitElement {
  static formAssociated = true;

  static properties = {
    label:    { type: String },
    nameFrom: { type: String, attribute: 'name-from' },
    nameTo:   { type: String, attribute: 'name-to' },
    from:     { type: String },
    to:       { type: String },
    required: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    readonly: { type: Boolean, reflect: true },
    error:    { type: String, reflect: true },
  };

  constructor() {
    super();
    this._internals = this.attachInternals();
    this.from = '';
    this.to   = '';
  }

  _onFromChange(e) {
    e.stopPropagation();
    this.from = e.detail.value;
    this._emit();
  }

  _onToChange(e) {
    e.stopPropagation();
    this.to = e.detail.value;
    this._emit();
  }

  _emit() {
    if (this.nameFrom || this.nameTo) {
      const fd = new FormData();
      if (this.nameFrom) fd.append(this.nameFrom, this.from);
      if (this.nameTo)   fd.append(this.nameTo,   this.to);
      this._internals.setFormValue(fd);
    } else {
      this._internals.setFormValue(JSON.stringify({ from: this.from, to: this.to }));
    }
    this.dispatchEvent(new CustomEvent('tbt-change', {
      detail: { from: this.from, to: this.to },
      bubbles: true,
      composed: true,
    }));
  }

  _syncValidity() {
    if (this.required && (!this.from || !this.to)) {
      const anchor = this.shadowRoot?.querySelector('tbt-datepicker') ?? this;
      this._internals.setValidity({ valueMissing: true }, 'Both dates are required', anchor);
    } else {
      this._internals.setValidity({});
    }
  }

  updated(changed) {
    if (changed.has('required') || changed.has('from') || changed.has('to')) {
      this._syncValidity();
    }
  }

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
    .range-row {
      display: flex; align-items: center; gap: var(--tbt-space-2);
    }
    .range-row tbt-datepicker { flex: 1; min-width: 0; }
    .sep {
      color: var(--tbt-text-muted);
      font-size: var(--tbt-size-sm);
      flex-shrink: 0;
      user-select: none;
    }
    .error-msg {
      margin-top: var(--tbt-space-1); font-size: var(--tbt-size-xs);
      color: var(--tbt-danger-text); display: flex; align-items: center; gap: 4px;
    }
    .error-icon { font-size: 12px; }
  `;

  render() {
    return html`
      ${tablerLink}
      ${this.label ? html`
        <div class="label-row">
          <label>${this.label}</label>
          ${this.required ? html`<span class="required">*</span>` : ''}
        </div>` : ''}
      <div class="range-row">
        <tbt-datepicker
          name=${this.nameFrom || nothing}
          label="From"
          .value=${this.from}
          ?required=${this.required}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          ?error=${!!this.error}
          @tbt-change=${this._onFromChange}>
        </tbt-datepicker>
        <span class="sep">—</span>
        <tbt-datepicker
          name=${this.nameTo || nothing}
          label="To"
          .value=${this.to}
          ?required=${this.required}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          ?error=${!!this.error}
          @tbt-change=${this._onToChange}>
        </tbt-datepicker>
      </div>
      ${this.error ? html`
        <div class="error-msg" role="alert">
          <i class="ti ti-alert-circle error-icon" aria-hidden="true"></i>
          ${this.error}
        </div>` : ''}
    `;
  }
}

customElements.define('tbt-date-range', TbtDateRange);

/**
 * @component tbt-dropdown
 * @version 1.0.0
 * @author Wichit Wongta
 *
 * Styled select dropdown with label, placeholder, and validation.
 * Options are passed as an array via the .options property.
 *
 * Usage:
 *   <tbt-dropdown
 *     label="สถานะ"
 *     placeholder="เลือกสถานะ..."
 *     .options=${[
 *       { value: 'A', label: 'Approved' },
 *       { value: 'P', label: 'Pending' },
 *       { value: 'R', label: 'Rejected' }
 *     ]}
 *     value="A"
 *     @tbt-change=${e => console.log(e.detail.value)}>
 *   </tbt-dropdown>
 *
 * Event: tbt-change → { value, label }
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';

class TbtDropdown extends LitElement {
  static properties = {
    label:       { type: String },
    name:        { type: String },
    placeholder: { type: String },
    value:       { type: String },
    options:     { type: Array },
    required:    { type: Boolean, reflect: true },
    disabled:    { type: Boolean, reflect: true },
    error:       { type: String, reflect: true }
  };

  constructor() {
    super();
    this.options = [];
    this.value = '';
    this.placeholder = 'Select…';
  }

  static styles = css`
    :host {
      display: block;
      font-family: var(--tbt-font);
    }
    .label-row {
      display: flex;
      align-items: baseline;
      gap: var(--tbt-space-1);
      margin-bottom: var(--tbt-space-1);
    }
    label {
      font-size: var(--tbt-size-xs);
      font-weight: var(--tbt-weight-medium);
      color: var(--tbt-text-secondary);
      letter-spacing: 0.04em;
    }
    .required { color: var(--tbt-text-required); font-size: var(--tbt-size-xs); }
    .wrap {
      position: relative;
    }
    select {
      display: block;
      width: 100%;
      box-sizing: border-box;
      font-family: inherit;
      font-size: var(--tbt-size-base);
      color: var(--tbt-text-primary);
      background: var(--tbt-bg-card);
      border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-md);
      padding: 8px var(--tbt-space-8) 8px var(--tbt-space-3);
      min-height: 38px;
      outline: 0;
      appearance: none;
      cursor: pointer;
      transition: border-color var(--tbt-transition-fast),
                  box-shadow var(--tbt-transition-fast);
    }
    select:focus {
      border-color: var(--tbt-primary-light);
      box-shadow: var(--tbt-shadow-focus);
    }
    select.placeholder-selected { color: var(--tbt-text-muted); }
    :host([error]) select { border-color: var(--tbt-danger); }
    :host([disabled]) select { background: var(--tbt-bg-hover); cursor: not-allowed; opacity: 0.65; }
    .chevron {
      position: absolute;
      right: var(--tbt-space-3);
      top: 50%;
      transform: translateY(-50%);
      font-size: 14px;
      color: var(--tbt-text-secondary);
      pointer-events: none;
    }
    .error-msg {
      margin-top: var(--tbt-space-1);
      font-size: var(--tbt-size-xs);
      color: var(--tbt-danger-text);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .error-icon { font-size: 12px; }
  `;

  _onChange(e) {
    const sel = e.target;
    this.value = sel.value;
    const opt = this.options.find(o => String(o.value) === sel.value);
    this.dispatchEvent(new CustomEvent('tbt-change', {
      detail: { value: this.value, label: opt?.label ?? '' },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    const isPlaceholder = !this.value;
    return html`
      ${tablerLink}
      ${this.label ? html`
        <div class="label-row">
          <label>${this.label}</label>
          ${this.required ? html`<span class="required">*</span>` : ''}
        </div>` : ''}
      <div class="wrap">
        <select
          class=${isPlaceholder ? 'placeholder-selected' : ''}
          .value=${this.value}
          ?required=${this.required}
          ?disabled=${this.disabled}
          @change=${this._onChange}>
          ${this.placeholder ? html`<option value="" ?selected=${isPlaceholder} disabled hidden>${this.placeholder}</option>` : ''}
          ${this.options.map(opt => html`
            <option value=${opt.value} ?selected=${String(opt.value) === String(this.value)}>
              ${opt.label}
            </option>
          `)}
        </select>
        <i class="ti ti-chevron-down chevron" aria-hidden="true"></i>
      </div>
      ${this.error ? html`
        <div class="error-msg">
          <i class="ti ti-alert-circle error-icon" aria-hidden="true"></i>
          ${this.error}
        </div>` : ''}
    `;
  }
}

customElements.define('tbt-dropdown', TbtDropdown);

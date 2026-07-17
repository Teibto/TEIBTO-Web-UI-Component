/**
 * @component tbt-input
 * @version 1.46.0
 * @author Wichit Wongta
 *
 * Styled text input with label, helper, and validation error.
 * Supports types: text, number, email, password, tel, search.
 *
 * Usage:
 *   <tbt-input label="Vendor name" placeholder="Enter vendor..." required></tbt-input>
 *   <tbt-input label="Email" type="email" value="test@example.com"></tbt-input>
 *   <tbt-input label="Amount" type="number" min="0"></tbt-input>
 *   <tbt-input label="Password" type="password"></tbt-input>
 *
 *   <!-- With validation error -->
 *   <tbt-input label="Document No." error="Document No. is required" required></tbt-input>
 *
 *   <!-- Read-only display -->
 *   <tbt-input label="Created by" value="Wichit Wongta" readonly></tbt-input>
 *
 * Events: tbt-input (on each keystroke), tbt-change (on blur/commit)
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';

/**
 * @fires tbt-input - Fired on every keystroke; detail: { value: string }
 * @fires tbt-change - Fired when input loses focus (blur); detail: { value: string }
 */
class TbtInput extends LitElement {
  static formAssociated = true;

  static properties = {
    label:       { type: String },
    name:        { type: String },
    type:        { type: String },
    value:       { type: String },
    placeholder: { type: String },
    required:    { type: Boolean, reflect: true },
    disabled:    { type: Boolean, reflect: true },
    readonly:    { type: Boolean, reflect: true },
    error:       { type: String, reflect: true },
    helper:      { type: String },
    min:         { type: String },
    max:         { type: String },
    step:        { type: String },
    maxlength:   { type: Number }
  };

  constructor() {
    super();
    this._internals = this.attachInternals();
    this.type = 'text';
    this.value = '';
    this.placeholder = '';
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
    .required {
      color: var(--tbt-text-required);
      font-size: var(--tbt-size-xs);
    }
    input {
      display: block;
      width: 100%;
      box-sizing: border-box;
      font-family: inherit;
      font-size: var(--tbt-size-base);
      color: var(--tbt-text-primary);
      background: var(--tbt-bg-card);
      border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-md);
      padding: 8px var(--tbt-space-3);
      min-height: 38px;
      outline: 0;
      transition: border-color var(--tbt-transition-fast),
                  box-shadow var(--tbt-transition-fast);
    }
    input::placeholder { color: var(--tbt-text-muted); }
    input:focus {
      border-color: var(--tbt-primary-light);
      box-shadow: var(--tbt-shadow-focus);
    }
    :host([error]) input {
      border-color: var(--tbt-danger);
    }
    :host([error]) input:focus {
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--tbt-danger) 18%, transparent);
    }
    :host([disabled]) input {
      background: var(--tbt-bg-hover);
      color: var(--tbt-text-muted);
      cursor: not-allowed;
    }
    :host([readonly]) input {
      background: var(--tbt-bg-hover);
      cursor: default;
    }
    .helper {
      margin-top: var(--tbt-space-1);
      font-size: var(--tbt-size-xs);
      color: var(--tbt-text-muted);
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

  _uid() {
    return this._id || (this._id = `tbt-input-${Math.random().toString(36).slice(2, 8)}`);
  }

  _onInput(e) {
    this.value = e.target.value;
    this._internals.setFormValue(this.value);
    this.dispatchEvent(new CustomEvent('tbt-input', {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }));
  }

  _onChange(e) {
    this.value = e.target.value;
    this._internals.setFormValue(this.value);
    this.dispatchEvent(new CustomEvent('tbt-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    const id = this._uid();
    const errId = `${id}-error`;
    const helperId = `${id}-helper`;
    const describedBy = this.error ? errId : this.helper ? helperId : nothing;
    return html`
      ${tablerLink}
      ${this.label ? html`
        <div class="label-row">
          <label for=${id}>${this.label}</label>
          ${this.required ? html`<span class="required">*</span>` : ''}
        </div>` : ''}
      <input
        id=${id}
        type=${this.type}
        .value=${this.value}
        placeholder=${this.placeholder}
        aria-invalid=${this.error ? 'true' : 'false'}
        aria-describedby=${describedBy}
        ?required=${this.required}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        min=${this.min || nothing}
        max=${this.max || nothing}
        step=${this.step || nothing}
        maxlength=${this.maxlength ?? nothing}
        @input=${this._onInput}
        @change=${this._onChange}>
      ${this.error ? html`
        <div id=${errId} class="error-msg" role="alert">
          <i class="ti ti-alert-circle error-icon" aria-hidden="true"></i>
          ${this.error}
        </div>` : ''}
      ${this.helper && !this.error ? html`
        <div id=${helperId} class="helper">${this.helper}</div>` : ''}
    `;
  }
}

customElements.define('tbt-input', TbtInput);

/**
 * @component tbt-textarea
 * @version 1.26.0
 * @author Wichit Wongta
 *
 * Multiline text input sibling of tbt-input. Form-associated.
 *
 * Usage:
 *   <tbt-textarea label="Notes" placeholder="Optional notes…" rows="4"></tbt-textarea>
 *   <tbt-textarea label="Memo" value="..." required></tbt-textarea>
 *
 * Events: tbt-input (every keystroke), tbt-change (on blur)
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';

/**
 * @fires tbt-input - Fired on every keystroke; detail: { value: string }
 * @fires tbt-change - Fired on blur; detail: { value: string }
 */
class TbtTextarea extends LitElement {
  static formAssociated = true;

  static properties = {
    label:       { type: String },
    name:        { type: String },
    value:       { type: String },
    placeholder: { type: String },
    rows:        { type: Number },
    maxlength:   { type: Number },
    required:    { type: Boolean, reflect: true },
    disabled:    { type: Boolean, reflect: true },
    readonly:    { type: Boolean, reflect: true },
    error:       { type: String,  reflect: true },
    helper:      { type: String },
  };

  constructor() {
    super();
    this._internals = this.attachInternals();
    this.value = '';
    this.placeholder = '';
    this.rows = 3;
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
    textarea {
      display: block; width: 100%; box-sizing: border-box;
      font-family: inherit; font-size: var(--tbt-size-base);
      color: var(--tbt-text-primary); background: var(--tbt-bg-card);
      border: 1px solid var(--tbt-border); border-radius: var(--tbt-radius-md);
      padding: 8px var(--tbt-space-3);
      outline: 0; resize: vertical; min-height: 60px;
      line-height: var(--tbt-leading-relaxed, 1.5);
      transition: border-color var(--tbt-transition-fast), box-shadow var(--tbt-transition-fast);
    }
    textarea::placeholder { color: var(--tbt-text-muted); }
    textarea:focus {
      border-color: var(--tbt-primary-light);
      box-shadow: var(--tbt-shadow-focus);
    }
    :host([error]) textarea { border-color: var(--tbt-danger); }
    :host([error]) textarea:focus { box-shadow: 0 0 0 3px color-mix(in srgb, var(--tbt-danger) 18%, transparent); }
    :host([disabled]) textarea {
      background: var(--tbt-bg-hover); color: var(--tbt-text-muted); cursor: not-allowed;
    }
    :host([readonly]) textarea { background: var(--tbt-bg-hover); cursor: default; }
    .helper {
      margin-top: var(--tbt-space-1); font-size: var(--tbt-size-xs);
      color: var(--tbt-text-muted);
    }
    .error-msg {
      margin-top: var(--tbt-space-1); font-size: var(--tbt-size-xs);
      color: var(--tbt-danger-text); display: flex; align-items: center; gap: 4px;
    }
    .error-icon { font-size: 12px; }
  `;

  _uid() {
    return this._id || (this._id = `tbt-textarea-${Math.random().toString(36).slice(2, 8)}`);
  }

  _syncValidity() {
    if (this.required && !this.value) {
      const anchor = this.shadowRoot?.querySelector('textarea') ?? this;
      this._internals.setValidity({ valueMissing: true }, 'This field is required', anchor);
    } else {
      this._internals.setValidity({});
    }
  }

  updated(changed) {
    if (changed.has('required') || changed.has('value')) this._syncValidity();
  }

  _onInput(e) {
    this.value = e.target.value;
    this._internals.setFormValue(this.value);
    this.dispatchEvent(new CustomEvent('tbt-input', {
      detail: { value: this.value },
      bubbles: true, composed: true,
    }));
  }

  _onChange(e) {
    this.value = e.target.value;
    this._internals.setFormValue(this.value);
    this.dispatchEvent(new CustomEvent('tbt-change', {
      detail: { value: this.value },
      bubbles: true, composed: true,
    }));
  }

  render() {
    const id = this._uid();
    return html`
      ${tablerLink}
      ${this.label ? html`
        <div class="label-row">
          <label for=${id}>${this.label}</label>
          ${this.required ? html`<span class="required">*</span>` : ''}
        </div>` : ''}
      <textarea
        id=${id}
        .value=${this.value}
        placeholder=${this.placeholder}
        rows=${this.rows}
        ?required=${this.required}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        maxlength=${this.maxlength ?? nothing}
        @input=${this._onInput}
        @change=${this._onChange}></textarea>
      ${this.error ? html`
        <div class="error-msg">
          <i class="ti ti-alert-circle error-icon" aria-hidden="true"></i>
          ${this.error}
        </div>` : ''}
      ${this.helper && !this.error ? html`
        <div class="helper">${this.helper}</div>` : ''}
    `;
  }
}

customElements.define('tbt-textarea', TbtTextarea);

/**
 * @component tbt-tag-input
 * @version 1.45.1
 * @author Wichit Wongta
 *
 * Tag / chip input — type and press Enter to add tags; × button or Backspace to remove.
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

class TbtTagInput extends LitElement {
  static formAssociated = true;

  static properties = {
    label:       { type: String },
    name:        { type: String },
    placeholder: { type: String },
    required:    { type: Boolean, reflect: true },
    disabled:    { type: Boolean, reflect: true },
    error:       { type: String },
    helper:      { type: String },
    max:         { type: Number },
    _tags:       { state: true },
    _input:      { state: true },
  };

  static styles = css`
    :host {
      display: block;
      font-family: var(--tbt-font);
    }
    :host([disabled]) {
      opacity: 0.55;
      pointer-events: none;
    }

    .label {
      display: block;
      font-size: var(--tbt-size-sm);
      font-weight: var(--tbt-weight-medium);
      color: var(--tbt-text-secondary);
      margin-bottom: var(--tbt-space-1);
    }
    .req {
      color: var(--tbt-text-required);
      margin-left: 2px;
    }

    .field {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;
      min-height: 38px;
      padding: 4px var(--tbt-space-2);
      border: 1.5px solid var(--tbt-border);
      border-radius: var(--tbt-radius-md);
      background: var(--tbt-bg-card);
      cursor: text;
      transition: border-color var(--tbt-transition-fast), box-shadow var(--tbt-transition-fast);
    }
    :host(:focus-within) .field {
      border-color: var(--tbt-primary);
      box-shadow: var(--tbt-shadow-focus);
    }
    .field.has-error {
      border-color: var(--tbt-danger);
    }
    :host(:focus-within) .field.has-error {
      box-shadow: 0 0 0 3px rgb(239 68 68 / 0.15);
    }

    .tag {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      padding: 2px 4px 2px 8px;
      background: var(--tbt-primary-bg);
      color: var(--tbt-primary-text);
      border-radius: var(--tbt-radius-pill);
      font-size: var(--tbt-size-sm);
      font-weight: var(--tbt-weight-medium);
      line-height: 1.4;
    }
    .tag-remove {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      padding: 0;
      border: none;
      border-radius: 50%;
      background: transparent;
      color: inherit;
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
      opacity: 0.6;
      transition: opacity var(--tbt-transition-fast), background var(--tbt-transition-fast);
    }
    .tag-remove:hover {
      opacity: 1;
      background: var(--tbt-primary-light);
      color: var(--tbt-bg-card);
    }
    .tag-remove:focus-visible {
      outline: 2px solid var(--tbt-primary);
      outline-offset: 1px;
      opacity: 1;
    }

    input {
      flex: 1 1 80px;
      min-width: 80px;
      border: none;
      outline: none;
      background: transparent;
      font: inherit;
      font-size: var(--tbt-size-base);
      color: var(--tbt-text-primary);
      padding: 3px 0;
    }
    input::placeholder {
      color: var(--tbt-text-muted);
    }

    .helper {
      display: block;
      font-size: var(--tbt-size-sm);
      color: var(--tbt-text-muted);
      margin-top: var(--tbt-space-1);
    }
    .error-text {
      display: block;
      font-size: var(--tbt-size-sm);
      color: var(--tbt-danger);
      margin-top: var(--tbt-space-1);
    }
  `;

  constructor() {
    super();
    this._internals = this.attachInternals();
    this._tags = [];
    this._input = '';
    this._uid = `tbt-tag-${Math.random().toString(36).slice(2, 9)}`;
    this.placeholder = 'Add tag…';
    this.max = 0;
  }

  get value() { return [...this._tags]; }
  set value(v) {
    this._tags = Array.isArray(v) ? [...v] : [];
    this._syncInternals();
  }

  _syncInternals() {
    this._internals.setFormValue(this._tags.join(','));
    if (this.required && this._tags.length === 0) {
      this._internals.setValidity(
        { valueMissing: true },
        'Please add at least one tag',
        this.shadowRoot?.querySelector('input') ?? undefined
      );
    } else {
      this._internals.setValidity({});
    }
  }

  _emit() {
    this._syncInternals();
    this.dispatchEvent(new CustomEvent('tbt-change', {
      detail: { values: [...this._tags] },
      bubbles: true,
      composed: true,
    }));
  }

  _addTag() {
    const val = this._input.trim();
    if (!val) return;
    if (this.max > 0 && this._tags.length >= this.max) return;
    if (this._tags.includes(val)) { this._input = ''; return; }
    this._tags = [...this._tags, val];
    this._input = '';
    this._emit();
  }

  _removeTag(i) {
    this._tags = this._tags.filter((_, idx) => idx !== i);
    this._emit();
    this.updateComplete.then(() => this.shadowRoot?.querySelector('input')?.focus());
  }

  _onKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this._addTag();
    } else if (e.key === 'Backspace' && this._input === '' && this._tags.length > 0) {
      this._removeTag(this._tags.length - 1);
    } else if (e.key === 'Escape') {
      this._input = '';
    }
  }

  _onInput(e) {
    this._input = e.target.value;
  }

  _focusInput() {
    this.shadowRoot?.querySelector('input')?.focus();
  }

  render() {
    const hasError = !!(this.error && this.error.trim());

    return html`
      ${this.label ? html`
        <label for=${this._uid} class="label">
          ${this.label}
          ${this.required ? html`<span class="req" aria-hidden="true">*</span>` : nothing}
        </label>
      ` : nothing}

      <div class="field ${hasError ? 'has-error' : ''}" @click=${this._focusInput}>
        ${this._tags.map((tag, i) => html`
          <span class="tag">
            <span class="tag-text">${tag}</span>
            <button
              class="tag-remove"
              type="button"
              aria-label="Remove ${tag}"
              @click=${(e) => { e.stopPropagation(); this._removeTag(i); }}>
              ×
            </button>
          </span>
        `)}
        <input
          id=${this._uid}
          .value=${this._input}
          placeholder=${this._tags.length === 0 ? (this.placeholder || '') : ''}
          @keydown=${this._onKeydown}
          @input=${this._onInput}
          ?disabled=${this.disabled}
          autocomplete="off"
          aria-label=${this.label ? nothing : 'Tags'}
        />
      </div>

      ${hasError ? html`<span class="error-text" role="alert">${this.error}</span>` : nothing}
      ${!hasError && this.helper ? html`<span class="helper">${this.helper}</span>` : nothing}
    `;
  }
}

customElements.define('tbt-tag-input', TbtTagInput);

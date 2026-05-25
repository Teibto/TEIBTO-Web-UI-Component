/**
 * @component tbt-dropdown
 * @version 1.26.2
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

/**
 * @fires tbt-change - Fired when selected value changes; detail: { value: string }
 */
class TbtDropdown extends LitElement {
  static formAssociated = true;

  static properties = {
    label:       { type: String },
    name:        { type: String },
    placeholder: { type: String },
    value:       { type: String },
    options:     { type: Array },
    required:    { type: Boolean, reflect: true },
    disabled:    { type: Boolean, reflect: true },
    error:       { type: String, reflect: true },
    searchable:  { type: Boolean },
    _open:       { state: true },
    _query:      { state: true },
  };

  constructor() {
    super();
    this._internals = this.attachInternals();
    this.options = [];
    this.value = '';
    this.placeholder = 'Select…';
    this._open = false;
    this._query = '';
  }

  connectedCallback() {
    super.connectedCallback();
    this._onOutside = (e) => {
      if (!e.composedPath().includes(this)) this._open = false;
    };
    document.addEventListener('click', this._onOutside);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._onOutside);
  }

  updated(changed) {
    if (changed.has('_open')) {
      this.toggleAttribute('open', this._open);
      if (this._open && this.searchable) {
        this._query = '';
        this.updateComplete.then(() => {
          this.shadowRoot.querySelector('.search input')?.focus();
        });
      }
    }
  }

  _toggleOpen() {
    if (!this.disabled) this._open = !this._open;
  }

  _pick(val) {
    this.value = String(val);
    this._internals.setFormValue(this.value);
    const opt = this.options.find(o => String(o.value) === this.value);
    this.dispatchEvent(new CustomEvent('tbt-change', {
      detail: { value: this.value, label: opt?.label ?? '' },
      bubbles: true,
      composed: true,
    }));
    this._open = false;
  }

  _onTriggerKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._toggleOpen();
    } else if (e.key === 'Escape' && this._open) {
      e.preventDefault();
      this._open = false;
    } else if (e.key === 'ArrowDown' && !this._open) {
      e.preventDefault();
      this._open = true;
    }
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

    /* ── Searchable mode (custom popover) ─────────────── */
    :host { position: relative; }
    .trigger {
      display: flex; align-items: center; min-height: 38px;
      padding: 8px var(--tbt-space-8) 8px var(--tbt-space-3);
      background: var(--tbt-bg-card);
      border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-md);
      cursor: pointer; outline: 0;
      font-size: var(--tbt-size-base); color: var(--tbt-text-primary);
      transition: border-color var(--tbt-transition-fast), box-shadow var(--tbt-transition-fast);
    }
    .trigger:focus-visible, :host([open]) .trigger {
      border-color: var(--tbt-primary-light);
      box-shadow: var(--tbt-shadow-focus);
    }
    .trigger.is-placeholder { color: var(--tbt-text-muted); }
    :host([error]) .trigger { border-color: var(--tbt-danger); }
    :host([disabled]) .trigger { background: var(--tbt-bg-hover); cursor: not-allowed; opacity: 0.65; }
    .dropdown {
      display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0;
      background: var(--tbt-bg-card); border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-md); box-shadow: var(--tbt-shadow-md);
      z-index: var(--tbt-z-dropdown); max-height: 240px; overflow-y: auto;
      padding: var(--tbt-space-1) 0;
    }
    :host([open]) .dropdown { display: block; }
    .option {
      display: flex; align-items: center; gap: var(--tbt-space-2);
      padding: 8px var(--tbt-space-3); cursor: pointer;
      font-size: var(--tbt-size-base); color: var(--tbt-text-primary);
      transition: background var(--tbt-transition-fast);
    }
    .option:hover { background: var(--tbt-bg-hover); }
    .option.selected { background: var(--tbt-primary-bg); color: var(--tbt-primary-text); }
    .search {
      position: sticky; top: 0; z-index: 1;
      padding: var(--tbt-space-1) var(--tbt-space-2);
      background: var(--tbt-bg-card);
      border-bottom: 1px solid var(--tbt-border);
    }
    .search input {
      width: 100%; box-sizing: border-box;
      font-family: inherit; font-size: var(--tbt-size-sm);
      color: var(--tbt-text-primary); background: var(--tbt-bg-page);
      border: 1px solid var(--tbt-border); border-radius: var(--tbt-radius-sm);
      padding: 5px var(--tbt-space-2); outline: 0;
    }
    .search input:focus {
      border-color: var(--tbt-primary-light);
      box-shadow: var(--tbt-shadow-focus);
    }
    .empty-msg {
      padding: var(--tbt-space-3); font-size: var(--tbt-size-sm);
      color: var(--tbt-text-muted); text-align: center;
    }
  `;

  _onChange(e) {
    const sel = e.target;
    this.value = sel.value;
    this._internals.setFormValue(this.value);
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
      ${this.searchable ? this._renderSearchable(isPlaceholder) : this._renderNative(isPlaceholder)}
      ${this.error ? html`
        <div class="error-msg">
          <i class="ti ti-alert-circle error-icon" aria-hidden="true"></i>
          ${this.error}
        </div>` : ''}
    `;
  }

  _renderNative(isPlaceholder) {
    return html`
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
      </div>`;
  }

  _renderSearchable(isPlaceholder) {
    const selected = this.options.find(o => String(o.value) === String(this.value));
    const q = (this._query ?? '').toLowerCase();
    const filtered = q
      ? this.options.filter(o => String(o.label ?? '').toLowerCase().includes(q))
      : this.options;
    return html`
      <div class="wrap">
        <div class="trigger ${isPlaceholder ? 'is-placeholder' : ''}"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded=${this._open ? 'true' : 'false'}
          aria-label=${this.label || this.placeholder}
          tabindex=${this.disabled ? '-1' : '0'}
          @click=${this._toggleOpen}
          @keydown=${this._onTriggerKeydown}>
          ${selected ? selected.label : this.placeholder}
        </div>
        <i class="ti ti-chevron-down chevron" aria-hidden="true"></i>
        <div class="dropdown" role="listbox">
          <div class="search" @click=${e => e.stopPropagation()}>
            <input type="text"
              placeholder="Search…"
              .value=${this._query ?? ''}
              @input=${e => { this._query = e.target.value; }}
              @keydown=${e => { if (e.key === 'Escape') { e.preventDefault(); this._open = false; } }}>
          </div>
          ${filtered.length === 0
            ? html`<div class="empty-msg">No options match</div>`
            : filtered.map(o => html`
              <div class="option ${String(o.value) === String(this.value) ? 'selected' : ''}"
                role="option"
                aria-selected=${String(o.value) === String(this.value) ? 'true' : 'false'}
                @click=${() => this._pick(o.value)}>
                ${o.label}
              </div>`)}
        </div>
      </div>`;
  }
}

customElements.define('tbt-dropdown', TbtDropdown);

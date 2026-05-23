/**
 * @component tbt-multiselect
 * @version 1.24.3
 * @author Wichit Wongta
 *
 * Multi-select with chip display and dropdown checkbox list.
 *
 * Usage:
 *   <tbt-multiselect
 *     label="Subsidiary"
 *     placeholder="Select subsidiaries..."
 *     .options=${[
 *       { value: '1', label: 'Teibto Co., Ltd.' },
 *       { value: '2', label: 'Teibto Logistics' },
 *       { value: '3', label: 'Teibto Retail' }
 *     ]}
 *     .value=${['1', '2']}
 *     @tbt-change=${e => console.log(e.detail.values)}>
 *   </tbt-multiselect>
 *
 * Event: tbt-change → { values: string[], labels: string[] }
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';

/**
 * @fires tbt-change - Fired when selection changes; detail: { values: string[], labels: string[] }
 */
class TbtMultiselect extends LitElement {
  static formAssociated = true;

  static properties = {
    label:       { type: String },
    name:        { type: String },
    placeholder: { type: String },
    options:     { type: Array },
    value:       { type: Array },
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
    this.value = [];
    this.placeholder = 'Select…';
    this._open = false;
    this._query = '';
  }

  static styles = css`
    :host { display: block; font-family: var(--tbt-font); position: relative; }
    .label-row {
      display: flex; align-items: baseline; gap: var(--tbt-space-1);
      margin-bottom: var(--tbt-space-1);
    }
    label { font-size: var(--tbt-size-xs); font-weight: var(--tbt-weight-medium);
      color: var(--tbt-text-secondary); letter-spacing: 0.04em; }
    .required { color: var(--tbt-text-required); font-size: var(--tbt-size-xs); }
    .trigger {
      display: flex; align-items: center; flex-wrap: wrap;
      gap: var(--tbt-space-1); min-height: 38px;
      padding: 5px var(--tbt-space-8) 5px var(--tbt-space-2);
      background: var(--tbt-bg-card);
      border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-md);
      cursor: pointer; position: relative;
      transition: border-color var(--tbt-transition-fast), box-shadow var(--tbt-transition-fast);
    }
    .trigger:focus-within, :host([open]) .trigger {
      border-color: var(--tbt-primary-light);
      box-shadow: var(--tbt-shadow-focus);
    }
    :host([error]) .trigger { border-color: var(--tbt-danger); }
    :host([disabled]) .trigger { background: var(--tbt-bg-hover); cursor: not-allowed; opacity: 0.65; }
    .chip {
      display: inline-flex; align-items: center; gap: 4px;
      background: var(--tbt-primary-bg); color: var(--tbt-primary-text);
      font-size: var(--tbt-size-xs); font-weight: var(--tbt-weight-medium);
      padding: 2px 8px; border-radius: var(--tbt-radius-pill);
    }
    .chip-remove {
      background: none; border: none; cursor: pointer; color: inherit;
      font-size: 11px; padding: 0; line-height: 1; opacity: 0.7;
    }
    .chip-remove:hover { opacity: 1; }
    .placeholder { font-size: var(--tbt-size-base); color: var(--tbt-text-muted); padding: 2px 4px; }
    .chevron {
      position: absolute; right: var(--tbt-space-2); top: 50%;
      transform: translateY(-50%); font-size: 14px; color: var(--tbt-text-secondary);
      pointer-events: none; transition: transform var(--tbt-transition-base);
    }
    :host([open]) .chevron { transform: translateY(-50%) rotate(180deg); }
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
    input[type="checkbox"] { accent-color: var(--tbt-primary); width: 15px; height: 15px; flex-shrink: 0; }
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
    .error-msg { margin-top: var(--tbt-space-1); font-size: var(--tbt-size-xs);
      color: var(--tbt-danger-text); display: flex; align-items: center; gap: 4px; }
    .error-icon { font-size: 12px; }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._onOutside = (e) => {
      if (!this.contains(e.target)) this._open = false;
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

  _toggle(val) {
    const current = this.value.map(String);
    const next = current.includes(val)
      ? current.filter(v => v !== val)
      : [...current, val];
    this.value = next;
    this._internals.setFormValue(next.join(','));
    const labels = this.options
      .filter(o => next.includes(String(o.value)))
      .map(o => o.label);
    this.dispatchEvent(new CustomEvent('tbt-change', {
      detail: { values: next, labels },
      bubbles: true,
      composed: true
    }));
  }

  _removeChip(val, e) {
    e.stopPropagation();
    this._toggle(val);
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

  render() {
    const selected = this.options.filter(o => this.value.includes(String(o.value)));
    const q = (this._query ?? '').toLowerCase();
    const filtered = this.searchable && q
      ? this.options.filter(o => String(o.label ?? '').toLowerCase().includes(q))
      : this.options;
    return html`
      ${tablerLink}
      ${this.label ? html`
        <div class="label-row">
          <label>${this.label}</label>
          ${this.required ? html`<span class="required">*</span>` : ''}
        </div>` : ''}
      <div class="trigger"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded=${this._open ? 'true' : 'false'}
        aria-label=${this.label || this.placeholder}
        tabindex=${this.disabled ? '-1' : '0'}
        @click=${this._toggleOpen}
        @keydown=${this._onTriggerKeydown}>
        ${selected.length === 0
          ? html`<span class="placeholder">${this.placeholder}</span>`
          : selected.map(o => html`
            <span class="chip">
              ${o.label}
              <button class="chip-remove" @click=${e => this._removeChip(String(o.value), e)} aria-label="Remove">×</button>
            </span>`)}
        <i class="ti ti-chevron-down chevron" aria-hidden="true"></i>
      </div>
      <div class="dropdown" role="listbox" aria-multiselectable="true">
        ${this.searchable ? html`
          <div class="search" @click=${e => e.stopPropagation()}>
            <input type="text"
              placeholder="Search…"
              .value=${this._query ?? ''}
              @input=${e => { this._query = e.target.value; }}
              @keydown=${e => { if (e.key === 'Escape') { e.preventDefault(); this._open = false; } }}>
          </div>` : ''}
        ${filtered.length === 0
          ? html`<div class="empty-msg">No options match</div>`
          : filtered.map(o => html`
            <div class="option ${this.value.includes(String(o.value)) ? 'selected' : ''}"
              role="option"
              aria-selected=${this.value.includes(String(o.value)) ? 'true' : 'false'}
              @click=${() => this._toggle(String(o.value))}>
              <input type="checkbox" .checked=${this.value.includes(String(o.value))} tabindex="-1" readonly>
              ${o.label}
            </div>`)}
      </div>
      ${this.error ? html`
        <div class="error-msg">
          <i class="ti ti-alert-circle error-icon"></i>
          ${this.error}
        </div>` : ''}
    `;
  }
}

customElements.define('tbt-multiselect', TbtMultiselect);

/**
 * @component tbt-multiselect
 * @version 1.46.1
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
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';
import { watchOutsideClick } from './tbt-outside-click.js';

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
    readonly:    { type: Boolean, reflect: true },
    error:       { type: String, reflect: true },
    searchable:  { type: Boolean },
    _open:       { state: true },
    _query:      { state: true },
    _activeIdx:  { state: true },
  };

  constructor() {
    super();
    this._internals = this.attachInternals();
    this.options = [];
    this.value = [];
    this.placeholder = 'Select…';
    this._open = false;
    this._query = '';
    this._activeIdx = -1;
    this._uid = `ms${Math.random().toString(36).slice(2, 8)}`;
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
    :host([readonly]) .trigger { background: var(--tbt-bg-hover); cursor: default; pointer-events: none; }
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
    }
    :host([open]) .dropdown { display: block; }
    [role="listbox"] { padding: var(--tbt-space-1) 0; }
    .option {
      display: flex; align-items: center; gap: var(--tbt-space-2);
      padding: 8px var(--tbt-space-3); cursor: pointer;
      font-size: var(--tbt-size-base); color: var(--tbt-text-primary);
      transition: background var(--tbt-transition-fast);
    }
    .option:hover { background: var(--tbt-bg-hover); }
    .option[data-kbd-active] { background: var(--tbt-bg-active); }
    .option.selected { background: var(--tbt-primary-bg); color: var(--tbt-primary-text); }
    .cb-visual {
      display: inline-block; flex-shrink: 0;
      width: 15px; height: 15px;
      border: 1.5px solid var(--tbt-border-strong);
      border-radius: 3px;
      position: relative;
    }
    .option.selected .cb-visual {
      background: var(--tbt-primary); border-color: var(--tbt-primary);
    }
    .option.selected .cb-visual::after {
      content: '';
      display: block; position: absolute;
      left: 4px; top: 1px;
      width: 4px; height: 8px;
      border: 2px solid white; border-top: none; border-left: none;
      transform: rotate(45deg);
    }
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
    this._stopOutside = watchOutsideClick(this, () => { this._open = false; });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopOutside?.();
    this._stopOutside = null;
  }

  updated(changed) {
    if (changed.has('_open')) {
      this.toggleAttribute('open', this._open);
      this._activeIdx = -1;
      if (this._open && this.searchable) {
        this._query = '';
        this.updateComplete.then(() => {
          this.shadowRoot.querySelector('.search input')?.focus();
        });
      }
    }
  }

  get _filteredOpts() {
    const q = (this._query ?? '').toLowerCase();
    return this.searchable && q
      ? this.options.filter(o => String(o.label ?? '').toLowerCase().includes(q))
      : this.options;
  }

  _toggleOpen() {
    if (!this.disabled && !this.readonly) this._open = !this._open;
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
    const opts = this._filteredOpts;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (this._open && this._activeIdx >= 0) {
        this._toggle(String(opts[this._activeIdx].value));
      } else {
        this._toggleOpen();
      }
    } else if (e.key === 'Escape' && this._open) {
      e.preventDefault();
      this._open = false;
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!this._open) this._open = true;
      else this._activeIdx = Math.min(this._activeIdx + 1, opts.length - 1);
    } else if (e.key === 'ArrowUp' && this._open) {
      e.preventDefault();
      this._activeIdx = Math.max(this._activeIdx - 1, 0);
    } else if (e.key === 'Home' && this._open) {
      e.preventDefault();
      this._activeIdx = 0;
    } else if (e.key === 'End' && this._open) {
      e.preventDefault();
      this._activeIdx = opts.length - 1;
    }
  }

  _onSearchKeydown(e) {
    const opts = this._filteredOpts;
    if (e.key === 'Escape') {
      e.preventDefault();
      this._open = false;
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this._activeIdx = Math.min(this._activeIdx + 1, opts.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this._activeIdx = Math.max(this._activeIdx - 1, 0);
    } else if (e.key === 'Home') {
      e.preventDefault();
      this._activeIdx = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      this._activeIdx = opts.length - 1;
    } else if (e.key === 'Enter' && this._activeIdx >= 0) {
      e.preventDefault();
      this._toggle(String(opts[this._activeIdx].value));
    }
  }

  render() {
    const selected = this.options.filter(o => this.value.includes(String(o.value)));
    const filtered = this._filteredOpts;
    const listboxId = `${this._uid}-listbox`;
    const activeId = this._activeIdx >= 0 && this._activeIdx < filtered.length
      ? `${this._uid}-opt-${filtered[this._activeIdx].value}`
      : nothing;
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
        aria-controls=${listboxId}
        aria-owns=${listboxId}
        aria-activedescendant=${activeId}
        tabindex=${this.disabled || this.readonly ? '-1' : '0'}
        @click=${this._toggleOpen}
        @keydown=${this._onTriggerKeydown}>
        ${selected.length === 0
          ? html`<span class="placeholder">${this.placeholder}</span>`
          : selected.map(o => html`
            <span class="chip">
              ${o.label}
              <button class="chip-remove" @click=${e => this._removeChip(String(o.value), e)} aria-label="Remove ${o.label}">×</button>
            </span>`)}
        <i class="ti ti-chevron-down chevron" aria-hidden="true"></i>
      </div>
      <div class="dropdown">
        ${this.searchable ? html`
          <div class="search" @click=${e => e.stopPropagation()}>
            <input type="text"
              aria-label="Search options"
              placeholder="Search…"
              .value=${this._query ?? ''}
              @input=${e => { this._query = e.target.value; this._activeIdx = -1; }}
              @keydown=${this._onSearchKeydown}>
          </div>` : ''}
        <div id=${listboxId} role="listbox" aria-multiselectable="true" aria-label=${this.label || this.placeholder}>
          ${filtered.length === 0
            ? html`<div class="empty-msg">No options match</div>`
            : filtered.map((o, idx) => html`
              <div id="${this._uid}-opt-${o.value}"
                class="option ${this.value.includes(String(o.value)) ? 'selected' : ''}"
                role="option"
                aria-selected=${this.value.includes(String(o.value)) ? 'true' : 'false'}
                ?data-kbd-active=${idx === this._activeIdx}
                @click=${() => this._toggle(String(o.value))}>
                <span class="cb-visual" aria-hidden="true"></span>
                ${o.label}
              </div>`)}
        </div>
      </div>
      ${this.error ? html`
        <div class="error-msg">
          <i class="ti ti-alert-circle error-icon" aria-hidden="true"></i>
          ${this.error}
        </div>` : ''}
    `;
  }
}

customElements.define('tbt-multiselect', TbtMultiselect);

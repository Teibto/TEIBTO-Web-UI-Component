/**
 * @component tbt-dropdown
 * @version 1.46.1
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
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';
import { watchOutsideClick } from './tbt-outside-click.js';

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
    readonly:    { type: Boolean, reflect: true },
    error:       { type: String, reflect: true },
    searchable:  { type: Boolean },
    /* Size to the longest option instead of filling the container — for
       compact filter usage in a section's actions slot (list pages), where
       the default width:100% collapses to min-content and truncates the
       placeholder ("ทุกสถ…"). */
    autoWidth:   { type: Boolean, attribute: 'auto-width', reflect: true },
    _open:       { state: true },
    _query:      { state: true },
    _activeIdx:  { state: true },
  };

  constructor() {
    super();
    this._internals = this.attachInternals();
    this.options = [];
    this.value = '';
    this.placeholder = 'Select…';
    this._open = false;
    this._query = '';
    this._activeIdx = -1;
    this._uid = `dd${Math.random().toString(36).slice(2, 8)}`;
  }

  connectedCallback() {
    super.connectedCallback();
    this._stopOutside = watchOutsideClick(this, () => { this._open = false; });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopOutside?.();
    this._stopOutside = null;
    if (this._repositionBound) {
      window.removeEventListener('scroll', this._repositionBound, true);
      window.removeEventListener('resize', this._repositionBound);
      this._repositionBound = null;
    }
  }

  updated(changed) {
    if (changed.has('_open')) {
      this.toggleAttribute('open', this._open);
      if (this._open && this.searchable) {
        this._query = '';
        this._activeIdx = -1;
        this.updateComplete.then(() => {
          this.shadowRoot.querySelector('.search input')?.focus();
        });
      }
      if (!this._open) this._activeIdx = -1;
      // Promote popup into the browser top layer via the HTML5 Popover API.
      // Top-layer elements escape ALL ancestor stacking contexts and overflow
      // clipping, while staying inside shadow DOM (so CSS rules still apply).
      // Browser support: Chrome 114+, Firefox 125+, Safari 17+.
      if (this.searchable) {
        const popup = this.shadowRoot?.querySelector('.dropdown');
        if (this._open) {
          if (popup) {
            if (!popup.hasAttribute('popover')) popup.setAttribute('popover', 'manual');
            try { popup.showPopover(); } catch (_) {}
          }
          this._positionPopup();
          this._repositionBound = () => this._positionPopup();
          window.addEventListener('scroll', this._repositionBound, true);
          window.addEventListener('resize', this._repositionBound);
        } else {
          if (popup) { try { popup.hidePopover(); } catch (_) {} }
          if (this._repositionBound) {
            window.removeEventListener('scroll', this._repositionBound, true);
            window.removeEventListener('resize', this._repositionBound);
            this._repositionBound = null;
          }
        }
      }
    }
  }

  _positionPopup() {
    const trigger = this.shadowRoot?.querySelector('.trigger');
    const popup   = this.shadowRoot?.querySelector('.dropdown');
    if (!trigger || !popup) return;
    const rect = trigger.getBoundingClientRect();
    const spaceBelow  = window.innerHeight - rect.bottom;
    const popupHeight = Math.min(popup.scrollHeight || 240, 240);
    const flipUp = spaceBelow < popupHeight + 8 && rect.top > popupHeight;
    popup.style.left   = `${rect.left}px`;
    popup.style.width  = `${rect.width}px`;
    popup.style.zIndex = '9999';
    if (flipUp) {
      popup.style.top    = '';
      popup.style.bottom = `${window.innerHeight - rect.top + 4}px`;
    } else {
      popup.style.bottom = '';
      popup.style.top    = `${rect.bottom + 4}px`;
    }
  }

  _toggleOpen() {
    if (!this.disabled && !this.readonly) this._open = !this._open;
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
    this._activeIdx = -1;
  }

  _onTriggerKeydown(e) {
    const opts = this._filteredOpts;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (this._open && this._activeIdx >= 0) {
        this._pick(opts[this._activeIdx].value);
      } else {
        this._toggleOpen();
      }
    } else if (e.key === 'Escape' && this._open) {
      e.preventDefault();
      this._open = false;
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!this._open) {
        this._open = true;
      } else {
        this._activeIdx = Math.min(this._activeIdx + 1, opts.length - 1);
      }
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

  get _filteredOpts() {
    const q = (this._query ?? '').toLowerCase();
    return q
      ? this.options.filter(o => String(o.label ?? '').toLowerCase().includes(q))
      : this.options;
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
    /* secondary (not muted): placeholder text must still meet 4.5:1 on card bg */
    select.placeholder-selected { color: var(--tbt-text-secondary); }
    :host([auto-width]) select,
    :host([auto-width]) .trigger { width: max-content; }
    :host([error]) select { border-color: var(--tbt-danger); }
    :host([disabled]) select { background: var(--tbt-bg-hover); cursor: not-allowed; opacity: 0.65; }
    :host([readonly]) select { background: var(--tbt-bg-hover); cursor: default; pointer-events: none; }
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
      box-sizing: border-box;   /* match <select> sizing so searchable vs native dropdown have equal height */
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
    .trigger.is-placeholder { color: var(--tbt-text-secondary); }
    :host([error]) .trigger { border-color: var(--tbt-danger); }
    :host([disabled]) .trigger { background: var(--tbt-bg-hover); cursor: not-allowed; opacity: 0.65; }
    :host([readonly]) .trigger { background: var(--tbt-bg-hover); cursor: default; pointer-events: none; }
    .dropdown {
      display: none;
      /* position: fixed + top-layer via popover attribute (set in JS).
         Top/left/width are set in JS from trigger's rect. Popover takes
         the element to browser top layer → escapes ALL stacking contexts
         and overflow boundaries, no portaling required.
         CRITICAL: browser default for [popover] is inset:0 + margin:auto
         which centers the popup in the viewport. We must clear all four
         insets so our inline top/left actually positions the popup. */
      position: fixed;
      inset: auto;          /* clears browser default inset:0 */
      background: var(--tbt-bg-card); border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-md); box-shadow: var(--tbt-shadow-md);
      z-index: 9999; max-height: 240px; overflow-y: auto;
      margin: 0; padding: 0; color: var(--tbt-text-primary);
    }
    .dropdown:popover-open { display: block; }
    :host([open]) .dropdown { display: block; }
    .option {
      display: flex; align-items: center; gap: var(--tbt-space-2);
      padding: 8px var(--tbt-space-3); cursor: pointer;
      font-size: var(--tbt-size-base); color: var(--tbt-text-primary);
      transition: background var(--tbt-transition-fast);
    }
    .option:hover { background: var(--tbt-bg-hover); }
    .option[data-kbd-active] { background: var(--tbt-bg-active); }
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
    [role="listbox"] { padding: var(--tbt-space-1) 0; }
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
        <div class="error-msg" role="alert">
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
          aria-label=${this.label || this.placeholder || nothing}
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
    const filtered = this._filteredOpts;
    const listboxId = `${this._uid}-listbox`;
    const activeId = this._activeIdx >= 0 && this._activeIdx < filtered.length
      ? `${this._uid}-opt-${filtered[this._activeIdx].value}`
      : nothing;
    return html`
      <div class="wrap">
        <div class="trigger ${isPlaceholder ? 'is-placeholder' : ''}"
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
          ${selected ? selected.label : this.placeholder}
        </div>
        <i class="ti ti-chevron-down chevron" aria-hidden="true"></i>
        <div class="dropdown">
          <div class="search" @click=${e => e.stopPropagation()}>
            <input type="text"
              aria-label="Search options"
              placeholder="Search…"
              .value=${this._query ?? ''}
              @input=${e => { this._query = e.target.value; this._activeIdx = -1; }}
              @keydown=${e => {
                const fo = this._filteredOpts;
                if (e.key === 'Escape') { e.preventDefault(); this._open = false; }
                else if (e.key === 'ArrowDown') { e.preventDefault(); this._activeIdx = Math.min(this._activeIdx + 1, fo.length - 1); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); this._activeIdx = Math.max(this._activeIdx - 1, 0); }
                else if (e.key === 'Home') { e.preventDefault(); this._activeIdx = 0; }
                else if (e.key === 'End') { e.preventDefault(); this._activeIdx = fo.length - 1; }
                else if (e.key === 'Enter' && this._activeIdx >= 0) { e.preventDefault(); this._pick(fo[this._activeIdx].value); }
              }}>
          </div>
          <div id=${listboxId} role="listbox" aria-label=${this.label || this.placeholder}>
            ${filtered.length === 0
              ? html`<div class="empty-msg">No options match</div>`
              : filtered.map((o, idx) => html`
                <div id="${this._uid}-opt-${o.value}"
                  class="option ${String(o.value) === String(this.value) ? 'selected' : ''}"
                  role="option"
                  aria-selected=${String(o.value) === String(this.value) ? 'true' : 'false'}
                  ?data-kbd-active=${idx === this._activeIdx}
                  @click=${() => this._pick(o.value)}>
                  ${o.label}
                </div>`)}
          </div>
        </div>
      </div>`;
  }
}

customElements.define('tbt-dropdown', TbtDropdown);

/**
 * @component tbt-color-picker
 * @version 1.45.1
 * @author Wichit Wongta
 *
 * Color swatch picker for ERP category and tag coloring.
 * Opens a palette popup on click; set allow-custom to also show a hex input.
 *
 * Usage:
 *   <tbt-color-picker
 *     label="Category color"
 *     value="#0D1171"
 *     allow-custom
 *     @tbt-change=${e => console.log(e.detail.value)}>
 *   </tbt-color-picker>
 *
 * Event: tbt-change → { value: string }  (hex, e.g. '#0D1171')
 *
 * @fires tbt-change - detail: { value: string }
 * @slot - (no slots — fully shadow-encapsulated)
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';

/* Default 20-color palette (4 cols × 5 rows).
 * Intentional hex data — color picker is exempt from Rule 1 lint (see lint-governance.js). */
const DEFAULT_PALETTE = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7',
  '#EC4899', '#F43F5E', '#64748B', '#94A3B8',
  '#0D1171', '#1E2B99', '#8B35C8', '#0F172A',
];

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/**
 * @fires tbt-change - Fired when selected color changes; detail: { value: string }
 */
class TbtColorPicker extends LitElement {
  static formAssociated = true;

  static properties = {
    label:       { type: String },
    name:        { type: String },
    value:       { type: String, reflect: true },
    palette:     { type: Array },
    allowCustom: { type: Boolean, attribute: 'allow-custom' },
    disabled:    { type: Boolean, reflect: true },
    required:    { type: Boolean, reflect: true },
    error:       { type: String, reflect: true },
    _open:       { state: true },
    _hex:        { state: true },
  };

  constructor() {
    super();
    this._internals = this.attachInternals();
    this.value = '';
    this.palette = DEFAULT_PALETTE;
    this.allowCustom = false;
    this._open = false;
    this._hex = '';
  }

  connectedCallback() {
    super.connectedCallback();
    this._onOutside = e => {
      if (!e.composedPath().includes(this)) this._close();
    };
    document.addEventListener('click', this._onOutside);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._onOutside);
  }

  _close() {
    this._open = false;
    this._hex = '';
  }

  _toggleOpen() {
    if (this.disabled) return;
    this._open = !this._open;
    if (this._open) this._hex = this.value || '';
  }

  _pick(color) {
    this.value = color.toUpperCase();
    this._internals.setFormValue(this.value);
    this.dispatchEvent(new CustomEvent('tbt-change', {
      detail: { value: this.value },
      bubbles: true, composed: true,
    }));
    this._close();
    this.updateComplete.then(() => {
      this.shadowRoot?.querySelector('.trigger')?.focus();
    });
  }

  _onHexInput(e) {
    this._hex = e.target.value;
  }

  _applyHex() {
    const val = this._hex.trim();
    if (HEX_RE.test(val)) this._pick(val);
  }

  _onHexKeydown(e) {
    if (e.key === 'Enter') { e.preventDefault(); this._applyHex(); }
    else if (e.key === 'Escape') { e.preventDefault(); this._close(); }
  }

  _onTriggerKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); this._toggleOpen();
    } else if (e.key === 'Escape' && this._open) {
      e.preventDefault(); this._close();
    } else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !this._open) {
      e.preventDefault();
      this._open = true;
      this._hex = this.value || '';
    }
  }

  _swatchKeydown(e, color, idx) {
    const len = (this.palette ?? DEFAULT_PALETTE).length;
    const cols = 4;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); this._pick(color);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this._close();
      this.shadowRoot?.querySelector('.trigger')?.focus();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.shadowRoot?.querySelectorAll('.swatch')[(idx + 1) % len]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.shadowRoot?.querySelectorAll('.swatch')[(idx - 1 + len) % len]?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.shadowRoot?.querySelectorAll('.swatch')[Math.min(idx + cols, len - 1)]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.shadowRoot?.querySelectorAll('.swatch')[Math.max(idx - cols, 0)]?.focus();
    }
  }

  updated(changed) {
    if (changed.has('_open')) {
      this.toggleAttribute('open', this._open);
      if (this._open) {
        this.updateComplete.then(() => {
          const swatches = this.shadowRoot?.querySelectorAll('.swatch');
          if (!swatches?.length) return;
          const palette = this.palette ?? DEFAULT_PALETTE;
          const selectedIdx = palette.findIndex(c => c.toUpperCase() === (this.value || '').toUpperCase());
          const target = selectedIdx >= 0 ? swatches[selectedIdx] : swatches[0];
          target?.focus();
        });
      }
    }
    if (changed.has('value') || changed.has('required')) {
      this._internals.setFormValue(this.value || '');
      this._syncValidity();
    }
  }

  _syncValidity() {
    if (this.required && !this.value) {
      this._internals.setValidity(
        { valueMissing: true },
        'Color is required',
        this.shadowRoot?.querySelector('.trigger') ?? this,
      );
    } else {
      this._internals.setValidity({});
    }
  }

  static styles = css`
    :host { display: block; font-family: var(--tbt-font); position: relative; }

    .label-row {
      display: flex; align-items: baseline; gap: var(--tbt-space-1);
      margin-bottom: var(--tbt-space-1);
    }
    label {
      font-size: var(--tbt-size-xs); font-weight: var(--tbt-weight-medium);
      color: var(--tbt-text-secondary); letter-spacing: 0.04em;
    }
    .required { color: var(--tbt-text-required); font-size: var(--tbt-size-xs); }

    .trigger {
      display: inline-flex; align-items: center; gap: var(--tbt-space-2);
      min-height: 38px; padding: 6px var(--tbt-space-3);
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
    :host([error]) .trigger { border-color: var(--tbt-danger); }
    :host([disabled]) .trigger { background: var(--tbt-bg-hover); cursor: not-allowed; opacity: 0.65; }

    .swatch-preview {
      width: 20px; height: 20px;
      border-radius: var(--tbt-radius-sm);
      border: 1px solid var(--tbt-border);
      flex-shrink: 0;
    }
    .swatch-preview.empty {
      background: repeating-linear-gradient(
        45deg,
        var(--tbt-border) 0, var(--tbt-border) 2px,
        transparent 2px, transparent 8px
      );
    }
    .hex-label {
      font-size: var(--tbt-size-sm); font-family: var(--tbt-font-mono);
      color: var(--tbt-text-secondary); user-select: none;
    }
    .chevron { font-size: 14px; color: var(--tbt-text-secondary); }

    .popup {
      display: none; position: absolute; top: calc(100% + 4px); left: 0;
      background: var(--tbt-bg-card); border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-lg); box-shadow: var(--tbt-shadow-md);
      padding: var(--tbt-space-3); z-index: var(--tbt-z-dropdown);
    }
    :host([open]) .popup { display: block; }

    .grid {
      display: grid; grid-template-columns: repeat(4, 28px); gap: var(--tbt-space-1);
    }

    .swatch {
      width: 28px; height: 28px; border-radius: var(--tbt-radius-sm);
      border: 2px solid transparent; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      outline: 0;
      transition: transform var(--tbt-transition-fast), border-color var(--tbt-transition-fast);
    }
    .swatch:hover { transform: scale(1.15); }
    .swatch:focus-visible {
      border-color: var(--tbt-primary-light);
      box-shadow: var(--tbt-shadow-focus);
    }
    .swatch.selected {
      border-color: var(--tbt-bg-card);
      box-shadow: 0 0 0 2px var(--tbt-primary-light);
    }
    .swatch .check {
      font-size: 14px; color: white;
      filter: drop-shadow(0 1px 1px rgba(0,0,0,0.5));
    }

    .hex-row {
      margin-top: var(--tbt-space-2); padding-top: var(--tbt-space-2);
      border-top: 1px solid var(--tbt-border);
      display: flex; gap: var(--tbt-space-1);
    }
    .hex-row input {
      flex: 1; min-width: 0; font-family: var(--tbt-font-mono);
      font-size: var(--tbt-size-sm); color: var(--tbt-text-primary);
      background: var(--tbt-bg-page); border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-sm); padding: 4px var(--tbt-space-2); outline: 0;
    }
    .hex-row input:focus {
      border-color: var(--tbt-primary-light); box-shadow: var(--tbt-shadow-focus);
    }
    .apply-btn {
      flex-shrink: 0; padding: 4px var(--tbt-space-2);
      background: var(--tbt-primary); color: white;
      border: none; border-radius: var(--tbt-radius-sm);
      cursor: pointer; font-size: var(--tbt-size-sm); font-family: inherit;
      transition: background var(--tbt-transition-fast);
    }
    .apply-btn:hover { background: var(--tbt-primary-dark); }
    .apply-btn:focus-visible { outline: 2px solid var(--tbt-primary-light); outline-offset: 2px; }

    .error-msg {
      margin-top: var(--tbt-space-1); font-size: var(--tbt-size-xs);
      color: var(--tbt-danger-text); display: flex; align-items: center; gap: 4px;
    }
    .error-icon { font-size: 12px; }
  `;

  render() {
    const palette = this.palette ?? DEFAULT_PALETTE;
    const hasValue = HEX_RE.test(this.value || '');
    const displayVal = hasValue ? this.value.toUpperCase() : 'None';
    const triggerLabel = this.label
      ? `${this.label}: ${displayVal}`
      : `Color picker: ${displayVal}`;

    return html`
      ${tablerLink}
      ${this.label ? html`
        <div class="label-row">
          <label>${this.label}</label>
          ${this.required ? html`<span class="required">*</span>` : ''}
        </div>` : ''}

      <div class="trigger"
        role="button"
        aria-haspopup="dialog"
        aria-expanded=${this._open ? 'true' : 'false'}
        aria-label=${triggerLabel}
        tabindex=${this.disabled ? '-1' : '0'}
        @click=${this._toggleOpen}
        @keydown=${this._onTriggerKeydown}>
        <span class="swatch-preview ${hasValue ? '' : 'empty'}"
          style=${hasValue ? `background:${this.value}` : nothing}
          aria-hidden="true"></span>
        <span class="hex-label">${displayVal}</span>
        <i class="ti ti-chevron-down chevron" aria-hidden="true"></i>
      </div>

      <div class="popup" role="dialog" aria-label="Choose color" aria-modal="true">
        <div class="grid" role="listbox" aria-label="Color palette">
          ${palette.map((color, i) => {
            const isSelected = color.toUpperCase() === (this.value || '').toUpperCase();
            return html`
              <div class="swatch ${isSelected ? 'selected' : ''}"
                style="background:${color}"
                role="option"
                aria-selected=${isSelected ? 'true' : 'false'}
                aria-label=${color.toUpperCase()}
                tabindex="0"
                @click=${() => this._pick(color)}
                @keydown=${e => this._swatchKeydown(e, color, i)}>
                ${isSelected
                  ? html`<i class="ti ti-check check" aria-hidden="true"></i>`
                  : nothing}
              </div>`;
          })}
        </div>
        ${this.allowCustom ? html`
          <div class="hex-row">
            <input type="text" placeholder="#000000" maxlength="7"
              aria-label="Custom hex color"
              .value=${this._hex}
              @input=${this._onHexInput}
              @keydown=${this._onHexKeydown}>
            <button class="apply-btn" type="button" aria-label="Apply hex color"
              @click=${this._applyHex}>
              <i class="ti ti-check" aria-hidden="true"></i>
            </button>
          </div>` : nothing}
      </div>

      ${this.error ? html`
        <div class="error-msg">
          <i class="ti ti-alert-circle error-icon" aria-hidden="true"></i>
          ${this.error}
        </div>` : nothing}
    `;
  }
}

customElements.define('tbt-color-picker', TbtColorPicker);

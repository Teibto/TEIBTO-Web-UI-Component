/**
 * @component tbt-split-button
 * @version 1.45.1
 * @author Wichit Wongta
 *
 * Split button — primary action + dropdown of secondary actions in one control.
 * Use for document workflows with multiple save modes.
 *
 * Usage:
 *   <tbt-split-button
 *     label="Save"
 *     icon="device-floppy"
 *     .actions=${[
 *       { value: 'submit', label: 'Save & Submit' },
 *       { value: 'print',  label: 'Save & Print',  icon: 'printer' },
 *       { value: 'draft',  label: 'Save as Draft', icon: 'file' },
 *     ]}
 *     @tbt-click=${() => save()}
 *     @tbt-action=${e => saveAs(e.detail.value)}>
 *   </tbt-split-button>
 *
 * Events:
 *   tbt-click  — main button clicked (no detail)
 *   tbt-action — secondary action selected: { value: string, label: string }
 *
 * @fires tbt-click  - Fired when main button is clicked
 * @fires tbt-action - Fired when secondary action is selected; detail: { value: string, label: string }
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';
import { ICON_ALIASES } from './tbt-icon.js';
import { watchOutsideClick } from './tbt-outside-click.js';

/**
 * @fires tbt-click  - Fired when main button is clicked
 * @fires tbt-action - Fired when secondary action is selected; detail: { value: string, label: string }
 */
class TbtSplitButton extends LitElement {
  static properties = {
    label:   { type: String },
    variant: { type: String, reflect: true },
    icon:    { type: String },
    actions: { type: Array },
    loading: { type: Boolean, reflect: true },
    disabled:{ type: Boolean, reflect: true },
    size:    { type: String, reflect: true },
    _open:   { state: true },
  };

  constructor() {
    super();
    this.variant = 'primary';
    this.size    = 'md';
    this.actions = [];
    this._open   = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this._stopOutside = watchOutsideClick(this, () => this._close());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopOutside?.();
    this._stopOutside = null;
  }

  _close() { this._open = false; }

  _toggleOpen() {
    if (this.disabled || this.loading) return;
    this._open = !this._open;
  }

  _onMainClick() {
    if (this.disabled || this.loading) return;
    this.dispatchEvent(new CustomEvent('tbt-click', { bubbles: true, composed: true }));
  }

  _pickAction(action) {
    if (action.disabled) return;
    this.dispatchEvent(new CustomEvent('tbt-action', {
      detail: { value: action.value, label: action.label },
      bubbles: true, composed: true,
    }));
    this._close();
    this.updateComplete.then(() => {
      this.shadowRoot?.querySelector('.chev-btn')?.focus();
    });
  }

  _onChevKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); this._toggleOpen();
    } else if (e.key === 'Escape' && this._open) {
      e.preventDefault(); this._close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!this._open) this._open = true;
      this.updateComplete.then(() => {
        this.shadowRoot?.querySelector('.menu-item:not(:disabled)')?.focus();
      });
    }
  }

  _onMenuKeydown(e) {
    const items = [...(this.shadowRoot?.querySelectorAll('.menu-item:not(:disabled)') ?? [])];
    const cur = items.indexOf(e.currentTarget);
    if (e.key === 'Escape') {
      e.preventDefault();
      this._close();
      this.shadowRoot?.querySelector('.chev-btn')?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[Math.min(cur + 1, items.length - 1)]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cur <= 0) { this._close(); this.shadowRoot?.querySelector('.chev-btn')?.focus(); }
      else items[cur - 1]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault(); items[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault(); items[items.length - 1]?.focus();
    } else if (e.key === 'Tab') {
      this._close();
    }
  }

  updated(changed) {
    if (changed.has('_open')) {
      this.toggleAttribute('open', this._open);
      if (this._open) {
        this.updateComplete.then(() => {
          this.shadowRoot?.querySelector('.menu-item:not(:disabled)')?.focus();
        });
      }
    }
  }

  static styles = css`
    :host {
      display: inline-block;
      font-family: var(--tbt-font);
      position: relative;
    }

    .wrap {
      display: inline-flex;
      border-radius: var(--tbt-radius-md);
      overflow: hidden;
    }

    .main-btn, .chev-btn {
      display: inline-flex; align-items: center; justify-content: center;
      font-family: inherit; font-weight: var(--tbt-weight-medium);
      border: none; cursor: pointer; outline: 0;
      transition: background var(--tbt-transition-fast), filter var(--tbt-transition-fast);
      white-space: nowrap;
    }
    .main-btn { gap: var(--tbt-space-2); }
    .main-btn:focus-visible, .chev-btn:focus-visible {
      box-shadow: var(--tbt-shadow-focus); outline: 0; position: relative; z-index: 1;
    }
    .main-btn:active:not(:disabled), .chev-btn:active:not(:disabled) {
      transform: translateY(1px);
    }

    /* ── Sizes ───────────────────────────────── */
    .main-btn { font-size: var(--tbt-size-base); padding: 8px var(--tbt-space-4); min-height: 38px; }
    .chev-btn { font-size: 14px; width: 34px; min-height: 38px; }

    :host([size="sm"]) .main-btn { font-size: var(--tbt-size-sm); padding: 5px var(--tbt-space-3); min-height: 30px; }
    :host([size="sm"]) .chev-btn { font-size: 12px; width: 28px; min-height: 30px; }
    :host([size="lg"]) .main-btn { font-size: var(--tbt-size-md); padding: 10px var(--tbt-space-5); min-height: 46px; }
    :host([size="lg"]) .chev-btn { font-size: 16px; width: 40px; min-height: 46px; }

    /* ── Primary (default) ───────────────────── */
    .main-btn, .chev-btn {
      background: var(--tbt-primary); color: var(--tbt-text-inverse);
    }
    .main-btn:hover:not(:disabled) { background: var(--tbt-primary-dark); }
    .chev-btn:hover:not(:disabled) { background: var(--tbt-primary-dark); }
    .chev-btn { border-left: 1px solid var(--tbt-primary-dark); }

    /* ── Secondary ───────────────────────────── */
    :host([variant="secondary"]) .wrap { border: 1px solid var(--tbt-border); }
    :host([variant="secondary"]) .main-btn,
    :host([variant="secondary"]) .chev-btn {
      background: var(--tbt-bg-card); color: var(--tbt-text-primary);
    }
    :host([variant="secondary"]) .main-btn:hover:not(:disabled),
    :host([variant="secondary"]) .chev-btn:hover:not(:disabled) { background: var(--tbt-bg-hover); }
    :host([variant="secondary"]) .chev-btn { border-left: 1px solid var(--tbt-border-strong); }

    /* ── Danger ──────────────────────────────── */
    :host([variant="danger"]) .main-btn,
    :host([variant="danger"]) .chev-btn {
      background: var(--tbt-danger); color: var(--tbt-text-inverse);
    }
    :host([variant="danger"]) .main-btn:hover:not(:disabled),
    :host([variant="danger"]) .chev-btn:hover:not(:disabled) { filter: brightness(0.92); }
    :host([variant="danger"]) .chev-btn { border-left: 1px solid var(--tbt-danger-text); }

    /* ── Ghost ───────────────────────────────── */
    :host([variant="ghost"]) .main-btn,
    :host([variant="ghost"]) .chev-btn {
      background: transparent; color: var(--tbt-text-secondary);
    }
    :host([variant="ghost"]) .main-btn:hover:not(:disabled),
    :host([variant="ghost"]) .chev-btn:hover:not(:disabled) {
      background: var(--tbt-bg-hover); color: var(--tbt-text-primary);
    }
    :host([variant="ghost"]) .wrap { border: 1px solid var(--tbt-border); }
    :host([variant="ghost"]) .chev-btn { border-left: 1px solid var(--tbt-border); }

    /* ── Disabled / Loading ──────────────────── */
    :host([disabled]) .main-btn, :host([disabled]) .chev-btn,
    :host([loading]) .main-btn, :host([loading]) .chev-btn {
      opacity: 0.55; cursor: not-allowed;
    }

    /* ── Spinner ─────────────────────────────── */
    .spinner {
      width: 14px; height: 14px;
      border: 2px solid currentColor; border-right-color: transparent;
      border-radius: 50%; animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Dropdown menu ───────────────────────── */
    .dropdown {
      display: none; position: absolute; top: calc(100% + 4px); right: 0;
      min-width: 190px; background: var(--tbt-bg-card);
      border: 1px solid var(--tbt-border); border-radius: var(--tbt-radius-md);
      box-shadow: var(--tbt-shadow-md); z-index: var(--tbt-z-dropdown);
      padding: var(--tbt-space-1) 0;
    }
    :host([open]) .dropdown { display: block; }

    .menu-item {
      display: flex; align-items: center; gap: var(--tbt-space-2);
      width: 100%; box-sizing: border-box;
      padding: 8px var(--tbt-space-3);
      font-family: inherit; font-size: var(--tbt-size-base);
      color: var(--tbt-text-primary); background: none;
      border: none; text-align: left; cursor: pointer; outline: 0;
      transition: background var(--tbt-transition-fast);
    }
    .menu-item:hover:not(:disabled) { background: var(--tbt-bg-hover); }
    .menu-item:focus-visible { background: var(--tbt-bg-active); }
    .menu-item:disabled { opacity: 0.5; cursor: not-allowed; }
  `;

  render() {
    const label = this.label ?? '';
    return html`
      ${tablerLink}
      <div class="wrap">
        <button class="main-btn" type="button"
          ?disabled=${this.disabled || this.loading}
          @click=${this._onMainClick}>
          ${this.loading
            ? html`<span class="spinner" aria-hidden="true"></span>`
            : (this.icon ? html`<i class="ti ti-${ICON_ALIASES[this.icon] ?? this.icon}" aria-hidden="true"></i>` : nothing)}
          ${label}
        </button>
        <button class="chev-btn" type="button"
          ?disabled=${this.disabled || this.loading}
          aria-haspopup="menu"
          aria-expanded=${this._open ? 'true' : 'false'}
          aria-label="More actions"
          @click=${e => { e.stopPropagation(); this._toggleOpen(); }}
          @keydown=${this._onChevKeydown}>
          <i class="ti ti-chevron-down" aria-hidden="true"></i>
        </button>
      </div>
      <div class="dropdown" role="menu" aria-label="${label}: more actions">
        ${(this.actions ?? []).map(action => html`
          <button class="menu-item" type="button" role="menuitem"
            ?disabled=${action.disabled ?? false}
            @click=${() => this._pickAction(action)}
            @keydown=${this._onMenuKeydown}>
            ${action.icon
              ? html`<i class="ti ti-${ICON_ALIASES[action.icon] ?? action.icon}" aria-hidden="true"></i>`
              : nothing}
            ${action.label}
          </button>`)}
      </div>
    `;
  }
}

customElements.define('tbt-split-button', TbtSplitButton);

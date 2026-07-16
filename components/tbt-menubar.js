/**
 * @component tbt-menubar, tbt-menu-item, tbt-menu-group
 * @version 1.45.1
 * @author Wichit Wongta
 *
 * Top navigation bar with logo, flat menu items, and grouped dropdown menus.
 *
 * Usage:
 *   <tbt-menubar logo="/path/to/logo.png" title="Teibto ERP">
 *     <tbt-menu-item href="/dashboard" label="หน้าหลัก" active></tbt-menu-item>
 *     <tbt-menu-group label="ขาย">
 *       <tbt-menu-item href="/quotation" label="ใบเสนอราคา"></tbt-menu-item>
 *       <tbt-menu-item href="/sales-order" label="Sales order"></tbt-menu-item>
 *     </tbt-menu-group>
 *     <tbt-menu-group label="จัดซื้อ">
 *       <tbt-menu-item href="/purchase-order" label="Purchase order"></tbt-menu-item>
 *     </tbt-menu-group>
 *   </tbt-menubar>
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';
import { ICON_ALIASES } from './tbt-icon.js';

/**
 * @fires tbt-menu-toggle - Fired when hamburger button clicked on mobile
 * @slot - Navigation items (tbt-menu-item, tbt-menu-group)
 * @slot end - Right-side actions (icons, user menu)
 */
class TbtMenubar extends LitElement {
  static properties = {
    logo:     { type: String },
    title:    { type: String },
    _compact: { state: true }
  };

  constructor() {
    super();
    this._compact = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this._ro = new ResizeObserver(([e]) => {
      const compact = e.contentRect.width <= 768;
      if (compact !== this._compact) this._compact = compact;
    });
    this._ro.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._ro?.disconnect();
  }

  static styles = css`
    :host {
      display: block;
      background: var(--tbt-accent-gradient);
      font-family: var(--tbt-font);
    }
    nav {
      display: flex;
      align-items: center;
      height: 56px;
      padding: 0 var(--tbt-space-5);
      gap: var(--tbt-space-4);
    }
    .hamburger {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px; height: 36px;
      border: none; background: none;
      border-radius: var(--tbt-radius-md);
      cursor: pointer;
      color: rgba(255,255,255,0.85);
      font-size: 22px;
      flex-shrink: 0;
      transition: background var(--tbt-transition-fast), color var(--tbt-transition-fast);
    }
    .hamburger:hover { background: rgba(255,255,255,0.15); color: var(--tbt-text-inverse); }
    .brand {
      display: flex;
      align-items: center;
      gap: var(--tbt-space-2);
      text-decoration: none;
      flex-shrink: 0;
      margin-right: var(--tbt-space-4);
    }
    .brand img {
      height: 28px;
      width: auto;
    }
    .brand-title {
      font-size: var(--tbt-size-md);
      font-weight: var(--tbt-weight-semibold);
      color: var(--tbt-text-inverse);
      letter-spacing: -0.01em;
    }
    .items {
      display: flex;
      align-items: center;
      gap: var(--tbt-space-1);
      flex: 1;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .items::-webkit-scrollbar { display: none; }
    .end-slot {
      margin-left: auto;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: var(--tbt-space-2);
    }
  `;

  _toggleNav() {
    this.dispatchEvent(new CustomEvent('tbt-menu-toggle', { bubbles: true, composed: true }));
  }

  render() {
    return html`
      ${tablerLink}
      <nav>
        ${this._compact ? html`
          <button class="hamburger" @click=${this._toggleNav} aria-label="Open navigation">
            <i class="ti ti-menu-2" aria-hidden="true"></i>
          </button>
        ` : ''}
        <a class="brand" href="#">
          ${this.logo ? html`<img src=${this.logo} alt="logo">` : ''}
          ${this.title ? html`<span class="brand-title">${this.title}</span>` : ''}
        </a>
        ${!this._compact ? html`
          <div class="items"><slot></slot></div>
        ` : ''}
        <div class="end-slot">
          <slot name="end"></slot>
        </div>
      </nav>
    `;
  }
}

customElements.define('tbt-menubar', TbtMenubar);

class TbtMenuItem extends LitElement {
  static properties = {
    href:   { type: String },
    label:  { type: String, reflect: true },
    active: { type: Boolean, reflect: true },
    icon:   { type: String }
  };

  static styles = css`
    :host { display: inline-block; }
    a {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: var(--tbt-radius-md);
      font-size: var(--tbt-size-sm);
      font-weight: var(--tbt-weight-medium);
      color: var(--_item-color, rgba(255,255,255,0.75));
      text-decoration: none;
      white-space: nowrap;
      transition: background var(--tbt-transition-fast), color var(--tbt-transition-fast);
      font-family: var(--tbt-font);
    }
    a:hover {
      background: var(--_item-hover-bg, rgba(255,255,255,0.12));
      color: var(--_item-hover-color, var(--tbt-text-inverse));
    }
    :host([active]) a {
      background: var(--_item-active-bg, rgba(255,255,255,0.18));
      color: var(--_item-active-color, var(--tbt-text-inverse));
    }
    .icon { font-size: 15px; line-height: 1; }
  `;

  render() {
    return html`
      ${tablerLink}
      <a href=${this.href || '#'}
         aria-current=${this.active ? 'page' : nothing}>
        ${this.icon ? html`<i class="ti ti-${ICON_ALIASES[this.icon] ?? this.icon} icon" aria-hidden="true"></i>` : ''}
        ${this.label}
      </a>
    `;
  }
}

customElements.define('tbt-menu-item', TbtMenuItem);

/**
 * @slot - tbt-menu-item elements
 */
class TbtMenuGroup extends LitElement {
  static properties = {
    label: { type: String },
    icon:  { type: String },
    _open: { state: true }
  };

  constructor() {
    super();
    this._open = false;
  }

  static styles = css`
    :host { display: inline-block; position: relative; }
    .trigger {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: var(--tbt-radius-md);
      font-size: var(--tbt-size-sm);
      font-weight: var(--tbt-weight-medium);
      color: rgba(255,255,255,0.75);
      cursor: pointer;
      white-space: nowrap;
      transition: background var(--tbt-transition-fast), color var(--tbt-transition-fast);
      font-family: var(--tbt-font);
      background: none;
      border: none;
      user-select: none;
    }
    .trigger:hover,
    :host([open]) .trigger {
      background: rgba(255,255,255,0.12);
      color: var(--tbt-text-inverse);
    }
    .icon { font-size: 15px; line-height: 1; }
    .chevron {
      font-size: 11px;
      transition: transform var(--tbt-transition-base);
      opacity: 0.75;
    }
    :host([open]) .chevron { transform: rotate(180deg); }
    .dropdown {
      display: none;
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      min-width: 180px;
      background: var(--tbt-bg-card);
      border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-md);
      box-shadow: var(--tbt-shadow-md);
      z-index: var(--tbt-z-dropdown);
      padding: var(--tbt-space-1) 0;
      overflow: hidden;
      --_item-color:        var(--tbt-text-secondary);
      --_item-hover-bg:     var(--tbt-bg-hover);
      --_item-hover-color:  var(--tbt-text-primary);
      --_item-active-bg:    var(--tbt-primary-bg);
      --_item-active-color: var(--tbt-primary);
    }
    :host([open]) .dropdown { display: block; }
    ::slotted(tbt-menu-item) { display: block; }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._onOutsideClick = (e) => {
      if (!e.composedPath().includes(this)) this._open = false;
    };
    document.addEventListener('click', this._onOutsideClick);
    // Host-level so Escape closes the menu whether focus is on the trigger
    // or on a slotted menu item (keydown bubbles up to the host).
    this._onKeydown = (e) => {
      if (e.key === 'Escape' && this._open) {
        e.stopPropagation();
        this._open = false;
        this.shadowRoot.querySelector('.trigger')?.focus();
      }
    };
    this.addEventListener('keydown', this._onKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._onOutsideClick);
    this.removeEventListener('keydown', this._onKeydown);
  }

  _toggle() { this._open = !this._open; }

  _onTriggerKeydown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this._open = true;
      this.updateComplete.then(() => {
        const first = this.querySelector('tbt-menu-item');
        (first?.shadowRoot?.querySelector('a') || first)?.focus?.();
      });
    }
  }

  updated(changed) {
    if (changed.has('_open')) {
      this.toggleAttribute('open', this._open);
    }
  }

  render() {
    return html`
      ${tablerLink}
      <button class="trigger"
        aria-haspopup="menu"
        aria-expanded=${this._open ? 'true' : 'false'}
        @click=${this._toggle}
        @keydown=${this._onTriggerKeydown}>
        ${this.icon ? html`<i class="ti ti-${ICON_ALIASES[this.icon] ?? this.icon} icon" aria-hidden="true"></i>` : ''}
        ${this.label}
        <span class="chevron" aria-hidden="true">▾</span>
      </button>
      <div class="dropdown" role="menu">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('tbt-menu-group', TbtMenuGroup);

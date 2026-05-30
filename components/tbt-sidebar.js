/**
 * @component tbt-sidebar, tbt-sidebar-item
 * @version 1.43.0
 * @author Wichit Wongta
 *
 * Collapsible left-side navigation panel.
 *
 * Usage:
 *   <tbt-sidebar collapsible>
 *     <div slot="brand">…logo + title…</div>
 *     <tbt-sidebar-item icon="home"         label="Dashboard"  href="/dashboard"></tbt-sidebar-item>
 *     <tbt-sidebar-item icon="file-invoice" label="เอกสาร"     active></tbt-sidebar-item>
 *     <div slot="footer">…user block + actions…</div>
 *   </tbt-sidebar>
 *
 * Slots:
 *   (default) — tbt-sidebar-item elements
 *   brand     — top header (logo + title); hidden when empty
 *   footer    — bottom block (user info + actions); hidden when empty
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';

/**
 * @fires tbt-sidebar-toggle - Fired when sidebar collapsed/expanded; detail: { collapsed: boolean }
 * @slot        - tbt-sidebar-item elements
 * @slot brand  - Top header block (logo + title); hidden when empty
 * @slot footer - Bottom block (user info + actions); hidden when empty
 */
class TbtSidebar extends LitElement {
  static properties = {
    collapsible: { type: Boolean, reflect: true },
    collapsed:   { type: Boolean, reflect: true }
  };

  constructor() {
    super();
    this.collapsible = false;
    this.collapsed = false;
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      background: var(--tbt-bg-card);
      border-right: 1px solid var(--tbt-border);
      width: 220px;
      height: 100%;          /* fill the parent (sidebar-slot) height */
      transition: width var(--tbt-transition-base);
      overflow-x: hidden;    /* clip for collapse animation */
      font-family: var(--tbt-font);
      /* item state vars — inherited by tbt-sidebar-item children */
      --_lbl-max-width: 200px;
      --_lbl-opacity: 1;
      --_item-gap: var(--tbt-space-3);
      --_item-justify: flex-start;
      --_item-ph: var(--tbt-space-3);
    }
    :host([collapsed]) {
      width: 52px;
      --_lbl-max-width: 0px;
      --_lbl-opacity: 0;
      --_item-gap: 0px;
      --_item-justify: center;
      --_item-ph: 8px;
    }
    .toggle-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      background: none;
      border-radius: var(--tbt-radius-sm);
      cursor: pointer;
      color: var(--tbt-text-secondary);
      font-size: 16px;
      flex-shrink: 0;
      transition: background var(--tbt-transition-fast);
    }
    .toggle-btn:hover {
      background: var(--tbt-bg-hover);
      color: var(--tbt-text-primary);
    }
    nav {
      padding: var(--tbt-space-2) 0;
      flex: 1;               /* fill remaining vertical space */
      overflow-y: auto;      /* scroll nav items when they overflow */
    }
    .brand,
    .footer {
      display: none;         /* default hidden — shown via :has() / [collapsible] when present */
      align-items: center;
      gap: var(--tbt-space-3);
      padding: var(--tbt-space-3) var(--tbt-space-4);
      flex-shrink: 0;
      min-height: 56px;
    }
    /* Brand row also hosts the collapse toggle — visible whenever slotted OR collapsible */
    .brand:has(*),
    :host([collapsible]) .brand {
      display: flex;
      border-bottom: 1px solid var(--tbt-border);
    }
    .footer:has(*) {
      display: flex;
      border-top: 1px solid var(--tbt-border);
    }
    :host([collapsed]) .brand,
    :host([collapsed]) .footer {
      padding: var(--tbt-space-3) 8px;
      justify-content: center;
      gap: 0;
    }
  `;

  _toggle() {
    this.collapsed = !this.collapsed;
    this.dispatchEvent(new CustomEvent('tbt-sidebar-toggle', {
      detail: { collapsed: this.collapsed },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      ${tablerLink}
      <div class="brand">
        <slot name="brand"></slot>
        ${this.collapsible ? html`
          <button class="toggle-btn" @click=${this._toggle} aria-label="Toggle sidebar">
            <i class="ti ti-${this.collapsed ? 'layout-sidebar-right' : 'layout-sidebar'}" aria-hidden="true"></i>
          </button>` : ''}
      </div>
      <nav>
        <slot></slot>
      </nav>
      <div class="footer">
        <slot name="footer"></slot>
      </div>
    `;
  }
}

customElements.define('tbt-sidebar', TbtSidebar);

class TbtSidebarItem extends LitElement {
  static properties = {
    icon:   { type: String },
    label:  { type: String },
    href:   { type: String },
    active: { type: Boolean, reflect: true }
  };

  static styles = css`
    :host { display: block; }
    a {
      display: flex;
      align-items: center;
      gap: var(--_item-gap, var(--tbt-space-3));
      padding: 9px var(--_item-ph, var(--tbt-space-3));
      justify-content: var(--_item-justify, flex-start);
      margin: 1px var(--tbt-space-2);
      border-radius: var(--tbt-radius-md);
      font-size: var(--tbt-size-sm);
      font-weight: var(--tbt-weight-medium);
      color: var(--tbt-text-secondary);
      text-decoration: none;
      white-space: nowrap;
      transition: background var(--tbt-transition-fast), color var(--tbt-transition-fast),
                  gap var(--tbt-transition-base), padding var(--tbt-transition-base);
      font-family: var(--tbt-font);
    }
    a:hover {
      background: var(--tbt-bg-hover);
      color: var(--tbt-text-primary);
    }
    :host([active]) a {
      background: var(--tbt-primary-bg);
      color: var(--tbt-primary);
    }
    .icon {
      font-size: 18px;
      line-height: 1;
      flex-shrink: 0;
      width: 20px;
      text-align: center;
    }
    .lbl {
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: var(--_lbl-max-width, 200px);
      opacity: var(--_lbl-opacity, 1);
      transition: max-width var(--tbt-transition-base), opacity var(--tbt-transition-base);
    }
  `;

  render() {
    return html`
      ${tablerLink}
      <a href=${this.href || '#'} title=${this.label || ''}
         aria-current=${this.active ? 'page' : nothing}>
        ${this.icon ? html`<i class="ti ti-${this.icon} icon" aria-hidden="true"></i>` : ''}
        <span class="lbl">${this.label}</span>
      </a>
    `;
  }
}

customElements.define('tbt-sidebar-item', TbtSidebarItem);

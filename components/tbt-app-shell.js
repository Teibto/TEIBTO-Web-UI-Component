/**
 * @component tbt-app-shell
 * @version 1.26.0
 * @author Wichit Wongta
 *
 * Page-level layout wrapper. Provides menubar slot at top, optional
 * sidebar slot on left, and main content area.
 * On mobile (≤768px) the sidebar becomes a slide-in drawer overlay.
 *
 * Usage:
 *   <tbt-app-shell>
 *     <tbt-menubar slot="menubar" logo="..." title="Teibto ERP"></tbt-menubar>
 *     <tbt-sidebar slot="sidebar">...</tbt-sidebar>
 *     <main slot="content">
 *       <!-- page content -->
 *     </main>
 *   </tbt-app-shell>
 *
 *   <!-- Without sidebar -->
 *   <tbt-app-shell no-sidebar>
 *     <tbt-menubar slot="menubar"></tbt-menubar>
 *     <main slot="content">...</main>
 *   </tbt-app-shell>
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

/**
 * @slot menubar - Top navigation bar (tbt-menubar)
 * @slot sidebar - Left navigation panel (tbt-sidebar)
 * @slot content - Main page content area
 * @slot - Additional content (same as content slot)
 */
class TbtAppShell extends LitElement {
  static properties = {
    noSidebar:   { type: Boolean, attribute: 'no-sidebar', reflect: true },
    _mobileOpen: { state: true }
  };

  constructor() {
    super();
    this._mobileOpen = false;
  }

  connectedCallback() {
    super.connectedCallback();
    // Track compact mode via menubar width (same threshold as tbt-menubar)
    this._ro = new ResizeObserver(([e]) => {
      const compact = e.contentRect.width <= 768;
      this.toggleAttribute('compact', compact);
      if (!compact) this._mobileOpen = false;
    });
    this._ro.observe(this);

    this._onMenuToggle = () => {
      this._mobileOpen = !this._mobileOpen;
      if (this._mobileOpen) {
        const sidebar = this.querySelector('[slot="sidebar"]');
        if (sidebar) sidebar.collapsed = false;
      }
    };
    this._onSidebarNav = (e) => {
      if (this._mobileOpen && e.composedPath().some(el => el.tagName === 'TBT-SIDEBAR-ITEM')) {
        this._mobileOpen = false;
      }
    };
    this.addEventListener('tbt-menu-toggle', this._onMenuToggle);
    this.addEventListener('click', this._onSidebarNav);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._ro?.disconnect();
    this.removeEventListener('tbt-menu-toggle', this._onMenuToggle);
    this.removeEventListener('click', this._onSidebarNav);
  }

  _closeMobile() {
    this._mobileOpen = false;
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;       /* constrain to viewport so sidebar + content can scroll internally */
      background: var(--tbt-bg-page);
      font-family: var(--tbt-font);
    }
    .menubar-slot {
      position: sticky;
      top: 0;
      z-index: var(--tbt-z-sticky);
      flex-shrink: 0;
    }
    .body {
      display: flex;
      flex: 1;
      min-height: 0;       /* allow children with overflow:auto to scroll instead of pushing body taller */
      overflow: hidden;
    }
    .sidebar-slot {
      flex-shrink: 0;
    }
    :host([no-sidebar]) .sidebar-slot {
      display: none;
    }
    .content-slot {
      flex: 1;
      overflow-y: auto;
      padding: var(--tbt-space-5) var(--tbt-space-6);
    }

    /* ── Mobile drawer ─────────────────────────────────── */
    @media (max-width: 768px) {
      .content-slot {
        padding: var(--tbt-space-4);
      }
      /* CSS fallback — hides sidebar instantly on first paint, before ResizeObserver fires */
      .sidebar-slot {
        position: fixed;
        top: 56px; left: 0; bottom: 0;
        z-index: 800;
        transform: translateX(-100%);
        transition: transform 200ms ease;
        --_sidebar-toggle-display: none;
      }
    }
    /* JS-driven compact mode — activated by ResizeObserver (component width ≤ 768px) */
    :host([compact]) .sidebar-slot {
      position: fixed;
      top: 56px; left: 0; bottom: 0;
      z-index: 800;
      transform: translateX(-100%);
      transition: transform 200ms ease;
      --_sidebar-toggle-display: none;
    }
    :host([compact]) .sidebar-slot.open {
      transform: translateX(0);
      box-shadow: 4px 0 24px rgb(0 0 0 / 0.18);
    }
    :host([compact][no-sidebar]) .sidebar-slot {
      display: none;
    }
    .backdrop {
      position: fixed;
      top: 56px; left: 0; right: 0; bottom: 0;
      z-index: 799;
      background: rgb(15 23 42 / 0.45);
      backdrop-filter: blur(2px);
      cursor: pointer;
    }
  `;

  render() {
    return html`
      <div class="menubar-slot">
        <slot name="menubar"></slot>
      </div>
      <div class="body">
        ${this._mobileOpen
          ? html`<div class="backdrop" @click=${this._closeMobile}></div>`
          : ''}
        <div class="sidebar-slot ${this._mobileOpen ? 'open' : ''}">
          <slot name="sidebar"></slot>
        </div>
        <div class="content-slot">
          <slot name="content"></slot>
          <slot></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('tbt-app-shell', TbtAppShell);

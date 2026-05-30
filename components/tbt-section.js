/**
 * @component tbt-section
 * @version 1.43.0
 * @author Wichit Wongta
 *
 * Collapsible card section. Container for grouped fields or content.
 * Supports a named "actions" slot in the header for buttons/tools.
 *
 * Usage:
 *   <tbt-section title="Purchase order info">
 *     <tbt-field-grid columns="4">...</tbt-field-grid>
 *   </tbt-section>
 *
 *   <tbt-section title="Line items" collapsed>
 *     <!-- starts collapsed -->
 *   </tbt-section>
 *
 *   <tbt-section title="Items">
 *     <tbt-button slot="actions" variant="primary" icon="plus">Add item</tbt-button>
 *     <tbt-table ...></tbt-table>
 *   </tbt-section>
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';

/**
 * @fires tbt-section-toggle - Fired when section collapsed/expanded; detail: { collapsed: boolean }
 * @slot actions - Action buttons displayed in section header
 * @slot - Section body content
 */
class TbtSection extends LitElement {
  static properties = {
    title:     { type: String },
    collapsed: { type: Boolean, reflect: true },
    icon:      { type: String },
    notCollapsible: { type: Boolean, attribute: 'not-collapsible', reflect: true },
  };

  static styles = css`
    :host {
      display: block;
      background: var(--tbt-bg-card);
      border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-lg);
      margin-bottom: var(--tbt-space-4);
      /* overflow: visible — allow dropdown/popover popups inside the section
         to escape past the section edge (otherwise overflow:hidden clips them
         and the popup gets covered by the next section). */
      overflow: visible;
      font-family: var(--tbt-font);
      box-shadow: var(--tbt-shadow-sm);
    }
    header {
      display: flex;
      align-items: center;
      padding: var(--tbt-space-4) var(--tbt-space-5);
      transition: background var(--tbt-transition-fast);
      /* Round only the top corners so hover background follows the host radius. */
      border-radius: var(--tbt-radius-lg) var(--tbt-radius-lg) 0 0;
    }
    header:hover {
      background: var(--tbt-bg-hover);
    }
    .toggle-btn {
      display: flex;
      align-items: center;
      gap: var(--tbt-space-2);
      flex: 1;
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      user-select: none;
      text-align: left;
      min-width: 0;
      color: inherit;
      font: inherit;
    }
    .toggle-btn:focus-visible {
      outline: 2px solid var(--tbt-primary);
      outline-offset: 2px;
      border-radius: var(--tbt-radius-sm);
    }
    .chevron {
      font-size: 14px;
      color: var(--tbt-text-secondary);
      transition: transform var(--tbt-transition-base);
      line-height: 1;
    }
    :host([collapsed]) .chevron {
      transform: rotate(-90deg);
    }
    .icon {
      font-size: 16px;
      color: var(--tbt-text-secondary);
    }
    .title-text {
      margin: 0;
      flex: 1;
      font-size: var(--tbt-size-base);
      font-weight: var(--tbt-weight-medium);
      color: var(--tbt-text-primary);
      line-height: 1.4;
      min-width: 0;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: var(--tbt-space-2);
    }
    .body {
      padding: var(--tbt-space-2) var(--tbt-space-5) var(--tbt-space-5);
    }
    :host([collapsed]) .body {
      display: none;
    }
    /* not-collapsible: hide chevron + neutralize toggle button cursor.
       Header still shows the title and slot=actions normally. */
    :host([not-collapsible]) .chevron     { display: none; }
    :host([not-collapsible]) .toggle-btn  { cursor: default; }
    :host([not-collapsible]) .toggle-btn:focus-visible { outline: none; box-shadow: none; }
    :host([not-collapsible]) header:hover { background: transparent; }
  `;

  toggle() {
    if (this.notCollapsible) return;
    this.collapsed = !this.collapsed;
    this.dispatchEvent(new CustomEvent('tbt-section-toggle', {
      detail: { collapsed: this.collapsed },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      ${tablerLink}
      <header>
        <button class="toggle-btn" @click=${this.toggle}
          aria-expanded=${!this.collapsed}
          aria-controls="section-body">
          <span class="chevron" aria-hidden="true">▾</span>
          ${this.icon ? html`<i class="ti ti-${this.icon} icon" aria-hidden="true"></i>` : ''}
          <span class="title-text">${this.title}</span>
        </button>
        <div class="actions" @click=${e => e.stopPropagation()}>
          <slot name="actions"></slot>
        </div>
      </header>
      <div id="section-body" class="body">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('tbt-section', TbtSection);

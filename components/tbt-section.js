/**
 * @component tbt-section
 * @version 1.24.2
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
    icon:      { type: String }
  };

  static styles = css`
    :host {
      display: block;
      background: var(--tbt-bg-card);
      border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-lg);
      margin-bottom: var(--tbt-space-4);
      overflow: hidden;
      font-family: var(--tbt-font);
      box-shadow: var(--tbt-shadow-sm);
    }
    header {
      display: flex;
      align-items: center;
      gap: var(--tbt-space-2);
      padding: var(--tbt-space-4) var(--tbt-space-5);
      cursor: pointer;
      user-select: none;
      transition: background var(--tbt-transition-fast);
    }
    header:hover {
      background: var(--tbt-bg-hover);
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
    h3 {
      margin: 0;
      flex: 1;
      font-size: var(--tbt-size-base);
      font-weight: var(--tbt-weight-medium);
      color: var(--tbt-text-primary);
      line-height: 1.4;
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
  `;

  toggle() {
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
      <header @click=${this.toggle} role="button" aria-expanded=${!this.collapsed}>
        <span class="chevron" aria-hidden="true">▾</span>
        ${this.icon ? html`<i class="ti ti-${this.icon} icon" aria-hidden="true"></i>` : ''}
        <h3>${this.title}</h3>
        <div class="actions" @click=${e => e.stopPropagation()}>
          <slot name="actions"></slot>
        </div>
      </header>
      <div class="body">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('tbt-section', TbtSection);

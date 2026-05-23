/**
 * @component tbt-breadcrumb
 * @version 1.24.1
 * @author Wichit Wongta
 *
 * Navigation breadcrumb trail for ERP page hierarchy.
 * Last item is treated as the current page (non-clickable).
 *
 * Usage:
 *   <tbt-breadcrumb .items=${[
 *     { label: 'Home',     href: '/ns/app/center/card.nl' },
 *     { label: 'Purchase', href: '/ns/app/accounting/purchase/purchaseorder.nl' },
 *     { label: 'PO-2569-0042' },
 *   ]}></tbt-breadcrumb>
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

class TbtBreadcrumb extends LitElement {
  static properties = {
    items: { type: Array },
  };

  constructor() {
    super();
    this.items = [];
  }

  static styles = css`
    :host { display: block; font-family: var(--tbt-font); }
    nav {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 2px;
      font-size: var(--tbt-size-sm);
      color: var(--tbt-text-secondary);
    }
    .item {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    a {
      color: var(--tbt-primary);
      text-decoration: none;
      border-radius: var(--tbt-radius-sm);
      padding: 1px 4px;
      transition: background var(--tbt-transition-fast), color var(--tbt-transition-fast);
    }
    a:hover {
      background: var(--tbt-primary-bg);
      color: var(--tbt-primary-text);
      text-decoration: underline;
    }
    a:focus-visible {
      outline: 2px solid var(--tbt-primary-light);
      outline-offset: 1px;
    }
    .current {
      color: var(--tbt-text-primary);
      font-weight: var(--tbt-weight-medium);
      padding: 1px 4px;
    }
    .sep {
      color: var(--tbt-text-muted);
      user-select: none;
      font-size: 11px;
      margin: 0 2px;
    }
  `;

  render() {
    if (!this.items.length) return html``;
    return html`
      <nav aria-label="breadcrumb">
        <ol style="display:contents;list-style:none;margin:0;padding:0">
          ${this.items.map((item, i) => {
            const isLast = i === this.items.length - 1;
            return html`
              <li class="item">
                ${isLast
                  ? html`<span class="current" aria-current="page">${item.label}</span>`
                  : html`<a href=${item.href || '#'}>${item.label}</a>`}
                ${!isLast ? html`<span class="sep" aria-hidden="true">›</span>` : ''}
              </li>
            `;
          })}
        </ol>
      </nav>
    `;
  }
}

customElements.define('tbt-breadcrumb', TbtBreadcrumb);

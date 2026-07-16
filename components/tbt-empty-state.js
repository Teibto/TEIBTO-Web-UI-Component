/**
 * @component tbt-empty-state
 * @version 1.45.1
 * @author Wichit Wongta
 *
 * Empty state display for tables, lists, and search results with no data.
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';
import { ICON_ALIASES } from './tbt-icon.js';

class TbtEmptyState extends LitElement {
  static properties = {
    icon:        { type: String },
    title:       { type: String },
    description: { type: String },
    size:        { type: String, reflect: true },
  };

  static styles = css`
    :host {
      display: block;
      text-align: center;
      padding: var(--tbt-space-10) var(--tbt-space-4);
      font-family: var(--tbt-font);
    }

    .icon-wrap {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: var(--tbt-bg-hover);
      color: var(--tbt-text-muted);
      font-size: 40px;
      margin: 0 auto var(--tbt-space-4);
    }
    :host([size="sm"]) .icon-wrap {
      width: 56px;
      height: 56px;
      font-size: 28px;
    }
    :host([size="lg"]) .icon-wrap {
      width: 100px;
      height: 100px;
      font-size: 50px;
    }

    .title {
      margin: 0 0 var(--tbt-space-2);
      font-size: var(--tbt-size-md);
      font-weight: var(--tbt-weight-semibold);
      color: var(--tbt-text-primary);
    }
    :host([size="sm"]) .title {
      font-size: var(--tbt-size-base);
    }
    :host([size="lg"]) .title {
      font-size: var(--tbt-size-lg);
    }

    .description {
      margin: 0 auto var(--tbt-space-4);
      max-width: 360px;
      font-size: var(--tbt-size-base);
      color: var(--tbt-text-secondary);
      line-height: 1.6;
    }

    .actions {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--tbt-space-2);
      flex-wrap: wrap;
      margin-top: var(--tbt-space-2);
    }
  `;

  render() {
    return html`
      ${tablerLink}
      <div class="icon-wrap" aria-hidden="true">
        <i class="ti ti-${ICON_ALIASES[this.icon] ?? (this.icon || 'inbox')}"></i>
      </div>
      <p class="title">${this.title || 'No data'}</p>
      ${this.description ? html`<p class="description">${this.description}</p>` : nothing}
      <div class="actions"><slot name="actions"></slot></div>
    `;
  }
}

customElements.define('tbt-empty-state', TbtEmptyState);

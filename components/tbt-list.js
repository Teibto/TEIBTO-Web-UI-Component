/**
 * @component tbt-list + tbt-list-item
 * @version 1.46.0
 * @author Wichit Wongta
 *
 * Vertical data list with label/value rows, optional icons, and per-item action slot.
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';
import { ICON_ALIASES } from './tbt-icon.js';

// ─── tbt-list-item ────────────────────────────────────────────────────────

class TbtListItem extends LitElement {
  static properties = {
    label: { type: String },
    value: { type: String },
    icon:  { type: String },
    muted: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host {
      display: block;
      font-family: var(--tbt-font);
    }
    :host([muted]) .label,
    :host([muted]) .value-col { opacity: 0.45; }

    .item {
      display: flex;
      align-items: center;
      gap: var(--tbt-space-2);
      padding: var(--tbt-list-item-padding, var(--tbt-space-3)) 0;
      border-bottom: var(--tbt-list-item-border, none);
    }

    .icon-col {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 20px;
      color: var(--tbt-text-muted);
      font-size: var(--tbt-list-item-font-size, var(--tbt-size-sm));
    }

    .label {
      flex-shrink: 0;
      width: var(--tbt-list-label-width, 140px);
      font-size: var(--tbt-list-item-font-size, var(--tbt-size-sm));
      font-weight: var(--tbt-weight-medium);
      color: var(--tbt-text-secondary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .value-col {
      flex: 1;
      min-width: 0;
      font-size: var(--tbt-list-item-font-size, var(--tbt-size-sm));
      color: var(--tbt-text-primary);
      text-align: right;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .action-col {
      flex-shrink: 0;
      margin-left: var(--tbt-space-1);
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'listitem');
  }

  render() {
    return html`
      ${tablerLink}
      <div class="item">
        ${this.icon ? html`
          <div class="icon-col" aria-hidden="true">
            <i class="ti ti-${ICON_ALIASES[this.icon] ?? this.icon}"></i>
          </div>
        ` : nothing}
        <span class="label">${this.label}</span>
        <div class="value-col">
          <slot>${this.value !== undefined ? this.value : nothing}</slot>
        </div>
        <div class="action-col"><slot name="action"></slot></div>
      </div>
    `;
  }
}

customElements.define('tbt-list-item', TbtListItem);

// ─── tbt-list ─────────────────────────────────────────────────────────────

class TbtList extends LitElement {
  static properties = {
    compact: { type: Boolean, reflect: true },
    divided: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host {
      display: block;
      font-family: var(--tbt-font);
    }
    :host([compact]) {
      --tbt-list-item-padding: var(--tbt-space-2);
      --tbt-list-item-font-size: var(--tbt-size-xs);
    }
    :host([divided]) {
      --tbt-list-item-border: 1px solid var(--tbt-border);
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
  `;

  render() {
    return html`<ul role="list"><slot></slot></ul>`;
  }
}

customElements.define('tbt-list', TbtList);

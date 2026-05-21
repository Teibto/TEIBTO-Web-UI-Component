/**
 * @component tbt-subtab, tbt-tab
 * @version 1.0.0
 * @author Wichit Wongta
 *
 * Horizontal tab navigation for subtabs within a page section.
 * Tab bar scrolls horizontally on mobile.
 *
 * Usage:
 *   <tbt-subtab active="items" @tbt-tab-change=${e => console.log(e.detail.name)}>
 *     <tbt-tab name="items" label="Items">
 *       <!-- content -->
 *     </tbt-tab>
 *     <tbt-tab name="billing" label="Billing & shipping">
 *       <!-- content -->
 *     </tbt-tab>
 *   </tbt-subtab>
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

class TbtSubtab extends LitElement {
  static properties = {
    active: { type: String, reflect: true }
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
    .bar {
      display: flex;
      overflow-x: auto;
      border-bottom: 1px solid var(--tbt-border);
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .bar::-webkit-scrollbar { display: none; }
    button {
      padding: 12px 16px;
      font-family: inherit;
      font-size: var(--tbt-size-base);
      color: var(--tbt-text-secondary);
      cursor: pointer;
      background: none;
      border: 0;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      white-space: nowrap;
      flex-shrink: 0;
      transition: color var(--tbt-transition-fast),
                  border-color var(--tbt-transition-fast);
    }
    button:hover { color: var(--tbt-text-primary); }
    button[aria-selected="true"] {
      color: var(--tbt-primary);
      font-weight: var(--tbt-weight-medium);
      border-bottom-color: var(--tbt-primary);
    }
    .panels {
      padding: var(--tbt-space-5);
    }
    ::slotted(tbt-tab) { display: none; }
    ::slotted(tbt-tab[active]) { display: block; }
  `;

  firstUpdated() { this._syncTabs(); }

  updated(changed) {
    if (changed.has('active')) this._syncTabs();
  }

  _syncTabs() {
    this.querySelectorAll('tbt-tab').forEach(t => {
      t.toggleAttribute('active', t.getAttribute('name') === this.active);
    });
  }

  _select(name) {
    this.active = name;
    this.dispatchEvent(new CustomEvent('tbt-tab-change', {
      detail: { name },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    const tabs = Array.from(this.querySelectorAll('tbt-tab') || []);
    return html`
      <div class="bar" role="tablist">
        ${tabs.map(t => html`
          <button
            role="tab"
            aria-selected=${t.getAttribute('name') === this.active}
            @click=${() => this._select(t.getAttribute('name'))}>
            ${t.getAttribute('label')}
          </button>
        `)}
      </div>
      <div class="panels">
        <slot @slotchange=${() => this.requestUpdate()}></slot>
      </div>
    `;
  }
}

customElements.define('tbt-subtab', TbtSubtab);

class TbtTab extends LitElement {
  static properties = {
    name:   { type: String, reflect: true },
    label:  { type: String, reflect: true },
    active: { type: Boolean, reflect: true }
  };

  static styles = css`
    :host { display: none; }
    :host([active]) { display: block; }
  `;

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define('tbt-tab', TbtTab);

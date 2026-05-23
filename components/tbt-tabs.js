/**
 * @component tbt-tabs
 * @version 1.24.0
 * @author Wichit Wongta
 *
 * Horizontal tab switcher with client-side panels.
 * Each panel is a <tbt-tabs-panel> child element.
 *
 * Usage:
 *   <tbt-tabs active="0" @tbt-change=${e => console.log(e.detail.active, e.detail.label)}>
 *     <tbt-tabs-panel label="Details">Details content here</tbt-tabs-panel>
 *     <tbt-tabs-panel label="History">History content here</tbt-tabs-panel>
 *     <tbt-tabs-panel label="Notes">Notes content here</tbt-tabs-panel>
 *   </tbt-tabs>
 *
 * Event: tbt-change → { active: number, label: string }
 *
 * @slot - tbt-tabs-panel elements
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

// ── Panel element ──────────────────────────────────────────────────────────────

class TbtTabsPanel extends LitElement {
  static _uid = 0;

  static properties = {
    label:  { type: String },
    active: { type: Boolean, reflect: true },
  };

  static styles = css`
    :host         { display: none; }
    :host([active]) { display: block; }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'tabpanel');
    if (!this.id) this.id = `tbt-tabs-panel-${++TbtTabsPanel._uid}`;
    if (this.label && !this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', this.label);
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define('tbt-tabs-panel', TbtTabsPanel);

// ── Container element ──────────────────────────────────────────────────────────

/**
 * @fires tbt-change - Fired when active tab changes; detail: { active: number, label: string }
 * @slot - tbt-tab elements
 */
class TbtTabs extends LitElement {
  static properties = {
    active:  { type: Number, reflect: true },
    _labels: { state: true },
  };

  constructor() {
    super();
    this.active  = 0;
    this._labels = [];
  }

  _tabs() {
    return [...this.querySelectorAll(':scope > tbt-tabs-panel')];
  }

  _onSlotChange() {
    const tabs = this._tabs();
    this._labels = tabs.map(t => t.label ?? '');
    if (this.active >= this._labels.length) {
      this.active = Math.max(0, this._labels.length - 1);
    }
    this._sync();
  }

  _select(i) {
    this.active = i;
    this._sync();
    this.updateComplete.then(() => {
      this.shadowRoot.querySelectorAll('[role="tab"]')[i]?.focus();
    });
    this.dispatchEvent(new CustomEvent('tbt-change', {
      detail: { active: i, label: this._labels[i] ?? '' },
      bubbles: true,
      composed: true,
    }));
  }

  _sync() {
    this._tabs().forEach((t, i) => { t.active = i === this.active; });
  }

  updated(changed) {
    if (changed.has('active')) this._sync();
  }

  _onKeydown(e) {
    const len = this._labels.length;
    if (!len) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); this._select((this.active + 1) % len); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); this._select((this.active - 1 + len) % len); }
    else if (e.key === 'Home') { e.preventDefault(); this._select(0); }
    else if (e.key === 'End')  { e.preventDefault(); this._select(len - 1); }
  }

  static styles = css`
    :host { display: block; font-family: var(--tbt-font); }

    .tab-bar {
      display: flex;
      border-bottom: 2px solid var(--tbt-border);
      gap: 0;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .tab-bar::-webkit-scrollbar { display: none; }

    .tab {
      padding: var(--tbt-space-2) var(--tbt-space-4);
      font-family: inherit;
      font-size: var(--tbt-size-base);
      font-weight: var(--tbt-weight-medium);
      color: var(--tbt-text-secondary);
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      cursor: pointer;
      white-space: nowrap;
      transition: color var(--tbt-transition-fast), border-color var(--tbt-transition-fast);
    }
    .tab:hover { color: var(--tbt-text-primary); }
    .tab:focus-visible {
      outline: 2px solid var(--tbt-primary-light);
      outline-offset: -2px;
      border-radius: var(--tbt-radius-sm) var(--tbt-radius-sm) 0 0;
    }
    .tab[aria-selected="true"] {
      color: var(--tbt-primary-text);
      border-bottom-color: var(--tbt-primary);
    }

    .panels { padding-top: var(--tbt-space-4); }
  `;

  render() {
    const tabs = this._tabs();
    return html`
      <div class="tab-bar" role="tablist" @keydown=${this._onKeydown}>
        ${this._labels.map((label, i) => html`
          <button
            class="tab"
            role="tab"
            tabindex=${this.active === i ? '0' : '-1'}
            aria-selected=${this.active === i ? 'true' : 'false'}
            aria-controls=${tabs[i]?.id ?? ''}
            @click=${() => this._select(i)}>
            ${label}
          </button>`)}
      </div>
      <div class="panels">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
    `;
  }
}

customElements.define('tbt-tabs', TbtTabs);

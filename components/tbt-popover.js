/**
 * @component tbt-popover
 * @version 1.45.0
 * @author Wichit Wongta
 *
 * Click-triggered floating panel for action menus, info cards, and quick forms.
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

class TbtPopover extends LitElement {
  static properties = {
    open:      { type: Boolean, reflect: true },
    placement: { type: String, reflect: true },
  };

  static styles = css`
    :host {
      display: inline-flex;
      position: relative;
      font-family: var(--tbt-font);
    }

    .trigger { display: inline-flex; align-items: center; }

    /* ── Panel ── */
    .popover {
      position: absolute;
      z-index: 9998;
      min-width: 180px;
      max-width: 320px;
      background: var(--tbt-bg-card);
      border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-md);
      box-shadow: var(--tbt-shadow-md);
      opacity: 0;
      pointer-events: none;
      transition: opacity 150ms ease, transform 150ms ease;
      /* default: bottom */
      top: calc(100% + 8px);
      left: 0;
      transform: translateY(-4px);
    }
    :host([open]) .popover {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }

    /* ── Top ── */
    :host([placement="top"]) .popover {
      top: auto;
      bottom: calc(100% + 8px);
      transform: translateY(4px);
    }
    :host([open][placement="top"]) .popover { transform: translateY(0); }

    /* ── Right ── */
    :host([placement="right"]) .popover {
      top: 0;
      left: calc(100% + 8px);
      transform: translateX(-4px);
    }
    :host([open][placement="right"]) .popover { transform: translateX(0); }

    /* ── Left ── */
    :host([placement="left"]) .popover {
      top: 0;
      right: calc(100% + 8px);
      left: auto;
      transform: translateX(4px);
    }
    :host([open][placement="left"]) .popover { transform: translateX(0); }
  `;

  constructor() {
    super();
    this.open = false;
    this.placement = 'bottom';
    this._docClickHandler = null;
    this._docKeyHandler = null;
  }

  firstUpdated() {
    this._syncTriggerAria();
    this.shadowRoot?.querySelector('slot:not([name])')
      ?.addEventListener('slotchange', () => this._syncTriggerAria());
  }

  updated(changedProps) {
    if (!changedProps.has('open')) return;
    this._syncTriggerAria();
    if (this.open) {
      this._docClickHandler = (e) => {
        if (!e.composedPath().includes(this)) this._doClose();
      };
      this._docKeyHandler = (e) => {
        if (e.key === 'Escape') this._doClose();
      };
      document.addEventListener('click', this._docClickHandler);
      document.addEventListener('keydown', this._docKeyHandler);
    } else {
      document.removeEventListener('click', this._docClickHandler);
      document.removeEventListener('keydown', this._docKeyHandler);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._docClickHandler);
    document.removeEventListener('keydown', this._docKeyHandler);
  }

  _syncTriggerAria() {
    const slot = this.shadowRoot?.querySelector('slot:not([name])');
    for (const el of (slot?.assignedElements({ flatten: true }) ?? [])) {
      el.setAttribute('aria-expanded', String(this.open));
      el.setAttribute('aria-haspopup', 'dialog');
    }
  }

  _doClose() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('tbt-close', { bubbles: true, composed: true }));
  }

  _onTriggerClick(e) {
    e.stopPropagation();
    if (this.open) {
      this._doClose();
    } else {
      this.open = true;
      this.dispatchEvent(new CustomEvent('tbt-open', { bubbles: true, composed: true }));
    }
  }

  render() {
    return html`
      <div class="trigger" @click=${this._onTriggerClick}>
        <slot></slot>
      </div>
      <div
        class="popover"
        role="dialog"
        aria-hidden=${this.open ? nothing : 'true'}>
        <slot name="content"></slot>
      </div>
    `;
  }
}

customElements.define('tbt-popover', TbtPopover);

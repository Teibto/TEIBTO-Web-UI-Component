/**
 * @component tbt-tooltip
 * @version 1.46.0
 * @author Wichit Wongta
 *
 * Tooltip that appears on hover / focus above the slotted trigger element.
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

class TbtTooltip extends LitElement {
  static properties = {
    content:   { type: String },
    placement: { type: String, reflect: true },
    delay:     { type: Number },
    _visible:  { state: true },
  };

  static styles = css`
    :host {
      display: inline-flex;
      position: relative;
      font-family: var(--tbt-font);
    }

    .trigger {
      display: inline-flex;
      align-items: center;
    }

    /* ── Tooltip bubble ── */
    .tip {
      position: absolute;
      z-index: 9999;
      pointer-events: none;
      padding: 4px 8px;
      border-radius: var(--tbt-radius-sm);
      background: var(--tbt-text-primary);
      color: var(--tbt-bg-card);
      font-size: var(--tbt-size-xs);
      font-weight: var(--tbt-weight-medium);
      white-space: nowrap;
      line-height: 1.4;
      opacity: 0;
      transition: opacity var(--tbt-transition-fast);
      /* default: top */
      bottom: calc(100% + 7px);
      left: 50%;
      transform: translateX(-50%);
    }
    .tip.visible { opacity: 1; }

    /* ── Arrow ── */
    .tip::after {
      content: '';
      position: absolute;
      border: 4px solid transparent;
      /* default: top — arrow points down */
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border-top-color: var(--tbt-text-primary);
    }

    /* ── Placement: bottom ── */
    :host([placement="bottom"]) .tip {
      top: calc(100% + 7px);
      bottom: auto;
      left: 50%;
      transform: translateX(-50%);
    }
    :host([placement="bottom"]) .tip::after {
      top: auto;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border-top-color: transparent;
      border-bottom-color: var(--tbt-text-primary);
    }

    /* ── Placement: left ── */
    :host([placement="left"]) .tip {
      top: 50%;
      bottom: auto;
      left: auto;
      right: calc(100% + 7px);
      transform: translateY(-50%);
    }
    :host([placement="left"]) .tip::after {
      top: 50%;
      left: 100%;
      transform: translateY(-50%);
      border-top-color: transparent;
      border-left-color: var(--tbt-text-primary);
    }

    /* ── Placement: right ── */
    :host([placement="right"]) .tip {
      top: 50%;
      bottom: auto;
      left: calc(100% + 7px);
      transform: translateY(-50%);
    }
    :host([placement="right"]) .tip::after {
      top: 50%;
      right: 100%;
      left: auto;
      transform: translateY(-50%);
      border-top-color: transparent;
      border-right-color: var(--tbt-text-primary);
    }
  `;

  constructor() {
    super();
    this._visible = false;
    this.placement = 'top';
    this.delay = 200;
    this._timer = null;
    this._uid = `tbt-tip-${Math.random().toString(36).slice(2, 9)}`;
  }

  _show() {
    clearTimeout(this._timer);
    if (!this.content) return;
    if (this.delay > 0) {
      this._timer = setTimeout(() => { this._visible = true; }, this.delay);
    } else {
      this._visible = true;
    }
  }

  _hide() {
    clearTimeout(this._timer);
    this._visible = false;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this._timer);
  }

  render() {
    return html`
      <div
        class="trigger"
        aria-describedby=${this._uid}
        @mouseenter=${this._show}
        @mouseleave=${this._hide}
        @focusin=${this._show}
        @focusout=${this._hide}>
        <slot></slot>
      </div>
      <div
        id=${this._uid}
        role="tooltip"
        class="tip ${this._visible ? 'visible' : ''}">
        ${this.content}
      </div>
    `;
  }
}

customElements.define('tbt-tooltip', TbtTooltip);

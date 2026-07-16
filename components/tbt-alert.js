/**
 * @component tbt-alert
 * @version 1.45.0
 * @author Wichit Wongta
 *
 * Alert banner for feedback messages. Inline (non-blocking) by default.
 * Supports dismiss button and custom icon.
 *
 * Usage:
 *   <tbt-alert variant="success">Document saved successfully.</tbt-alert>
 *   <tbt-alert variant="danger" title="Validation error">
 *     Please fill in all required fields before saving.
 *   </tbt-alert>
 *   <tbt-alert variant="warning" dismissible>
 *     Your session will expire in 5 minutes.
 *   </tbt-alert>
 *   <tbt-alert variant="info" icon="info-circle">
 *     This form will auto-save every 30 seconds.
 *   </tbt-alert>
 *
 * Event: tbt-dismiss (when dismiss button clicked)
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';

const VARIANT_ICONS = {
  success: 'circle-check',
  warning: 'alert-triangle',
  danger:  'alert-circle',
  info:    'info-circle',
  neutral: 'info-circle'
};

/**
 * @fires tbt-dismiss - Fired when dismiss button clicked
 * @slot - Alert message content
 */
class TbtAlert extends LitElement {
  static properties = {
    variant:     { type: String, reflect: true },
    title:       { type: String },
    icon:        { type: String },
    dismissible: { type: Boolean, reflect: true },
    _dismissed:  { state: true }
  };

  constructor() {
    super();
    this.variant = 'info';
    this._dismissed = false;
  }

  static styles = css`
    :host {
      display: block;
      font-family: var(--tbt-font);
    }
    :host([hidden]), .dismissed { display: none !important; }
    .alert {
      display: flex;
      gap: var(--tbt-space-3);
      padding: var(--tbt-space-3) var(--tbt-space-4);
      border-radius: var(--tbt-radius-md);
      border: 1px solid transparent;
      background: var(--tbt-info-bg);
      border-color: var(--tbt-info);
      color: var(--tbt-info-text);
      font-size: var(--tbt-size-sm);
      line-height: var(--tbt-leading-normal);
    }
    .alert-icon {
      font-size: 18px;
      line-height: 1;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .body { flex: 1; }
    .title {
      font-weight: var(--tbt-weight-semibold);
      margin-bottom: 2px;
    }
    .dismiss {
      background: none;
      border: none;
      cursor: pointer;
      color: inherit;
      opacity: 0.6;
      font-size: 16px;
      padding: 0;
      line-height: 1;
      flex-shrink: 0;
      align-self: flex-start;
      margin-top: 1px;
    }
    .dismiss:hover { opacity: 1; }

    /* Variants */
    :host([variant="success"]) .alert {
      background: var(--tbt-success-bg);
      border-color: var(--tbt-success);
      color: var(--tbt-success-text);
    }
    :host([variant="warning"]) .alert {
      background: var(--tbt-warning-bg);
      border-color: var(--tbt-warning);
      color: var(--tbt-warning-text);
    }
    :host([variant="danger"]) .alert {
      background: var(--tbt-danger-bg);
      border-color: var(--tbt-danger);
      color: var(--tbt-danger-text);
    }
    :host([variant="neutral"]) .alert {
      background: var(--tbt-neutral-bg);
      border-color: var(--tbt-border-strong);
      color: var(--tbt-neutral-text);
    }
  `;

  _dismiss() {
    this._dismissed = true;
    this.dispatchEvent(new CustomEvent('tbt-dismiss', { bubbles: true, composed: true }));
  }

  render() {
    if (this._dismissed) return html``;
    const iconName = this.icon || VARIANT_ICONS[this.variant] || 'info-circle';
    return html`
      ${tablerLink}
      <div class="alert" role="alert">
        <i class="ti ti-${iconName} alert-icon" aria-hidden="true"></i>
        <div class="body">
          ${this.title ? html`<div class="title">${this.title}</div>` : ''}
          <slot></slot>
        </div>
        ${this.dismissible ? html`
          <button class="dismiss" @click=${this._dismiss} aria-label="Dismiss">
            <i class="ti ti-x" aria-hidden="true"></i>
          </button>` : ''}
      </div>
    `;
  }
}

customElements.define('tbt-alert', TbtAlert);

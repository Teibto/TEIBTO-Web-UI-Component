/**
 * @component tbt-badge
 * @version 1.46.1
 * @author Wichit Wongta
 *
 * Status pill for showing document state, category, or count.
 *
 * Usage:
 *   <tbt-badge>Approved</tbt-badge>
 *   <tbt-badge variant="warning">Pending</tbt-badge>
 *   <tbt-badge variant="danger">Rejected</tbt-badge>
 *   <tbt-badge variant="neutral">Draft</tbt-badge>
 *   <tbt-badge variant="info">In review</tbt-badge>
 *   <tbt-badge variant="primary">Active</tbt-badge>
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

/**
 * @slot - Badge label text
 */
class TbtBadge extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    size:    { type: String, reflect: true }
  };

  constructor() {
    super();
    this.variant = 'success';
    this.size = 'md';
  }

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      font-family: var(--tbt-font);
      font-size: var(--tbt-size-xs);
      font-weight: var(--tbt-weight-medium);
      padding: 3px 10px;
      border-radius: var(--tbt-radius-pill);
      line-height: 1.4;
      background: var(--tbt-success-bg);
      color: var(--tbt-success-text);
      white-space: nowrap;
    }
    :host([variant="warning"]) {
      background: var(--tbt-warning-bg);
      color: var(--tbt-warning-text);
    }
    :host([variant="danger"]) {
      background: var(--tbt-danger-bg);
      color: var(--tbt-danger-text);
    }
    :host([variant="info"]) {
      background: var(--tbt-info-bg);
      color: var(--tbt-info-text);
    }
    :host([variant="neutral"]) {
      background: var(--tbt-neutral-bg);
      color: var(--tbt-neutral-text);
    }
    :host([variant="primary"]) {
      background: var(--tbt-primary-bg);
      color: var(--tbt-primary-text);
    }
    :host([size="sm"]) {
      font-size: 10px;
      padding: 2px 8px;
    }
    :host([size="lg"]) {
      font-size: var(--tbt-size-sm);
      padding: 4px 12px;
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define('tbt-badge', TbtBadge);

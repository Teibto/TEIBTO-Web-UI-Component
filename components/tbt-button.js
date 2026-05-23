/**
 * @component tbt-button
 * @version 1.24.2
 * @author Wichit Wongta
 *
 * Standard action button with brand variants.
 *
 * Usage:
 *   <tbt-button variant="primary">Save</tbt-button>
 *   <tbt-button variant="secondary">Cancel</tbt-button>
 *   <tbt-button variant="danger">Delete</tbt-button>
 *   <tbt-button variant="ghost" icon="printer">Print</tbt-button>
 *   <tbt-button variant="primary" loading>Saving…</tbt-button>
 *   <tbt-button variant="accent">Gradient button</tbt-button>
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';

/**
 * @slot - Button label text
 */
class TbtButton extends LitElement {
  static properties = {
    variant:  { type: String, reflect: true },
    icon:     { type: String },
    loading:  { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    size:     { type: String, reflect: true }
  };

  constructor() {
    super();
    this.variant = 'primary';
    this.size = 'md';
  }

  static styles = css`
    :host {
      display: inline-block;
      font-family: var(--tbt-font);
    }
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--tbt-space-2);
      font-family: inherit;
      font-size: var(--tbt-size-base);
      font-weight: var(--tbt-weight-medium);
      line-height: 1;
      padding: 10px 16px;
      border-radius: var(--tbt-radius-md);
      border: 1px solid transparent;
      cursor: pointer;
      transition: background var(--tbt-transition-base),
                  color var(--tbt-transition-base),
                  border-color var(--tbt-transition-base);
      white-space: nowrap;
      min-height: 40px;
    }
    button:focus-visible {
      outline: 0;
      box-shadow: var(--tbt-shadow-focus);
    }
    button:active:not(:disabled) {
      transform: translateY(1px);
    }

    /* Primary — Navy Blue */
    :host([variant="primary"]) button {
      background: var(--tbt-primary);
      color: var(--tbt-text-inverse);
    }
    :host([variant="primary"]) button:hover:not(:disabled) {
      background: var(--tbt-primary-dark);
    }

    /* Secondary */
    :host([variant="secondary"]) button {
      background: var(--tbt-bg-card);
      color: var(--tbt-text-primary);
      border-color: var(--tbt-border);
    }
    :host([variant="secondary"]) button:hover:not(:disabled) {
      background: var(--tbt-bg-hover);
    }

    /* Danger */
    :host([variant="danger"]) button {
      background: var(--tbt-danger);
      color: var(--tbt-text-inverse);
    }
    :host([variant="danger"]) button:hover:not(:disabled) {
      filter: brightness(0.92);
    }

    /* Ghost */
    :host([variant="ghost"]) button {
      background: transparent;
      color: var(--tbt-text-secondary);
    }
    :host([variant="ghost"]) button:hover:not(:disabled) {
      background: var(--tbt-bg-hover);
      color: var(--tbt-text-primary);
    }

    /* Accent — gradient from logo O */
    :host([variant="accent"]) button {
      background: var(--tbt-accent-gradient);
      color: var(--tbt-text-inverse);
      border: none;
    }
    :host([variant="accent"]) button:hover:not(:disabled) {
      filter: brightness(1.08);
    }

    /* Sizes */
    :host([size="sm"]) button {
      font-size: var(--tbt-size-sm);
      padding: 6px 12px;
      min-height: 32px;
    }
    :host([size="lg"]) button {
      font-size: var(--tbt-size-md);
      padding: 12px 20px;
      min-height: 48px;
    }

    /* States */
    :host([disabled]) button,
    :host([loading]) button {
      opacity: 0.55;
      cursor: not-allowed;
    }

    /* Spinner */
    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .icon {
      font-size: 16px;
      line-height: 1;
    }
  `;

  _handleClick(e) {
    if (this.disabled || this.loading) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  render() {
    return html`
      ${tablerLink}
      <button
        ?disabled=${this.disabled || this.loading}
        @click=${this._handleClick}>
        ${this.loading
          ? html`<span class="spinner" aria-hidden="true"></span>`
          : (this.icon ? html`<i class="ti ti-${this.icon} icon" aria-hidden="true"></i>` : '')}
        <slot></slot>
      </button>
    `;
  }
}

customElements.define('tbt-button', TbtButton);

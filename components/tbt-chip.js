/**
 * @component tbt-chip
 * @version 1.37.0
 * @author Wichit Wongta
 *
 * Toggleable chip / filter tag with optional remove action.
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';

class TbtChip extends LitElement {
  static properties = {
    variant:   { type: String, reflect: true },
    selected:  { type: Boolean, reflect: true },
    removable: { type: Boolean },
    disabled:  { type: Boolean, reflect: true },
    icon:      { type: String },
    size:      { type: String, reflect: true },
  };

  static styles = css`
    :host {
      display: inline-flex;
      align-items: stretch;
      font-family: var(--tbt-font);
      vertical-align: middle;
    }
    :host([disabled]) { opacity: 0.5; pointer-events: none; }

    .body {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border: 1.5px solid var(--tbt-border);
      border-radius: var(--tbt-radius-pill);
      background: var(--tbt-bg-card);
      color: var(--tbt-text-secondary);
      font-size: var(--tbt-size-sm);
      font-weight: var(--tbt-weight-medium);
      line-height: 1.4;
      cursor: pointer;
      user-select: none;
      outline: none;
      transition:
        border-color var(--tbt-transition-fast),
        background var(--tbt-transition-fast),
        color var(--tbt-transition-fast),
        box-shadow var(--tbt-transition-fast);
    }
    .body:hover {
      border-color: var(--tbt-border-strong);
      color: var(--tbt-text-primary);
    }
    .body:focus-visible {
      box-shadow: var(--tbt-shadow-focus);
      border-color: var(--tbt-primary);
      outline: none;
    }

    /* flatten right pill edge when removable */
    :host([removable]) .body {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-right-width: 0;
    }

    /* ── Sizes ── */
    :host([size="sm"]) .body { padding: 2px 8px; font-size: var(--tbt-size-xs); }
    :host([size="lg"]) .body { padding: 6px 14px; font-size: var(--tbt-size-base); }

    /* ── Selected states ── */
    :host([selected]) .body,
    :host([selected][variant="neutral"]) .body,
    :host([selected][variant="primary"]) .body {
      background: var(--tbt-primary-bg);
      border-color: var(--tbt-primary);
      color: var(--tbt-primary-text);
    }
    :host([selected][variant="success"]) .body {
      background: var(--tbt-success-bg);
      border-color: var(--tbt-success);
      color: var(--tbt-success-text);
    }
    :host([selected][variant="warning"]) .body {
      background: var(--tbt-warning-bg);
      border-color: var(--tbt-warning);
      color: var(--tbt-warning-text);
    }
    :host([selected][variant="danger"]) .body {
      background: var(--tbt-danger-bg);
      border-color: var(--tbt-danger);
      color: var(--tbt-danger-text);
    }
    :host([selected][variant="info"]) .body {
      background: var(--tbt-info-bg);
      border-color: var(--tbt-info);
      color: var(--tbt-info-text);
    }

    /* ── Remove button ── */
    .remove {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px 7px;
      border: 1.5px solid var(--tbt-border);
      border-left-width: 0;
      border-top-right-radius: var(--tbt-radius-pill);
      border-bottom-right-radius: var(--tbt-radius-pill);
      background: var(--tbt-bg-card);
      color: var(--tbt-text-muted);
      cursor: pointer;
      font-size: 13px;
      line-height: 1;
      outline: none;
      transition:
        background var(--tbt-transition-fast),
        color var(--tbt-transition-fast),
        border-color var(--tbt-transition-fast);
    }
    .remove:hover { background: var(--tbt-danger-bg); color: var(--tbt-danger); border-color: var(--tbt-danger); }
    .remove:focus-visible { box-shadow: var(--tbt-shadow-focus); }
    :host([size="sm"]) .remove { padding: 2px 5px; }
    :host([size="lg"]) .remove { padding: 6px 8px; font-size: 15px; }

    /* match remove border color to selected variant */
    :host([selected]) .remove { border-color: var(--tbt-primary); }
    :host([selected][variant="success"]) .remove { border-color: var(--tbt-success); }
    :host([selected][variant="warning"]) .remove { border-color: var(--tbt-warning); }
    :host([selected][variant="danger"]) .remove { border-color: var(--tbt-danger); }
    :host([selected][variant="info"]) .remove { border-color: var(--tbt-info); }
  `;

  _toggle() {
    this.selected = !this.selected;
    this.dispatchEvent(new CustomEvent('tbt-toggle', {
      detail: { selected: this.selected },
      bubbles: true,
      composed: true,
    }));
  }

  _onKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._toggle();
    }
  }

  _remove(e) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('tbt-remove', {
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    return html`
      ${tablerLink}
      <div
        class="body"
        role="button"
        aria-pressed=${this.selected ? 'true' : 'false'}
        tabindex=${this.disabled ? '-1' : '0'}
        @click=${this._toggle}
        @keydown=${this._onKeydown}>
        ${this.icon ? html`<i class="ti ti-${this.icon}" aria-hidden="true"></i>` : nothing}
        <slot></slot>
      </div>
      ${this.removable ? html`
        <button
          class="remove"
          type="button"
          aria-label="Remove"
          ?disabled=${this.disabled}
          @click=${this._remove}>×</button>
      ` : nothing}
    `;
  }
}

customElements.define('tbt-chip', TbtChip);

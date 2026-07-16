/**
 * @component tbt-drawer
 * @version 1.45.0
 * @author Wichit Wongta
 *
 * Slide-in drawer panel for filter panels, detail views, and side forms.
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

class TbtDrawer extends LitElement {
  static properties = {
    open:      { type: Boolean, reflect: true },
    placement: { type: String, reflect: true },
    title:     { type: String },
    size:      { type: String, reflect: true },
    closable:  { type: Boolean },
  };

  static styles = css`
    :host { font-family: var(--tbt-font); }

    dialog {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      max-width: none;
      max-height: none;
      padding: 0;
      margin: 0;
      border: none;
      background: transparent;
      overflow: visible;
    }
    dialog::backdrop {
      background: rgb(0 0 0 / 0.35);
      transition: opacity 280ms ease;
    }

    /* ── Panel base (right) ── */
    .panel {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 420px;
      display: flex;
      flex-direction: column;
      background: var(--tbt-bg-card);
      box-shadow: -4px 0 32px rgb(13 17 113 / 0.12);
      transform: translateX(100%);
      transition: transform 280ms cubic-bezier(0.4, 0, 0.2, 1);
      will-change: transform;
    }
    :host([open]) .panel { transform: translateX(0); }

    /* ── Left placement ── */
    :host([placement="left"]) .panel {
      right: auto;
      left: 0;
      box-shadow: 4px 0 32px rgb(13 17 113 / 0.12);
      transform: translateX(-100%);
    }
    :host([open][placement="left"]) .panel { transform: translateX(0); }

    /* ── Bottom placement ── */
    :host([placement="bottom"]) .panel {
      top: auto;
      right: 0;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 50%;
      box-shadow: 0 -4px 32px rgb(13 17 113 / 0.12);
      transform: translateY(100%);
    }
    :host([open][placement="bottom"]) .panel { transform: translateY(0); }

    /* ── Sizes — right / left width ── */
    :host([size="sm"]) .panel  { width: 320px; }
    :host([size="lg"]) .panel  { width: 560px; }
    :host([size="full"]) .panel { width: 100%; }

    /* ── Sizes — bottom height ── */
    :host([placement="bottom"][size="sm"]) .panel   { height: 30%; }
    :host([placement="bottom"][size="lg"]) .panel   { height: 70%; }
    :host([placement="bottom"][size="full"]) .panel { height: 100%; }

    /* ── Header ── */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--tbt-space-3);
      padding: var(--tbt-space-4) var(--tbt-space-5);
      border-bottom: 1px solid var(--tbt-border);
      flex-shrink: 0;
    }
    .title {
      flex: 1;
      min-width: 0;
      font-size: var(--tbt-size-md);
      font-weight: var(--tbt-weight-semibold);
      color: var(--tbt-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .close-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      border: none;
      border-radius: var(--tbt-radius-sm);
      background: transparent;
      color: var(--tbt-text-muted);
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
      transition: background var(--tbt-transition-fast), color var(--tbt-transition-fast);
    }
    .close-btn:hover  { background: var(--tbt-bg-hover); color: var(--tbt-text-primary); }
    .close-btn:focus-visible { outline: 2px solid var(--tbt-primary); outline-offset: 1px; }

    /* ── Body ── */
    .body {
      flex: 1;
      overflow-y: auto;
      padding: var(--tbt-space-5);
    }

    /* ── Footer ── */
    .footer {
      display: flex;
      align-items: center;
      gap: var(--tbt-space-2);
      flex-wrap: wrap;
      flex-shrink: 0;
      padding: var(--tbt-space-4) var(--tbt-space-5);
      border-top: 1px solid var(--tbt-border);
    }
  `;

  constructor() {
    super();
    this.closable = true;
    this.placement = 'right';
    this.size = 'md';
  }

  updated(changedProps) {
    if (!changedProps.has('open')) return;
    const dialog = this.shadowRoot?.querySelector('dialog');
    if (this.open) {
      this._prevFocus = document.activeElement;
      dialog?.showModal();
    } else {
      // Restore focus to the opener AFTER close() — a modal <dialog> traps
      // focus while open, so the restore must wait for the close (deferred
      // here for the slide-out animation). Mirrors tbt-modal.
      setTimeout(() => { if (!this.open) this._finalizeClose(); }, 280);
    }
  }

  _finalizeClose() {
    this.shadowRoot?.querySelector('dialog')?.close();
    this._prevFocus?.focus?.();
    this._prevFocus = null;
  }

  _close() {
    this.dispatchEvent(new CustomEvent('tbt-close', { bubbles: true, composed: true }));
  }

  _onCancel(e) {
    e.preventDefault();
    if (this.closable) this._close();
  }

  _onBackdropClick(e) {
    if (!this.closable) return;
    const panel = this.shadowRoot?.querySelector('.panel');
    if (panel && !e.composedPath().includes(panel)) {
      this._close();
    }
  }

  render() {
    return html`
      <dialog
        aria-label=${this.title || 'Drawer'}
        aria-modal="true"
        @cancel=${this._onCancel}
        @click=${this._onBackdropClick}>
        <div class="panel">
          <div class="header">
            <span class="title">${this.title || ''}</span>
            ${this.closable ? html`
              <button class="close-btn" type="button" aria-label="Close drawer" @click=${this._close}>×</button>
            ` : nothing}
          </div>
          <div class="body"><slot></slot></div>
          <div class="footer"><slot name="footer"></slot></div>
        </div>
      </dialog>
    `;
  }
}

customElements.define('tbt-drawer', TbtDrawer);

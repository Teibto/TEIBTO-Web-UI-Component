/**
 * @component tbt-modal
 * @version 1.46.1
 * @author Wichit Wongta
 *
 * Dialog modal using the native <dialog> element for accessibility.
 * Supports default, confirm, and danger variants.
 *
 * Usage:
 *   <!-- Controlled via open attribute -->
 *   <tbt-modal title="Confirm delete" variant="danger" ?open=${showModal}
 *     @tbt-confirm=${onConfirm}
 *     @tbt-cancel=${onCancel}>
 *     Are you sure you want to delete this record? This action cannot be undone.
 *   </tbt-modal>
 *
 *   <!-- Custom footer -->
 *   <tbt-modal title="Document details" ?open=${showModal} @tbt-close=${onClose}>
 *     <div slot="content">...content...</div>
 *     <div slot="footer">
 *       <tbt-button variant="primary">Approve</tbt-button>
 *       <tbt-button variant="secondary">Close</tbt-button>
 *     </div>
 *   </tbt-modal>
 *
 *   <!-- A form whose content must not be lost to a stray click on the backdrop -->
 *   <tbt-modal title="Template SCB" ?open=${showModal} no-backdrop-close>
 *     <div slot="content">...fields the user typed into...</div>
 *   </tbt-modal>
 *
 * Events: tbt-confirm, tbt-cancel, tbt-close
 * Properties: open (Boolean), title (String), variant (default|confirm|danger), size (sm|md|lg),
 *             no-backdrop-close (Boolean)
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';

/**
 * @fires tbt-close - Fired when modal closes via X button
 * @fires tbt-cancel - Fired when cancel button or backdrop clicked or ESC pressed
 * @attr no-backdrop-close - Clicking the backdrop does not close the dialog; Cancel, the X button and ESC still do
 * @fires tbt-confirm - Fired when confirm button clicked
 * @slot - Body content (shorthand for content slot)
 * @slot content - Main body content area
 * @slot footer - Custom footer buttons
 */
class TbtModal extends LitElement {
  static properties = {
    open:             { type: Boolean, reflect: true },
    title:            { type: String },
    variant:          { type: String, reflect: true },
    size:             { type: String, reflect: true },
    noBackdropClose:  { type: Boolean, attribute: 'no-backdrop-close', reflect: true },
    _hasCustomFooter: { state: true },
  };

  constructor() {
    super();
    this.open = false;
    this.variant = 'default';
    this.size = 'md';
    this.noBackdropClose = false;
    this._hasCustomFooter = false;
    this._prevFocus = null;
    this._pressedBackdrop = false;
    this._releasedBackdrop = false;
  }

  static styles = css`
    :host { display: contents; font-family: var(--tbt-font); }
    dialog {
      padding: 0;
      border: none;
      border-radius: var(--tbt-radius-lg);
      box-shadow: var(--tbt-shadow-lg);
      background: var(--tbt-bg-card);
      font-family: var(--tbt-font);
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    dialog[open] { display: flex; }
    dialog:not([open]) { display: none; }

    /* Sizes */
    :host([size="sm"]) dialog { width: min(400px, 92vw); }
    :host([size="md"]) dialog { width: min(560px, 92vw); }
    :host([size="lg"]) dialog { width: min(800px, 92vw); }
    dialog { width: min(560px, 92vw); }

    /* Backdrop */
    dialog::backdrop {
      background: var(--tbt-overlay);
      backdrop-filter: blur(2px);
    }

    /* Header */
    .modal-header {
      display: flex;
      align-items: center;
      gap: var(--tbt-space-3);
      padding: var(--tbt-space-4) var(--tbt-space-5);
      border-bottom: 1px solid var(--tbt-border);
      flex-shrink: 0;
    }
    .modal-icon {
      font-size: 22px;
      line-height: 1;
      flex-shrink: 0;
    }
    :host([variant="danger"]) .modal-icon { color: var(--tbt-danger); }
    :host([variant="confirm"]) .modal-icon { color: var(--tbt-primary); }
    h3 {
      margin: 0;
      flex: 1;
      font-size: var(--tbt-size-md);
      font-weight: var(--tbt-weight-semibold);
      color: var(--tbt-text-primary);
    }
    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--tbt-text-secondary);
      font-size: 18px;
      padding: 4px;
      border-radius: var(--tbt-radius-sm);
      line-height: 1;
      display: flex;
      align-items: center;
    }
    .close-btn:hover { background: var(--tbt-bg-hover); color: var(--tbt-text-primary); }

    /* Body */
    .modal-body {
      padding: var(--tbt-space-5);
      overflow-y: auto;
      flex: 1;
      font-size: var(--tbt-size-base);
      color: var(--tbt-text-secondary);
      line-height: var(--tbt-leading-normal);
    }

    /* Footer */
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--tbt-space-3);
      padding: var(--tbt-space-4) var(--tbt-space-5);
      border-top: 1px solid var(--tbt-border);
      flex-shrink: 0;
    }
    /* When no custom footer slot, show default buttons */
    .default-footer {
      display: flex;
      gap: var(--tbt-space-3);
    }
  `;

  updated(changed) {
    if (!changed.has('open')) return;
    const dlg = this.shadowRoot?.querySelector('dialog');
    if (!dlg) return;
    if (this.open) {
      this._prevFocus = document.activeElement;
      this._pressedBackdrop = false;
      this._releasedBackdrop = false;
      dlg.showModal();
    } else {
      dlg.close();
      this._prevFocus?.focus();
      this._prevFocus = null;
    }
  }

  _onFooterSlotChange(e) {
    this._hasCustomFooter = e.target.assignedElements().length > 0;
  }

  /**
   * A backdrop click is a press *and* a release on the dialog itself.
   *
   * `click` fires on the nearest common ancestor of pointerdown and pointerup, not on the
   * element the pointer was over when it came up. So a drag that starts inside the content —
   * resizing a `<textarea>` by its grip is the one people actually hit — and ends past the
   * dialog's edge arrives here with `target === <dialog>`, which used to read as a backdrop
   * click. The dialog closed and whatever was typed into the form went with it (#96).
   *
   * Both ends are recorded because either one alone still misreads a drag: watching only
   * pointerdown would let a drag that begins on the backdrop and ends inside the form close it.
   */
  _onDialogPointerDown(e) {
    this._pressedBackdrop = e.target === e.currentTarget;
  }

  _onDialogPointerUp(e) {
    this._releasedBackdrop = e.target === e.currentTarget;
  }

  _onBackdropClick(e) {
    const onBackdrop =
      e.target === e.currentTarget && this._pressedBackdrop && this._releasedBackdrop;
    this._pressedBackdrop = false;
    this._releasedBackdrop = false;
    if (onBackdrop && !this.noBackdropClose) {
      this._cancel();
    }
  }

  _close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('tbt-close', { bubbles: true, composed: true }));
  }

  _cancel() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('tbt-cancel', { bubbles: true, composed: true }));
  }

  // Sync this.open when native <dialog> closes via ESC key
  _onNativeCancel(e) {
    e.preventDefault();
    this._cancel();
  }

  _confirm() {
    this.dispatchEvent(new CustomEvent('tbt-confirm', { bubbles: true, composed: true }));
  }

  _variantIcon() {
    if (this.variant === 'danger')  return 'alert-triangle';
    if (this.variant === 'confirm') return 'help-circle';
    return null;
  }

  render() {
    const icon = this._variantIcon();
    return html`
      ${tablerLink}
      <dialog aria-labelledby="modal-title" aria-modal="true"
        @pointerdown=${this._onDialogPointerDown}
        @pointerup=${this._onDialogPointerUp}
        @click=${this._onBackdropClick}
        @cancel=${this._onNativeCancel}>
        <div class="modal-header">
          ${icon ? html`<i class="ti ti-${icon} modal-icon" aria-hidden="true"></i>` : ''}
          <h3 id="modal-title">${this.title}</h3>
          <button class="close-btn" @click=${this._close} aria-label="Close modal">
            <i class="ti ti-x" aria-hidden="true"></i>
          </button>
        </div>
        <div class="modal-body">
          <slot name="content"></slot>
          <slot></slot>
        </div>
        <div class="modal-footer">
          <slot name="footer" @slotchange=${this._onFooterSlotChange}></slot>
          ${!this._hasCustomFooter ? html`
            <div class="default-footer">
              <tbt-button variant="secondary" @click=${this._cancel}>Cancel</tbt-button>
              <tbt-button
                variant=${this.variant === 'danger' ? 'danger' : 'primary'}
                @click=${this._confirm}>
                ${this.variant === 'danger' ? 'Delete' : 'Confirm'}
              </tbt-button>
            </div>` : ''}
        </div>
      </dialog>
    `;
  }
}

customElements.define('tbt-modal', TbtModal);

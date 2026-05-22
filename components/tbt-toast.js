/**
 * @component tbt-toast
 * @version 1.21.2
 * @author Wichit Wongta
 *
 * Toast notification overlay. Use the imperative singleton or place the element directly.
 *
 * Usage (imperative — preferred):
 *   import { toast } from '.../index.js';
 *   toast.success('Document saved');
 *   toast.danger('Save failed — please retry');
 *   toast.info('5 lines imported', { duration: 6000 });
 *   toast.warning('Unsaved changes', { persistent: true });
 *
 * Usage (declarative — place element once, then call .add()):
 *   <tbt-toast position="top-right"></tbt-toast>
 *
 * Props:
 *   position  top-right (default) | top-left | bottom-right | bottom-left
 *
 * Instance method:
 *   el.add(message, variant, { duration, persistent })
 *
 * Event: tbt-dismiss — fired after each toast animates out; detail: { id }
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';

const ICONS = {
  success: 'circle-check',
  warning: 'alert-triangle',
  danger:  'alert-circle',
  info:    'info-circle',
};

/**
 * @fires tbt-dismiss - Fired after a toast is removed; detail: { id }
 */
class TbtToast extends LitElement {
  static properties = {
    position: { type: String, reflect: true },
    _items:   { state: true },
  };

  constructor() {
    super();
    this.position = 'top-right';
    this._items = [];
  }

  static styles = css`
    :host {
      --_slide: 16px;
      position: fixed;
      top: var(--tbt-space-4, 16px);
      right: var(--tbt-space-4, 16px);
      z-index: var(--tbt-z-toast, 1100);
      display: flex;
      flex-direction: column;
      gap: var(--tbt-space-2, 8px);
      pointer-events: none;
      max-width: 360px;
      width: max-content;
    }
    :host([position="top-left"]) {
      right: unset;
      left: var(--tbt-space-4, 16px);
      --_slide: -16px;
    }
    :host([position="bottom-right"]) {
      top: unset;
      bottom: var(--tbt-space-4, 16px);
      flex-direction: column-reverse;
    }
    :host([position="bottom-left"]) {
      top: unset;
      bottom: var(--tbt-space-4, 16px);
      right: unset;
      left: var(--tbt-space-4, 16px);
      flex-direction: column-reverse;
      --_slide: -16px;
    }
    .toast {
      pointer-events: all;
      display: flex;
      align-items: flex-start;
      gap: var(--tbt-space-3, 12px);
      padding: var(--tbt-space-3, 12px) var(--tbt-space-4, 16px);
      border-radius: var(--tbt-radius-md);
      border: 1px solid transparent;
      font-family: var(--tbt-font);
      font-size: var(--tbt-size-sm);
      line-height: var(--tbt-leading-normal);
      box-shadow: var(--tbt-shadow-md);
      min-width: 240px;
      animation: toast-in 0.2s ease;
    }
    .toast--out {
      animation: toast-out 0.2s ease forwards;
    }
    .toast--success {
      background: var(--tbt-success-bg);
      border-color: var(--tbt-success);
      color: var(--tbt-success-text);
    }
    .toast--warning {
      background: var(--tbt-warning-bg);
      border-color: var(--tbt-warning);
      color: var(--tbt-warning-text);
    }
    .toast--danger {
      background: var(--tbt-danger-bg);
      border-color: var(--tbt-danger);
      color: var(--tbt-danger-text);
    }
    .toast--info {
      background: var(--tbt-info-bg);
      border-color: var(--tbt-info);
      color: var(--tbt-info-text);
    }
    .icon {
      font-size: 18px;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .msg { flex: 1; }
    .close {
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
    .close:hover { opacity: 1; }
    @keyframes toast-in {
      from { opacity: 0; transform: translateX(var(--_slide)); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes toast-out {
      from { opacity: 1; transform: translateX(0); }
      to   { opacity: 0; transform: translateX(var(--_slide)); }
    }
  `;

  /**
   * Add a toast notification.
   * @param {string} message
   * @param {'success'|'warning'|'danger'|'info'} variant
   * @param {{ duration?: number, persistent?: boolean }} [opts]
   */
  add(message, variant = 'info', opts = {}) {
    const id = Date.now() + Math.random();
    const duration = opts.duration !== undefined
      ? opts.duration
      : (opts.persistent ? 0 : 4000);

    this._items = [...this._items, { id, message, variant, removing: false }];

    if (this._items.length > 5) {
      const oldest = this._items.find(i => !i.removing);
      if (oldest) this._dismiss(oldest.id);
    }

    if (duration > 0) {
      setTimeout(() => this._dismiss(id), duration);
    }
  }

  _dismiss(id) {
    if (!this._items.find(i => i.id === id)) return;
    this._items = this._items.map(i =>
      i.id === id ? { ...i, removing: true } : i
    );
    setTimeout(() => {
      this._items = this._items.filter(i => i.id !== id);
      this.dispatchEvent(new CustomEvent('tbt-dismiss', {
        bubbles: true, composed: true, detail: { id }
      }));
    }, 220);
  }

  render() {
    return html`
      ${tablerLink}
      ${this._items.map(item => html`
        <div
          class="toast toast--${item.variant}${item.removing ? ' toast--out' : ''}"
          role="alert">
          <i class="ti ti-${ICONS[item.variant] || 'info-circle'} icon" aria-hidden="true"></i>
          <span class="msg">${item.message}</span>
          <button class="close" @click=${() => this._dismiss(item.id)} aria-label="Dismiss">
            <i class="ti ti-x" aria-hidden="true"></i>
          </button>
        </div>
      `)}
    `;
  }
}

customElements.define('tbt-toast', TbtToast);

let _instance = null;

function _getInstance() {
  if (!_instance || !_instance.isConnected) {
    _instance = document.createElement('tbt-toast');
    document.body.appendChild(_instance);
  }
  return _instance;
}

export const toast = {
  success: (msg, opts) => _getInstance().add(msg, 'success', opts),
  danger:  (msg, opts) => _getInstance().add(msg, 'danger', opts),
  info:    (msg, opts) => _getInstance().add(msg, 'info', opts),
  warning: (msg, opts) => _getInstance().add(msg, 'warning', opts),
};

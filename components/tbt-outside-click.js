/**
 * Shared close-on-outside-click helper for popup components.
 *
 * Six components (dropdown, multiselect, menubar, color-picker, split-button,
 * popover) used to hand-roll the same document click listener + composedPath
 * containment check — a leak fix in the pattern meant touching six files (#63).
 *
 * Usage (always-on, in connectedCallback/disconnectedCallback):
 *   connectedCallback() {
 *     super.connectedCallback();
 *     this._stopOutside = watchOutsideClick(this, () => { this._open = false; });
 *   }
 *   disconnectedCallback() {
 *     super.disconnectedCallback();
 *     this._stopOutside?.();
 *     this._stopOutside = null;
 *   }
 *
 * Usage (only-while-open, e.g. tbt-popover's updated()):
 *   if (this.open) this._stopOutside = watchOutsideClick(this, () => this._doClose());
 *   else { this._stopOutside?.(); this._stopOutside = null; }
 *
 * composedPath() (not e.target) because clicks inside the component's shadow
 * DOM retarget to the host — path containment is the only reliable check.
 *
 * @author Wichit Wongta
 * @since 2026-07-17
 * @version 1.46.1
 */

/**
 * Listen for document clicks outside `host` and call `close` on each one.
 * Returns an unwatch function that removes the listener.
 */
export function watchOutsideClick(host, close) {
  const handler = (e) => {
    if (!e.composedPath().includes(host)) close();
  };
  document.addEventListener('click', handler);
  return () => document.removeEventListener('click', handler);
}

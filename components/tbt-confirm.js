/**
 * @module tbt-confirm
 * @version 1.26.1
 * @author Wichit Wongta
 *
 * Promise-based confirmation dialog built on tbt-modal.
 * Reduces multi-step delete/cancel/discard flows to a single await.
 *
 * Usage:
 *   import { confirm } from '.../index.js';
 *
 *   const ok = await confirm({
 *     title: 'Delete document',
 *     message: 'This action cannot be undone.',
 *     confirmLabel: 'Delete',
 *     cancelLabel: 'Cancel',
 *     variant: 'danger',
 *   });
 *   if (ok) await deleteDoc();
 *
 * @param {object} opts
 * @param {string} [opts.title='Confirm']
 * @param {string} [opts.message='']           May contain HTML (e.g. <strong>)
 * @param {string} [opts.confirmLabel='Confirm']
 * @param {string} [opts.cancelLabel='Cancel']
 * @param {'default'|'confirm'|'danger'} [opts.variant='default']
 * @param {'sm'|'md'|'lg'} [opts.size='sm']
 * @returns {Promise<boolean>}  true = confirmed, false = cancelled / dismissed
 */
export function confirm({
  title        = 'Confirm',
  message      = '',
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant      = 'default',
  size         = 'sm',
} = {}) {
  return new Promise(resolve => {
    const modal = document.createElement('tbt-modal');
    modal.title   = title;
    modal.variant = variant;
    modal.size    = size;

    if (message) {
      const body = document.createElement('p');
      body.style.cssText = 'font-family:var(--tbt-font);color:var(--tbt-text-secondary);margin:0';
      body.innerHTML = message;
      modal.appendChild(body);
    }

    const footer = document.createElement('div');
    footer.slot = 'footer';
    footer.style.cssText = 'display:flex;gap:var(--tbt-space-3)';

    const confirmBtn = document.createElement('tbt-button');
    confirmBtn.setAttribute('variant', variant === 'danger' ? 'danger' : 'primary');
    confirmBtn.textContent = confirmLabel;

    const cancelBtn = document.createElement('tbt-button');
    cancelBtn.setAttribute('variant', 'secondary');
    cancelBtn.textContent = cancelLabel;

    footer.appendChild(confirmBtn);
    footer.appendChild(cancelBtn);
    modal.appendChild(footer);

    let done = false;
    function cleanup(result) {
      if (done) return;
      done = true;
      modal.open = false;
      setTimeout(() => modal.remove(), 300);
      resolve(result);
    }

    confirmBtn.addEventListener('click', () => cleanup(true));
    cancelBtn.addEventListener('click',  () => cleanup(false));
    modal.addEventListener('tbt-cancel', () => cleanup(false));
    modal.addEventListener('tbt-close',  () => cleanup(false));

    document.body.appendChild(modal);
    // Element is in the DOM now; Lit's microtask update will call showModal() safely
    modal.open = true;
  });
}

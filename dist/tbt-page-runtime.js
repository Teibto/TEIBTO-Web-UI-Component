/**
 * tbt-page-runtime.js — shared client-side helpers for Suitelet body templates.
 *
 * Load alongside tbt-ds.min.js in the page <head>:
 *   <script src="/sc/SuiteScripts/Teibto/ds/v1.43.0/dist/tbt-page-runtime.js"></script>
 *
 * Exposes a single global, window.tbtPageRuntime, with these helpers:
 *
 *   currency(n, prefix='฿')         → formatted "฿1,234.56"
 *   setStatusBadge(el, label)       → set text + variant via status name
 *   showAlert(elId, message)        → show <tbt-alert id=elId> with message
 *   hideAlerts(...elIds)            → hide given <tbt-alert>s
 *   post(restletUrl, payload)       → POST JSON → returns parsed body, throws on !ok
 *   sumBy(rows, field)              → sum numeric field across rows
 *
 * Kept browser-global (no module imports) so templates can use it via
 * inline <script type="module"> without an extra import line.
 */
(function () {
  'use strict';

  const STATUS_VARIANT = {
    Approved:  'success',
    Paid:      'success',
    Rejected:  'danger',
    Pending:   'info',
    Draft:     'warning',
    Submitted: 'info',
    Current:   'info',
  };

  function currency(n, prefix) {
    const p = prefix == null ? '฿' : prefix;
    return p + Number(n || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function setStatusBadge(el, label) {
    if (!el) return;
    el.textContent = label;
    el.setAttribute('variant', STATUS_VARIANT[label] || 'neutral');
  }

  function showAlert(elId, message) {
    const el = typeof elId === 'string' ? document.getElementById(elId) : elId;
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideAlerts() {
    for (let i = 0; i < arguments.length; i++) {
      const el = typeof arguments[i] === 'string'
        ? document.getElementById(arguments[i])
        : arguments[i];
      if (el) el.hidden = true;
    }
  }

  async function post(restletUrl, payload) {
    const res  = await fetch(restletUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    // RESTlets report failures as HTTP 200 + {ok:false} — both paths must
    // throw, or the page shows a false "success" while the server rejected it.
    if (!res.ok || body.ok === false) throw new Error(body.message || ('HTTP ' + res.status));
    return body;
  }

  function sumBy(rows, field) {
    return (rows || []).reduce((s, r) => s + Number(r[field] || 0), 0);
  }

  // Escape a value for safe interpolation into an HTML string. Required for any
  // tbt-table `html: true` column, whose content is rendered via unsafeHTML —
  // record-derived values must be escaped or they are an XSS vector.
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Build a <tbt-badge> for an html-column cell with label + variant escaped.
  // Use instead of string-building the badge inline with raw record values.
  function badge(label, variant) {
    return `<tbt-badge variant="${escapeHtml(variant || 'neutral')}">${escapeHtml(label)}</tbt-badge>`;
  }

  // Build the HTML for a row-action cluster (view / edit / delete icons).
  // Renders inside a tbt-table cell with `html: true`. Wire via
  // wireRowActions(tableEl, { onView, onEdit, onDelete }) which uses event
  // delegation and stops the row-click event so navigation doesn't double-fire.
  function rowActions(id, opts) {
    const o = opts || {};
    const show = (k) => o[k] !== false;
    const iconBtn = (action, name, color, label) =>
      `<tbt-icon name="${name}" color="${color}" size="md" data-action="${action}"
         title="${label}" aria-label="${label}" role="button" tabindex="0"
         style="cursor:pointer"></tbt-icon>`;
    const view = show('view')   ? iconBtn('view',   'view',   'primary',   'View')   : '';
    const edit = show('edit')   ? iconBtn('edit',   'edit',   'secondary', 'Edit')   : '';
    const del  = show('delete') ? iconBtn('delete', 'delete', 'danger',    'Delete') : '';
    return `<span class="tbt-row-actions" data-id="${String(id).replace(/"/g, '&quot;')}">${view}${edit}${del}</span>`;
  }

  function wireRowActions(tableEl, handlers) {
    if (!tableEl) return;
    // Capture click on the table; if the click hit an action icon, run the
    // handler and prevent the row-click from also firing.
    tableEl.addEventListener('click', (e) => {
      const target = e.composedPath().find(el => el?.dataset?.action);
      if (!target) return;
      const wrap = e.composedPath().find(el => el?.classList?.contains('tbt-row-actions'));
      const id = wrap?.dataset?.id;
      const action = target.dataset.action;
      e.stopPropagation();
      if (action === 'view'   && handlers.onView)   handlers.onView(id);
      if (action === 'edit'   && handlers.onEdit)   handlers.onEdit(id);
      if (action === 'delete' && handlers.onDelete) handlers.onDelete(id);
    }, true);  // capture phase — fires before tbt-row-click
  }

  window.tbtPageRuntime = {
    currency,
    setStatusBadge,
    showAlert,
    hideAlerts,
    post,
    sumBy,
    escapeHtml,
    badge,
    rowActions,
    wireRowActions,
  };
})();

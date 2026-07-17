/**
 * Shared ERP list-page controller (util module — no custom element).
 *
 * Five list pages (customer, PO, invoice, quotation, SO) used to copy-paste
 * the same ~120-line controller script and differ only in labels, columns,
 * and status maps (#64). This module owns the shared flow — per-page HTML
 * keeps its own markup and passes a config object:
 *
 *   import * as ds from '<file-cabinet>/dist/tbt-ds.min.js';
 *   ds.initListPage({
 *     data: window.__DATA__,          // mutated in place on delete
 *     recordsKey: 'records',          // key of the row array in data
 *     countNoun: 'invoices',          // header badge: "6 invoices"
 *     filters: [                      // dropdowns; equality match per field
 *       { id: 'f-customer', field: 'customerId', options: d.customers,
 *         allLabel: 'All customers' },
 *     ],
 *     searchText: r => r.tranid,      // string the search box matches against
 *     statusVariant: { Draft: 'warning', ... },  // optional; adds r.statusBadge
 *     derive: (r, rt) => ({ amountText: rt.currency(r.amount) }),  // optional
 *     columns: [...],                 // tbt-table columns (may reference derived keys)
 *     stats: [                        // optional KPI tiles
 *       { id: 'stat-total', value: (rows, rt) => String(rows.length) },
 *     ],
 *     deleteNoun: 'invoice',          // confirm dialog: "Delete invoice?"
 *     deleteLabel: r => r.tranid,     // display id inside the confirm message
 *   });
 *
 * Fixed element ids the markup must provide: #rec-table, #hdr-count,
 * #f-search, #new-btn, #export-btn, #print-btn (same ids all five pages
 * already share). csv config: { header, row(r), filename }.
 *
 * @author Wichit Wongta
 * @since 2026-07-17
 * @version 1.46.0
 */
import { confirm } from './tbt-confirm.js';

export function initListPage(cfg) {
  const d  = cfg.data;
  const rt = cfg.runtime || window.tbtPageRuntime;
  const recordsKey = cfg.recordsKey || 'records';
  const rows = () => d[recordsKey] || [];

  const $ = (id) => document.getElementById(id);
  const table = $(cfg.tableId || 'rec-table');

  /* ── Filters ────────────────────────────────────────────── */
  const filterEls = (cfg.filters || []).map((f) => {
    const el = $(f.id);
    el.options = [{ value: '', label: f.allLabel }, ...f.options];
    el.value = '';
    return { el, field: f.field };
  });

  /* ── Status badge + row derivation ──────────────────────── */
  const statusBadge = cfg.statusVariant
    ? (s) => rt.badge(s, cfg.statusVariant[s] || 'neutral')
    : null;

  table.columns = cfg.columns;

  function renderRows(filtered) {
    table.rows = filtered.map((r, i) => ({
      ...r,
      no: i + 1,
      ...(cfg.derive ? cfg.derive(r, rt) : null),
      ...(statusBadge ? { statusBadge: statusBadge(r.status) } : null),
      actions: rt.rowActions(r.id),
    }));
    for (const s of cfg.stats || []) $(s.id).value = s.value(filtered, rt);
    $('hdr-count').textContent = `${filtered.length} ${cfg.countNoun}`;
  }

  function applyFilter() {
    const q = ($('f-search').value || '').toLowerCase();
    renderRows(rows().filter((r) =>
      filterEls.every(({ el, field }) => !el.value || String(r[field]) === String(el.value)) &&
      (!q || cfg.searchText(r).toLowerCase().includes(q))
    ));
  }
  filterEls.forEach(({ el }) => el.addEventListener('tbt-change', applyFilter));
  $('f-search').addEventListener('tbt-search', applyFilter);
  applyFilter();

  /* ── Row click / actions / new ──────────────────────────── */
  table.addEventListener('tbt-row-click', (e) => {
    location.href = `${d.formUrl}?id=${e.detail.row.id}`;
  });
  rt.wireRowActions(table, {
    onView: (id) => { location.href = `${d.formUrl}?id=${id}`; },
    onEdit: (id) => { location.href = `${d.formUrl}?id=${id}&mode=edit`; },
    onDelete: async (id) => {
      const target = rows().find((r) => String(r.id) === String(id));
      const ok = await confirm({
        title: `Delete ${cfg.deleteNoun}?`,
        message: `Permanently delete ${(target && cfg.deleteLabel(target)) || id}?`,
        confirmLabel: 'Delete',
        variant: 'danger',
      });
      if (!ok) return;
      d[recordsKey] = rows().filter((r) => String(r.id) !== String(id));
      applyFilter();
    },
  });
  $('new-btn').addEventListener('click', () => {
    location.href = `${d.formUrl}?id=new`;
  });

  /* ── Export CSV + print ─────────────────────────────────── */
  $('export-btn').addEventListener('click', () => {
    const csv = [cfg.csv.header, ...rows().map(cfg.csv.row)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `${cfg.csv.filename}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
  $('print-btn').addEventListener('click', () => window.print());

  return { applyFilter, renderRows };
}

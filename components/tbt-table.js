/**
 * @component tbt-table
 * @version 1.46.0
 * @author Wichit Wongta
 *
 * Data table with sortable/resizable columns, scroll, pagination, and responsive card view.
 *
 * Usage:
 *   <tbt-table
 *     .columns=${[
 *       { key: 'tranid',  label: 'Document No.', sortable: true, mobileTitle: true,
 *                        href: row => `/app/record.nl?id=${row.id}` },
 *       { key: 'date',    label: 'Date',         sortable: true, width: 120 },
 *       { key: 'amount',  label: 'Amount',       align: 'right', resizable: false },
 *       { key: 'status',  label: 'Status',       html: true }
 *     ]}
 *     .rows=${data}
 *     max-height="400px"
 *     responsive
 *     paginate
 *     page-size="50"
 *     empty-message="ไม่พบเอกสาร">
 *   </tbt-table>
 *
 * Column definition:
 *   { key, label, sortable?, align?, html?, href?: (row) => string,
 *     width?: number, resizable?: boolean (default true),
 *     mobileTitle?: boolean  ← card header on mobile (defaults to first column) }
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { unsafeHTML } from 'https://cdn.jsdelivr.net/npm/lit@3/directives/unsafe-html.js/+esm';
import './tbt-pagination.js';

class TbtTable extends LitElement {
  static properties = {
    columns:      { type: Array },
    rows:         { type: Array },
    paginate:     { type: Boolean },
    pageSize:     { type: Number,  attribute: 'page-size' },
    maxHeight:    { type: String,  attribute: 'max-height' },
    responsive:   { type: Boolean },
    loading:      { type: Boolean, reflect: true },
    emptyMessage: { type: String,  attribute: 'empty-message' },
    serverSort:   { type: Boolean, attribute: 'server-sort' },
    sortKey:      { type: String,  attribute: 'sort-key' },
    sortAsc:      { type: Boolean, attribute: 'sort-asc' },
    /* Sticky columns — comma-separated column indexes. Same API as
       tbt-line-items: sticky-left="0,1" pins the first two columns to the
       left edge; sticky-right="N" pins to the right. */
    stickyLeft:   { type: String,  attribute: 'sticky-left',  reflect: true },
    stickyRight:  { type: String,  attribute: 'sticky-right', reflect: true },
    /* Optional namespace for per-user persistence; right-click pin/unpin
       on a column header is saved to localStorage under
       `tbt-table-sticky-${prefKey}`. */
    prefKey:      { type: String,  attribute: 'pref-key' },
    _sortKey:     { state: true },
    _sortAsc:     { state: true },
    _page:        { state: true },
    _colWidths:   { state: true },
    _isMobile:    { state: true },
  };

  constructor() {
    super();
    this.columns = [];
    this.rows = [];
    this.paginate = false;
    this.pageSize = 50;
    this.maxHeight = '';
    this.responsive = false;
    this.loading = false;
    this.emptyMessage = 'No data';
    this.serverSort = false;
    this.sortKey = null;
    this.sortAsc = true;
    this._sortKey = null;
    this._sortAsc = true;
    this._page = 1;
    this._colWidths = [];
    this._isMobile = false;
  }

  /* ── Sticky-column helpers ──────────────────────────────── */
  _stickyIndexes(side) {
    const raw = side === 'left' ? this.stickyLeft : this.stickyRight;
    if (!raw) return [];
    return String(raw).split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  }
  _stickyStyleFor(colIndex) {
    const leftIdxs  = this._stickyIndexes('left');
    const rightIdxs = this._stickyIndexes('right');
    if (leftIdxs.includes(colIndex)) {
      const offset = leftIdxs
        .filter(i => i < colIndex)
        .reduce((s, i) => s + (this._colWidths[i] || 0), 0);
      return `left:${offset}px`;
    }
    if (rightIdxs.includes(colIndex)) {
      const offset = rightIdxs
        .filter(i => i > colIndex)
        .reduce((s, i) => s + (this._colWidths[i] || 0), 0);
      return `right:${offset}px`;
    }
    return '';
  }
  _stickyClassFor(colIndex) {
    const leftIdxs  = this._stickyIndexes('left');
    const rightIdxs = this._stickyIndexes('right');
    if (leftIdxs.includes(colIndex)) {
      const isLast = Math.max(...leftIdxs) === colIndex;
      return isLast ? 'sticky-cell edge-left' : 'sticky-cell';
    }
    if (rightIdxs.includes(colIndex)) {
      const isFirst = Math.min(...rightIdxs) === colIndex;
      return isFirst ? 'sticky-cell edge-right' : 'sticky-cell';
    }
    return '';
  }

  /* ── User preference persistence ────────────────────────── */
  _loadStickyPref() {
    if (!this.prefKey) return;
    try {
      const raw = localStorage.getItem('tbt-table-sticky-' + this.prefKey);
      if (!raw) return;
      const obj = JSON.parse(raw);
      if (typeof obj.left  === 'string') this.stickyLeft  = obj.left;
      if (typeof obj.right === 'string') this.stickyRight = obj.right;
    } catch (_) {}
  }
  _saveStickyPref() {
    if (!this.prefKey) return;
    try {
      localStorage.setItem('tbt-table-sticky-' + this.prefKey, JSON.stringify({
        left:  this.stickyLeft  || '',
        right: this.stickyRight || '',
      }));
    } catch (_) {}
  }

  /* ── Right-click pin / unpin column ────────────────────── */
  _showStickyMenu(e, colIndex) {
    e.preventDefault();
    document.querySelectorAll('.tbt-sticky-menu').forEach(el => el.remove());

    const menu = document.createElement('div');
    menu.className = 'tbt-sticky-menu';
    menu.style.cssText = `
      position: fixed;
      top: ${e.clientY}px; left: ${e.clientX}px;
      background: var(--tbt-bg-card);
      border: 1px solid var(--tbt-border);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
      padding: 4px 0;
      z-index: 9999;
      font-family: var(--tbt-font, system-ui);
      font-size: 14px;
      min-width: 160px;
    `;
    const isPinnedLeft  = this._stickyIndexes('left').includes(colIndex);
    const isPinnedRight = this._stickyIndexes('right').includes(colIndex);
    menu.innerHTML = `
      <div data-act="pin-left"  style="padding:8px 14px;cursor:pointer;${isPinnedLeft ? 'background:var(--tbt-bg-hover)' : ''}">📌 Pin to left</div>
      <div data-act="pin-right" style="padding:8px 14px;cursor:pointer;${isPinnedRight ? 'background:var(--tbt-bg-hover)' : ''}">📌 Pin to right</div>
      <div data-act="unpin"     style="padding:8px 14px;cursor:pointer;color:var(--tbt-danger)">✕ Unpin</div>
    `;
    menu.querySelectorAll('[data-act]').forEach(el => {
      el.addEventListener('mouseenter', () => el.style.background = 'var(--tbt-bg-hover)');
      el.addEventListener('mouseleave', () => el.style.background = (
        (el.dataset.act === 'pin-left'  && isPinnedLeft)  ||
        (el.dataset.act === 'pin-right' && isPinnedRight)
      ) ? 'var(--tbt-bg-hover)' : '');
    });
    menu.addEventListener('click', (ev) => {
      const t = ev.target.closest('[data-act]');
      if (!t) return;
      this._applyStickyAction(colIndex, t.dataset.act);
      menu.remove();
    });
    document.body.appendChild(menu);

    const close = (ev) => {
      if (menu.contains(ev.target)) return;
      menu.remove();
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', escClose);
    };
    const escClose = (ev) => { if (ev.key === 'Escape') { menu.remove(); document.removeEventListener('mousedown', close); document.removeEventListener('keydown', escClose); } };
    setTimeout(() => {
      document.addEventListener('mousedown', close);
      document.addEventListener('keydown', escClose);
    }, 0);
  }

  _applyStickyAction(colIndex, action) {
    let left  = this._stickyIndexes('left').filter(i => i !== colIndex);
    let right = this._stickyIndexes('right').filter(i => i !== colIndex);
    if (action === 'pin-left')  left.push(colIndex);
    if (action === 'pin-right') right.push(colIndex);
    this.stickyLeft  = left.sort((a, b)  => a - b).join(',');
    this.stickyRight = right.sort((a, b) => a - b).join(',');
    this._saveStickyPref();
    this.dispatchEvent(new CustomEvent('tbt-sticky-change', {
      detail: { left: this.stickyLeft, right: this.stickyRight },
      bubbles: true, composed: true,
    }));
  }

  static styles = css`
    :host {
      display: block;
      font-family: var(--tbt-font);
    }

    /* ── Table (desktop) ──────────────────────────────── */
    .scroll {
      overflow-x: auto;
      overflow-y: var(--_scroll-y, clip);
      max-height: var(--tbt-table-max-height, none);
      border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-lg);
      box-shadow: var(--tbt-shadow-sm);
    }
    table {
      /* border-collapse: separate is required for sticky positioning on
         th/td to work reliably across browsers (Chrome/Firefox/Safari all
         have collapse-mode sticky bugs). border-spacing:0 keeps cells flush. */
      border-collapse: separate;
      border-spacing: 0;
      font-size: var(--tbt-size-base);
      min-width: 100%;
    }
    table.fixed { table-layout: fixed; }

    /* ── Sticky columns ─────────────────────────────────
       Class .sticky-cell is applied to th and td by render() based on
       stickyLeft / stickyRight. left/right offset is computed per-cell and
       set via inline style. edge-left / edge-right add a 1px shadow at the
       boundary between sticky and scrolling regions. */
    th.sticky-cell,
    td.sticky-cell {
      position: sticky;
      z-index: 1;
    }
    .sticky-cell.edge-left  { box-shadow:  1px 0 0 var(--tbt-border); }
    .sticky-cell.edge-right { box-shadow: -1px 0 0 var(--tbt-border); }
    td.sticky-cell { background: var(--tbt-bg-card); }
    tbody tr:hover td.sticky-cell { background: var(--tbt-bg-hover); }
    thead th.sticky-cell { z-index: 3; background: var(--tbt-bg-hover); }
    thead {
      background: var(--tbt-bg-hover);
      position: sticky;
      top: var(--tbt-table-sticky-top, 0);
      z-index: 1;
    }
    th {
      padding: var(--tbt-table-cell-py, 10px) var(--tbt-space-4);
      text-align: left;
      font-size: var(--tbt-size-xs);
      font-weight: var(--tbt-weight-semibold);
      /* -strong: 11px uppercase on bg-hover needs 4.5:1 (plain secondary = 4.27) */
      color: var(--tbt-text-secondary-strong, var(--tbt-text-secondary));
      letter-spacing: 0.06em;
      text-transform: uppercase;
      white-space: nowrap;
      user-select: none;
      position: relative;
      box-shadow: inset 0 -1px 0 var(--tbt-border);
      background: var(--tbt-bg-hover);   /* needed so sticky scroll doesn't show transparent header */
    }
    th.sortable { cursor: pointer; }
    th.sortable:hover { color: var(--tbt-text-primary); }
    th.sortable:focus-visible {
      outline: 2px solid var(--tbt-primary);
      outline-offset: -2px;
      color: var(--tbt-text-primary);
    }
    th .sort-icon {
      display: inline-block;
      margin-left: 4px;
      opacity: 0.4;
      font-size: 10px;
    }
    th.active .sort-icon { opacity: 1; color: var(--tbt-primary); }
    th[data-align="right"], td[data-align="right"] { text-align: right; }
    th[data-align="center"], td[data-align="center"] { text-align: center; }
    td {
      padding: var(--tbt-table-cell-py, 10px) var(--tbt-space-4);
      color: var(--tbt-text-primary);
      border-bottom: 1px solid var(--tbt-border);
      vertical-align: middle;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      background: var(--tbt-bg-card);   /* opaque so sticky cells visually cover scrolled cells */
    }
    tr:last-child td { border-bottom: 0; }
    tbody tr { cursor: pointer; }
    tbody tr:hover td { background: var(--tbt-bg-hover); }
    td a {
      color: var(--tbt-text-link);
      text-decoration: none;
      font-weight: var(--tbt-weight-medium);
    }
    td a:hover { text-decoration: underline; }

    /* ── Resize handle ───────────────────────────────── */
    .resize-handle {
      position: absolute;
      right: 0; top: 0; bottom: 0;
      width: 8px;
      cursor: col-resize;
      display: flex;
      align-items: stretch;
      justify-content: flex-end;
      z-index: 2;
    }
    .resize-handle::after {
      content: '';
      display: block;
      width: 2px;
      background: transparent;
      transition: background var(--tbt-transition-fast);
    }
    .resize-handle:hover::after,
    .resize-handle.resizing::after { background: var(--tbt-primary); }

    /* ── Loading ─────────────────────────────────────── */
    :host([loading]) .scroll,
    :host([loading]) .cards { opacity: 0.5; pointer-events: none; }

    /* ── Empty ───────────────────────────────────────── */
    .empty {
      padding: var(--tbt-space-10) var(--tbt-space-4);
      text-align: center;
      color: var(--tbt-text-muted);
      font-size: var(--tbt-size-sm);
    }

    /* ── Pagination ──────────────────────────────────── */
    .pagination {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--tbt-space-3) var(--tbt-space-4);
      border-top: 1px solid var(--tbt-border);
      background: var(--tbt-bg-card);
      border-radius: 0 0 var(--tbt-radius-lg) var(--tbt-radius-lg);
    }
    .pagination-cards {
      margin-top: var(--tbt-space-3);
      border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-lg);
      background: var(--tbt-bg-card);
    }
    .page-info { font-size: var(--tbt-size-sm); color: var(--tbt-text-secondary); }
    .page-btns { display: flex; gap: var(--tbt-space-1); flex-wrap: wrap; }
    .page-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 32px;
      border-radius: var(--tbt-radius-sm);
      border: 1px solid var(--tbt-border);
      background: var(--tbt-bg-card);
      color: var(--tbt-text-secondary);
      font-size: var(--tbt-size-sm);
      cursor: pointer;
      transition: background var(--tbt-transition-fast);
    }
    .page-btn:hover:not(:disabled) { background: var(--tbt-bg-hover); color: var(--tbt-text-primary); }
    .page-btn.active { background: var(--tbt-primary); color: var(--tbt-text-inverse); border-color: var(--tbt-primary); }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    /* ── Card view (mobile) ──────────────────────────── */
    .cards {
      display: flex;
      flex-direction: column;
      gap: var(--tbt-space-3);
    }
    .card {
      background: var(--tbt-bg-card);
      border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-lg);
      box-shadow: var(--tbt-shadow-sm);
      overflow: hidden;
    }
    .card-title {
      padding: var(--tbt-space-3) var(--tbt-space-4);
      background: var(--tbt-bg-hover);
      border-bottom: 1px solid var(--tbt-border);
      font-size: var(--tbt-size-base);
      font-weight: var(--tbt-weight-semibold);
      color: var(--tbt-text-primary);
    }
    .card-title a {
      color: var(--tbt-text-link);
      text-decoration: none;
    }
    .card-title a:hover { text-decoration: underline; }
    .card-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--tbt-space-3);
      padding: var(--tbt-space-2) var(--tbt-space-4);
      border-bottom: 1px solid var(--tbt-border);
    }
    .card-row:last-child { border-bottom: none; }
    .card-label {
      font-size: var(--tbt-size-xs);
      font-weight: var(--tbt-weight-semibold);
      color: var(--tbt-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      flex-shrink: 0;
    }
    .card-value {
      font-size: var(--tbt-size-sm);
      color: var(--tbt-text-primary);
      text-align: right;
      word-break: break-word;
      min-width: 0;
    }
    .card-value a {
      color: var(--tbt-text-link);
      text-decoration: none;
      font-weight: var(--tbt-weight-medium);
    }
    .card-value a:hover { text-decoration: underline; }
    .card-empty {
      padding: var(--tbt-space-10) var(--tbt-space-4);
      text-align: center;
      color: var(--tbt-text-muted);
      font-size: var(--tbt-size-sm);
      background: var(--tbt-bg-card);
      border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-lg);
    }
  `;

  /* ── Lifecycle ──────────────────────────────────────── */

  connectedCallback() {
    super.connectedCallback();
    this._loadStickyPref();
    this._ro = new ResizeObserver(([entry]) => {
      const mobile = entry.contentRect.width < 600;
      if (mobile !== this._isMobile) this._isMobile = mobile;
    });
    this._ro.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._ro?.disconnect();
  }

  updated(changed) {
    if (changed.has('maxHeight')) {
      this.style.setProperty('--tbt-table-max-height', this.maxHeight || 'none');
      this.style.setProperty('--_scroll-y', this.maxHeight ? 'auto' : 'clip');
    }
    if (changed.has('columns')) {
      this._colWidths = [];
      this._measureColWidths();
    } else if (changed.has('rows') && this._colWidths.length === 0) {
      this._measureColWidths();
    }
  }

  _measureColWidths() {
    requestAnimationFrame(() => {
      const ths = this.shadowRoot?.querySelectorAll('thead th');
      if (!ths?.length) return;
      this._colWidths = this.columns.map((col, i) =>
        col.width ?? ths[i]?.offsetWidth ?? 120
      );
    });
  }

  /* ── Resize drag ────────────────────────────────────── */

  _startResize(e, colIndex) {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = this._colWidths[colIndex] ?? 120;
    const handle = e.currentTarget;
    handle.classList.add('resizing');
    const onMove = (moveE) => {
      const next = [...this._colWidths];
      next[colIndex] = Math.max(50, startWidth + moveE.clientX - startX);
      this._colWidths = next;
    };
    const onUp = () => {
      handle.classList.remove('resizing');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  /* ── Sort ───────────────────────────────────────────── */

  _sortedRows() {
    if (this.serverSort || !this._sortKey) return this.rows;
    return [...this.rows].sort((a, b) => {
      const av = a[this._sortKey] ?? '';
      const bv = b[this._sortKey] ?? '';
      const cmp = String(av).localeCompare(String(bv), 'th', { numeric: true });
      return this._sortAsc ? cmp : -cmp;
    });
  }

  _setSort(key) {
    if (this.serverSort) {
      const asc = this.sortKey === key ? !this.sortAsc : true;
      this.dispatchEvent(new CustomEvent('tbt-sort', {
        detail: { key, asc },
        bubbles: true,
        composed: true,
      }));
      return;
    }
    if (this._sortKey === key) { this._sortAsc = !this._sortAsc; }
    else { this._sortKey = key; this._sortAsc = true; }
    this._page = 1;
  }

  _onSortKeydown(e, key) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._setSort(key);
    }
  }

  _emitRowClick(row) {
    this.dispatchEvent(new CustomEvent('tbt-row-click', {
      detail: { row },
      bubbles: true,
      composed: true,
    }));
  }

  /* ── Cell renderer (shared) ─────────────────────────── */

  _cell(col, row) {
    if (col.href)  return html`<a href=${col.href(row)}>${row[col.key] ?? '—'}</a>`;
    if (col.html)  return unsafeHTML(String(row[col.key] ?? ''));
    return row[col.key] ?? '—';
  }

  /* ── Card view ──────────────────────────────────────── */

  _renderCards(pageRows, sorted, totalPages) {
    const titleCol = this.columns.find(c => c.mobileTitle) ?? this.columns[0];
    const bodyCol  = this.columns.filter(c => c !== titleCol);

    return html`
      ${pageRows.length === 0
        ? html`<div class="card-empty">${this.loading ? 'Loading…' : this.emptyMessage}</div>`
        : html`
          <div class="cards">
            ${pageRows.map(row => html`
              <div class="card">
                <div class="card-title">${this._cell(titleCol, row)}</div>
                ${bodyCol.map(col => html`
                  <div class="card-row">
                    <span class="card-label">${col.label}</span>
                    <span class="card-value">${this._cell(col, row)}</span>
                  </div>
                `)}
              </div>
            `)}
          </div>`}
      ${this._renderPagination(sorted, totalPages, true)}
    `;
  }

  /* ── Pagination ─────────────────────────────────────── */

  _renderPagination(sorted, totalPages, forCards = false) {
    if (!this.paginate || totalPages <= 1) return nothing;
    const pag = html`
      <tbt-pagination
        .total=${sorted.length}
        .page=${this._page}
        .pageSize=${this.pageSize}
        @tbt-page-change=${e => { this._page = e.detail.page; }}>
      </tbt-pagination>
    `;
    return forCards
      ? html`<div style="margin-top:var(--tbt-space-3)">${pag}</div>`
      : pag;
  }

  /* ── Render ─────────────────────────────────────────── */

  render() {
    const sorted     = this._sortedRows();
    const totalPages = this.paginate ? Math.ceil(sorted.length / this.pageSize) || 1 : 1;
    const pageRows   = this.paginate
      ? sorted.slice((this._page - 1) * this.pageSize, this._page * this.pageSize)
      : sorted;

    // Mobile card view
    if (this.responsive && this._isMobile) {
      return this._renderCards(pageRows, sorted, totalPages);
    }

    // Desktop table view
    const hasWidths = this._colWidths.length === this.columns.length;
    return html`
      <div class="scroll">
        <table class=${hasWidths ? 'fixed' : ''}>
          ${hasWidths ? html`
            <colgroup>
              ${this.columns.map((_, i) => html`<col style="width:${this._colWidths[i]}px">`)}
            </colgroup>` : ''}
          <thead>
            <tr>
              ${this.columns.map((col, i) => {
                const sortCls   = col.sortable ? ((this.serverSort ? this.sortKey : this._sortKey) === col.key ? 'sortable active' : 'sortable') : '';
                const stickyCls = this._stickyClassFor(i);
                const cls       = [sortCls, stickyCls].filter(Boolean).join(' ');
                const stickySt  = this._stickyStyleFor(i);
                return html`
                <th
                  scope="col"
                  class=${cls}
                  style=${stickySt}
                  data-align=${col.align || 'left'}
                  aria-sort=${col.sortable
                    ? ((this.serverSort ? this.sortKey : this._sortKey) === col.key
                        ? ((this.serverSort ? this.sortAsc : this._sortAsc) ? 'ascending' : 'descending')
                        : 'none')
                    : nothing}
                  tabindex=${col.sortable ? '0' : nothing}
                  aria-label=${col.label ? nothing : (col.key || 'actions')}
                  @click=${col.sortable ? () => this._setSort(col.key) : nothing}
                  @keydown=${col.sortable ? (e) => this._onSortKeydown(e, col.key) : nothing}
                  @contextmenu=${(e) => this._showStickyMenu(e, i)}
                  title="Right-click to pin/unpin this column">
                  ${col.label}
                  ${col.sortable ? html`
                    <span class="sort-icon" aria-hidden="true">
                      ${(this.serverSort ? this.sortKey : this._sortKey) === col.key
                        ? ((this.serverSort ? this.sortAsc : this._sortAsc) ? '↑' : '↓')
                        : '↕'}
                    </span>` : ''}
                  ${col.resizable !== false ? html`
                    <span class="resize-handle"
                      @mousedown=${(e) => this._startResize(e, i)}
                      @click=${(e) => e.stopPropagation()}>
                    </span>` : ''}
                </th>
              `;})}
            </tr>
          </thead>
          <tbody>
            ${pageRows.length === 0 ? html`
              <tr>
                <td colspan=${this.columns.length}>
                  <div class="empty">${this.loading ? 'Loading…' : this.emptyMessage}</div>
                </td>
              </tr>` : pageRows.map(row => html`
              <tr @click=${() => this._emitRowClick(row)}>
                ${this.columns.map((col, i) => {
                  const stickyCls = this._stickyClassFor(i);
                  const stickySt  = this._stickyStyleFor(i);
                  return html`
                  <td data-align=${col.align || 'left'}
                      class=${stickyCls || nothing}
                      style=${stickySt || nothing}>${this._cell(col, row)}</td>
                `;})}
              </tr>
            `)}
          </tbody>
        </table>
        ${this._renderPagination(sorted, totalPages)}
      </div>
    `;
  }
}

customElements.define('tbt-table', TbtTable);

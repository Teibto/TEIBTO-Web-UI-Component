/**
 * @component tbt-line-items
 * @version 1.26.2
 * @author Wichit Wongta
 *
 * Self-contained inline-editable line items table with automatic totals.
 * Covers the standard ERP document line items pattern.
 *
 * Usage:
 *   <tbt-line-items id="li" currency="฿" vat-rate="0.07"></tbt-line-items>
 *
 *   <script type="module">
 *     const li = document.getElementById('li');
 *
 *     // Set account options (required for the Account column)
 *     li.accountOptions = [
 *       { value:'5100', label:'5100 - Office supplies' },
 *       { value:'5200', label:'5200 - IT equipment' },
 *     ];
 *
 *     // Load initial rows
 *     li.rows = [
 *       { item:'Laptop', desc:'Dell 14"', qty:5, unit:'Pcs', price:35000, account:'5200' },
 *     ];
 *
 *     // Add a blank row (wire to your "Add line" button)
 *     document.getElementById('add-btn').onclick = () => li.addRow();
 *
 *     // Read current data
 *     li.addEventListener('tbt-change', e => {
 *       console.log(e.detail.rows, e.detail.subtotal, e.detail.vat, e.detail.total);
 *     });
 *   </script>
 *
 * Props:
 *   unitOptions     Array   [{value, label}] Unit select options
 *                           Default: Pcs, Box, Set, Roll
 *   accountOptions  Array   [{value, label}] Account select options (default: empty)
 *   currency        String  Currency prefix symbol (default: "฿")
 *   vat-rate        Number  VAT rate 0–1 (default: 0.07)
 *   show-summary    Boolean Show subtotal / VAT / grand total below table (default: true)
 *   readonly        Boolean View-only mode — plain text, no editing
 *   loading         Boolean Skeleton placeholder state
 *
 * Public methods:
 *   addRow()           Append a blank row and focus the Item input
 *   getTotal()         Returns { subtotal, vat, total }
 *
 * Public properties:
 *   rows  (get/set)    Array of row objects { id?, item, desc, qty, unit, price, account }
 *
 * Events:
 *   tbt-change         { rows, subtotal, vat, total } — fires on every edit / add / delete
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';
import './tbt-dropdown.js';   // Item column uses <tbt-dropdown searchable>

const DEFAULT_UNITS = [
  { value:'Pcs',  label:'Pcs'  },
  { value:'Box',  label:'Box'  },
  { value:'Set',  label:'Set'  },
  { value:'Roll', label:'Roll' },
];

/**
 * @fires tbt-change - Fired on every row edit, add, or delete; detail: { rows: Array, subtotal: number, vat: number, total: number }
 */
class TbtLineItems extends LitElement {

  static properties = {
    unitOptions:    { type: Array },
    accountOptions: { type: Array },
    /* List of suggested items for the Item column (renders as a native HTML5
       datalist — input shows a typing autocomplete + dropdown arrow). User
       can still type free text not in the list. */
    itemOptions:    { type: Array },
    currency:       { type: String },
    vatRate:        { type: Number,  attribute: 'vat-rate' },
    showSummary:    { type: Boolean, attribute: 'show-summary', reflect: true },
    readonly:       { type: Boolean, reflect: true },
    loading:        { type: Boolean, reflect: true },
    maxHeight:      { type: String,  attribute: 'max-height' },
    /* Comma-separated column indexes (0–8) that should stick to the left or
       right edges of the horizontal scroll. Example: sticky-left="0,1" pins
       No. + Item columns; sticky-right="8" pins the delete button.
       These are the *default* values — when prefKey is also set, the user's
       saved preference overrides them on mount. */
    stickyLeft:     { type: String,  attribute: 'sticky-left',  reflect: true },
    stickyRight:    { type: String,  attribute: 'sticky-right', reflect: true },
    /* Optional namespace key for per-user persistence. When set, sticky
       changes via the column-header right-click menu are saved to
       localStorage under `tbt-line-items-sticky-${prefKey}`. */
    prefKey:        { type: String,  attribute: 'pref-key' },
    /* Internal reactive state — drives summary re-render only */
    _totals:        { state: true },
    _colWidths:     { state: true },
  };

  static styles = css`
    :host { display: block; min-width: 0; }

    /* ── Layout ── */
    .wrap { display:flex; flex-direction:column; gap:var(--tbt-space-4); min-width: 0; }
    /* min-width:0 + max-width:100% keeps the scrollbar inside the component
       — otherwise the wrapper expands past its parent and the page scrolls. */
    .lines-wrap {
      overflow-x: auto;
      max-width: 100%;
      min-width: 0;
      -webkit-overflow-scrolling: touch;
    }

    /* Scrollable mode — when max-height is set, match tbt-table's .scroll shell */
    .lines-wrap.scrollable {
      overflow-y: auto;
      border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-lg);
      box-shadow: var(--tbt-shadow-sm);
    }

    /* ── Table base ────────────────────────────────────────────────
       border-collapse: separate is REQUIRED for sticky positioning to
       work on <th> elements (Chrome/Firefox/Safari all have collapse-
       mode sticky bugs). border-spacing: 0 keeps cells flush. */
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-family: var(--tbt-font);
      font-size: var(--tbt-size-base);
    }
    table.fixed { table-layout: fixed; }
    th {
      position: relative;                /* anchor for .resize-handle */
      background: var(--tbt-bg-page);
      color: var(--tbt-text-secondary);
      font-weight: var(--tbt-weight-medium);
      font-size: var(--tbt-size-sm);
      padding: var(--tbt-space-2) var(--tbt-space-3);
      border-bottom: 2px solid var(--tbt-border);
      text-align: left;
      white-space: nowrap;
      user-select: none;
    }
    th.r { text-align: right; }
    td {
      padding: var(--tbt-space-1) var(--tbt-space-2);
      border-bottom: 1px solid var(--tbt-border);
      vertical-align: middle;
      background: var(--tbt-bg-card);    /* opaque so sticky cells cover the body cells they slide over */
    }
    tbody tr:hover td { background: var(--tbt-bg-hover); }
    tbody tr:last-child td { border-bottom: none; }

    /* ── Inline inputs ── */
    .li {
      width:100%; box-sizing:border-box;
      border:1px solid transparent; border-radius:var(--tbt-radius-sm);
      padding:5px 8px;
      font-family:var(--tbt-font); font-size:var(--tbt-size-base);
      color:var(--tbt-text-primary); background:transparent;
      transition:border-color var(--tbt-transition-fast), background var(--tbt-transition-fast),
                 box-shadow var(--tbt-transition-fast);
    }
    /* Item column uses tbt-dropdown — strip its outer padding so it fits the
       inline-edit row. The internal trigger/popup keeps its own styling. */
    tbt-dropdown.li-item { padding: 0; }
    .li:hover { border-color:var(--tbt-border-strong); background:var(--tbt-bg-card); }
    .li:focus { outline:none; border-color:var(--tbt-primary); background:var(--tbt-bg-card); box-shadow:var(--tbt-shadow-focus); }
    .li.num   { text-align:right; width:80px; }
    .li.nw    { width:100px; }

    select.li {
      appearance:none; -webkit-appearance:none; cursor:pointer;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat:no-repeat; background-position:right 6px center;
      padding-right:22px;
    }
    select.li option { background:var(--tbt-bg-card); color:var(--tbt-text-primary); }
    input[type=number].li { -moz-appearance:textfield; }
    input[type=number].li::-webkit-inner-spin-button,
    input[type=number].li::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }

    /* ── Computed amount cell ── */
    .amt { text-align:right; font-weight:var(--tbt-weight-medium); color:var(--tbt-text-primary); white-space:nowrap; padding:5px 8px; font-family:var(--tbt-font); }

    /* ── Read-only cells ── */
    .ro     { font-family:var(--tbt-font); font-size:var(--tbt-size-base); color:var(--tbt-text-primary); padding:5px 8px; display:block; }
    .ro.r   { text-align:right; }
    .ro.mu  { color:var(--tbt-text-muted); }

    /* ── Delete row button ── */
    .del {
      display:flex; align-items:center; justify-content:center;
      width:26px; height:26px; border-radius:var(--tbt-radius-sm);
      border:1px solid transparent; background:transparent;
      color:var(--tbt-text-muted); cursor:pointer; font-size:14px;
      transition:all var(--tbt-transition-fast);
    }
    .del:hover { border-color:var(--tbt-danger-bg); background:var(--tbt-danger-bg); color:var(--tbt-danger); }
    :host([readonly]) .del { display:none; }

    /* ── Vertical sticky header (only when scrollable) ─────────────
       Stays at top:0 of the scrolling container. */
    .lines-wrap.scrollable thead th {
      position: sticky;
      top: 0;
      z-index: 2;
    }

    /* ── Horizontal sticky columns ─────────────────────────────────
       Class .sticky-cell is applied to th and td by render() for
       columns listed in sticky-left / sticky-right. left/right offset
       comes from per-cell inline style; this block only handles position,
       background, z-index, and the edge shadow indicator. */
    th.sticky-cell,
    td.sticky-cell {
      position: sticky;
      z-index: 1;                        /* above non-sticky body cells */
    }
    .sticky-cell.edge-left  { box-shadow:  1px 0 0 var(--tbt-border); }
    .sticky-cell.edge-right { box-shadow: -1px 0 0 var(--tbt-border); }

    /* Sticky body cells need opaque bg + hover state. */
    td.sticky-cell { background: var(--tbt-bg-card); }
    tbody tr:hover td.sticky-cell { background: var(--tbt-bg-hover); }

    /* Sticky header cells must out-rank both the vertical-sticky-header
       rule above (z-index: 2) and the body sticky cells (z-index: 1).
       Selector specificity (0,3,1) beats .lines-wrap.scrollable thead th
       (0,2,1) so this z-index actually wins. */
    .lines-wrap.scrollable thead th.sticky-cell,
    thead th.sticky-cell {
      z-index: 3;
    }

    /* ── Resize handle ──────────────────────────────────────────── */
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
    table.fixed { table-layout: fixed; }

    /* ── Empty state ── */
    .empty { text-align:center; padding:var(--tbt-space-8) var(--tbt-space-4); }
    .empty-msg {
      margin-top:var(--tbt-space-3); font-family:var(--tbt-font);
      font-size:var(--tbt-size-sm); color:var(--tbt-text-secondary);
    }

    /* ── Loading skeleton ── */
    .skel { animation:skel-pulse 1.4s ease-in-out infinite; background:var(--tbt-border); border-radius:var(--tbt-radius-sm); }
    @keyframes skel-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

    /* ── Summary area ── */
    .sum-wrap { display:flex; justify-content:flex-end; }
    .sum-inner { width:320px; }
  `;

  /* ── Initialisation ───────────────────────────────────────── */

  constructor() {
    super();
    this.currency       = '฿';
    this.vatRate        = 0.07;
    this.showSummary    = true;
    this.readonly       = false;
    this.loading        = false;
    this.unitOptions    = [...DEFAULT_UNITS];
    this.accountOptions = [];
    this.itemOptions    = [];
    this._rows          = [];
    this._nextId        = 1;
    this._totals        = { subtotal:0, vat:0, total:0 };
    // Default column widths in px. Indexes match: No., Item, Desc, Qty, Unit, Price, Amount, Account, Delete.
    this._colWidths     = [44, 200, 200, 80, 100, 110, 120, 180, 40];
    this._boundInput    = e => this._onInput(e);
    this._boundChange   = e => this._onChange(e);
    this._boundClick    = e => this._onClick(e);
  }

  /* ── Re-render tbody when sticky props / column widths change ─
     The tbody is hand-written via innerHTML (for inline-edit performance),
     so Lit's automatic re-render only updates <thead>. We mirror sticky and
     col-width changes onto <tbody> here so body cells get the same offsets
     and `.sticky-cell` classes that the header just gained. */
  updated(changedProperties) {
    if (changedProperties.has('stickyLeft')  ||
        changedProperties.has('stickyRight') ||
        changedProperties.has('_colWidths')  ||
        changedProperties.has('readonly')) {
      // Body is hand-rendered → mirror prop changes (sticky offsets, running
      // No., view/edit mode switch) onto tbody manually. Without this, view
      // mode still shows the edit-mode dropdowns/inputs because Lit only
      // re-renders the Lit-managed <thead>, never the manual <tbody>.
      this._renderTbody();
    } else if (changedProperties.has('itemOptions')) {
      // Options changed — refresh each row's dropdown options without re-render
      this._wireItemDropdowns();
    }
  }

  /* ── User preference persistence ─────────────────────────── */
  connectedCallback() {
    super.connectedCallback();
    this._loadStickyPref();
  }
  _loadStickyPref() {
    if (!this.prefKey) return;
    try {
      const raw = localStorage.getItem('tbt-line-items-sticky-' + this.prefKey);
      if (!raw) return;
      const obj = JSON.parse(raw);
      if (typeof obj.left  === 'string') this.stickyLeft  = obj.left;
      if (typeof obj.right === 'string') this.stickyRight = obj.right;
    } catch (_) { /* localStorage may be blocked */ }
  }
  _saveStickyPref() {
    if (!this.prefKey) return;
    try {
      localStorage.setItem('tbt-line-items-sticky-' + this.prefKey, JSON.stringify({
        left:  this.stickyLeft  || '',
        right: this.stickyRight || '',
      }));
    } catch (_) {}
  }

  /* ── User actions: pin / unpin column via header right-click ── */
  _showStickyMenu(e, colIndex) {
    e.preventDefault();
    // remove any existing menu first
    document.querySelectorAll('.tbt-sticky-menu').forEach(el => el.remove());

    const menu = document.createElement('div');
    menu.className = 'tbt-sticky-menu';
    menu.style.cssText = `
      position: fixed;
      top: ${e.clientY}px; left: ${e.clientX}px;
      background: var(--tbt-bg-card, #fff);
      border: 1px solid var(--tbt-border, #e2e8f0);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
      padding: 4px 0;
      z-index: 9999;
      font-family: var(--tbt-font, system-ui);
      font-size: 14px;
      min-width: 160px;
    `;
    const leftIdxs  = this._stickyIndexes('left');
    const rightIdxs = this._stickyIndexes('right');
    const isPinnedLeft  = leftIdxs.includes(colIndex);
    const isPinnedRight = rightIdxs.includes(colIndex);
    menu.innerHTML = `
      <div data-act="pin-left"  style="padding:8px 14px;cursor:pointer;${isPinnedLeft ? 'background:var(--tbt-bg-hover, #f3f4f6)' : ''}">📌 Pin to left</div>
      <div data-act="pin-right" style="padding:8px 14px;cursor:pointer;${isPinnedRight ? 'background:var(--tbt-bg-hover, #f3f4f6)' : ''}">📌 Pin to right</div>
      <div data-act="unpin"     style="padding:8px 14px;cursor:pointer;color:var(--tbt-danger, #ef4444)">✕ Unpin</div>
    `;
    menu.querySelectorAll('[data-act]').forEach(el => {
      el.addEventListener('mouseenter', () => el.style.background = 'var(--tbt-bg-hover, #f3f4f6)');
      el.addEventListener('mouseleave', () => el.style.background = (
        (el.dataset.act === 'pin-left'  && isPinnedLeft)  ||
        (el.dataset.act === 'pin-right' && isPinnedRight)
      ) ? 'var(--tbt-bg-hover, #f3f4f6)' : '');
    });
    menu.addEventListener('click', (ev) => {
      const t = ev.target.closest('[data-act]');
      if (!t) return;
      this._applyStickyAction(colIndex, t.dataset.act);
      menu.remove();
    });
    document.body.appendChild(menu);

    // close on outside click / Escape
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
    // action === 'unpin' just leaves both lists without colIndex
    this.stickyLeft  = left.sort((a, b)  => a - b).join(',');
    this.stickyRight = right.sort((a, b) => a - b).join(',');
    this._saveStickyPref();
    this.dispatchEvent(new CustomEvent('tbt-sticky-change', {
      detail: { left: this.stickyLeft, right: this.stickyRight },
      bubbles: true, composed: true,
    }));
  }

  /* ── Sticky-column offset math ──────────────────────────── */
  _stickyIndexes(which) {
    const raw = which === 'left' ? this.stickyLeft : this.stickyRight;
    if (!raw) return [];
    return String(raw).split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  }
  // Returns CSS rules string for a given column index, or '' if not sticky.
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

  /* ── Column resize ──────────────────────────────────────── */
  _startResize(e, colIndex) {
    e.preventDefault();
    e.stopPropagation();
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

  /* ── Public API ───────────────────────────────────────────── */

  /** Get/set line item rows. */
  get rows() { return [...this._rows]; }

  set rows(val) {
    const arr = Array.isArray(val) ? val : [];
    this._rows = arr.map(r => ({
      id:      r.id      != null ? +r.id : this._nextId++,
      item:    r.item    ?? '',
      desc:    r.desc    ?? '',
      qty:     +r.qty    || 1,
      unit:    r.unit    ?? (this.unitOptions[0]?.value ?? 'Pcs'),
      price:   +r.price  || 0,
      account: r.account ?? (this.accountOptions[0]?.value ?? ''),
    }));
    if (this._rows.length) {
      this._nextId = Math.max(this._nextId, ...this._rows.map(r => r.id)) + 1;
    }
    this._recalc();
    /* Re-render tbody immediately if shadow DOM is ready, otherwise firstUpdated handles it */
    const tbody = this.shadowRoot?.querySelector('tbody');
    if (tbody) this._renderTbody();
  }

  /** Append a blank row and focus the Item input. */
  addRow() {
    if (this.readonly) return;
    const r = {
      id:      this._nextId++,
      item:    '', desc: '', qty: 1,
      unit:    this.unitOptions[0]?.value    ?? 'Pcs',
      price:   0,
      account: this.accountOptions[0]?.value ?? '',
    };
    const wasEmpty = this._rows.length === 0;
    this._rows.push(r);
    this._recalc();
    const tbody = this.shadowRoot?.querySelector('tbody');
    if (!tbody) return;
    // Append-only is cheaper, but we need the running No. of the new row.
    // _rowHTML expects (row, rowNo); for the new row that's rows.length (1-based).
    if (wasEmpty) {
      this._renderTbody();
    } else {
      tbody.insertAdjacentHTML('beforeend', this._rowHTML(r, this._rows.length));
      // wire the newly inserted tbt-dropdown (Item column) with options/value/event
      this._wireItemDropdowns();
    }
    // Focus first editable element of the new row — prefer the Item dropdown.
    const lastRow = tbody.lastElementChild;
    const focusTarget = lastRow?.querySelector('tbt-dropdown[data-f="item"]') ||
                        lastRow?.querySelector('.li');
    focusTarget?.focus?.();
  }

  /** Returns { subtotal, vat, total }. */
  getTotal() { return { ...this._totals }; }

  /* ── Lit lifecycle ────────────────────────────────────────── */

  firstUpdated() {
    this._renderTbody();
    this._tbody = this.shadowRoot.querySelector('tbody');
    this._tbody?.addEventListener('input',  this._boundInput);
    this._tbody?.addEventListener('change', this._boundChange);
    this._tbody?.addEventListener('click',  this._boundClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._tbody?.removeEventListener('input',  this._boundInput);
    this._tbody?.removeEventListener('change', this._boundChange);
    this._tbody?.removeEventListener('click',  this._boundClick);
  }

  render() {
    const { subtotal, vat, total } = this._totals;
    const vatPct = `VAT ${Math.round((this.vatRate ?? 0.07) * 100)}%`;
    const wrapClass = this.maxHeight ? 'lines-wrap scrollable' : 'lines-wrap';
    const wrapStyle = this.maxHeight ? `max-height:${this.maxHeight}` : '';

    if (this.loading) return html`
      ${tablerLink}
      <div class="wrap">
        <div class=${wrapClass} style=${wrapStyle}>
          <table>
            <thead>
              <tr>${['No.','Item','Desc','Qty','Unit','Price','Amount','Account',''].map(l =>
                html`<th>${l}</th>`)}</tr>
            </thead>
            <tbody>
              ${[1,2,3].map(() => html`<tr>
                ${[24,200,140,50,70,80,90,160,26].map(w => html`
                  <td><div class="skel" style="height:22px;width:${w}px"></div></td>`)}
              </tr>`)}
            </tbody>
          </table>
        </div>
      </div>`;

    return html`
      ${tablerLink}
      <div class="wrap">

        <div class=${wrapClass} style=${wrapStyle}>
          <table class="fixed">
            <colgroup>
              ${this._colWidths.map(w => html`<col style="width:${w}px">`)}
            </colgroup>
            <thead>
              <tr>
                ${['No.','Item','Description','Qty','Unit','Unit price','Amount','Account',''].map((label, i) => {
                  // Right-align numeric columns: No.(0), Qty(3), Unit price(5), Amount(6)
                  const align    = (i === 0 || i === 3 || i === 5 || i === 6) ? 'r' : '';
                  const stickyCl = this._stickyClassFor(i);
                  const cls      = [align, stickyCl].filter(Boolean).join(' ');
                  const stickySt = this._stickyStyleFor(i);
                  const last     = i === 8;
                  const noResize = i === 0 || last;   // No. + delete column not resizable
                  const allowPin = i !== 8;   // delete column not pinnable
                  return html`
                    <th class=${cls} style=${stickySt}
                        @contextmenu=${allowPin ? (e) => this._showStickyMenu(e, i) : nothing}
                        title=${allowPin ? 'Right-click to pin/unpin this column' : nothing}>
                      ${label}
                      ${noResize ? '' : html`<span class="resize-handle"
                        @mousedown=${(e) => this._startResize(e, i)}
                        @click=${(e) => e.stopPropagation()}></span>`}
                    </th>`;
                })}
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>

        ${this.showSummary !== false ? html`
          <div class="sum-wrap">
            <div class="sum-inner">
              <tbt-summary>
                <tbt-summary-item label="Subtotal"    value="${this._fmt(subtotal)}"></tbt-summary-item>
                <tbt-summary-item label="${vatPct}"   value="${this._fmt(vat)}"></tbt-summary-item>
                <tbt-summary-item label="Grand total" value="${this._fmt(total)}" highlight></tbt-summary-item>
              </tbt-summary>
            </div>
          </div>
        ` : nothing}

      </div>`;
  }

  /* ── Row HTML builder ─────────────────────────────────────── */

  _renderTbody() {
    const tbody = this.shadowRoot?.querySelector('tbody');
    if (!tbody) return;
    tbody.innerHTML = this._rows.length === 0
      ? `<tr><td colspan="9" class="empty">
           <tbt-svg name="empty" size="80"></tbt-svg>
           <div class="empty-msg">No line items added yet</div>
         </td></tr>`
      : this._rows.map((r, i) => this._rowHTML(r, i + 1)).join('');
    this._wireItemDropdowns();
  }

  _rowHTML(r, rowNo) {
    // Compose a class+style fragment for each of the 9 td cells based on
    // sticky-left / sticky-right props. Returns ' class="..." style="..."' or ''.
    const tdAttr = (extraClass) => Array.from({ length: 9 }, (_, i) => {
      const stickyCls = this._stickyClassFor(i);
      const stickySt  = this._stickyStyleFor(i);
      const cls       = [extraClass[i], stickyCls].filter(Boolean).join(' ');
      const parts     = [];
      if (cls)      parts.push(`class="${cls}"`);
      if (stickySt) parts.push(`style="${stickySt}"`);
      return parts.length ? ' ' + parts.join(' ') : '';
    });

    if (this.readonly) {
      const a = tdAttr(['r', '', '', '', '', '', 'amt', '', '']);
      return `
        <tr data-id="${r.id}">
          <td${a[0]}><span class="ro r mu">${rowNo}</span></td>
          <td${a[1]}><span class="ro">${this._esc(r.item)}</span></td>
          <td${a[2]}><span class="ro mu">${this._esc(r.desc)}</span></td>
          <td${a[3]}><span class="ro r">${r.qty}</span></td>
          <td${a[4]}><span class="ro">${this._esc(r.unit)}</span></td>
          <td${a[5]}><span class="ro r">${this._fmt(r.price)}</span></td>
          <td${a[6]}>${this._fmt(r.qty * r.price)}</td>
          <td${a[7]}><span class="ro mu">${this._esc(this._acctLabel(r.account))}</span></td>
          <td${a[8]}></td>
        </tr>`;
    }

    const uOpts = (this.unitOptions ?? DEFAULT_UNITS).map(o =>
      `<option value="${this._esc(o.value)}"${o.value===r.unit?' selected':''}>${this._esc(o.label)}</option>`
    ).join('');
    const aOpts = (this.accountOptions ?? []).map(o =>
      `<option value="${this._esc(o.value)}"${o.value===r.account?' selected':''}>${this._esc(o.label)}</option>`
    ).join('');
    const a = tdAttr(['r', '', '', '', '', '', 'amt', '', '']);

    // Item column uses <tbt-dropdown searchable> — options/value are set
    // after innerHTML insertion by _wireItemDropdowns().
    return `
      <tr data-id="${r.id}">
        <td${a[0]}><span class="ro r mu">${rowNo}</span></td>
        <td${a[1]}><tbt-dropdown class="li li-item" data-f="item" data-row="${r.id}" placeholder="Item" searchable></tbt-dropdown></td>
        <td${a[2]}><input  class="li"      data-f="desc"    aria-label="Description"  value="${this._esc(r.desc)}"  placeholder="Description"></td>
        <td${a[3]}><input  class="li num"  data-f="qty"     aria-label="Qty"          value="${r.qty}"  type="number" min="0.001" step="any"></td>
        <td${a[4]}><select class="li nw"   data-f="unit"    aria-label="Unit">${uOpts}</select></td>
        <td${a[5]}><input  class="li num"  data-f="price"   aria-label="Unit price"   value="${r.price}" type="number" min="0" step="any"></td>
        <td${a[6]} id="amt-${r.id}">${this._fmt(r.qty * r.price)}</td>
        <td${a[7]}><select class="li"      data-f="account" aria-label="Account">${aOpts}</select></td>
        <td${a[8]}>
          <button class="del" data-id="${r.id}" title="Remove line">
            <i class="ti ti-x"></i>
          </button>
        </td>
      </tr>`;
  }

  // Wire each row's <tbt-dropdown data-f="item"> with options + value + change
  // handler. Called after _renderTbody / addRow / when itemOptions changes.
  _wireItemDropdowns() {
    if (!this.shadowRoot) return;
    const opts = (this.itemOptions || []).map(o => typeof o === 'string'
      ? { value: o, label: o }
      : { value: o.value ?? o.label, label: o.label ?? o.value });
    this.shadowRoot.querySelectorAll('tbt-dropdown[data-f="item"]').forEach(dd => {
      if (dd._tbtItemWired) {
        dd.options = opts;
        return;
      }
      dd.options = opts;
      const rowId = +dd.dataset.row;
      const row   = this._rows.find(r => r.id === rowId);
      if (row) dd.value = row.item || '';
      dd.addEventListener('tbt-change', (e) => {
        const r = this._rows.find(x => x.id === rowId);
        if (!r) return;
        r.item = e.detail.value;
        this._emit();
      });
      dd._tbtItemWired = true;
    });
  }

  /* ── Event handlers (delegated on tbody) ──────────────────── */

  _onInput(e) {
    const el  = e.target;
    const tr  = el.closest('tr[data-id]');
    if (!tr) return;
    const id  = +tr.dataset.id;
    const f   = el.dataset.f;
    const row = this._rows.find(r => r.id === id);
    if (!row || !f) return;

    if (f === 'qty' || f === 'price') {
      row[f] = parseFloat(el.value) || 0;
      const amtCell = this.shadowRoot.getElementById(`amt-${id}`);
      if (amtCell) amtCell.textContent = this._fmt(row.qty * row.price);
      this._recalc();
    } else {
      row[f] = el.value;
    }
    this._emit();
  }

  _onChange(e) {
    const el = e.target;
    if (el.tagName !== 'SELECT') return;
    const tr  = el.closest('tr[data-id]');
    if (!tr) return;
    const id  = +tr.dataset.id;
    const f   = el.dataset.f;
    const row = this._rows.find(r => r.id === id);
    if (row && f) { row[f] = el.value; this._emit(); }
  }

  _onClick(e) {
    const btn = e.target.closest('.del[data-id]');
    if (!btn) return;
    const id = +btn.dataset.id;
    this._rows = this._rows.filter(r => r.id !== id);
    // Always full re-render so the running No. column re-sequences after
    // a row is removed (otherwise rows below the deletion keep their old
    // numbers, e.g. delete row 2 → remaining rows would show 1, 3, 4).
    this._renderTbody();
    this._recalc();
    this._emit();
  }

  /* ── Helpers ──────────────────────────────────────────────── */

  _recalc() {
    const subtotal = this._rows.reduce((s, r) => s + r.qty * r.price, 0);
    const vat      = subtotal * (this.vatRate ?? 0.07);
    this._totals   = { subtotal, vat, total: subtotal + vat };
  }

  _emit() {
    this.dispatchEvent(new CustomEvent('tbt-change', {
      bubbles: true, composed: true,
      detail: { rows: [...this._rows], ...this._totals },
    }));
  }

  _fmt(n) {
    return (this.currency ?? '฿') +
      (n || 0).toLocaleString('th-TH', { minimumFractionDigits:2, maximumFractionDigits:2 });
  }

  _esc(s) {
    return String(s ?? '')
      .replace(/&/g,'&amp;').replace(/"/g,'&quot;')
      .replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  _acctLabel(val) {
    return (this.accountOptions ?? []).find(a => a.value === val)?.label ?? val;
  }
}

customElements.define('tbt-line-items', TbtLineItems);

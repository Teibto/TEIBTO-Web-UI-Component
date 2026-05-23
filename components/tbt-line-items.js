/**
 * @component tbt-line-items
 * @version 1.24.3
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
    currency:       { type: String },
    vatRate:        { type: Number,  attribute: 'vat-rate' },
    showSummary:    { type: Boolean, attribute: 'show-summary', reflect: true },
    readonly:       { type: Boolean, reflect: true },
    loading:        { type: Boolean, reflect: true },
    maxHeight:      { type: String,  attribute: 'max-height' },
    /* Internal reactive state — drives summary re-render only */
    _totals:        { state: true },
  };

  static styles = css`
    :host { display: block; }

    /* ── Layout ── */
    .wrap { display:flex; flex-direction:column; gap:var(--tbt-space-4); }
    .lines-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; }

    /* Scrollable mode — when max-height is set, match tbt-table's .scroll shell */
    .lines-wrap.scrollable {
      overflow-y: auto;
      border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-lg);
      box-shadow: var(--tbt-shadow-sm);
    }
    .lines-wrap.scrollable thead th {
      position: sticky;
      top: 0;
      z-index: 1;
    }

    /* ── Table structure ── */
    table { width:100%; border-collapse:collapse; font-family:var(--tbt-font); font-size:var(--tbt-size-base); }
    th {
      background:var(--tbt-bg-page); color:var(--tbt-text-secondary);
      font-weight:var(--tbt-weight-medium); font-size:var(--tbt-size-sm);
      padding:var(--tbt-space-2) var(--tbt-space-3);
      border-bottom:2px solid var(--tbt-border);
      text-align:left; white-space:nowrap; user-select:none;
    }
    th.r { text-align:right; }
    td { padding:var(--tbt-space-1) var(--tbt-space-2); border-bottom:1px solid var(--tbt-border); vertical-align:middle; }
    tbody tr:hover td { background:var(--tbt-bg-hover); }
    tbody tr:last-child td { border-bottom:none; }

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
    this._rows          = [];
    this._nextId        = 1;
    this._totals        = { subtotal:0, vat:0, total:0 };
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
    if (wasEmpty) {
      this._renderTbody();
    } else {
      tbody.insertAdjacentHTML('beforeend', this._rowHTML(r));
    }
    tbody.lastElementChild?.querySelector('.li')?.focus();
  }

  /** Returns { subtotal, vat, total }. */
  getTotal() { return { ...this._totals }; }

  /* ── Lit lifecycle ────────────────────────────────────────── */

  firstUpdated() {
    this._renderTbody();
    const tbody = this.shadowRoot.querySelector('tbody');
    tbody?.addEventListener('input',  e => this._onInput(e));
    tbody?.addEventListener('change', e => this._onChange(e));
    tbody?.addEventListener('click',  e => this._onClick(e));
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
              <tr>${['Item','Desc','Qty','Unit','Price','Amount','Account',''].map(l =>
                html`<th>${l}</th>`)}</tr>
            </thead>
            <tbody>
              ${[1,2,3].map(() => html`<tr>
                ${[200,140,50,70,80,90,160,26].map(w => html`
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
          <table>
            <colgroup>
              <col style="min-width:160px">
              <col style="min-width:130px">
              <col style="width:80px">
              <col style="width:100px">
              <col style="width:110px">
              <col style="width:120px">
              <col style="min-width:160px">
              <col style="width:40px">
            </colgroup>
            <thead>
              <tr>
                <th>Item</th>
                <th>Description</th>
                <th class="r">Qty</th>
                <th>Unit</th>
                <th class="r">Unit price</th>
                <th class="r">Amount</th>
                <th>Account</th>
                <th></th>
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
      ? `<tr><td colspan="8" class="empty">
           <tbt-svg name="empty" size="80"></tbt-svg>
           <div class="empty-msg">No line items added yet</div>
         </td></tr>`
      : this._rows.map(r => this._rowHTML(r)).join('');
  }

  _rowHTML(r) {
    if (this.readonly) {
      return `
        <tr data-id="${r.id}">
          <td><span class="ro">${this._esc(r.item)}</span></td>
          <td><span class="ro mu">${this._esc(r.desc)}</span></td>
          <td><span class="ro r">${r.qty}</span></td>
          <td><span class="ro">${this._esc(r.unit)}</span></td>
          <td><span class="ro r">${this._fmt(r.price)}</span></td>
          <td class="amt">${this._fmt(r.qty * r.price)}</td>
          <td><span class="ro mu">${this._esc(this._acctLabel(r.account))}</span></td>
          <td></td>
        </tr>`;
    }

    const uOpts = (this.unitOptions ?? DEFAULT_UNITS).map(o =>
      `<option value="${this._esc(o.value)}"${o.value===r.unit?' selected':''}>${this._esc(o.label)}</option>`
    ).join('');
    const aOpts = (this.accountOptions ?? []).map(o =>
      `<option value="${this._esc(o.value)}"${o.value===r.account?' selected':''}>${this._esc(o.label)}</option>`
    ).join('');

    return `
      <tr data-id="${r.id}">
        <td><input  class="li"      data-f="item"    value="${this._esc(r.item)}"  placeholder="Item name"></td>
        <td><input  class="li"      data-f="desc"    value="${this._esc(r.desc)}"  placeholder="Description"></td>
        <td><input  class="li num"  data-f="qty"     value="${r.qty}"  type="number" min="0.001" step="any"></td>
        <td><select class="li nw"   data-f="unit">${uOpts}</select></td>
        <td><input  class="li num"  data-f="price"   value="${r.price}" type="number" min="0" step="any"></td>
        <td id="amt-${r.id}" class="amt">${this._fmt(r.qty * r.price)}</td>
        <td><select class="li"      data-f="account">${aOpts}</select></td>
        <td>
          <button class="del" data-id="${r.id}" title="Remove line">
            <i class="ti ti-x"></i>
          </button>
        </td>
      </tr>`;
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
    if (this._rows.length === 0) {
      this._renderTbody();
    } else {
      btn.closest('tr').remove();
    }
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

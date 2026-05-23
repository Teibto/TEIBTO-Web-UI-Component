/**
 * @component tbt-lines-block
 * @version 1.22.0
 * @author Wichit Wongta
 *
 * Compound component: section wrapper + inline-editable line items + Add button + totals.
 * Replaces the manual boilerplate of wiring tbt-section + tbt-button + tbt-line-items.
 *
 * Usage:
 *   <tbt-lines-block
 *     title="Line items"
 *     add-label="Add line"
 *     currency="฿"
 *     vat-rate="0.07"
 *     max-height="320px"
 *     @tbt-change=${e => console.log(e.detail.rows, e.detail.total)}>
 *   </tbt-lines-block>
 *
 *   // Load initial rows
 *   el.rows = [{ item: 'Widget', desc: '', qty: 2, unit: 'pcs', price: 500, account: '' }];
 *
 *   max-height  CSS max-height of the scrollable table area (default: '320px').
 *               Container fits content up to this height, then scrolls vertically.
 *
 * Properties (pass-through to tbt-line-items):
 *   rows (get/set)  Array of row objects
 *   getTotal()      Returns { subtotal, vat, total }
 *
 * Event: tbt-change → { rows, subtotal, vat, total }  (same shape as tbt-line-items)
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import './tbt-section.js';
import './tbt-line-items.js';
import './tbt-button.js';
import './tbt-summary.js';

/**
 * @fires tbt-change - Forwarded from tbt-line-items on every row edit/add/delete;
 *   detail: { rows: Array, subtotal: number, vat: number, total: number }
 */
class TbtLinesBlock extends LitElement {
  static properties = {
    title:       { type: String },
    addLabel:    { type: String,  attribute: 'add-label' },
    currency:    { type: String },
    vatRate:     { type: Number,  attribute: 'vat-rate' },
    showSummary: { type: Boolean, attribute: 'show-summary' },
    maxHeight:   { type: String,  attribute: 'max-height' },
    disabled:    { type: Boolean, reflect: true },
    _totals:     { state: true },
  };

  constructor() {
    super();
    this.addLabel    = 'Add line';
    this.currency    = '฿';
    this.vatRate     = 0.07;
    this.showSummary = true;
    this.maxHeight   = '320px';
    this._totals     = { subtotal: 0, vat: 0, total: 0 };
  }

  get rows() {
    return this._li()?.rows ?? [];
  }

  set rows(val) {
    const li = this._li();
    if (li) li.rows = val;
    else this.updateComplete.then(() => { this._li().rows = val; });
  }

  getTotal() {
    return this._li()?.getTotal() ?? { subtotal: 0, vat: 0, total: 0 };
  }

  _li() {
    return this.shadowRoot?.querySelector('tbt-line-items');
  }

  _onLiChange(e) {
    this._totals = { subtotal: e.detail.subtotal, vat: e.detail.vat, total: e.detail.total };
    this.dispatchEvent(new CustomEvent('tbt-change', {
      detail: e.detail,
      bubbles: true,
      composed: true,
    }));
  }

  _fmt(n) {
    return (this.currency ?? '฿') +
      (n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  static styles = css`
    :host { display: block; font-family: var(--tbt-font); }
    .table-wrap {
      overflow-y: auto;
      overflow-x: auto;
      border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-md);
      box-sizing: border-box;
    }
    .footer {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--tbt-space-3);
      margin-top: var(--tbt-space-2);
    }
  `;

  render() {
    const { subtotal, vat, total } = this._totals;
    const vatPct = `VAT ${Math.round((this.vatRate ?? 0.07) * 100)}%`;
    return html`
      <tbt-section .title=${this.title ?? ''}>
        <div class="table-wrap" style="max-height:${this.maxHeight ?? '320px'}">
          <tbt-line-items
            .currency=${this.currency ?? '฿'}
            .vatRate=${this.vatRate ?? 0.07}
            .showSummary=${false}
            @tbt-change=${this._onLiChange}>
          </tbt-line-items>
        </div>
        <div class="footer">
          <tbt-button
            variant="ghost"
            icon="plus"
            size="sm"
            ?disabled=${this.disabled}
            @click=${() => this._li()?.addRow()}>
            ${this.addLabel ?? 'Add line'}
          </tbt-button>
          ${this.showSummary ? html`
            <tbt-summary>
              <tbt-summary-item label="Subtotal"    value=${this._fmt(subtotal)}></tbt-summary-item>
              <tbt-summary-item label=${vatPct}     value=${this._fmt(vat)}></tbt-summary-item>
              <tbt-summary-item label="Grand total" value=${this._fmt(total)} highlight></tbt-summary-item>
            </tbt-summary>` : nothing}
        </div>
      </tbt-section>
    `;
  }
}

customElements.define('tbt-lines-block', TbtLinesBlock);

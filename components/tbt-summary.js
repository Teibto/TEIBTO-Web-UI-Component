/**
 * @component tbt-summary
 * @version 1.26.1
 * @author Wichit Wongta
 *
 * Document totals block — subtotal, VAT, grand total.
 * Slot "extra-rows" for custom rows before grand total.
 * Use `highlight` on tbt-summary-item for the grand total emphasis.
 *
 * Usage (simple props):
 *   <tbt-summary subtotal="100000" vat="7000"></tbt-summary>
 *
 * Usage (with slot items for full control):
 *   <tbt-summary>
 *     <tbt-summary-item label="Subtotal" value="100,000"></tbt-summary-item>
 *     <tbt-summary-item label="VAT 7%" value="7,000"></tbt-summary-item>
 *     <tbt-summary-item label="Total" value="107,000" highlight></tbt-summary-item>
 *   </tbt-summary>
 */
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

/**
 * @slot - tbt-summary-item elements
 * @slot extra-rows - Additional custom summary rows
 */
class TbtSummary extends LitElement {
  static properties = {
    subtotal:        { type: Number },
    vat:             { type: Number },
    vatRate:         { type: Number, attribute: 'vat-rate' },
    currency:        { type: String },
    grandTotalLabel: { type: String, attribute: 'grand-total-label' }
  };

  constructor() {
    super();
    this.subtotal = 0;
    this.vat = 0;
    this.vatRate = 7;
    this.currency = '฿';
    this.grandTotalLabel = 'Grand total';
  }

  static styles = css`
    :host {
      display: block;
      font-family: var(--tbt-font);
    }
    .auto-summary {
      display: flex;
      flex-direction: column;
      gap: var(--tbt-space-2);
      padding: var(--tbt-space-4) var(--tbt-space-5);
      background: var(--tbt-bg-card);
      border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-lg);
      box-shadow: var(--tbt-shadow-sm);
      width: 100%;
      box-sizing: border-box;
    }
    .row {
      display: flex;
      justify-content: space-between;
      gap: var(--tbt-space-4);
      font-size: var(--tbt-size-base);
      color: var(--tbt-text-secondary);
      min-width: 0;
    }
    .row .val {
      color: var(--tbt-text-primary);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .divider {
      width: 100%;
      border: 0;
      border-top: 1px solid var(--tbt-border);
      margin: var(--tbt-space-1) 0;
    }
    .grand-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: var(--tbt-space-4);
      min-width: 0;
    }
    .grand-label {
      font-size: var(--tbt-size-base);
      font-weight: var(--tbt-weight-medium);
      color: var(--tbt-text-primary);
    }
    .grand-val {
      font-size: var(--tbt-size-lg);
      font-weight: var(--tbt-weight-semibold);
      color: var(--tbt-primary);
      font-variant-numeric: tabular-nums;
    }
    /* When using slot items instead of props */
    ::slotted(tbt-summary-item) {
      display: block;
    }
  `;

  _fmt(n) {
    const num = Number(n || 0);
    return `${this.currency}${num.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  render() {
    const hasSlot = this._hasItems();
    if (hasSlot) {
      return html`<slot></slot>`;
    }
    const sub = Number(this.subtotal || 0);
    const vat = Number(this.vat || 0);
    const total = sub + vat;
    return html`
      <div class="auto-summary">
        <div class="row">
          <span>Subtotal (pre-VAT)</span>
          <span class="val">${this._fmt(sub)}</span>
        </div>
        <div class="row">
          <span>VAT ${this.vatRate}%</span>
          <span class="val">${this._fmt(vat)}</span>
        </div>
        <slot name="extra-rows"></slot>
        <hr class="divider">
        <div class="grand-row">
          <span class="grand-label">${this.grandTotalLabel}</span>
          <span class="grand-val">${this._fmt(total)}</span>
        </div>
      </div>
    `;
  }

  _hasItems() {
    const slot = this.shadowRoot?.querySelector('slot:not([name])');
    if (!slot) return false;
    return slot.assignedElements().length > 0;
  }
}

customElements.define('tbt-summary', TbtSummary);

class TbtSummaryItem extends LitElement {
  static properties = {
    label:     { type: String },
    value:     { type: String },
    highlight: { type: Boolean, reflect: true }
  };

  static styles = css`
    :host {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: var(--tbt-space-4);
      font-family: var(--tbt-font);
      font-size: var(--tbt-size-base);
      color: var(--tbt-text-secondary);
      padding: var(--tbt-space-1) 0;
      min-width: 0;
    }
    .val {
      color: var(--tbt-text-primary);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    :host([highlight]) {
      color: var(--tbt-text-primary);
      font-weight: var(--tbt-weight-medium);
      border-top: 1px solid var(--tbt-border);
      padding-top: var(--tbt-space-3);
      margin-top: var(--tbt-space-1);
    }
    :host([highlight]) .val {
      font-size: var(--tbt-size-lg);
      font-weight: var(--tbt-weight-semibold);
      color: var(--tbt-primary);
      white-space: nowrap;
    }
  `;

  render() {
    return html`
      <span>${this.label}</span>
      <span class="val">${this.value}</span>
    `;
  }
}

customElements.define('tbt-summary-item', TbtSummaryItem);

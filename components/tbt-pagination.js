/**
 * @component tbt-pagination
 * @version 1.24.2
 * @author Wichit Wongta
 *
 * Standalone pagination bar. Used internally by tbt-table and usable
 * on its own for list pages that paginate non-table content.
 *
 * Usage:
 *   <tbt-pagination
 *     total="234"
 *     page="1"
 *     page-size="50"
 *     @tbt-page-change=${e => this.page = e.detail.page}>
 *   </tbt-pagination>
 *
 * Event: tbt-page-change → { page: number }
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

/**
 * @fires tbt-page-change - Fired when user navigates to a new page; detail: { page: number }
 */
class TbtPagination extends LitElement {
  static properties = {
    total:    { type: Number },
    page:     { type: Number, reflect: true },
    pageSize: { type: Number, attribute: 'page-size' },
  };

  constructor() {
    super();
    this.total    = 0;
    this.page     = 1;
    this.pageSize = 50;
  }

  static styles = css`
    :host { display: block; font-family: var(--tbt-font); }
    .pagination {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--tbt-space-3) var(--tbt-space-4);
      border-top: 1px solid var(--tbt-border);
      background: var(--tbt-bg-card);
      flex-wrap: wrap;
      gap: var(--tbt-space-2);
    }
    .page-info { font-size: var(--tbt-size-sm); color: var(--tbt-text-secondary); }
    .page-btns { display: flex; gap: var(--tbt-space-1); flex-wrap: wrap; }
    .page-btn {
      min-width: 32px;
      height: 32px;
      padding: 0 var(--tbt-space-2);
      border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-sm);
      background: var(--tbt-bg-card);
      color: var(--tbt-text-secondary);
      font-family: inherit;
      font-size: var(--tbt-size-sm);
      cursor: pointer;
      transition: background var(--tbt-transition-fast), color var(--tbt-transition-fast);
    }
    .page-btn:hover:not(:disabled) { background: var(--tbt-bg-hover); color: var(--tbt-text-primary); }
    .page-btn.active { background: var(--tbt-primary); color: var(--tbt-text-inverse); border-color: var(--tbt-primary); }
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  `;

  get _totalPages() {
    return Math.ceil(this.total / this.pageSize) || 1;
  }

  _go(p) {
    if (p === this.page || p < 1 || p > this._totalPages) return;
    this.page = p;
    this.dispatchEvent(new CustomEvent('tbt-page-change', {
      detail: { page: p },
      bubbles: true,
      composed: true,
    }));
  }

  _pageButtons() {
    const totalPages = this._totalPages;
    return Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter(p => Math.abs(p - this.page) <= 2 || p === 1 || p === totalPages)
      .reduce((acc, p, i, arr) => {
        if (i > 0 && p - arr[i - 1] > 1) acc.push('…');
        acc.push(p);
        return acc;
      }, []);
  }

  render() {
    if (this._totalPages <= 1) return nothing;
    const start = (this.page - 1) * this.pageSize + 1;
    const end   = Math.min(this.page * this.pageSize, this.total);
    return html`
      <div class="pagination">
        <span class="page-info">${start}–${end} of ${this.total}</span>
        <div class="page-btns">
          <button class="page-btn" ?disabled=${this.page === 1}
            aria-label="Previous page" @click=${() => this._go(this.page - 1)}>‹</button>
          ${this._pageButtons().map(p => p === '…'
            ? html`<span class="page-btn" style="border:none;cursor:default">…</span>`
            : html`<button class="page-btn ${p === this.page ? 'active' : ''}"
                aria-label="Page ${p}" aria-current=${p === this.page ? 'true' : nothing}
                @click=${() => this._go(p)}>${p}</button>`)}
          <button class="page-btn" ?disabled=${this.page === this._totalPages}
            aria-label="Next page" @click=${() => this._go(this.page + 1)}>›</button>
        </div>
      </div>
    `;
  }
}

customElements.define('tbt-pagination', TbtPagination);

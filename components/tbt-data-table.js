/**
 * @component tbt-data-table
 * @version 1.26.1
 * @author Wichit Wongta
 *
 * Server-side data table wrapper around tbt-table.
 * Handles fetch, pagination, sort, loading, and error states.
 * Reduces typical list-page Suitelet code by ~50%.
 *
 * Usage:
 *   <tbt-data-table id="dt" page-size="50" empty-message="No records"></tbt-data-table>
 *   <script type="module">
 *     const dt = document.getElementById('dt');
 *     dt.columns = [
 *       { key: 'tranid',   label: 'Document No.', sortable: true },
 *       { key: 'trandate', label: 'Date',         sortable: true },
 *       { key: 'entity',   label: 'Vendor' },
 *       { key: 'amount',   label: 'Amount',       align: 'right' },
 *     ];
 *     dt.fetch = async ({ page, pageSize, sort, order }) => {
 *       const offset = (page - 1) * pageSize;
 *       const res = await fetch(`/restlet?offset=${offset}&limit=${pageSize}&sort=${sort}&order=${order}`);
 *       return res.json(); // must return { rows: [...], total: N }
 *     };
 *   </script>
 *
 * Props:
 *   columns      Column definitions (same format as tbt-table)
 *   fetch        async ({ page, pageSize, sort, order }) => { rows, total }
 *   page-size    Items per page (default 50)
 *   empty-message  Shown when fetch returns zero rows (default 'No records found')
 *   max-height   Forwarded to tbt-table
 *
 * Methods:
 *   refresh()    Re-fetch the current page (e.g. after a save)
 *
 * Events: tbt-load-error — fired when fetch throws; detail: { error }
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import './tbt-table.js';
import './tbt-pagination.js';
import './tbt-skeleton.js';
import './tbt-alert.js';

/**
 * @fires tbt-load-error - Fired when the fetch function throws; detail: { error }
 */
class TbtDataTable extends LitElement {
  static properties = {
    columns:      { type: Array },
    fetch:        { attribute: false },
    pageSize:     { type: Number,  attribute: 'page-size' },
    emptyMessage: { type: String,  attribute: 'empty-message' },
    maxHeight:    { type: String,  attribute: 'max-height' },
    _rows:        { state: true },
    _total:       { state: true },
    _page:        { state: true },
    _sort:        { state: true },
    _order:       { state: true },
    _loading:     { state: true },
    _error:       { state: true },
  };

  constructor() {
    super();
    this.columns      = [];
    this.fetch        = null;
    this.pageSize     = 50;
    this.emptyMessage = 'No records found';
    this.maxHeight    = '';
    this._rows        = [];
    this._total       = 0;
    this._page        = 1;
    this._sort        = null;
    this._order       = 'asc';
    this._loading     = false;
    this._error       = null;
  }

  static styles = css`
    :host { display: block; font-family: var(--tbt-font); }
    .skeleton-wrap {
      border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-lg);
      padding: var(--tbt-space-4);
      display: flex;
      flex-direction: column;
      gap: var(--tbt-space-3);
      background: var(--tbt-bg-card);
    }
    tbt-table { display: block; }
  `;

  updated(changed) {
    if (changed.has('fetch') && this.fetch) {
      this._page = 1;
      this._sort = null;
      this._order = 'asc';
      this._load();
    }
    if (changed.has('columns') && changed.has('columns') && this.fetch && !changed.has('fetch')) {
      this._load();
    }
  }

  async _load() {
    if (!this.fetch) return;
    this._loading = true;
    this._error   = null;
    try {
      const result = await this.fetch({
        page:     this._page,
        pageSize: this.pageSize,
        sort:     this._sort  || '',
        order:    this._order || 'asc',
      });
      this._rows  = result.rows  ?? [];
      this._total = result.total ?? 0;
    } catch (err) {
      this._error = err?.message || 'Failed to load data';
      this.dispatchEvent(new CustomEvent('tbt-load-error', {
        detail: { error: err },
        bubbles: true,
        composed: true,
      }));
    } finally {
      this._loading = false;
    }
  }

  /** Re-fetch the current page — call after a create/update/delete operation. */
  refresh() {
    this._load();
  }

  _onSort(e) {
    this._sort  = e.detail.key;
    this._order = e.detail.asc ? 'asc' : 'desc';
    this._page  = 1;
    this._load();
  }

  _onPageChange(e) {
    this._page = e.detail.page;
    this._load();
  }

  render() {
    if (this._loading) {
      return html`
        <div class="skeleton-wrap">
          <tbt-skeleton variant="text" lines="1" width="40%"></tbt-skeleton>
          ${Array.from({ length: Math.min(5, this.pageSize) }, () => html`
            <tbt-skeleton variant="block" height="40px"></tbt-skeleton>
          `)}
        </div>
      `;
    }

    if (this._error) {
      return html`
        <tbt-alert variant="danger" title="Failed to load">
          ${this._error}
          <tbt-button variant="secondary" style="margin-top:var(--tbt-space-2)" @click=${() => this._load()}>
            Retry
          </tbt-button>
        </tbt-alert>
      `;
    }

    return html`
      <tbt-table
        .columns=${this.columns}
        .rows=${this._rows}
        max-height=${this.maxHeight || nothing}
        empty-message=${this.emptyMessage}
        server-sort
        sort-key=${this._sort || nothing}
        ?sort-asc=${this._order === 'asc'}
        @tbt-sort=${this._onSort}>
      </tbt-table>
      <tbt-pagination
        .total=${this._total}
        .page=${this._page}
        .pageSize=${this.pageSize}
        @tbt-page-change=${this._onPageChange}>
      </tbt-pagination>
    `;
  }
}

customElements.define('tbt-data-table', TbtDataTable);

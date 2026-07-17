/**
 * @component tbt-stat
 * @version 1.46.0
 * @author Wichit Wongta
 *
 * Stat / KPI card for dashboard metrics with optional trend indicator and icon.
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';
import { ICON_ALIASES } from './tbt-icon.js';

class TbtStat extends LitElement {
  static properties = {
    value:        { type: String },
    label:        { type: String },
    trend:        { type: String },
    trendVariant: { type: String, attribute: 'trend-variant' },
    icon:         { type: String },
    variant:      { type: String, reflect: true },
  };

  static styles = css`
    :host {
      display: block;
      font-family: var(--tbt-font);
    }

    .card {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: var(--tbt-space-1) var(--tbt-space-3);
      padding: var(--tbt-space-5);
      background: var(--tbt-bg-card);
      border: 1px solid var(--tbt-border);
      border-top: 3px solid var(--tbt-border);
      border-radius: var(--tbt-radius-lg);
      box-shadow: var(--tbt-shadow-sm);
    }

    /* ── Variant accent lines ── */
    :host([variant="primary"]) .card { border-top-color: var(--tbt-primary); }
    :host([variant="success"]) .card { border-top-color: var(--tbt-success); }
    :host([variant="warning"]) .card { border-top-color: var(--tbt-warning); }
    :host([variant="danger"])  .card { border-top-color: var(--tbt-danger); }
    :host([variant="info"])    .card { border-top-color: var(--tbt-info); }

    .label {
      grid-column: 1;
      font-size: var(--tbt-size-sm);
      font-weight: var(--tbt-weight-medium);
      color: var(--tbt-text-secondary);
    }

    .value {
      grid-column: 1;
      font-size: var(--tbt-size-xl);
      font-weight: var(--tbt-weight-bold);
      color: var(--tbt-text-primary);
      line-height: 1.15;
      letter-spacing: -0.5px;
    }

    .trend {
      grid-column: 1;
      display: inline-flex;
      align-items: center;
      gap: 3px;
      margin-top: var(--tbt-space-1);
      font-size: var(--tbt-size-sm);
      font-weight: var(--tbt-weight-medium);
    }
    .trend.success { color: var(--tbt-success); }
    .trend.danger  { color: var(--tbt-danger); }
    .trend.neutral { color: var(--tbt-text-muted); }

    .icon-wrap {
      grid-column: 2;
      grid-row: 1 / 3;
      display: flex;
      align-items: center;
      justify-content: center;
      align-self: start;
      width: 44px;
      height: 44px;
      border-radius: var(--tbt-radius-md);
      background: var(--tbt-bg-hover);
      color: var(--tbt-text-muted);
      font-size: 22px;
    }

    /* ── Variant icon colors ── */
    :host([variant="primary"]) .icon-wrap { background: var(--tbt-primary-bg); color: var(--tbt-primary); }
    :host([variant="success"]) .icon-wrap { background: var(--tbt-success-bg); color: var(--tbt-success); }
    :host([variant="warning"]) .icon-wrap { background: var(--tbt-warning-bg); color: var(--tbt-warning); }
    :host([variant="danger"])  .icon-wrap { background: var(--tbt-danger-bg);  color: var(--tbt-danger); }
    :host([variant="info"])    .icon-wrap { background: var(--tbt-info-bg);    color: var(--tbt-info); }
  `;

  get _resolvedTrendVariant() {
    if (this.trendVariant) return this.trendVariant;
    if (this.trend?.startsWith('+')) return 'success';
    if (this.trend?.startsWith('-')) return 'danger';
    return 'neutral';
  }

  get _trendIcon() {
    if (this.trend?.startsWith('+')) return 'trending-up';
    if (this.trend?.startsWith('-')) return 'trending-down';
    return 'minus';
  }

  render() {
    const tv = this._resolvedTrendVariant;
    return html`
      ${tablerLink}
      <div class="card">
        <div class="label">${this.label}</div>
        ${this.icon ? html`
          <div class="icon-wrap" aria-hidden="true">
            <i class="ti ti-${ICON_ALIASES[this.icon] ?? this.icon}"></i>
          </div>
        ` : nothing}
        <div class="value">${this.value ?? '—'}</div>
        ${this.trend ? html`
          <div class="trend ${tv}">
            <i class="ti ti-${this._trendIcon}" aria-hidden="true"></i>
            <span>${this.trend}</span>
          </div>
        ` : nothing}
      </div>
    `;
  }
}

customElements.define('tbt-stat', TbtStat);

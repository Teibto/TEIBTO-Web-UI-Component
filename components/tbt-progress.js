/**
 * @component tbt-progress
 * @version 1.46.1
 * @author Wichit Wongta
 *
 * Horizontal progress bar for upload, import batch, and processing feedback.
 * Supports determinate (0–100%), indeterminate (pulsing), and animated modes.
 *
 * Usage:
 *   <tbt-progress value="75" label="Uploading file…" show-value></tbt-progress>
 *   <tbt-progress value="100" variant="success" label="Import complete" show-value></tbt-progress>
 *   <tbt-progress indeterminate label="Processing…"></tbt-progress>
 *
 * Variants: primary (default) | success | warning | danger
 * Sizes:    sm (4px) | md (8px, default) | lg (14px)
 *
 * @slot - (no slots — prop-driven display component)
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

class TbtProgress extends LitElement {
  static properties = {
    value:         { type: Number },
    label:         { type: String },
    variant:       { type: String, reflect: true },
    size:          { type: String, reflect: true },
    showValue:     { type: Boolean, attribute: 'show-value' },
    indeterminate: { type: Boolean, reflect: true },
  };

  constructor() {
    super();
    this.value         = 0;
    this.variant       = 'primary';
    this.size          = 'md';
    this.showValue     = false;
    this.indeterminate = false;
  }

  get _pct() {
    return Math.min(100, Math.max(0, this.value ?? 0));
  }

  static styles = css`
    :host { display: block; font-family: var(--tbt-font); }

    .header {
      display: flex; justify-content: space-between; align-items: baseline;
      margin-bottom: var(--tbt-space-2);
    }
    .label-text {
      font-size: var(--tbt-size-sm);
      color: var(--tbt-text-secondary);
    }
    .value-text {
      font-size: var(--tbt-size-xs);
      font-family: var(--tbt-font-mono);
      color: var(--tbt-text-muted);
    }

    /* ── Track ────────────────────────────────── */
    .track {
      width: 100%; overflow: hidden;
      background: var(--tbt-bg-active);
      border-radius: var(--tbt-radius-pill);
      height: 8px;
    }
    :host([size="sm"]) .track { height: 4px; }
    :host([size="lg"]) .track { height: 14px; }

    /* ── Bar ──────────────────────────────────── */
    .bar {
      height: 100%;
      border-radius: inherit;
      background: var(--tbt-primary);
      transition: width var(--tbt-transition-base);
      transform-origin: left center;
    }

    :host([variant="success"]) .bar { background: var(--tbt-success); }
    :host([variant="warning"]) .bar { background: var(--tbt-warning); }
    :host([variant="danger"])  .bar { background: var(--tbt-danger); }

    /* ── Indeterminate ────────────────────────── */
    @keyframes slide {
      0%   { transform: translateX(-100%) scaleX(0.4); }
      50%  { transform: translateX(75%)   scaleX(0.6); }
      100% { transform: translateX(250%)  scaleX(0.4); }
    }
    :host([indeterminate]) .bar {
      width: 40%;
      animation: slide 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      transition: none;
    }
  `;

  render() {
    const pct   = this._pct;
    const indet = this.indeterminate;
    const hasHeader = this.label || (this.showValue && !indet);

    return html`
      ${hasHeader ? html`
        <div class="header">
          <span class="label-text">${this.label ?? ''}</span>
          ${this.showValue && !indet
            ? html`<span class="value-text">${pct}%</span>`
            : ''}
        </div>` : ''}
      <div class="track"
        role="progressbar"
        aria-label=${this.label || 'Progress'}
        aria-valuenow=${indet ? nothing : String(pct)}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-busy=${indet ? 'true' : nothing}>
        <div class="bar"
          style=${indet ? nothing : `width:${pct}%`}>
        </div>
      </div>
    `;
  }
}

customElements.define('tbt-progress', TbtProgress);

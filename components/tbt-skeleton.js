/**
 * @component tbt-skeleton
 * @version 1.24.0
 * @author Wichit Wongta
 *
 * Animated loading placeholder. Use while fetching data to reduce
 * perceived latency (replaces custom inline skeleton CSS in each component).
 *
 * Usage:
 *   <tbt-skeleton variant="text"></tbt-skeleton>
 *   <tbt-skeleton variant="text" lines="3"></tbt-skeleton>
 *   <tbt-skeleton variant="block" width="100%" height="120px"></tbt-skeleton>
 *   <tbt-skeleton variant="circle" width="40px"></tbt-skeleton>
 *   <tbt-skeleton variant="card"></tbt-skeleton>
 *
 * Props:
 *   variant   text (default) | block | circle | card
 *   width     CSS length — overrides default width
 *   height    CSS length — overrides default height
 *   lines     Number of text lines (variant="text" only, default 1)
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

/**
 * @slot - (variant="card" only) Extra content appended after the card skeleton
 */
class TbtSkeleton extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    width:   { type: String },
    height:  { type: String },
    lines:   { type: Number },
  };

  constructor() {
    super();
    this.variant = 'text';
    this.lines   = 1;
  }

  static styles = css`
    :host { display: block; }

    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }

    .bone {
      border-radius: var(--tbt-radius-sm);
      background: linear-gradient(
        90deg,
        var(--tbt-bg-hover) 25%,
        var(--tbt-border)   50%,
        var(--tbt-bg-hover) 75%
      );
      background-size: 200% auto;
      animation: shimmer 1.5s linear infinite;
    }

    :host([variant="text"]) .bone,
    .text-line {
      height: 14px;
      border-radius: var(--tbt-radius-pill);
    }
    .text-lines { display: flex; flex-direction: column; gap: var(--tbt-space-2); }

    :host([variant="block"]) .bone {
      height: var(--_h, 80px);
      width:  var(--_w, 100%);
    }

    :host([variant="circle"]) .bone {
      width:  var(--_w, 40px);
      height: var(--_w, 40px);
      border-radius: 50%;
    }

    .card {
      border: 1px solid var(--tbt-border);
      border-radius: var(--tbt-radius-lg);
      background: var(--tbt-bg-card);
      padding: var(--tbt-space-4);
      display: flex;
      flex-direction: column;
      gap: var(--tbt-space-3);
    }
    .card-header { display: flex; align-items: center; gap: var(--tbt-space-3); }
    .card-avatar { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; }
    .card-title  { flex: 1; height: 14px; border-radius: var(--tbt-radius-pill); }
    .card-line   { height: 12px; border-radius: var(--tbt-radius-pill); }
  `;

  _sizeStyle() {
    const parts = [];
    if (this.width)  parts.push(`--_w:${this.width}`);
    if (this.height) parts.push(`--_h:${this.height}`);
    return parts.length ? parts.join(';') : nothing;
  }

  render() {
    if (this.variant === 'text') {
      const count = Math.max(1, this.lines);
      return html`
        <div class="text-lines">
          ${Array.from({ length: count }, (_, i) => html`
            <div class="bone text-line"
              style=${i === count - 1 && count > 1 ? 'width:70%' : nothing}></div>
          `)}
        </div>
      `;
    }

    if (this.variant === 'card') {
      return html`
        <div class="card">
          <div class="card-header">
            <div class="bone card-avatar"></div>
            <div class="bone card-title"></div>
          </div>
          <div class="bone card-line"></div>
          <div class="bone card-line" style="width:85%"></div>
          <div class="bone card-line" style="width:60%"></div>
          <slot></slot>
        </div>
      `;
    }

    return html`<div class="bone" style=${this._sizeStyle()}></div>`;
  }
}

customElements.define('tbt-skeleton', TbtSkeleton);

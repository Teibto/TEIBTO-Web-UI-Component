/**
 * @component tbt-timeline
 * @version 1.45.1
 * @author Wichit Wongta
 *
 * Vertical event timeline for document history, process flows, and audit trails.
 * Each entry has a label, timestamp, optional user, icon, variant, and content.
 *
 * Usage:
 *   <tbt-timeline
 *     .entries=${[
 *       { label: 'Order created',   timestamp: '2026-05-20T09:00:00', user: 'Wichit', icon: 'plus',  variant: 'primary' },
 *       { label: 'Submitted',       timestamp: '2026-05-20T10:30:00', user: 'Wichit', icon: 'send',  variant: 'info' },
 *       { label: 'Approved',        timestamp: '2026-05-21T14:00:00', user: 'Manager', icon: 'check', variant: 'success',
 *         content: 'Approved — please proceed with delivery' },
 *     ]}>
 *   </tbt-timeline>
 *
 * Entry fields: label*, timestamp, user, icon, variant, content
 * Variants: primary | success | warning | danger | info | neutral (default)
 *
 * @slot - (no slots — data-driven via .entries property)
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';
import { ICON_ALIASES } from './tbt-icon.js';

class TbtTimeline extends LitElement {
  static properties = {
    entries:   { type: Array },
    compact:   { type: Boolean, reflect: true },
    maxHeight: { type: String, attribute: 'max-height' },
  };

  constructor() {
    super();
    this.entries   = [];
    this.compact   = false;
    this.maxHeight = '';
  }

  _formatTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
      hour12: false,
    });
  }

  static styles = css`
    :host { display: block; font-family: var(--tbt-font); }

    .scroll-wrap {
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--tbt-border) transparent;
    }

    ol {
      list-style: none; margin: 0; padding: 0;
    }

    .entry {
      display: grid;
      grid-template-columns: 36px 1fr;
      gap: 0 var(--tbt-space-3);
    }

    /* ── Connector (dot + line) ────────────────────── */
    .connector {
      display: flex; flex-direction: column; align-items: center;
    }
    .dot {
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; font-size: 14px;
    }
    .dot-inner {
      width: 8px; height: 8px; border-radius: 50%;
      background: currentColor; opacity: 0.6;
    }
    .line {
      flex: 1; width: 2px;
      background: var(--tbt-border);
      margin: 3px 0;
      min-height: var(--tbt-space-4);
    }
    .entry:last-child .line { display: none; }

    /* ── Dot variants ──────────────────────────────── */
    .dot--primary  { background: var(--tbt-primary-bg);  color: var(--tbt-primary-text); }
    .dot--success  { background: var(--tbt-success-bg);  color: var(--tbt-success-text); }
    .dot--warning  { background: var(--tbt-warning-bg);  color: var(--tbt-warning-text); }
    .dot--danger   { background: var(--tbt-danger-bg);   color: var(--tbt-danger-text); }
    .dot--info     { background: var(--tbt-info-bg);     color: var(--tbt-info-text); }
    .dot--neutral  { background: var(--tbt-bg-active);   color: var(--tbt-text-secondary); }

    /* ── Body ──────────────────────────────────────── */
    .body {
      padding-bottom: var(--tbt-space-5);
      min-width: 0;
    }
    .entry:last-child .body { padding-bottom: 0; }

    .label {
      font-size: var(--tbt-size-base);
      font-weight: var(--tbt-weight-medium);
      color: var(--tbt-text-primary);
      line-height: 32px;
    }
    .meta {
      display: flex; flex-wrap: wrap; align-items: center;
      gap: var(--tbt-space-1);
      margin-top: 2px;
      font-size: var(--tbt-size-xs);
      color: var(--tbt-text-muted);
    }
    .sep { opacity: 0.5; }
    .content {
      margin-top: var(--tbt-space-2);
      padding: var(--tbt-space-2) var(--tbt-space-3);
      font-size: var(--tbt-size-sm);
      color: var(--tbt-text-secondary);
      background: var(--tbt-bg-hover);
      border-left: 2px solid var(--tbt-border-strong);
      border-radius: 0 var(--tbt-radius-sm) var(--tbt-radius-sm) 0;
    }

    /* ── Compact mode ──────────────────────────────── */
    :host([compact]) .meta    { display: none; }
    :host([compact]) .content { display: none; }
    :host([compact]) .body    { padding-bottom: var(--tbt-space-3); }
    :host([compact]) .dot     { width: 24px; height: 24px; font-size: 11px; }
    :host([compact]) .label   { font-size: var(--tbt-size-sm); line-height: 24px; }
    :host([compact]) .line    { min-height: var(--tbt-space-2); }
  `;

  render() {
    const entries = this.entries ?? [];
    const wrapStyle = this.maxHeight ? `max-height:${this.maxHeight}` : nothing;

    return html`
      ${tablerLink}
      <div class="scroll-wrap" style=${wrapStyle}>
        <ol aria-label="Timeline">
          ${entries.map(entry => {
            const variant = entry.variant || 'neutral';
            const ts = this._formatTime(entry.timestamp);
            return html`
              <li class="entry">
                <div class="connector" aria-hidden="true">
                  <div class="dot dot--${variant}">
                    ${entry.icon
                      ? html`<i class="ti ti-${ICON_ALIASES[entry.icon] ?? entry.icon}"></i>`
                      : html`<span class="dot-inner"></span>`}
                  </div>
                  <div class="line"></div>
                </div>
                <div class="body">
                  <div class="label">${entry.label}</div>
                  ${ts || entry.user ? html`
                    <div class="meta">
                      ${ts   ? html`<span>${ts}</span>` : ''}
                      ${ts && entry.user ? html`<span class="sep">·</span>` : ''}
                      ${entry.user ? html`<span>${entry.user}</span>` : ''}
                    </div>` : ''}
                  ${entry.content ? html`
                    <div class="content">${entry.content}</div>` : ''}
                </div>
              </li>`;
          })}
        </ol>
      </div>
    `;
  }
}

customElements.define('tbt-timeline', TbtTimeline);

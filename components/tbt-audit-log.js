/**
 * @component tbt-audit-log
 * @version 1.21.0
 * @author Wichit Wongta
 *
 * Vertical timeline showing document/record activity history.
 *
 * Usage:
 *   <tbt-audit-log .entries=${history}></tbt-audit-log>
 *   <tbt-audit-log .entries=${history} max-height="320px"></tbt-audit-log>
 *   <tbt-audit-log .entries=${history} compact></tbt-audit-log>
 *   <tbt-audit-log loading></tbt-audit-log>
 *
 * Entry shape:
 *   {
 *     id:        string
 *     timestamp: string                   ISO 8601
 *     user:      string                   display name
 *     action:    string                   created|updated|approved|rejected|submitted|
 *                                         cancelled|deleted|printed|emailed|attached|viewed
 *     label:     string                   short description shown on the timeline row
 *     detail?:   string                   optional note line below label
 *     changes?:  { field, from, to }[]    field-level diffs (hidden in compact mode)
 *   }
 *
 * Props:
 *   entries        Array    log entries (displayed in order given — newest-first recommended)
 *   loading        Boolean  show skeleton placeholder while fetching
 *   compact        Boolean  hide field changes; tighter row height
 *   max-height     String   CSS value enabling vertical scroll, e.g. "320px"
 *   empty-message  String   text shown when entries is empty and not loading
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';

const ACTION_MAP = {
  created:   { variant: 'success', icon: 'plus' },
  updated:   { variant: 'info',    icon: 'pencil' },
  approved:  { variant: 'success', icon: 'circle-check' },
  rejected:  { variant: 'danger',  icon: 'circle-x' },
  submitted: { variant: 'primary', icon: 'send' },
  cancelled: { variant: 'warning', icon: 'ban' },
  deleted:   { variant: 'danger',  icon: 'trash' },
  printed:   { variant: 'neutral', icon: 'printer' },
  emailed:   { variant: 'info',    icon: 'mail' },
  attached:  { variant: 'neutral', icon: 'paperclip' },
  viewed:    { variant: 'neutral', icon: 'eye' },
};
const FALLBACK = { variant: 'neutral', icon: 'activity' };

class TbtAuditLog extends LitElement {
  static properties = {
    entries:      { type: Array },
    loading:      { type: Boolean, reflect: true },
    compact:      { type: Boolean, reflect: true },
    maxHeight:    { type: String, attribute: 'max-height' },
    emptyMessage: { type: String, attribute: 'empty-message' },
  };

  constructor() {
    super();
    this.entries = [];
    this.loading = false;
    this.compact = false;
    this.emptyMessage = 'No activity yet';
  }

  static styles = css`
    :host { display: block; font-family: var(--tbt-font); }

    .scroll-wrap { overflow-y: auto; }

    /* ── Entry row ────────────────────────────── */
    .entry {
      position: relative;
      padding-left: 42px;
      padding-bottom: var(--tbt-space-5);
    }
    :host([compact]) .entry { padding-bottom: var(--tbt-space-3); }
    .entry:last-child        { padding-bottom: 0; }

    /* vertical connector between entries */
    .entry:not(:last-child)::after {
      content: '';
      position: absolute;
      left: 13px;
      top: 26px;
      bottom: 0;
      width: 2px;
      background: var(--tbt-border);
    }

    /* ── Dot ──────────────────────────────────── */
    .dot {
      position: absolute;
      left: 0; top: 0;
      width: 26px; height: 26px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px;
      border: 2px solid var(--tbt-bg-card);
      box-shadow: var(--tbt-shadow-sm);
      background: var(--tbt-neutral-bg);
      color: var(--tbt-neutral-text);
    }
    .dot[data-v="success"] { background: var(--tbt-success-bg); color: var(--tbt-success-text); }
    .dot[data-v="danger"]  { background: var(--tbt-danger-bg);  color: var(--tbt-danger-text); }
    .dot[data-v="warning"] { background: var(--tbt-warning-bg); color: var(--tbt-warning-text); }
    .dot[data-v="info"]    { background: var(--tbt-info-bg);    color: var(--tbt-info-text); }
    .dot[data-v="primary"] { background: var(--tbt-primary-bg); color: var(--tbt-primary-text); }

    /* ── Content ──────────────────────────────── */
    .content { min-width: 0; padding-top: 2px; }

    .row1 {
      display: flex;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 2px var(--tbt-space-3);
      margin-bottom: 2px;
    }

    .label {
      font-size: var(--tbt-size-base);
      font-weight: var(--tbt-weight-medium);
      color: var(--tbt-text-primary);
    }
    .user {
      display: flex; align-items: center; gap: 3px;
      font-size: var(--tbt-size-xs);
      color: var(--tbt-text-secondary);
    }
    .user i { font-size: 10px; }
    .time {
      margin-left: auto;
      font-size: var(--tbt-size-xs);
      color: var(--tbt-text-muted);
      white-space: nowrap;
      cursor: default;
    }
    .detail {
      font-size: var(--tbt-size-xs);
      color: var(--tbt-text-secondary);
      line-height: 1.5;
      margin-top: 2px;
    }

    /* ── Field changes ────────────────────────── */
    .changes {
      margin-top: var(--tbt-space-2);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    :host([compact]) .changes { display: none; }

    .change-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--tbt-space-1) var(--tbt-space-2);
      font-size: var(--tbt-size-xs);
    }
    .chg-field {
      color: var(--tbt-text-secondary);
      font-weight: var(--tbt-weight-medium);
      min-width: 72px;
    }
    .chg-from {
      color: var(--tbt-danger-text);
      background: var(--tbt-danger-bg);
      padding: 1px 6px;
      border-radius: var(--tbt-radius-sm);
      text-decoration: line-through;
    }
    .chg-to {
      color: var(--tbt-success-text);
      background: var(--tbt-success-bg);
      padding: 1px 6px;
      border-radius: var(--tbt-radius-sm);
    }
    .chg-empty {
      color: var(--tbt-text-muted);
      background: var(--tbt-neutral-bg);
      padding: 1px 6px;
      border-radius: var(--tbt-radius-sm);
      text-decoration: none;
      font-style: italic;
    }
    .chg-arrow { color: var(--tbt-text-muted); font-size: 10px; }

    /* ── Empty state ──────────────────────────── */
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--tbt-space-10) 0;
      gap: var(--tbt-space-2);
    }
    .empty i { font-size: 28px; color: var(--tbt-text-muted); opacity: 0.5; }
    .empty span { font-size: var(--tbt-size-sm); color: var(--tbt-text-muted); }

    /* ── Loading skeleton ─────────────────────── */
    @keyframes tbt-shimmer {
      0%   { background-position: -600px 0; }
      100% { background-position:  600px 0; }
    }
    .skel {
      border-radius: var(--tbt-radius-sm);
      background: linear-gradient(
        90deg,
        var(--tbt-border) 25%,
        var(--tbt-bg-hover) 50%,
        var(--tbt-border) 75%
      );
      background-size: 1200px 100%;
      animation: tbt-shimmer 1.5s infinite linear;
    }
    .skel-dot  { width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0; }
    .skel-line { height: 12px; }
  `;

  _meta(action) {
    return ACTION_MAP[action?.toLowerCase()] ?? FALLBACK;
  }

  _formatTime(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7)  return `${days}d ago`;
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  _fullTime(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  _renderChange(c) {
    const from = c.from != null && c.from !== '' ? c.from : null;
    const to   = c.to   != null && c.to   !== '' ? c.to   : null;
    return html`
      <div class="change-row">
        <span class="chg-field">${c.field}</span>
        ${from != null
          ? html`<span class="chg-from">${from}</span>`
          : html`<span class="chg-empty">—</span>`}
        <i class="ti ti-arrow-right chg-arrow" aria-hidden="true"></i>
        ${to != null
          ? html`<span class="chg-to">${to}</span>`
          : html`<span class="chg-empty">—</span>`}
      </div>`;
  }

  _renderEntry(entry) {
    const { variant, icon } = this._meta(entry.action);
    return html`
      <div class="entry">
        <div class="dot" data-v=${variant} aria-hidden="true">
          <i class="ti ti-${icon}"></i>
        </div>
        <div class="content">
          <div class="row1">
            <span class="label">${entry.label}</span>
            <span class="user">
              <i class="ti ti-user" aria-hidden="true"></i>${entry.user}
            </span>
            <time class="time" datetime=${entry.timestamp} title=${this._fullTime(entry.timestamp)}>
              ${this._formatTime(entry.timestamp)}
            </time>
          </div>
          ${entry.detail
            ? html`<div class="detail">${entry.detail}</div>`
            : nothing}
          ${entry.changes?.length > 0
            ? html`<div class="changes">${entry.changes.map(c => this._renderChange(c))}</div>`
            : nothing}
        </div>
      </div>`;
  }

  _renderSkeleton() {
    const widths = ['55%', '70%', '60%'];
    return widths.map(w => html`
      <div class="entry">
        <div class="dot skel skel-dot"></div>
        <div class="content" style="padding-top:3px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <div class="skel skel-line" style="width:${w}"></div>
            <div class="skel skel-line" style="width:48px;margin-left:auto"></div>
          </div>
          <div class="skel skel-line" style="width:38%"></div>
        </div>
      </div>`);
  }

  render() {
    let body;
    if (this.loading) {
      body = this._renderSkeleton();
    } else if (this.entries.length === 0) {
      body = html`
        <div class="empty">
          <i class="ti ti-history" aria-hidden="true"></i>
          <span>${this.emptyMessage}</span>
        </div>`;
    } else {
      body = this.entries.map(e => this._renderEntry(e));
    }

    return html`
      ${tablerLink}
      <div class="scroll-wrap" style=${this.maxHeight ? `max-height:${this.maxHeight}` : nothing}>
        ${body}
      </div>`;
  }
}

customElements.define('tbt-audit-log', TbtAuditLog);

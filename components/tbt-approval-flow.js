/**
 * @component tbt-approval-flow
 * @version 1.26.0
 * @author Wichit Wongta
 *
 * Approval chain visualization showing each step's status, approver, and comment.
 * Supports horizontal (default, compact header/card) and vertical (sidebar/detail) layouts.
 *
 * Usage:
 *   <tbt-approval-flow .steps=${steps}></tbt-approval-flow>
 *   <tbt-approval-flow .steps=${steps} orientation="vertical"></tbt-approval-flow>
 *
 * Step shape:
 *   {
 *     id:         string
 *     label:      string      step name / role  (e.g. "Supervisor", "CFO")
 *     approver?:  string      person name
 *     status:     'pending' | 'current' | 'approved' | 'rejected' | 'skipped'
 *     timestamp?: string      ISO 8601 — when action was taken
 *     comment?:   string      optional approver note
 *   }
 *
 * Props:
 *   steps        Array    approval steps in order
 *   orientation  String   'horizontal' (default) | 'vertical'
 *   loading      Boolean  show skeleton placeholder
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';

const STATUS = {
  approved: { icon: 'check',  label: 'Approved', cls: 'approved' },
  rejected: { icon: 'x',     label: 'Rejected', cls: 'rejected' },
  current:  { icon: 'clock', label: 'Awaiting', cls: 'current'  },
  skipped:  { icon: 'minus', label: 'Skipped',  cls: 'skipped'  },
  pending:  { icon: null,    label: 'Pending',  cls: 'pending'  },
};
const FALLBACK = { icon: null, label: '', cls: 'pending' };

class TbtApprovalFlow extends LitElement {
  static properties = {
    steps:       { type: Array },
    orientation: { type: String, reflect: true },
    loading:     { type: Boolean, reflect: true },
  };

  constructor() {
    super();
    this.steps = [];
    this.orientation = 'horizontal';
    this.loading = false;
  }

  static styles = css`
    :host { display: block; font-family: var(--tbt-font); }

    /* ══ Shared dot styles ════════════════════════════════ */
    .dot {
      display: flex; align-items: center; justify-content: center;
      width: 30px; height: 30px; border-radius: 50%;
      font-size: 14px; flex-shrink: 0;
      border: 2px solid transparent;
      transition: background var(--tbt-transition-base), border-color var(--tbt-transition-base);
    }
    .dot.approved { background: var(--tbt-success-bg); color: var(--tbt-success-text); border-color: var(--tbt-success); }
    .dot.rejected { background: var(--tbt-danger-bg);  color: var(--tbt-danger-text);  border-color: var(--tbt-danger); }
    .dot.current  { background: var(--tbt-primary-bg); color: var(--tbt-primary-text); border-color: var(--tbt-primary);
                    animation: tbt-flow-pulse 2s ease-in-out infinite; }
    .dot.skipped  { background: var(--tbt-neutral-bg); color: var(--tbt-neutral-text); border-color: var(--tbt-border-strong); opacity: 0.7; }
    .dot.pending  { background: var(--tbt-bg-card);    color: var(--tbt-text-muted);   border-color: var(--tbt-border-strong); }

    @keyframes tbt-flow-pulse {
      0%, 100% { box-shadow: 0 0 0 0   color-mix(in srgb, var(--tbt-primary) 30%, transparent); }
      50%       { box-shadow: 0 0 0 7px transparent; }
    }

    /* ══ Shared chip ══════════════════════════════════════ */
    .chip {
      display: inline-block;
      font-size: 10px; font-weight: var(--tbt-weight-medium);
      padding: 1px 7px; border-radius: var(--tbt-radius-pill);
      line-height: 1.6; white-space: nowrap;
    }
    .chip.approved { background: var(--tbt-success-bg); color: var(--tbt-success-text); }
    .chip.rejected { background: var(--tbt-danger-bg);  color: var(--tbt-danger-text); }
    .chip.current  { background: var(--tbt-primary-bg); color: var(--tbt-primary-text); }
    .chip.skipped  { background: var(--tbt-neutral-bg); color: var(--tbt-neutral-text); opacity: 0.7; }
    .chip.pending  { background: var(--tbt-neutral-bg); color: var(--tbt-neutral-text); }

    /* ══ HORIZONTAL layout ════════════════════════════════ */
    :host([orientation="horizontal"]) .flow,
    :host(:not([orientation])) .flow {
      display: flex;
      align-items: flex-start;
      overflow-x: auto;
      padding: var(--tbt-space-1) 0 var(--tbt-space-2);
    }

    :host([orientation="horizontal"]) .step-wrap,
    :host(:not([orientation])) .step-wrap {
      display: flex; flex-direction: column; align-items: center;
      min-width: 88px; max-width: 130px;
      text-align: center; flex: 0 0 auto;
    }

    :host([orientation="horizontal"]) .conn-wrap,
    :host(:not([orientation])) .conn-wrap {
      flex: 1; min-width: 20px; max-width: 60px;
      padding-top: 14px; /* align line with dot center (30px/2 - 2px/2) */
    }
    :host([orientation="horizontal"]) .connector,
    :host(:not([orientation])) .connector {
      height: 2px; width: 100%;
      background: var(--tbt-border);
      transition: background var(--tbt-transition-base);
    }
    .connector.approved { background: var(--tbt-success); }
    .connector.rejected { background: var(--tbt-danger); }
    .connector.skipped  { background: var(--tbt-border-strong); }

    :host([orientation="horizontal"]) .info,
    :host(:not([orientation])) .info {
      margin-top: var(--tbt-space-2);
      display: flex; flex-direction: column; align-items: center;
      gap: 3px;
    }

    :host([orientation="horizontal"]) .step-label,
    :host(:not([orientation])) .step-label {
      font-size: var(--tbt-size-xs); font-weight: var(--tbt-weight-semibold);
      color: var(--tbt-text-primary); line-height: 1.3;
    }
    :host([orientation="horizontal"]) .approver,
    :host(:not([orientation])) .approver {
      font-size: var(--tbt-size-xs); color: var(--tbt-text-secondary); line-height: 1.3;
    }
    :host([orientation="horizontal"]) .time,
    :host(:not([orientation])) .time {
      font-size: 10px; color: var(--tbt-text-muted);
    }
    :host([orientation="horizontal"]) .comment,
    :host(:not([orientation])) .comment {
      font-size: 10px; color: var(--tbt-text-secondary); font-style: italic;
      max-width: 120px; text-align: center; line-height: 1.4;
    }

    /* ══ VERTICAL layout ══════════════════════════════════ */
    :host([orientation="vertical"]) .flow {
      display: flex; flex-direction: column;
    }

    :host([orientation="vertical"]) .step-wrap {
      display: grid;
      grid-template-columns: 30px 1fr;
      column-gap: var(--tbt-space-3);
      position: relative;
      padding-bottom: var(--tbt-space-4);
    }
    :host([orientation="vertical"]) .step-wrap:last-child { padding-bottom: 0; }

    :host([orientation="vertical"]) .conn-wrap {
      position: absolute;
      left: 14px; /* center of 30px dot */
      top: 30px; bottom: 0;
      width: 2px;
      padding: 0;
    }
    :host([orientation="vertical"]) .connector {
      width: 100%; height: 100%;
      background: var(--tbt-border);
    }

    :host([orientation="vertical"]) .info {
      padding-top: 3px;
      display: flex; flex-direction: column; gap: 3px;
    }
    :host([orientation="vertical"]) .step-label {
      font-size: var(--tbt-size-base); font-weight: var(--tbt-weight-medium);
      color: var(--tbt-text-primary); line-height: 1.3;
    }
    :host([orientation="vertical"]) .row2 {
      display: flex; align-items: center; flex-wrap: wrap;
      gap: 4px var(--tbt-space-2);
    }
    :host([orientation="vertical"]) .approver {
      font-size: var(--tbt-size-xs); color: var(--tbt-text-secondary);
      display: flex; align-items: center; gap: 3px;
    }
    :host([orientation="vertical"]) .approver i { font-size: 10px; }
    :host([orientation="vertical"]) .time {
      font-size: var(--tbt-size-xs); color: var(--tbt-text-muted);
    }
    :host([orientation="vertical"]) .comment {
      font-size: var(--tbt-size-xs); color: var(--tbt-text-secondary);
      font-style: italic; line-height: 1.5;
      padding: var(--tbt-space-1) var(--tbt-space-2);
      background: var(--tbt-bg-hover);
      border-left: 2px solid var(--tbt-border-strong);
      border-radius: 0 var(--tbt-radius-sm) var(--tbt-radius-sm) 0;
    }

    /* ══ Loading skeleton ═════════════════════════════════ */
    @keyframes tbt-flow-shimmer {
      0%   { background-position: -600px 0; }
      100% { background-position:  600px 0; }
    }
    .skel {
      border-radius: var(--tbt-radius-sm);
      background: linear-gradient(90deg,
        var(--tbt-border) 25%, var(--tbt-bg-hover) 50%, var(--tbt-border) 75%);
      background-size: 1200px 100%;
      animation: tbt-flow-shimmer 1.5s infinite linear;
    }
    .skel-dot  { width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0; }
    .skel-line { height: 10px; }
  `;

  _meta(status) {
    return STATUS[status] ?? FALLBACK;
  }

  _formatTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  _connectorCls(step) {
    if (step.status === 'approved') return 'approved';
    if (step.status === 'rejected') return 'rejected';
    if (step.status === 'skipped')  return 'skipped';
    return '';
  }

  /* ── Horizontal step ── */
  _renderHStep(step) {
    const { icon, label, cls } = this._meta(step.status);
    return html`
      <div class="step-wrap">
        <div class="dot ${cls}">
          ${icon ? html`<i class="ti ti-${icon}" aria-hidden="true"></i>` : nothing}
        </div>
        <div class="info">
          <span class="step-label">${step.label}</span>
          ${step.approver ? html`<span class="approver">${step.approver}</span>` : nothing}
          <span class="chip ${cls}">${label}</span>
          ${step.timestamp ? html`<span class="time">${this._formatTime(step.timestamp)}</span>` : nothing}
          ${step.comment   ? html`<span class="comment">"${step.comment}"</span>` : nothing}
        </div>
      </div>`;
  }

  /* ── Vertical step ── */
  _renderVStep(step, isLast) {
    const { icon, label, cls } = this._meta(step.status);
    return html`
      <div class="step-wrap">
        ${!isLast ? html`
          <div class="conn-wrap">
            <div class="connector ${this._connectorCls(step)}"></div>
          </div>` : nothing}
        <div class="dot ${cls}">
          ${icon ? html`<i class="ti ti-${icon}" aria-hidden="true"></i>` : nothing}
        </div>
        <div class="info">
          <div class="step-label">${step.label}</div>
          <div class="row2">
            ${step.approver ? html`
              <span class="approver">
                <i class="ti ti-user" aria-hidden="true"></i>${step.approver}
              </span>` : nothing}
            <span class="chip ${cls}">${label}</span>
            ${step.timestamp ? html`<span class="time">${this._formatTime(step.timestamp)}</span>` : nothing}
          </div>
          ${step.comment ? html`<div class="comment">"${step.comment}"</div>` : nothing}
        </div>
      </div>`;
  }

  /* ── Skeleton ── */
  _renderSkeletonH() {
    return [1, 2, 3].map((_, i) => html`
      ${i > 0 ? html`<div class="conn-wrap"><div class="connector"></div></div>` : nothing}
      <div class="step-wrap">
        <div class="dot skel skel-dot"></div>
        <div class="info" style="width:80px;gap:4px">
          <div class="skel skel-line" style="width:70%"></div>
          <div class="skel skel-line" style="width:90%"></div>
          <div class="skel skel-line" style="width:50%;height:16px;border-radius:9999px"></div>
        </div>
      </div>`);
  }

  _renderSkeletonV() {
    return [1, 2, 3].map((_, i) => html`
      <div class="step-wrap">
        ${i < 2 ? html`<div class="conn-wrap"><div class="connector"></div></div>` : nothing}
        <div class="dot skel skel-dot"></div>
        <div class="info" style="padding-top:3px">
          <div class="skel skel-line" style="width:45%;margin-bottom:4px"></div>
          <div style="display:flex;gap:6px">
            <div class="skel skel-line" style="width:30%"></div>
            <div class="skel skel-line" style="width:20%;height:18px;border-radius:9999px"></div>
          </div>
        </div>
      </div>`);
  }

  render() {
    const isVertical = this.orientation === 'vertical';

    if (this.loading) {
      return html`
        ${tablerLink}
        <div class="flow">
          ${isVertical ? this._renderSkeletonV() : this._renderSkeletonH()}
        </div>`;
    }

    if (isVertical) {
      return html`
        ${tablerLink}
        <div class="flow">
          ${this.steps.map((s, i) => this._renderVStep(s, i === this.steps.length - 1))}
        </div>`;
    }

    /* horizontal — interleave connectors */
    return html`
      ${tablerLink}
      <div class="flow">
        ${this.steps.map((s, i) => html`
          ${i > 0 ? html`
            <div class="conn-wrap">
              <div class="connector ${this._connectorCls(this.steps[i - 1])}"></div>
            </div>` : nothing}
          ${this._renderHStep(s)}`)}
      </div>`;
  }
}

customElements.define('tbt-approval-flow', TbtApprovalFlow);

/**
 * @component tbt-avatar
 * @version 1.46.1
 * @author Wichit Wongta
 *
 * User avatar — image with an automatic initials fallback (colour derived from
 * the name), optional status dot. Pair with <tbt-avatar-group> to stack people.
 *
 * Usage:
 *   <tbt-avatar name="Wichit Wongta" src="/u/1.jpg" size="md" status="online"></tbt-avatar>
 *   <tbt-avatar name="Mana Jaidee"></tbt-avatar>   <!-- initials MJ, colour from name -->
 *
 *   <tbt-avatar-group max="3">
 *     <tbt-avatar name="A B"></tbt-avatar> …
 *   </tbt-avatar-group>
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

const SIZES = { xs: 20, sm: 28, md: 36, lg: 48, xl: 64 };
const STATUS_LABEL = { online: 'Online', away: 'Away', busy: 'Busy', offline: 'Offline' };

class TbtAvatar extends LitElement {
  static properties = {
    name:   { type: String },
    src:    { type: String },
    size:   { type: String, reflect: true },
    status: { type: String, reflect: true },
    shape:  { type: String, reflect: true },
    _imgError: { state: true },
  };

  constructor() {
    super();
    this.size = 'md';
    this.shape = 'circle';
    this._imgError = false;
  }

  willUpdate(changed) {
    if (changed.has('src')) this._imgError = false;
  }

  static styles = css`
    :host { display: inline-block; font-family: var(--tbt-font); vertical-align: middle; }
    .av {
      position: relative; display: inline-flex; align-items: center; justify-content: center;
      width: var(--_sz); height: var(--_sz);
      border-radius: var(--tbt-radius-pill);
      color: white; font-weight: var(--tbt-weight-semibold);
      overflow: hidden; user-select: none;
      box-shadow: 0 0 0 2px var(--tbt-bg-card);
    }
    :host([shape="square"]) .av { border-radius: var(--tbt-radius-md); }
    .av img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .initials { font-size: calc(var(--_sz) * 0.4); line-height: 1; }

    /* deterministic palette — same name → same colour, dark-mode token-based */
    .c0 { background: var(--tbt-primary); }
    .c1 { background: var(--tbt-accent-purple); }
    .c2 { background: var(--tbt-accent-blue); }
    .c3 { background: var(--tbt-success); }
    .c4 { background: var(--tbt-warning); }
    .c5 { background: var(--tbt-info); }
    .c6 { background: var(--tbt-danger); }

    .dot {
      position: absolute; right: 0; bottom: 0;
      width: calc(var(--_sz) * 0.28); height: calc(var(--_sz) * 0.28);
      border-radius: var(--tbt-radius-pill);
      box-shadow: 0 0 0 2px var(--tbt-bg-card);
    }
    .dot.online  { background: var(--tbt-success); }
    .dot.away    { background: var(--tbt-warning); }
    .dot.busy    { background: var(--tbt-danger); }
    .dot.offline { background: var(--tbt-text-muted); }
  `;

  _hash(s) {
    let h = 0;
    const str = String(s || '');
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h;
  }

  _initials(name) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
  }

  render() {
    const px = SIZES[this.size] || SIZES.md;
    const showImg = this.src && !this._imgError;
    const cls = 'c' + (this._hash(this.name) % 7);
    return html`
      <div class="av ${showImg ? '' : cls}" style=${`--_sz:${px}px`}
        role="img" aria-label=${this.name || 'User'}>
        ${showImg
          ? html`<img src=${this.src} alt=${this.name || ''} @error=${() => { this._imgError = true; }}>`
          : html`<span class="initials">${this._initials(this.name)}</span>`}
        ${this.status ? html`<span class="dot ${this.status}" title=${STATUS_LABEL[this.status] || this.status}></span>` : nothing}
      </div>`;
  }
}
customElements.define('tbt-avatar', TbtAvatar);

/* ── Group: overlapping avatars with +N overflow ───────────────────────────── */

class TbtAvatarGroup extends LitElement {
  static properties = {
    max:    { type: Number },
    _count: { state: true },
  };

  constructor() {
    super();
    this.max = 0;
    this._count = 0;
  }

  static styles = css`
    :host { display: inline-flex; align-items: center; font-family: var(--tbt-font); }
    .stack { display: inline-flex; }
    ::slotted(tbt-avatar) { margin-left: -8px; }
    ::slotted(tbt-avatar:first-child) { margin-left: 0; }
    .more {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 28px; height: 28px; margin-left: -8px; padding: 0 6px;
      border-radius: var(--tbt-radius-pill);
      background: var(--tbt-bg-active); color: var(--tbt-text-secondary);
      font-size: var(--tbt-size-xs); font-weight: var(--tbt-weight-semibold);
      box-shadow: 0 0 0 2px var(--tbt-bg-card);
    }
  `;

  firstUpdated() { this._recount(); }

  _recount() {
    const avatars = [...this.querySelectorAll(':scope > tbt-avatar')];
    this._count = avatars.length;
    avatars.forEach((el, i) => { el.style.display = (this.max > 0 && i >= this.max) ? 'none' : ''; });
  }

  render() {
    const overflow = this.max > 0 && this._count > this.max ? this._count - this.max : 0;
    return html`
      <span class="stack"><slot @slotchange=${() => this._recount()}></slot></span>
      ${overflow ? html`<span class="more">+${overflow}</span>` : nothing}`;
  }
}
customElements.define('tbt-avatar-group', TbtAvatarGroup);

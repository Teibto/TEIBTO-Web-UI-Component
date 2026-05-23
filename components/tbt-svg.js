/**
 * @component tbt-svg
 * @version 1.25.0
 * @author Wichit Wongta
 *
 * SVG illustration component — built-in named illustrations, external URL fetch,
 * or inline SVG via slot. Colors resolve CSS tokens automatically (uses style= not fill=).
 *
 * Usage:
 *   <!-- Built-in illustration -->
 *   <tbt-svg name="empty"></tbt-svg>
 *   <tbt-svg name="success" size="120"></tbt-svg>
 *
 *   <!-- External URL -->
 *   <tbt-svg src="/assets/my-illustration.svg" size="100"></tbt-svg>
 *
 *   <!-- Inline SVG via slot -->
 *   <tbt-svg label="Custom icon">
 *     <svg viewBox="0 0 24 24">...</svg>
 *   </tbt-svg>
 *
 * Built-in names: empty | search | success | error | warning | draft | no-access
 *
 * Props:
 *   name    String   Built-in illustration name
 *   src     String   URL to fetch external SVG
 *   size    Number   Width & height in px (default: 80)
 *   width   Number   Width override
 *   height  Number   Height override
 *   label   String   Accessible label — when set, aria-hidden is removed
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';

/* ─── Built-in illustrations ──────────────────────────────────────────────── */
/* All SVGs use style="fill:..." so CSS custom properties resolve in shadow DOM */

const ILLUSTRATIONS = {
  empty: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none">
      <!-- Background circle -->
      <circle cx="40" cy="40" r="36" style="fill:var(--tbt-primary-bg)"/>
      <!-- Box outline -->
      <rect x="22" y="28" width="36" height="28" rx="3"
        style="stroke:var(--tbt-primary-light);fill:var(--tbt-bg-card)" stroke-width="2"/>
      <!-- Box lid left -->
      <path d="M22 36 L40 36" style="stroke:var(--tbt-primary-light)" stroke-width="2"/>
      <path d="M40 36 L58 36" style="stroke:var(--tbt-primary-light)" stroke-width="2"/>
      <!-- Lid flap -->
      <path d="M30 28 L30 22 Q40 18 50 22 L50 28"
        style="stroke:var(--tbt-primary-light);fill:var(--tbt-bg-card)" stroke-width="2"/>
      <!-- Stars/dots -->
      <circle cx="28" cy="17" r="2" style="fill:var(--tbt-accent-purple)"/>
      <circle cx="55" cy="20" r="1.5" style="fill:var(--tbt-accent-blue)"/>
      <circle cx="60" cy="50" r="2" style="fill:var(--tbt-primary-light)"/>
    </svg>`,

  search: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="36" style="fill:var(--tbt-primary-bg)"/>
      <!-- Magnifier circle -->
      <circle cx="36" cy="36" r="14"
        style="stroke:var(--tbt-primary);fill:var(--tbt-bg-card)" stroke-width="2.5"/>
      <!-- Handle -->
      <line x1="46" y1="46" x2="57" y2="57"
        style="stroke:var(--tbt-primary)" stroke-width="3" stroke-linecap="round"/>
      <!-- Search lines inside lens -->
      <line x1="30" y1="33" x2="42" y2="33"
        style="stroke:var(--tbt-border-strong)" stroke-width="2" stroke-linecap="round"/>
      <line x1="30" y1="38" x2="39" y2="38"
        style="stroke:var(--tbt-border-strong)" stroke-width="2" stroke-linecap="round"/>
      <circle cx="58" cy="22" r="2" style="fill:var(--tbt-accent-purple)"/>
      <circle cx="24" cy="56" r="1.5" style="fill:var(--tbt-accent-blue)"/>
    </svg>`,

  success: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="36" style="fill:var(--tbt-success-bg)"/>
      <!-- Outer ring -->
      <circle cx="40" cy="40" r="22"
        style="stroke:var(--tbt-success);fill:none" stroke-width="2" stroke-dasharray="4 3" opacity="0.4"/>
      <!-- Filled circle -->
      <circle cx="40" cy="40" r="16" style="fill:var(--tbt-success)"/>
      <!-- Checkmark -->
      <path d="M32 40 L38 46 L50 34"
        style="stroke:white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

  error: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="36" style="fill:var(--tbt-danger-bg)"/>
      <circle cx="40" cy="40" r="22"
        style="stroke:var(--tbt-danger);fill:none" stroke-width="2" stroke-dasharray="4 3" opacity="0.4"/>
      <circle cx="40" cy="40" r="16" style="fill:var(--tbt-danger)"/>
      <!-- X mark -->
      <line x1="34" y1="34" x2="46" y2="46"
        style="stroke:white" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="46" y1="34" x2="34" y2="46"
        style="stroke:white" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,

  warning: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="36" style="fill:var(--tbt-warning-bg)"/>
      <!-- Triangle -->
      <path d="M40 18 L62 56 H18 Z"
        style="fill:var(--tbt-warning);stroke:var(--tbt-warning)" stroke-linejoin="round" stroke-width="1"/>
      <!-- ! stem -->
      <rect x="38" y="30" width="4" height="14" rx="2" style="fill:white"/>
      <!-- ! dot -->
      <circle cx="40" cy="50" r="2.5" style="fill:white"/>
    </svg>`,

  draft: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="36" style="fill:var(--tbt-primary-bg)"/>
      <!-- Document -->
      <rect x="24" y="18" width="26" height="34" rx="3"
        style="fill:var(--tbt-bg-card);stroke:var(--tbt-border-strong)" stroke-width="1.5"/>
      <!-- Dog-ear fold -->
      <path d="M44 18 L50 24 L44 24 Z"
        style="fill:var(--tbt-primary-bg);stroke:var(--tbt-border-strong)" stroke-width="1"/>
      <!-- Lines -->
      <line x1="29" y1="30" x2="44" y2="30"
        style="stroke:var(--tbt-border-strong)" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="29" y1="35" x2="44" y2="35"
        style="stroke:var(--tbt-border-strong)" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="29" y1="40" x2="38" y2="40"
        style="stroke:var(--tbt-border-strong)" stroke-width="1.5" stroke-linecap="round"/>
      <!-- Pencil -->
      <g transform="translate(42,44) rotate(-30)">
        <rect x="0" y="-3" width="16" height="6" rx="1.5"
          style="fill:var(--tbt-primary)"/>
        <polygon points="16,-3 20,0 16,3" style="fill:var(--tbt-primary-dark)"/>
        <rect x="-2" y="-3" width="4" height="6" rx="1"
          style="fill:var(--tbt-accent-blue)" opacity="0.6"/>
      </g>
    </svg>`,

  'no-access': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="36" style="fill:var(--tbt-primary-bg)"/>
      <!-- Lock body -->
      <rect x="26" y="38" width="28" height="22" rx="4"
        style="fill:var(--tbt-primary)"/>
      <!-- Lock shackle -->
      <path d="M32 38 L32 30 Q32 22 40 22 Q48 22 48 30 L48 38"
        style="stroke:var(--tbt-primary);fill:none" stroke-width="4" stroke-linecap="round"/>
      <!-- Keyhole -->
      <circle cx="40" cy="49" r="3.5" style="fill:var(--tbt-primary-bg)"/>
      <rect x="38.5" y="50" width="3" height="5" rx="1.5" style="fill:var(--tbt-primary-bg)"/>
    </svg>`,
};

/* ─── Component ────────────────────────────────────────────────────────────── */

/**
 * @slot - Inline SVG element
 */
class TbtSvg extends LitElement {
  static properties = {
    name:     { type: String },
    src:      { type: String },
    size:     { type: Number },
    width:    { type: Number },
    height:   { type: Number },
    label:    { type: String },
    _loading: { state: true },
    _err:     { state: true },
    _fetched: { state: true },
  };

  constructor() {
    super();
    this.size     = 80;
    this._loading = false;
    this._err     = false;
    this._fetched = null;
  }

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .wrap {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .wrap svg,
    .wrap ::slotted(svg) {
      display: block;
    }
    /* Inline SVG fetched from src */
    .fetched-svg svg {
      display: block;
    }
    /* Loading spinner */
    .spinner {
      border-radius: 50%;
      border: 3px solid var(--tbt-border);
      border-top-color: var(--tbt-primary);
      animation: tbt-svg-spin 0.8s linear infinite;
    }
    @keyframes tbt-svg-spin {
      to { transform: rotate(360deg); }
    }
    /* Error state */
    .error-box {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--tbt-radius-md);
      background: var(--tbt-danger-bg);
      color: var(--tbt-danger);
      font-family: var(--tbt-font);
      font-size: var(--tbt-size-xs);
    }
  `;

  updated(changed) {
    if (changed.has('src') && this.src) {
      this._fetchSvg(this.src);
    }
  }

  async _fetchSvg(url) {
    this._loading = true;
    this._err     = false;
    this._fetched = null;
    try {
      const res  = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      /* Strip script tags and event handler attributes for safety */
      const clean = text
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/\s(on\w+)="[^"]*"/gi, '');
      this._fetched = clean;
    } catch {
      this._err = true;
    } finally {
      this._loading = false;
    }
  }

  get _w() { return this.width  ?? this.size; }
  get _h() { return this.height ?? this.size; }

  render() {
    const w = this._w;
    const h = this._h;
    const wrapStyle = `width:${w}px;height:${h}px;`;
    const ariaAttrs = this.label
      ? { role: 'img', 'aria-label': this.label }
      : { 'aria-hidden': 'true' };

    /* Loading */
    if (this._loading) {
      return html`
        <div class="wrap spinner" style="${wrapStyle}" aria-hidden="true"></div>
      `;
    }

    /* Fetch error */
    if (this._err) {
      return html`
        ${tablerLink}
        <div class="wrap error-box" style="${wrapStyle}" aria-hidden="true">
          <i class="ti ti-photo-off" style="font-size:${Math.round(w * 0.4)}px"></i>
        </div>
      `;
    }

    /* External SVG fetched via src */
    if (this._fetched) {
      return html`
        <div class="wrap fetched-svg"
          style="${wrapStyle}"
          role=${ariaAttrs.role || nothing}
          aria-label=${ariaAttrs['aria-label'] || nothing}
          aria-hidden=${ariaAttrs['aria-hidden'] || nothing}
          .innerHTML=${this._resizeFetched(this._fetched, w, h)}>
        </div>
      `;
    }

    /* Built-in illustration */
    if (this.name && ILLUSTRATIONS[this.name]) {
      return html`
        <div class="wrap"
          style="${wrapStyle}"
          role=${ariaAttrs.role || nothing}
          aria-label=${ariaAttrs['aria-label'] || nothing}
          aria-hidden=${ariaAttrs['aria-hidden'] || nothing}
          .innerHTML=${this._resizeFetched(ILLUSTRATIONS[this.name], w, h)}>
        </div>
      `;
    }

    /* Slot (inline SVG from user) */
    return html`
      <div class="wrap"
        style="${wrapStyle}"
        role=${ariaAttrs.role || nothing}
        aria-label=${ariaAttrs['aria-label'] || nothing}
        aria-hidden=${ariaAttrs['aria-hidden'] || nothing}>
        <slot></slot>
      </div>
    `;
  }

  /* Inject width/height onto the root <svg> element */
  _resizeFetched(svgText, w, h) {
    return svgText.replace(/<svg([^>]*)>/, (_, attrs) => {
      const cleaned = attrs
        .replace(/\s*width="[^"]*"/g, '')
        .replace(/\s*height="[^"]*"/g, '');
      return `<svg${cleaned} width="${w}" height="${h}" style="display:block">`;
    });
  }
}

customElements.define('tbt-svg', TbtSvg);

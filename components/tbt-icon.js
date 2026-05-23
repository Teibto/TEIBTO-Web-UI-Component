/**
 * @component tbt-icon
 * @version 1.24.1
 * @author Wichit Wongta
 *
 * Tabler icon wrapper with design-token sizing, semantic color, spin animation,
 * and built-in accessibility handling.
 * Requires the Tabler Icons web font to be loaded on the page.
 *
 * Usage:
 *   <!-- Semantic ERP aliases (recommended) -->
 *   <tbt-icon name="save"></tbt-icon>
 *   <tbt-icon name="approve" color="success" size="lg"></tbt-icon>
 *   <tbt-icon name="loader" spin color="primary"></tbt-icon>
 *
 *   <!-- Raw Tabler icon names also work -->
 *   <tbt-icon name="device-floppy"></tbt-icon>
 *
 *   <!-- Accessible (meaningful icon, not decorative) -->
 *   <tbt-icon name="user" label="User profile" size="lg"></tbt-icon>
 *
 * Props:
 *   name    String   ERP alias (see ICON_ALIASES) or raw Tabler icon name (without ti- prefix)
 *   size    String   xs | sm | md (default) | lg | xl | 2xl
 *   color   String   inherit (default) | primary | secondary | muted |
 *                    success | warning | danger | info
 *   spin    Boolean  Spinning animation — use with "loader", "refresh" etc.
 *   label   String   Accessible label; when set the icon is announced to screen readers
 *
 * Size → token mapping:
 *   xs   → --tbt-size-xs   (11px)   fine print, tight spaces
 *   sm   → --tbt-size-base (14px)   inline with body text
 *   md   → --tbt-size-md   (16px)   default standalone
 *   lg   → --tbt-size-lg   (20px)   action buttons, headers
 *   xl   → --tbt-size-xl   (28px)   empty-state icons
 *   2xl  → --tbt-size-2xl  (36px)   hero icons
 */
import { LitElement, html, css, nothing } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
import { tablerLink } from './tbt-icons-css.js';

/* ─── ERP Semantic Aliases ────────────────────────────────────────────────── */
/* Maps ERP-friendly names → Tabler icon names.
   Raw Tabler names (e.g. "device-floppy") still work as fallback. */
const ICON_ALIASES = {
  /* ── Document actions ── */
  save:           'device-floppy',
  print:          'printer',
  email:          'mail',
  attach:         'paperclip',
  export:         'file-export',
  import:         'file-import',
  download:       'download',
  upload:         'upload',
  share:          'share',

  /* ── CRUD ── */
  add:            'plus',
  new:            'plus',
  edit:           'pencil',
  delete:         'trash',
  remove:         'trash',
  copy:           'copy',
  duplicate:      'copy',
  view:           'eye',
  hide:           'eye-off',
  search:         'search',
  filter:         'filter',
  sort:           'arrows-sort',
  refresh:        'refresh',
  reload:         'reload',
  clear:          'eraser',
  reset:          'rotate-2',
  more:              'dots',
  'more-vertical':   'dots-vertical',

  /* ── Approval / Workflow ── */
  approve:        'circle-check',
  reject:         'circle-x',
  submit:         'send',
  cancel:         'ban',
  void:           'ban',
  pending:        'clock',
  draft:          'file-text',
  review:         'eye-check',
  lock:           'lock',
  unlock:         'lock-open',
  sign:           'signature',

  /* ── Navigation ── */
  back:           'arrow-left',
  forward:        'arrow-right',
  up:             'arrow-up',
  down:           'arrow-down',
  home:           'home',
  menu:           'menu-2',
  close:          'x',
  expand:          'chevron-down',
  collapse:        'chevron-up',
  'expand-right':  'chevron-right',
  external:        'external-link',

  /* ── User & Auth ── */
  user:           'user',
  users:          'users',
  logout:         'logout',
  login:          'login',
  settings:       'settings',
  profile:        'user-circle',
  role:           'shield',
  permission:     'shield-check',
  password:       'key',

  /* ── Document types ── */
  invoice:        'file-invoice',
  receipt:        'receipt',
  quotation:      'file-description',
  'purchase-order': 'shopping-cart',
  'sales-order':  'shopping-bag',
  payment:        'credit-card',
  expense:        'report-money',
  report:         'report',
  contract:       'file-certificate',
  document:       'file',
  folder:         'folder',

  /* ── Finance ── */
  money:          'currency-baht',
  bank:           'building-bank',
  tax:            'receipt-tax',
  discount:       'tag-minus',
  price:          'tag',
  total:          'sigma',

  /* ── Inventory ── */
  product:        'box',
  warehouse:      'building-warehouse',
  stock:          'packages',
  barcode:        'barcode',
  qrcode:         'qrcode',

  /* ── Communication ── */
  comment:        'message',
  note:           'note',
  notification:   'bell',
  alert:          'alert-circle',
  info:           'info-circle',
  warning:        'alert-triangle',
  success:        'circle-check',
  error:          'alert-circle',

  /* ── Time & Schedule ── */
  calendar:       'calendar',
  date:           'calendar-event',
  time:           'clock',
  history:        'history',
  schedule:       'calendar-time',
  deadline:       'calendar-due',

  /* ── Misc ── */
  chart:          'chart-bar',
  dashboard:      'layout-dashboard',
  map:            'map-pin',
  phone:          'phone',
  link:           'link',
  image:          'photo',
  check:          'check',
  loader:         'loader-2',
  spin:           'loader-2',
  star:           'star',
  bookmark:       'bookmark',
  tag:            'tag',
  category:       'category',
  company:        'building',
  branch:         'building-skyscraper',
  employee:       'id-badge-2',
  department:     'sitemap',
};

class TbtIcon extends LitElement {
  static properties = {
    name:  { type: String },
    size:  { type: String, reflect: true },
    color: { type: String, reflect: true },
    spin:  { type: Boolean, reflect: true },
    label: { type: String },
  };

  constructor() {
    super();
    this.size  = 'md';
    this.color = 'inherit';
    this.spin  = false;
  }

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      flex-shrink: 0;
      font-size: var(--tbt-size-md);
      color: inherit;
    }

    /* ── Sizes ───────────────────────────────────────── */
    :host([size="xs"])  { font-size: var(--tbt-size-xs); }
    :host([size="sm"])  { font-size: var(--tbt-size-base); }
    :host([size="md"])  { font-size: var(--tbt-size-md); }
    :host([size="lg"])  { font-size: var(--tbt-size-lg); }
    :host([size="xl"])  { font-size: var(--tbt-size-xl); }
    :host([size="2xl"]) { font-size: var(--tbt-size-2xl); }

    /* ── Colors ──────────────────────────────────────── */
    :host([color="primary"])   { color: var(--tbt-primary); }
    :host([color="secondary"]) { color: var(--tbt-text-secondary); }
    :host([color="muted"])     { color: var(--tbt-text-muted); }
    :host([color="success"])   { color: var(--tbt-success); }
    :host([color="warning"])   { color: var(--tbt-warning); }
    :host([color="danger"])    { color: var(--tbt-danger); }
    :host([color="info"])      { color: var(--tbt-info); }

    /* ── Spin ────────────────────────────────────────── */
    @keyframes tbt-icon-spin {
      to { transform: rotate(360deg); }
    }
    :host([spin]) i {
      animation: tbt-icon-spin 0.75s linear infinite;
    }

    i { line-height: 1; }
  `;

  render() {
    if (!this.name) return nothing;
    const icon = ICON_ALIASES[this.name] ?? this.name;
    return html`
      ${tablerLink}
      <i class="ti ti-${icon}"
         aria-hidden=${this.label ? nothing : 'true'}
         aria-label=${this.label || nothing}></i>`;
  }
}

customElements.define('tbt-icon', TbtIcon);

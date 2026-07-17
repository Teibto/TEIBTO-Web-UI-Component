/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * tbt_page.js — server-side page helper for Teibto Design System.
 *
 * One file renders the entire <head>, <body>, app shell, menubar, sidebar, and
 * injects window.__DATA__. A consuming Suitelet stays ~15 lines: load data,
 * call render(), write the response. No hand-written head, no version editing,
 * no styling.
 *
 * Usage (thin entry, ~15 lines):
 *
 *   // sl_po_view.js
 *   define(['./tbt_page'], (tbtPage) => ({
 *     onRequest(ctx) {
 *       const data = { tranId: 'PO-0001', vendor: 'ABC Co.', lines: [] };
 *       const body = `
 *         <tbt-section title="Document info">
 *           <tbt-field label="Document no." value="${data.tranId}"></tbt-field>
 *         </tbt-section>`;
 *       ctx.response.write(tbtPage.render({
 *         title: 'Purchase order',
 *         active: 'purchase-order',
 *         data,
 *         body
 *       }));
 *     }
 *   }));
 *
 * Bumping the DS = edit DS_VERSION once. Every emitted URL is derived from it.
 *
 * URL resolution: NetSuite does not serve File Cabinet files at a path-style
 * URL (/sc/SuiteScripts/... returns "Page Not Found" — verified on SB2, see
 * repo issue #17). render() resolves each asset via N/file at request time —
 * file.url carries the required h= token and survives token rotation on
 * re-upload. Path-style DS URLs inside opts.body (templates write them for
 * readability + local dev) are rewritten to the resolved URL as well.
 */
define([ 'N/error', 'N/file' ], (error, file) => {

  /* ── Single source of truth ──────────────────────────────────────── */

  const DS_VERSION = '1.46.1';
  const FC_DIST_PATH = `SuiteScripts/Teibto/ds/v${DS_VERSION}/dist`;
  const LOGO_PATH  = 'SuiteScripts/Teibto/assets/teibtologo.png';
  const BRAND      = 'Teibto ERP';
  const DEFAULT_LANG = 'th';

  /* ── File Cabinet URL resolution ─────────────────────────────────── */

  // Required DS asset → throws with a deploy hint when the file is absent.
  const resolveDsUrl = (name) => {
    const fcPath = `${FC_DIST_PATH}/${name}`;
    try {
      return file.load({ id: fcPath }).url;
    } catch (e) {
      throw error.create({
        name: 'TBT_DS_ASSET_NOT_FOUND',
        message: `tbt_page: cannot resolve File Cabinet URL for "${fcPath}" — `
          + `deploy DS v${DS_VERSION} first (npm run sync:sdf && suitecloud project:deploy, `
          + `see netsuite/DEPLOY.md). Root cause: ${e.message}`,
      });
    }
  };

  // Optional asset (logo): a missing file degrades the brand area, not the page.
  const resolveOptionalUrl = (fcPath) => {
    try {
      return file.load({ id: fcPath }).url;
    } catch (e) {
      log.debug({ title: 'tbt_page: optional asset missing', details: `${fcPath} — ${e.message}` });
      return null;
    }
  };

  // Path-style DS URLs written inside template bodies (any pinned version).
  const BODY_DS_URL_RE = /\/sc\/SuiteScripts\/Teibto\/ds\/v[\d.]+\/dist\/(tbt-ds\.min\.js|tbt-theme\.css|tbt-page-runtime\.js)/g;

  /* ── Default navigation (overridable per page via opts.menu / opts.sidebar) ── */

  const DEFAULT_MENU = [
    { label: 'Dashboard', href: '#' },
    { label: 'ขาย', items: [
        { label: 'ใบเสนอราคา',  href: '#' },
        { label: 'Sales order', href: '#' },
    ]},
    { label: 'จัดซื้อ', items: [
        { label: 'Purchase order', href: '#' },
        { label: 'ใบรับสินค้า',     href: '#' },
    ]},
    { label: 'บัญชี', items: [
        { label: 'AP Invoice', href: '#' },
        { label: 'Payment',    href: '#' },
    ]},
  ];

  const DEFAULT_SIDEBAR = [
    { key: 'dashboard',      icon: 'dashboard',      label: 'Dashboard',      href: '/dashboard' },
    { key: 'customer',       icon: 'user',           label: 'Customers',      href: '/customer/list' },
    { key: 'quotation',      icon: 'quotation',      label: 'Quotations',     href: '/quotation/list' },
    { key: 'sales-order',    icon: 'sales-order',    label: 'Sales orders',   href: '/so/list' },
    { key: 'purchase-order', icon: 'purchase-order', label: 'Purchase orders',href: '/po/list' },
    { key: 'invoice',        icon: 'invoice',        label: 'Invoices',       href: '/invoice/list' },
    { key: 'expense',        icon: 'receipt',        label: 'Expense claim',  href: '/expense/claim' },
    { key: 'time-tracking',  icon: 'time',           label: 'Time tracking',  href: '/time/entry' },
    { key: 'inventory',      icon: 'stock',          label: 'Inventory',      href: '/inventory' },
    { key: 'report',         icon: 'report',         label: 'Reports',        href: '/time/report' },
    { key: 'settings',       icon: 'settings',       label: 'Settings',       href: '#' },
  ];

  /* ── Internal helpers ────────────────────────────────────────────── */

  // Escape user-controlled strings used inside HTML attribute or text contexts.
  const esc = (s) => String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  // Safe JSON for <script> tags: prevent breakout via </script> or HTML comments.
  // See OWASP "JSON in script context" guidance.
  const safeJson = (obj) => JSON.stringify(obj)
    .replace(/<\//g, '<\\/')
    .replace(/<!--/g, '<\\!--')
    .replace(/-->/g, '--\\>')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  const renderMenuItem = (it) =>
    `<tbt-menu-item label="${esc(it.label)}" href="${esc(it.href || '#')}"></tbt-menu-item>`;

  const renderMenuGroup = (g) => {
    const iconAttr = g.icon ? ` icon="${esc(g.icon)}"` : '';
    const children = (g.items || []).map(renderMenuItem).join('\n      ');
    return `<tbt-menu-group label="${esc(g.label)}"${iconAttr}>
      ${children}
    </tbt-menu-group>`;
  };

  const renderSidebar = (items, active, user, logoUrl) => {
    const navBody = (items || []).map((it) => {
      const isActive = it.key && active && it.key === active;
      const activeAttr = isActive ? ' active' : '';
      return `<tbt-sidebar-item icon="${esc(it.icon || '')}" label="${esc(it.label)}" href="${esc(it.href || '#')}"${activeAttr}></tbt-sidebar-item>`;
    }).join('\n    ');

    // --_lbl-* are inherited from tbt-sidebar so text fades + shrinks to 0
    // when the sidebar collapses (220px → 52px), matching tbt-sidebar-item.
    const labelStyle = 'max-width:var(--_lbl-max-width);opacity:var(--_lbl-opacity);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--tbt-font);transition:max-width var(--tbt-transition-base),opacity var(--tbt-transition-base)';

    const logoImg = logoUrl
      ? `<img src="${esc(logoUrl)}" alt="" style="width:28px;height:28px;border-radius:var(--tbt-radius-sm);flex-shrink:0;object-fit:cover">
      `
      : '';
    const brand = `<div slot="brand" style="display:flex;align-items:center;gap:var(--tbt-space-3);min-width:0;flex:1">
      ${logoImg}<span style="font-size:var(--tbt-size-md);font-weight:var(--tbt-weight-semibold);color:var(--tbt-text-primary);${labelStyle}">${esc(BRAND)}</span>
    </div>`;

    const u = user || {};
    const footer = `<div slot="footer" style="display:flex;align-items:center;gap:var(--tbt-space-3);width:100%;min-width:0">
      <tbt-icon name="user" size="lg" color="primary" style="flex-shrink:0"></tbt-icon>
      <div style="display:flex;flex-direction:column;min-width:0;flex:1;max-width:var(--_lbl-max-width);opacity:var(--_lbl-opacity);transition:max-width var(--tbt-transition-base),opacity var(--tbt-transition-base)">
        <span style="font-size:var(--tbt-size-sm);font-weight:var(--tbt-weight-medium);color:var(--tbt-text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--tbt-font)">${esc(u.name  || 'Guest user')}</span>
        <span style="font-size:var(--tbt-size-xs);color:var(--tbt-text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--tbt-font)">${esc(u.role  || '—')}</span>
      </div>
      <tbt-icon id="tbt-theme-toggle" name="moon" size="md" color="secondary" style="cursor:pointer;flex-shrink:0" label="Toggle dark mode"></tbt-icon>
    </div>`;

    return `<tbt-sidebar slot="sidebar" collapsible>
    ${brand}
    ${navBody}
    ${footer}
  </tbt-sidebar>`;
  };

  /* ── Public API ──────────────────────────────────────────────────── */

  /**
   * render(opts) — returns the full HTML document as a string.
   *
   * Required:
   *   opts.title   string — page <title> + menubar title context
   *   opts.body    string — HTML for <main slot="content">; expected to be
   *                          composed of tbt-* components only.
   *
   * Optional:
   *   opts.active  string — sidebar item key to mark active (matches item.key)
   *   opts.data    object — injected as window.__DATA__ for the page script
   *   opts.lang    string — <html lang>; defaults to 'th'
   *   opts.density string — 'erp' (default, NetSuite-like compact) | 'default' (airier)
   *   opts.menu    array  — menubar items; defaults to DEFAULT_MENU
   *   opts.sidebar array  — sidebar items; defaults to DEFAULT_SIDEBAR
   *
   * Throws: error.create with name TBT_PAGE_MISSING_ARG if title or body absent.
   */
  const render = (opts) => {
    if (!opts || typeof opts !== 'object') {
      throw error.create({
        name: 'TBT_PAGE_MISSING_ARG',
        message: 'tbt_page.render(opts): opts object is required.',
      });
    }
    if (!opts.title || typeof opts.title !== 'string') {
      throw error.create({
        name: 'TBT_PAGE_MISSING_ARG',
        message: 'tbt_page.render(opts): opts.title is required (string).',
      });
    }
    if (!opts.body || typeof opts.body !== 'string') {
      throw error.create({
        name: 'TBT_PAGE_MISSING_ARG',
        message: 'tbt_page.render(opts): opts.body is required (string).',
      });
    }

    const lang    = opts.lang    || DEFAULT_LANG;
    const sidebar = opts.sidebar || DEFAULT_SIDEBAR;
    const active  = opts.active  || '';
    const user    = opts.user    || { name: 'Wichit Wongta', role: 'Admin' };
    // ERP density is the production default (RFC 0007) — pass density: 'default'
    // to keep the airier dashboard spacing (e.g. a marketing/report page).
    const density = opts.density || 'erp';

    // Resolve every DS asset up-front — fail fast with a deploy hint (#17).
    const dsUrls = {
      'tbt-theme.css':       resolveDsUrl('tbt-theme.css'),
      'tbt-ds.min.js':       resolveDsUrl('tbt-ds.min.js'),
      'tbt-page-runtime.js': resolveDsUrl('tbt-page-runtime.js'),
    };
    const logoUrl = resolveOptionalUrl(LOGO_PATH);

    // Templates keep the readable path-style URL in their own <script> imports;
    // swap in the resolved URL so the served page never 404s (#17).
    const body = opts.body.replace(BODY_DS_URL_RE, (m, name) => dsUrls[name]);

    const dataScript = opts.data !== undefined
      ? `<script>window.__DATA__ = ${safeJson(opts.data)};</script>`
      : '';

    return `<!DOCTYPE html>
<html lang="${esc(lang)}" data-theme="light"${density !== 'default' ? ` data-density="${esc(density)}"` : ''}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(BRAND)} · ${esc(opts.title)}</title>
  <script>
    /* Apply saved theme before stylesheet paints — avoids FOUC. Default: light. */
    (function () {
      try {
        var t = localStorage.getItem('tbt-theme') || 'light';
        document.documentElement.dataset.theme = t;
      } catch (e) { /* localStorage blocked — keep default light */ }
    })();
  </script>
  <link rel="stylesheet" href="${esc(dsUrls['tbt-theme.css'])}">
  <script type="module" src="${esc(dsUrls['tbt-ds.min.js'])}"></script>
  <script src="${esc(dsUrls['tbt-page-runtime.js'])}"></script>
  <style>
    /* Minimal page reset — tbt-app-shell takes full viewport, so the body
       must not add its own margin (would push the shell past 100vh and
       produce a second page-level scrollbar on top of content scroll). */
    html, body { margin: 0; padding: 0; height: 100%; }

    /* Floating mobile menu trigger — replaces the menubar hamburger.
       Visible only ≤768px (same threshold as tbt-app-shell compact mode).
       Dispatches tbt-menu-toggle, which app-shell already handles. */
    #tbt-mobile-menu {
      display: none;
      position: fixed;
      top: var(--tbt-space-3);
      left: var(--tbt-space-3);
      z-index: 900;
      width: 40px;
      height: 40px;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--tbt-border);
      background: var(--tbt-bg-card);
      border-radius: var(--tbt-radius-md);
      box-shadow: var(--tbt-shadow-md);
      color: var(--tbt-text-primary);
      cursor: pointer;
      font-family: var(--tbt-font);
    }
    #tbt-mobile-menu > i { font-size: 20px; line-height: 1; }
    #tbt-mobile-menu:hover { background: var(--tbt-bg-hover); }
    @media (max-width: 768px) {
      #tbt-mobile-menu { display: flex; }
    }
    /* Hide the trigger while the drawer is open — the fixed button otherwise
       sits on top of the drawer's brand ("Teibto ERP" read as "o ERP"). */
    body:has(tbt-app-shell[drawer-open]) #tbt-mobile-menu { display: none; }
  </style>
</head>
<body>
<button id="tbt-mobile-menu" type="button" aria-label="Open navigation">
  <i class="ti ti-menu-2" aria-hidden="true"></i>
</button>
<tbt-app-shell style="--tbt-menubar-height: 0px">
  ${renderSidebar(sidebar, active, user, logoUrl)}
  <main slot="content">
${body}
  </main>
</tbt-app-shell>
${dataScript}
<script type="module">
  /* Mobile hamburger → open/close sidebar drawer (app-shell listens for tbt-menu-toggle). */
  const mobileBtn = document.getElementById('tbt-mobile-menu');
  const shell     = document.querySelector('tbt-app-shell');
  if (mobileBtn && shell) {
    mobileBtn.addEventListener('click', () => {
      shell.dispatchEvent(new CustomEvent('tbt-menu-toggle', { bubbles: true, composed: true }));
    });
  }

  /* Theme toggle in the sidebar footer. Persists via localStorage when allowed. */
  const btn = document.getElementById('tbt-theme-toggle');
  if (btn) {
    const sync = () => {
      const t = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
      btn.setAttribute('name',  t === 'dark' ? 'sun'  : 'moon');
      btn.setAttribute('label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    };
    sync();
    btn.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('tbt-theme', next); } catch (e) {}
      sync();
    });
  }
</script>
</body>
</html>`;
  };

  return {
    render,
    DS_VERSION,
    resolveDsUrl,
  };
});

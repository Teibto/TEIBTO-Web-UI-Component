/**
 * dev-suitelet.mjs — local mock of the NetSuite Suitelet runtime.
 *
 * Stubs `define`, `N/file`, `N/error` so the thin-entry Suitelet scripts in
 * templates/ can be loaded with plain Node and their onRequest(ctx) invoked
 * against a mock context. The rendered HTML is then served back over HTTP.
 *
 * Run:
 *   npm run dev:suitelet     → http://localhost:8090
 *
 * Routes:
 *   GET /            menu
 *   GET /document    sl_starter_document.js
 *   GET /list        sl_starter_list.js
 *   GET /dashboard   sl_starter_dashboard.js
 *   GET /sc/SuiteScripts/Teibto/ds/v1.42.1/dist/*  → dist/*
 *   GET /sc/SuiteScripts/Teibto/assets/teibtologo.png → 1x1 placeholder
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');
const PORT      = Number(process.env.PORT) || 8090;

const FC_PREFIX     = '/sc/SuiteScripts/Teibto/ds/v1.42.1/dist/';
const ASSETS_PREFIX = '/sc/SuiteScripts/Teibto/assets/';

/* ── SuiteScript stubs ─────────────────────────────────────────────── */

const SS = {
  'N/error': {
    create: ({ name, message }) => Object.assign(new Error(message), { name }),
  },
  'N/file': {
    // Resolve template files relative to templates/ folder.
    load({ id }) {
      const rel = String(id).replace(/^\.\//, '');
      const full = path.join(ROOT, 'templates', rel);
      const contents = fs.readFileSync(full, 'utf8');
      return { getContents: () => contents };
    },
  },
};

/**
 * Load a SuiteScript AMD module from a local path. Reads the file as text and
 * runs it with a captured `define` closure — no Node CommonJS cache involved,
 * so live edits are picked up every request and recursive loads cannot
 * collide via shared global state.
 */
function loadAmd(modulePath) {
  const code = fs.readFileSync(modulePath, 'utf8');
  let result;
  const define = (deps, factory) => {
    const resolved = deps.map((d) => {
      if (SS[d]) return SS[d];
      if (d.startsWith('./')) {
        const moduleDir = path.dirname(modulePath);
        for (const tryPath of [
          path.join(moduleDir, d + '.js'),
          path.join(moduleDir, d),
          // Templates require tbt_page from sibling netsuite/ folder.
          path.join(ROOT, 'netsuite', d.replace(/^\.\//, '') + '.js'),
          path.join(ROOT, 'netsuite', d.replace(/^\.\//, '')),
        ]) {
          if (fs.existsSync(tryPath) && fs.statSync(tryPath).isFile()) {
            return loadAmd(tryPath);
          }
        }
        throw new Error(`Cannot resolve dependency: ${d} from ${modulePath}`);
      }
      throw new Error(`Unknown dependency: ${d}`);
    });
    result = factory(...resolved);
  };
  // Wrap in IIFE so any internal `return` would be inside the function.
  const wrapper = new Function('define', code + '\n//# sourceURL=' + modulePath);
  wrapper(define);
  return result;
}

/* ── Routes ────────────────────────────────────────────────────────── */

const ENTRIES = {
  '/document':           'templates/sl_starter_document.js',
  '/list':               'templates/sl_starter_list.js',
  '/dashboard':          'templates/sl_starter_dashboard.js',
  '/form':               'templates/sl_starter_form.js',
  '/kit/customer':       'templates/sl_kit_customer.js',
  '/kit/sales-order':    'templates/sl_kit_sales_order.js',
  '/kit/purchase-order': 'templates/sl_kit_purchase_order.js',
  '/time/entry':         'templates/sl_tt_entry.js',
  '/time/approval':      'templates/sl_tt_approval.js',
  '/time/report':        'templates/sl_tt_report.js',
  '/expense/claim':      'templates/sl_expense_claim.js',
  '/inventory':          'templates/sl_inventory.js',
  '/so/list':            'templates/sl_so_list.js',
  '/so/form':            'templates/sl_so_form.js',
  '/customer/list':      'templates/sl_customer_list.js',
  '/customer/form':      'templates/sl_customer_form.js',
  '/po/list':            'templates/sl_po_list.js',
  '/po/form':            'templates/sl_po_form.js',
  '/invoice/list':       'templates/sl_invoice_list.js',
  '/invoice/form':       'templates/sl_invoice_form.js',
  '/quotation/list':     'templates/sl_quotation_list.js',
  '/quotation/form':     'templates/sl_quotation_form.js',
};

const INDEX_HTML = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>tbt-ds · Local Suitelet preview</title>
  <link rel="stylesheet" href="${FC_PREFIX}tbt-theme.css">
  <script type="module" src="${FC_PREFIX}tbt-ds.min.js"></script>
</head>
<body style="margin:0">
  <tbt-app-shell>
    <tbt-menubar slot="menubar" title="Teibto ERP · Local preview"></tbt-menubar>
    <main slot="content">
      <tbt-section title="Schema-driven kits — ready to use">
        <p style="color:var(--tbt-text-secondary);font-family:var(--tbt-font);margin:0 0 var(--tbt-space-4) 0">
          Each kit is a thin Suitelet driving <code>tbt-doc-form</code> with a
          pre-built schema from <code>tbt-doc-schemas</code>. Same template,
          different schemaName + mock data.
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:var(--tbt-space-3)">
          <tbt-button href="/kit/customer"                variant="primary"   icon="user">New customer</tbt-button>
          <tbt-button href="/kit/customer?id=C001"        variant="ghost"     icon="edit">Edit customer (C001)</tbt-button>
          <tbt-button href="/kit/sales-order"             variant="primary"   icon="sales-order">New sales order</tbt-button>
          <tbt-button href="/kit/sales-order?id=SO-0042"  variant="ghost"     icon="edit">Edit sales order (SO-0042)</tbt-button>
          <tbt-button href="/kit/purchase-order"          variant="primary"   icon="purchase-order">New purchase order</tbt-button>
          <tbt-button href="/kit/purchase-order?id=PO-0042" variant="ghost"   icon="edit">Edit purchase order (PO-0042)</tbt-button>
        </div>
      </tbt-section>

      <tbt-section title="Time tracking module">
        <p style="color:var(--tbt-text-secondary);font-family:var(--tbt-font);margin:0 0 var(--tbt-space-4) 0">
          Three Suitelets that compose a full Time tracking workflow — employee entry,
          manager approval, and reporting. Same DS components, standard Teibto layout.
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:var(--tbt-space-3)">
          <tbt-button href="/time/entry"    variant="primary" icon="time">Employee weekly entry</tbt-button>
          <tbt-button href="/time/approval" variant="primary" icon="approve">Manager approval queue</tbt-button>
          <tbt-button href="/time/report"   variant="primary" icon="chart">Reporting dashboard</tbt-button>
        </div>
      </tbt-section>

      <tbt-section title="ERP records — list + form (new / view / edit) — same pattern, 5 records">
        <p style="color:var(--tbt-text-secondary);font-family:var(--tbt-font);margin:0 0 var(--tbt-space-4) 0">
          All 5 records share <code>erp-form.html</code> + universal schema-driven form.
          Only <code>schemaName</code> + mock data change per Suitelet.
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:var(--tbt-space-3)">
          <tbt-button href="/customer/list"  variant="primary" icon="user">Customers · list</tbt-button>
          <tbt-button href="/quotation/list" variant="primary" icon="quotation">Quotations · list</tbt-button>
          <tbt-button href="/so/list"        variant="primary" icon="sales-order">Sales orders · list</tbt-button>
          <tbt-button href="/po/list"        variant="primary" icon="purchase-order">Purchase orders · list</tbt-button>
          <tbt-button href="/invoice/list"   variant="primary" icon="invoice">Invoices · list</tbt-button>
        </div>
      </tbt-section>

      <tbt-section title="Sales Order — ERP workflow (list / new / view / edit)">
        <p style="color:var(--tbt-text-secondary);font-family:var(--tbt-font);margin:0 0 var(--tbt-space-4) 0">
          Full 4-mode pattern: list → click row to view → Edit/Save/Delete. New button on list opens blank form.
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:var(--tbt-space-3)">
          <tbt-button href="/so/list"                            variant="primary" icon="sales-order">List (main)</tbt-button>
          <tbt-button href="/so/form?id=new"                     variant="primary" icon="add">New sales order</tbt-button>
          <tbt-button href="/so/form?id=SO-2026-0001"            variant="ghost"   icon="view">View · SO-2026-0001</tbt-button>
          <tbt-button href="/so/form?id=SO-2026-0001&mode=edit"  variant="ghost"   icon="edit">Edit · SO-2026-0001</tbt-button>
        </div>
      </tbt-section>

      <tbt-section title="Inventory module">
        <p style="color:var(--tbt-text-secondary);font-family:var(--tbt-font);margin:0 0 var(--tbt-space-4) 0">
          Warehouse stock list — Tier 4 design-mode build. Filters + KPI + modal CRUD + CSV export.
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:var(--tbt-space-3)">
          <tbt-button href="/inventory" variant="primary" icon="stock">Stock list</tbt-button>
        </div>
      </tbt-section>

      <tbt-section title="Expense claim module">
        <p style="color:var(--tbt-text-secondary);font-family:var(--tbt-font);margin:0 0 var(--tbt-space-4) 0">
          Employee expense submission with modal-driven line entry, billable flag, and receipt links.
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:var(--tbt-space-3)">
          <tbt-button href="/expense/claim"           variant="primary" icon="receipt">Expense claim entry</tbt-button>
          <tbt-button href="/expense/claim?id=EXP-0001" variant="ghost" icon="edit">Edit claim (EXP-0001)</tbt-button>
        </div>
      </tbt-section>

      <tbt-section title="Starter templates (hand-written layout)">
        <p style="color:var(--tbt-text-secondary);font-family:var(--tbt-font);margin:0 0 var(--tbt-space-4) 0">
          Plain HTML bodies for non-schema layouts — list, dashboard, custom form.
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:var(--tbt-space-3)">
          <tbt-button href="/document"  variant="secondary" icon="purchase-order">Document page</tbt-button>
          <tbt-button href="/list"      variant="secondary" icon="invoice">List page</tbt-button>
          <tbt-button href="/dashboard" variant="secondary" icon="dashboard">Dashboard</tbt-button>
          <tbt-button href="/form"      variant="secondary" icon="add">Custom form</tbt-button>
        </div>
      </tbt-section>
    </main>
  </tbt-app-shell>
</body>
</html>`;

const MIME = {
  '.js':   'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
};

// 1x1 transparent PNG (89 50 4e 47 ...) for the logo placeholder.
const LOGO_PLACEHOLDER = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4' +
  '890000000d49444154789c63000100000005000100' +
  '5d0bba4f0000000049454e44ae426082',
  'hex'
);

const server = http.createServer(async (req, res) => {
  try {
    const url = req.url.split('?')[0];

    // Static: bundled DS files
    if (url.startsWith(FC_PREFIX)) {
      const rel = url.slice(FC_PREFIX.length);
      const full = path.join(ROOT, 'dist', rel);
      if (fs.existsSync(full) && fs.statSync(full).isFile()) {
        res.writeHead(200, { 'Content-Type': MIME[path.extname(full)] || 'application/octet-stream' });
        fs.createReadStream(full).pipe(res);
        return;
      }
      res.writeHead(404).end(`Not in dist/: ${rel}`);
      return;
    }

    // Static: logo placeholder
    if (url.startsWith(ASSETS_PREFIX)) {
      res.writeHead(200, { 'Content-Type': 'image/png' });
      res.end(LOGO_PLACEHOLDER);
      return;
    }

    // Index
    if (url === '/' || url === '/index.html') {
      res.writeHead(200, { 'Content-Type': MIME['.html'] });
      res.end(INDEX_HTML);
      return;
    }

    // Suitelet routes
    const entry = ENTRIES[url];
    if (entry) {
      const mod = loadAmd(path.join(ROOT, entry));
      const query = Object.fromEntries(new URL(req.url, 'http://localhost').searchParams);
      let body = '';
      const ctx = {
        request:  { parameters: query, method: req.method },
        response: { write: (s) => { body += s; } },
      };
      mod.onRequest(ctx);
      res.writeHead(200, { 'Content-Type': MIME['.html'] });
      res.end(body);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found: ' + url);
  } catch (e) {
    console.error('[dev-suitelet]', e);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Server error:\n\n' + (e.stack || e.message));
  }
});

server.listen(PORT, () => {
  console.log(`tbt-ds local Suitelet preview running at:\n  http://localhost:${PORT}/`);
  console.log('\nRoutes:');
  console.log('  /            menu');
  Object.keys(ENTRIES).forEach((p) => console.log(`  ${p.padEnd(12)} ${ENTRIES[p]}`));
});

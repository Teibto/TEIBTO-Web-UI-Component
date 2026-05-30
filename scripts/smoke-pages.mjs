/**
 * smoke-pages.mjs — functional smoke test for the live Suitelet pages.
 *
 * Run: npm run test:smoke
 *
 * Spawns the dev-suitelet mock server, loads each page in headless Chromium,
 * and asserts: (1) no console errors / page errors, and (2) the key
 * components actually rendered (charts have shapes, tables have rows). This
 * guards the page-level wiring + tbt-chart integration that pixel snapshots of
 * the static demo can't reach. Self-contained — starts and stops its own server.
 *
 * Exit 0 = all pass; exit 1 = any failure.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.SMOKE_PORT) || 8097;
const BASE = `http://localhost:${PORT}`;

let failures = 0;
const ok = (cond, msg) => { console.log(`   ${cond ? '✓' : '✗'} ${msg}`); if (!cond) failures++; };

async function waitForServer(timeoutMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try { const r = await fetch(BASE + '/dashboard'); if (r.ok) return true; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('dev-suitelet did not start on ' + BASE);
}

async function check(browser, name, urlPath, assert) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  await page.goto(BASE + urlPath, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  console.log(`\n[${name}]`);
  const result = await page.evaluate(assert);
  for (const [label, val] of Object.entries(result)) ok(val.ok, `${label}: ${val.val}`);
  ok(errors.length === 0, `no console errors${errors.length ? ': ' + errors.join('; ') : ''}`);
  await page.close();
}

const server = spawn(process.execPath, [path.join(__dirname, 'dev-suitelet.mjs')], {
  env: { ...process.env, PORT: String(PORT) },
  stdio: 'ignore',
});

let browser;
try {
  await waitForServer();
  browser = await chromium.launch();

  await check(browser, 'dashboard', '/dashboard', () => {
    const sales = document.getElementById('chart-sales');
    const status = document.getElementById('chart-status');
    return {
      'sales bar chart renders bars': { val: sales?.shadowRoot.querySelectorAll('rect.bar').length, ok: sales?.shadowRoot.querySelectorAll('rect.bar').length > 0 },
      'status donut renders slices':  { val: status?.shadowRoot.querySelectorAll('path.slice').length, ok: status?.shadowRoot.querySelectorAll('path.slice').length > 0 },
      'pending table has rows':       { val: document.getElementById('pending-table')?.rows?.length, ok: document.getElementById('pending-table')?.rows?.length > 0 },
    };
  });

  await check(browser, 'bill-receipt list', '/bill-receipt/list', () => {
    const t = document.getElementById('table');
    return {
      'voucher table has rows': { val: t?.rows?.length, ok: t?.rows?.length > 0 },
      'status column is a badge': { val: /tbt-badge/.test(t?.rows?.[0]?.statusBadge || ''), ok: /tbt-badge/.test(t?.rows?.[0]?.statusBadge || '') },
    };
  });

  await check(browser, 'bill-receipt form', '/bill-receipt/form?id=1', () => {
    const lines = document.getElementById('lines-table');
    const stat = document.getElementById('stat-total');
    const af = document.getElementById('approval-flow');
    return {
      'invoice lines render': { val: lines?.rows?.length, ok: lines?.rows?.length === 3 },
      'grand total computed':  { val: stat?.value, ok: !!stat?.value && stat.value.includes('฿') },
      'approval flow has steps': { val: af?.steps?.length, ok: af?.steps?.length > 0 },
    };
  });

  await check(browser, 'expense claim (demo fallback)', '/expense/claim?id=7', () => {
    const table = document.getElementById('lines-table');
    const af = document.getElementById('approval-flow');
    const demo = document.getElementById('demo-alert');
    return {
      'expense lines render':    { val: table?.rows?.length, ok: table?.rows?.length === 3 },
      'approval flow has steps': { val: af?.steps?.length, ok: af?.steps?.length === 3 },
      'demo banner visible':     { val: demo && demo.hidden === false, ok: demo && demo.hidden === false },
    };
  });
} catch (err) {
  console.error('smoke error:', err.message);
  failures++;
} finally {
  if (browser) await browser.close();
  server.kill();
}

console.log(failures === 0 ? '\n✅ SMOKE PASSED — pages render, no console errors' : `\n❌ SMOKE FAILED — ${failures} problem(s)`);
process.exit(failures === 0 ? 0 : 1);

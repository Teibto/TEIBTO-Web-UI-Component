/**
 * Web Test Runner config for TBT-DS component tests.
 *
 * Components import Lit from CDN — we redirect those URLs to local
 * node_modules via an import map so tests run without network access.
 */
import { chromeLauncher } from '@web/test-runner';

// Map every CDN Lit URL used in components/ to the local npm package.
const importMap = {
  imports: {
    'https://cdn.jsdelivr.net/npm/lit@3/+esm': '/node_modules/lit/index.js',
    'https://cdn.jsdelivr.net/npm/lit@3/directives/unsafe-html.js/+esm':
      '/node_modules/lit/directives/unsafe-html.js',
  },
};

export default {
  files: 'tests/**/*.test.js',
  nodeResolve: true,
  // CI (ubuntu, 2-core) เปิด test page ชุดแรกไม่ทัน default 30s เมื่อ 60 ไฟล์
  // แย่งกัน start → "browser was unable to create and start a test page" ทั้งที่
  // ทุก test ผ่าน (#60) — เพิ่มเพดานเวลา start และจำกัดจำนวนไฟล์ที่รันพร้อมกัน
  browserStartTimeout: 120000,
  concurrency: 4,
  // PITFALL: never `fixture()` a template whose ROOT is a plain element
  // (e.g. <div> wrapping components) — open-wc waits for nextFrame →
  // requestAnimationFrame, and concurrent wtr pages are hidden tabs where
  // headless Chrome never fires rAF → the test hangs until mocha timeout.
  // Fixture a single Lit component, or build DOM manually + updateComplete.
  browsers: [
    chromeLauncher({ launchOptions: { args: ['--no-sandbox', '--disable-dev-shm-usage'] } }),
  ],
  testRunnerHtml: testFramework => `
    <!DOCTYPE html>
    <html>
      <head>
        <script type="importmap">${JSON.stringify(importMap)}</script>
        <script src="/node_modules/axe-core/axe.min.js"></script>
      </head>
      <body>
        <script type="module" src="${testFramework}"></script>
      </body>
    </html>
  `,
};

/**
 * build-bundle.js — bundle all tbt-* components into a single ES module.
 *
 * Usage:
 *   node scripts/build-bundle.js
 *
 * Output:
 *   dist/tbt-ds.min.js   — all components + Lit 3, minified
 *   dist/tbt-theme.css   — design tokens (verbatim copy)
 *
 * Source files are left untouched (CDN imports stay for dev server).
 * Only the bundle output rewrites Lit CDN URL → npm package.
 */

import { rollup } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

// Rewrite CDN Lit imports → local npm 'lit' so Rollup can bundle it.
// Source files keep their CDN URL for dev-server usage without npm install.
// Handles both main entry and sub-paths:
//   https://cdn.jsdelivr.net/npm/lit@3/+esm                        → lit
//   https://cdn.jsdelivr.net/npm/lit@3/directives/unsafe-html.js/+esm → lit/directives/unsafe-html.js
const LIT_CDN_BASE = 'https://cdn.jsdelivr.net/npm/lit@3/';
const rewriteLitCdn = {
  name: 'rewrite-lit-cdn',
  async resolveId(source, importer, options) {
    if (!source.startsWith(LIT_CDN_BASE)) return null;
    const rest = source.slice(LIT_CDN_BASE.length); // e.g. "+esm" or "directives/unsafe-html.js/+esm"
    const npmId = rest === '+esm'
      ? 'lit'
      : `lit/${rest.replace(/\/\+esm$/, '')}`;
    return this.resolve(npmId, importer, { skipSelf: true, ...options });
  },
};

async function gzipSize(filePath) {
  let size = 0;
  await pipeline(
    fs.createReadStream(filePath),
    createGzip(),
    async function* (source) {
      for await (const chunk of source) size += chunk.length;
    }
  );
  return size;
}

async function build() {
  fs.mkdirSync(DIST, { recursive: true });

  console.log('Bundling components...');
  const bundle = await rollup({
    input: path.join(ROOT, 'components/index.js'),
    plugins: [rewriteLitCdn, nodeResolve(), terser()],
    onwarn(warning, warn) {
      // suppress circular dependency warnings from Lit internals
      if (warning.code === 'CIRCULAR_DEPENDENCY') return;
      warn(warning);
    },
  });

  await bundle.write({
    file: path.join(DIST, 'tbt-ds.min.js'),
    format: 'es',
  });
  await bundle.close();

  // Copy theme CSS verbatim
  fs.copyFileSync(
    path.join(ROOT, 'theme/tbt-theme.css'),
    path.join(DIST, 'tbt-theme.css')
  );

  // Size report
  const jsPath = path.join(DIST, 'tbt-ds.min.js');
  const rawKb = (fs.statSync(jsPath).size / 1024).toFixed(1);
  const gzKb = ((await gzipSize(jsPath)) / 1024).toFixed(1);
  const cssKb = (fs.statSync(path.join(DIST, 'tbt-theme.css')).size / 1024).toFixed(1);

  console.log(`✓ dist/tbt-ds.min.js    ${rawKb} KB raw  /  ${gzKb} KB gz`);
  console.log(`✓ dist/tbt-theme.css    ${cssKb} KB`);

  if (parseFloat(gzKb) > 100) {
    console.warn(`⚠ gzipped JS exceeds 100 KB target (${gzKb} KB)`);
  }
}

build().catch(err => { console.error(err); process.exit(1); });

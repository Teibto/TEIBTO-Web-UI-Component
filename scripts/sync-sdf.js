/**
 * sync-sdf.js — copy the production bundle into the SuiteCloud staging area.
 *
 * Usage:
 *   node scripts/sync-sdf.js           # uses version from package.json
 *   node scripts/sync-sdf.js --dry-run # show what would be copied, no writes
 *
 * Reads:
 *   dist/tbt-ds.min.js   (must exist — run npm run build first)
 *   dist/tbt-theme.css
 *
 * Writes to:
 *   tbt-ds/src/FileCabinet/SuiteScripts/Teibto/ds/v{VERSION}/tbt-ds.min.js
 *   tbt-ds/src/FileCabinet/SuiteScripts/Teibto/ds/v{VERSION}/tbt-theme.css
 *
 * The tbt-ds/ folder is gitignored — it is a local SuiteCloud staging area
 * used by SuiteCloud CLI (suitecloud project:deploy).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const DRY_RUN = process.argv.includes('--dry-run');

// Read version from package.json
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const version = pkg.version;

const DIST = path.join(ROOT, 'dist');
const SDF_TARGET = path.join(ROOT, 'tbt-ds', 'src', 'FileCabinet', 'SuiteScripts', 'Teibto', 'ds', `v${version}`);

const FILES = ['tbt-ds.min.js', 'tbt-theme.css'];

// Verify dist files exist
for (const file of FILES) {
  const src = path.join(DIST, file);
  if (!fs.existsSync(src)) {
    console.error(`✗ dist/${file} not found — run: npm run build`);
    process.exit(1);
  }
}

// Report sizes
const jsSize  = (fs.statSync(path.join(DIST, 'tbt-ds.min.js')).size / 1024).toFixed(1);
const cssSize = (fs.statSync(path.join(DIST, 'tbt-theme.css')).size / 1024).toFixed(1);
console.log(`  dist/tbt-ds.min.js   ${jsSize} KB`);
console.log(`  dist/tbt-theme.css   ${cssSize} KB`);
console.log(`  target: ${path.relative(ROOT, SDF_TARGET)}/`);
console.log();

if (DRY_RUN) {
  for (const file of FILES) {
    console.log(`  would copy: dist/${file} → ...ds/v${version}/${file}`);
  }
  console.log('\n[dry-run] no files written');
  process.exit(0);
}

// Create target directory
fs.mkdirSync(SDF_TARGET, { recursive: true });

// Copy files
for (const file of FILES) {
  fs.copyFileSync(path.join(DIST, file), path.join(SDF_TARGET, file));
  console.log(`✓ copied ${file}`);
}

console.log(`\n✓ SDF staging updated → v${version}`);
console.log('  Next step: suitecloud project:deploy (from tbt-ds/ directory)');

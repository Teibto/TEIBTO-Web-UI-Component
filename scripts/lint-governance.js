/**
 * lint-governance.js — enforce TBT-DS governance rules.
 *
 * Usage: node scripts/lint-governance.js
 * Exit 0 = clean; Exit 1 = violations found.
 *
 * Rules enforced:
 *   1. No hex color literals in components/**\/*.js
 *   2. No @latest in any import URL across the repo
 *   3. Every components/tbt-*.js calls customElements.define
 *   4. Every components/tbt-*.js has @version X.Y.Z JSDoc
 *   5. Lit import URL is exactly the approved CDN string (no drift)
 *   6. No hardcoded color values in style="" attributes in demo/**\/*.html
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const LIT_CDN_MAIN = 'https://cdn.jsdelivr.net/npm/lit@3/+esm';
const LIT_CDN_BASE = 'https://cdn.jsdelivr.net/npm/lit@3/';

let violations = 0;

function fail(file, line, message) {
  const rel = path.relative(ROOT, file);
  const loc = line ? `${rel}:${line}` : rel;
  console.error(`✗ ${loc}: ${message}`);
  violations++;
}

function pass(message) {
  console.log(`✓ ${message}`);
}

// Strip block comments and single-line comments from JS source,
// leaving string contents (template literals) intact for hex detection.
function stripComments(src) {
  // Remove /* ... */ block comments (including multiline)
  src = src.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove // line comments (but not inside strings — approximation: skip lines with http://)
  src = src.replace(/(?<!:)\/\/(?!\/)[^\n]*/g, '');
  return src;
}

function getLines(src) {
  return src.split('\n');
}

// ─── Rule 1: No hex colors in components/**/*.js ───────────────────────────
// Exempt: tbt-color-picker.js — its DEFAULT_PALETTE is intentional hex data, not CSS styling.
const HEX_EXEMPT = new Set(['tbt-color-picker.js']);
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/;
const componentsDir = path.join(ROOT, 'components');
const componentFiles = fs.readdirSync(componentsDir).filter(f => f.endsWith('.js'));

let rule1Violations = 0;
for (const file of componentFiles) {
  if (HEX_EXEMPT.has(file)) continue;
  const filePath = path.join(componentsDir, file);
  const src = stripComments(fs.readFileSync(filePath, 'utf8'));
  const lines = getLines(src);
  for (let i = 0; i < lines.length; i++) {
    if (HEX_RE.test(lines[i])) {
      fail(filePath, i + 1, `hex color literal: ${lines[i].trim()}`);
      rule1Violations++;
    }
  }
}
if (rule1Violations === 0) pass('No hex colors in components/');

// ─── Rule 2: No @latest anywhere ──────────────────────────────────────────
const extensions = ['.js', '.html', '.css'];
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'scripts', 'tbt-ds']);

function walkFiles(dir, exts) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkFiles(full, exts));
    else if (exts.includes(path.extname(entry.name))) results.push(full);
  }
  return results;
}

const allFiles = walkFiles(ROOT, extensions);
let rule2Violations = 0;
for (const filePath of allFiles) {
  const lines = getLines(fs.readFileSync(filePath, 'utf8'));
  for (let i = 0; i < lines.length; i++) {
    if (/@latest/.test(lines[i])) {
      fail(filePath, i + 1, `@latest in import URL: ${lines[i].trim()}`);
      rule2Violations++;
    }
  }
}
if (rule2Violations === 0) pass('No @latest in import URLs');

// ─── Rule 3: Every tbt-*.js calls customElements.define ───────────────────
// Utility modules (no LitElement class) are exempt from this rule
const UTIL_MODULES = new Set(['tbt-icons-css.js', 'tbt-confirm.js', 'tbt-doc-schemas.js', 'tbt-outside-click.js']);
const tbtComponents = componentFiles.filter(f => f.startsWith('tbt-') && !UTIL_MODULES.has(f));
let rule3Violations = 0;
for (const file of tbtComponents) {
  const filePath = path.join(componentsDir, file);
  const src = fs.readFileSync(filePath, 'utf8');
  if (!src.includes('customElements.define')) {
    fail(filePath, null, 'missing customElements.define');
    rule3Violations++;
  }
}
if (rule3Violations === 0) pass('All tbt-*.js call customElements.define');

// ─── Rule 4: Every tbt-*.js has @version JSDoc ────────────────────────────
const VERSION_RE = /@version\s+\d+\.\d+\.\d+/;
let rule4Violations = 0;
for (const file of tbtComponents) {
  const filePath = path.join(componentsDir, file);
  const src = fs.readFileSync(filePath, 'utf8');
  if (!VERSION_RE.test(src)) {
    fail(filePath, null, 'missing @version X.Y.Z in JSDoc');
    rule4Violations++;
  }
}
if (rule4Violations === 0) pass('All tbt-*.js have @version JSDoc');

// ─── Rule 5: Consistent Lit CDN import URL ─────────────────────────────────
const LIT_IMPORT_RE = /from\s+['"]https:\/\/cdn\.jsdelivr\.net\/npm\/lit[^'"]+['"]/g;
let rule5Violations = 0;
for (const file of componentFiles) {
  const filePath = path.join(componentsDir, file);
  const src = fs.readFileSync(filePath, 'utf8');
  for (const match of src.matchAll(LIT_IMPORT_RE)) {
    const url = match[0].replace(/from\s+['"]/, '').replace(/['"]$/, '');
    // Allow main entry or known sub-paths (directives/*)
    if (url !== LIT_CDN_MAIN && !url.startsWith(LIT_CDN_BASE + 'directives/')) {
      fail(filePath, null, `non-standard Lit CDN URL: ${url}`);
      rule5Violations++;
    }
  }
}
if (rule5Violations === 0) pass('Lit CDN import URLs are consistent');

// ─── Rule 6: No hardcoded color values in demo style="" attributes ──────────
// Flags style="..." containing hex colors (#xxx) or raw rgb/rgba literals.
// Allows: var() references, layout-only properties, and transitions.
const STYLE_HEX_RE = /style="[^"]*#[0-9a-fA-F]{3,8}[^"]*"/;
const STYLE_RGB_BARE_RE = /style="[^"]*(?:^|;|\s)(?:color|background|background-color)\s*:\s*rgba?\s*\(\s*\d/;
const demoDir = path.join(ROOT, 'demo');
const demoFiles = fs.existsSync(demoDir)
  ? fs.readdirSync(demoDir).filter(f => f.endsWith('.html')).map(f => path.join(demoDir, f))
  : [];

let rule6Violations = 0;
for (const filePath of demoFiles) {
  const lines = getLines(fs.readFileSync(filePath, 'utf8'));
  for (let i = 0; i < lines.length; i++) {
    if (STYLE_HEX_RE.test(lines[i]) || STYLE_RGB_BARE_RE.test(lines[i])) {
      // Allow lines with an opt-out comment on the same or previous line
      const prevLine = i > 0 ? lines[i - 1] : '';
      if (prevLine.includes('lint-allow-inline-style') || lines[i].includes('lint-allow-inline-style')) continue;
      fail(filePath, i + 1, `hardcoded color in style attribute: ${lines[i].trim().slice(0, 80)}`);
      rule6Violations++;
    }
  }
}
if (rule6Violations === 0) pass('No hardcoded colors in demo inline styles');

// ─── Summary ────────────────────────────────────────────────────────────────
console.log('');
if (violations === 0) {
  console.log('✓ All governance checks passed');
  process.exit(0);
} else {
  console.error(`${violations} violation${violations === 1 ? '' : 's'} found`);
  process.exit(1);
}

/**
 * sync-version.js — propagate a new version string across the repo.
 *
 * Usage:
 *   node scripts/sync-version.js <new-version> [--dry-run]
 *
 * Updates:
 *   - package.json       → version, tbt.ds-version, tbt.file-cabinet-path, tbt.skill-version
 *   - components/*.js    → @version X.Y.Z in JSDoc header
 *   - README.md          → every /vX.Y.Z/ occurrence in code blocks
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const [, , newVersion, flag] = process.argv;
const DRY_RUN = flag === '--dry-run';

if (!newVersion || !/^\d+\.\d+\.\d+/.test(newVersion)) {
  console.error('Usage: node scripts/sync-version.js <semver> [--dry-run]');
  process.exit(1);
}

let violations = 0;

function write(filePath, content) {
  if (DRY_RUN) {
    console.log(`  would write: ${path.relative(ROOT, filePath)}`);
  } else {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

// 1. package.json
const pkgPath = path.join(ROOT, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const pkgChanged =
  pkg.version !== newVersion ||
  pkg.tbt['ds-version'] !== newVersion ||
  pkg.tbt['skill-version'] !== newVersion ||
  pkg.tbt['file-cabinet-path'] !== `/SuiteScripts/Teibto/ds/v${newVersion}/`;

if (pkgChanged) {
  pkg.version = newVersion;
  pkg.tbt['ds-version'] = newVersion;
  pkg.tbt['skill-version'] = newVersion;
  pkg.tbt['file-cabinet-path'] = `/SuiteScripts/Teibto/ds/v${newVersion}/`;
  write(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`✓ package.json → ${newVersion}`);
} else {
  console.log(`  package.json already at ${newVersion}`);
}

// 2. components/**/*.js — @version X.Y.Z JSDoc header
const componentsDir = path.join(ROOT, 'components');
const jsFiles = fs.readdirSync(componentsDir).filter(f => f.endsWith('.js'));
let componentCount = 0;

for (const file of jsFiles) {
  const filePath = path.join(componentsDir, file);
  const src = fs.readFileSync(filePath, 'utf8');
  const updated = src.replace(
    /(@version\s+)\d+\.\d+\.\d+/,
    `$1${newVersion}`
  );
  if (updated !== src) {
    write(filePath, updated);
    componentCount++;
  }
}
console.log(`✓ components/ → ${newVersion} (${componentCount} files updated)`);

// 3. README.md — /vX.Y.Z/ in code blocks
const readmePath = path.join(ROOT, 'README.md');
const readme = fs.readFileSync(readmePath, 'utf8');
const updatedReadme = readme.replace(/\/v\d+\.\d+\.\d+\//g, `/v${newVersion}/`);
if (updatedReadme !== readme) {
  write(readmePath, updatedReadme);
  console.log(`✓ README.md → v${newVersion}`);
} else {
  console.log(`  README.md already at v${newVersion}`);
}

if (DRY_RUN) {
  console.log('\n[dry-run] no files written');
}

if (violations > 0) {
  process.exit(1);
}

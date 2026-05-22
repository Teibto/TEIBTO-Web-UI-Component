/**
 * Visual regression tests for TBT-DS demo pages.
 *
 * Run: npx playwright test
 * Update snapshots: npx playwright test --update-snapshots
 *
 * First run creates baseline snapshots in tests/visual/__snapshots__/.
 * Subsequent runs diff against baselines and fail on unintended changes.
 *
 * Prerequisite: npm run serve must be running (http://localhost:8081).
 * In CI this is started by the workflow before the test step.
 */
import { test, expect } from '@playwright/test';

// Wait for all custom elements to upgrade, render, and async fetches to settle
async function waitForDS(page) {
  await page.waitForFunction(() =>
    customElements.get('tbt-button') !== undefined &&
    document.readyState === 'complete'
  );
  await page.evaluate(() => document.fonts.ready);
  // Let tbt-data-table start its async fetch, then wait for it to finish
  await page.waitForTimeout(100);
  await page.waitForFunction(() => {
    const tables = [...document.querySelectorAll('tbt-data-table')];
    return tables.every(t => t._loading !== true);
  }, { timeout: 5000 }).catch(() => {});
  // Final settle for Lit reactive updates
  await page.waitForTimeout(300);
}

// Single-capture snapshot — avoids Playwright's two-consecutive-capture stability
// check, which fails on specimen.html due to 1px height oscillation caused by
// the full-page scrolling algorithm interacting with sub-pixel layout.
async function snap(page, name) {
  const buf = await page.screenshot({ fullPage: true, animations: 'disabled' });
  expect(buf).toMatchSnapshot(name, { maxDiffPixelRatio: 0.01 });
}

test('specimen.html — full page', async ({ page }) => {
  await page.goto('/demo/specimen.html');
  await waitForDS(page);
  await snap(page, 'specimen-light.png');
});

test('specimen.html — dark mode', async ({ page }) => {
  await page.goto('/demo/specimen.html');
  await waitForDS(page);
  await page.evaluate(() => {
    document.documentElement.dataset.theme = 'dark';
  });
  await page.waitForTimeout(100);
  await snap(page, 'specimen-dark.png');
});

test('demo.html — purchase order page', async ({ page }) => {
  await page.goto('/demo/demo.html');
  await waitForDS(page);
  await snap(page, 'demo-light.png');
});

test('icon-svg.html — icon gallery', async ({ page }) => {
  await page.goto('/demo/icon-svg.html');
  await waitForDS(page);
  await snap(page, 'icon-svg.png');
});

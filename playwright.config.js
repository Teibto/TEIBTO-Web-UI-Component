import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  snapshotDir: './tests/visual/__snapshots__',
  use: {
    baseURL: 'http://localhost:8081',
    // Consistent rendering: disable animations for stable diffs
    launchOptions: {
      args: ['--force-prefers-reduced-motion'],
    },
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium', viewport: { width: 1280, height: 900 } } },
  ],
  // Don't run Playwright tests with `npm test` (wtr); use `npx playwright test` explicitly
  testMatch: 'tests/visual/**/*.spec.js',
});

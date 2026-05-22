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
  browsers: [
    chromeLauncher({ launchOptions: { args: ['--no-sandbox', '--disable-dev-shm-usage'] } }),
  ],
  testRunnerHtml: testFramework => `
    <!DOCTYPE html>
    <html>
      <head>
        <script type="importmap">${JSON.stringify(importMap)}</script>
      </head>
      <body>
        <script type="module" src="${testFramework}"></script>
      </body>
    </html>
  `,
};

/**
 * Shared Tabler Icons stylesheet injector for shadow DOM components.
 * Import this and include ${tablerLink} at the top of every render()
 * that uses <i class="ti ti-*"> elements inside a shadow root.
 *
 * Two-tier loading (required for shadow DOM):
 *   1) On module load — inject <link> into document head so @font-face
 *      registers at document level and Chromium actually fetches the .woff2.
 *      (Chromium does NOT trigger font file loading for @font-face declared
 *      only inside shadow DOM stylesheets — codepoints set, glyphs missing,
 *      icons render as tofu.)
 *   2) Per-component ${tablerLink} — class rules (.ti-*:before { content })
 *      do not cross shadow boundaries, so each shadow root still needs them.
 *
 * Browsers cache the CSS file — one network request regardless of how many
 * components include the link.
 *
 * Tabler Icons pinned version: 3.44.0
 * Changelog: https://github.com/tabler/tabler-icons/releases
 * To upgrade: update TABLER_CSS_HREF and run npm run lint to verify.
 */
import { html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

const TABLER_CSS_HREF = 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.44.0/dist/tabler-icons.min.css';

if (typeof document !== 'undefined' && !document.head.querySelector('link[data-tbt-tabler]')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = TABLER_CSS_HREF;
  link.dataset.tbtTabler = '1';
  document.head.appendChild(link);
}

export const tablerLink = html`<link rel="stylesheet" href="${TABLER_CSS_HREF}">`;

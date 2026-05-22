/**
 * Shared Tabler Icons stylesheet injector for shadow DOM components.
 * Import this and include ${tablerLink} at the top of every render()
 * that uses <i class="ti ti-*"> elements inside a shadow root.
 *
 * Browsers cache the CSS file — one network request regardless of
 * how many components include the link.
 *
 * Tabler Icons pinned version: 3.44.0
 * Changelog: https://github.com/tabler/tabler-icons/releases
 * To upgrade: update the version below and run npm run lint to verify.
 */
import { html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

export const tablerLink = html`<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.44.0/dist/tabler-icons.min.css">`;

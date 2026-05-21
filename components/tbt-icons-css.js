/**
 * Shared Tabler Icons stylesheet injector for shadow DOM components.
 * Import this and include ${tablerLink} at the top of every render()
 * that uses <i class="ti ti-*"> elements inside a shadow root.
 *
 * Browsers cache the CSS file — one network request regardless of
 * how many components include the link.
 */
import { html } from 'https://cdn.jsdelivr.net/npm/lit@3/+esm';

export const tablerLink = html`<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css">`;

# Changelog — TBT-DS

All notable changes to this project are documented here.
Format: [Semantic Versioning](https://semver.org)

---

## [Unreleased]

### Docs
- Consolidated demo pages: `demo/help.html` removed; `demo/specimen.html` now uses the `tbt-app-shell` + categorized `tbt-sidebar` layout from the deleted help page (7 nav groups: Theme · Layout · Navigation · Actions · Feedback · Form · Display) while keeping all existing live demos, playgrounds, and form-submission examples. Scroll-spy highlights the active sidebar item as you scroll. Anchor IDs on every section.

---

## [1.24.2] — 2026-05-23

### Changed
- `tbt-menubar`: switched from dark navy (`var(--tbt-primary)`) to a light/neutral background (`var(--tbt-bg-card)`) with a 1px bottom border. Text and hover/active states now use the standard text/surface tokens (`--tbt-text-secondary`, `--tbt-text-primary`, `--tbt-bg-hover`, `--tbt-primary-bg`/`--tbt-primary-text` for active) — automatically theme-aware. `tbt-menu-item` and `tbt-menu-group` updated to match. `specimen.html`'s slotted theme toggle (`.theme-btn`) likewise switched from white-on-dark to token-based.

---

## [1.24.1] — 2026-05-23

### Fixed
- `tbt-sidebar` + `tbt-app-shell`: sidebar nav items now scroll internally when they overflow vertically (e.g., the 38-item nav on specimen.html).
  - `tbt-app-shell`: host `min-height: 100vh` → `height: 100vh`. The shell stays viewport-sized so the content area + sidebar can scroll internally instead of pushing the whole page taller. `.body` also gets `min-height: 0` so its `overflow: hidden` actually clips children (classic flex-shrink gotcha).
  - `tbt-sidebar`: host switched to flex column with `height: 100%`. The toggle header stays pinned at the top via `flex-shrink: 0`; the `<nav>` region is `flex: 1; overflow-y: auto`. Previously the sidebar grew to its content height (because `min-height: 100%` and the parent didn't constrain), so `overflow-y` had nothing to scroll.

---

## [1.24.0] — 2026-05-23

### Added
- `tbt-dropdown`: `searchable` boolean prop. When set, swaps the native `<select>` for a custom popover that includes a search input filtering options by label (case-insensitive). Existing non-searchable usage is unchanged.
- `tbt-multiselect`: `searchable` boolean prop. Adds a search input at the top of the option panel; filters the checkbox list as you type. Selection logic unchanged.

Both popovers reset the query when closed, focus the search input when opened, dismiss on Escape / outside click, and show an empty-state message when no options match.

---

## [1.23.0] — 2026-05-23

### Added
- `tbt-line-items`: `max-height` prop. When set, the table area scrolls vertically with a sticky `<thead>` and gets `tbt-table`-style chrome (1px border, `--tbt-radius-lg`, `--tbt-shadow-sm`). Standalone usage without `max-height` is unchanged.

### Changed
- `tbt-lines-block`: scroll shell now comes from the inner `tbt-line-items` via its new `max-height` prop instead of an extra wrapper `<div>`. Visual now matches `tbt-table` scrollable mode (sticky header, rounded border, subtle shadow) — previously the wrapper rendered as a plain rounded box and the table headers scrolled out of view.

---

## [1.22.0] — 2026-05-23

### Changed
- `tbt-lines-block`: scroll behavior switched from fixed `height` + drag-resize handle to `max-height` + content-driven sizing. Table now fits its content up to `max-height`, then scrolls vertically. No pagination.

### Renamed
- `tbt-lines-block`: `height` prop → `max-height`. Default `240px` → `320px`. Removed the `resize: vertical` drag handle from the table wrapper.

### Migration
- `<tbt-lines-block height="240px">` → `<tbt-lines-block max-height="320px">` (or the value you prefer). If you relied on the drag-resize handle to grow the table at runtime, you'll need to adjust `max-height` instead.

---

## [1.21.2] — 2026-05-23

### Changed
- `tbt-playground`: unified schema key handling — all keys are now the camelCase property name on the target element, regardless of `type`. Previously boolean keys had to be the kebab-case attribute name (because the boolean branch routed through `setAttribute`, which lowercases names and broke camelCase props like `showSummary`). Booleans now write the property directly, same as other types — `reflect: true` properties sync to attribute via Lit's machinery. The existing `disabled`/`loading`/`dismissible`/`multiple` etc. playgrounds are unaffected (single-word names work identically either way).

---

## [1.21.1] — 2026-05-23

### Fixed
- `tbt-tabs`: panel element renamed from `<tbt-tab>` to `<tbt-tabs-panel>` to resolve a name collision with the pre-existing `<tbt-tab>` registered by `tbt-subtab`. When both `tbt-subtab` and `tbt-tabs` loaded via `components/index.js` (the normal Suitelet path), the second `customElements.define('tbt-tab', …)` threw and `tbt-tabs` failed to register — making `<tbt-tabs>` fall back to `HTMLUnknownElement` on any page that loaded the barrel. `tbt-subtab` continues to use `<tbt-tab>` unchanged.

### Migration
- Anywhere you used the v1.21.0 `<tbt-tabs>` API: replace `<tbt-tab>` children with `<tbt-tabs-panel>`. The container `<tbt-tabs>` element and its API (`active`, `tbt-change`) are unchanged. The auto-generated panel id now uses prefix `tbt-tabs-panel-` instead of `tbt-tab-`.

---

## [1.21.0] — 2026-05-22

### Added
- `tbt-tabs` / `tbt-tab` — tab panel switcher; discovers `<tbt-tab>` children via slot; keyboard nav (ArrowLeft/Right/Home/End) with focus management; fires `tbt-change { active, label }`. Panels carry `role="tabpanel"` with `aria-controls` wiring; `active` is clamped on slot changes.
- `tbt-stepper` — horizontal progress stepper; `steps` array prop `[{ label, description?, error? }]`; `active` index; complete steps show check icon; error steps show X icon; connector lines fill on completion; active step carries `aria-current="step"`
- `tbt-date-range` — dual date range picker (`from`/`to`) composed from two `tbt-datepicker` inputs; form-associated; props: `label`, `name-from`, `name-to`, `from`, `to`, `required`, `disabled`, `error`; fires `tbt-change { from, to }` (YYYY-MM-DD or ''). When `name-from`/`name-to` are set, submits a `FormData` with both fields; otherwise submits a JSON string. `required` participates in constraint validation (`valueMissing`).
- `tbt-file-upload` — drag-and-drop file upload zone; form-associated; props: `label`, `name`, `accept`, `multiple`, `max-size` (bytes), `disabled`, `required`, `error`; `files` getter; file icon per extension; `_addFiles()` validates size; fires `tbt-change { files: File[] }`. When `name` is set, submits a `FormData` (one entry per file under `name`); `required` participates in constraint validation (`valueMissing`).
- `tbt-lines-block` — compound component wrapping `tbt-section` + `tbt-line-items` + Add button + totals
  - Props: `title`, `add-label` (default: "Add line"), `currency`, `vat-rate`, `show-summary`, `height`, `disabled`
  - `height` prop (default: `240px`) — controls scrollable table area; user can drag resize handle to adjust
  - `rows` get/set and `getTotal()` delegate directly to the inner `tbt-line-items`
  - Add button (variant=ghost, icon=plus) positioned bottom-left; `tbt-summary` totals on the right
  - Forwards `tbt-change` with same `{ rows, subtotal, vat, total }` shape as `tbt-line-items`

---

## [1.19.0] — 2026-05-22

### Added
- `tbt-data-table` — server-side data table wrapper around `tbt-table`
  - `fetch` prop: `async ({ page, pageSize, sort, order }) => { rows, total }` — plug in any RESTlet/SuiteQL endpoint
  - Loading state: shimmer skeletons (via `tbt-skeleton`) while fetching
  - Error state: `tbt-alert variant="danger"` with Retry button on fetch failure; fires `tbt-load-error`
  - Server-side sort: clicking sortable headers fires `tbt-sort` event, re-fetches with new `sort`/`order` params
  - `refresh()` public method — call after create/update/delete to reload current page
  - `tbt-table` extended with `server-sort`, `sort-key`, `sort-asc` props + `tbt-sort` event to support external sort control
- `tbt-breadcrumb` — navigation breadcrumb; `items` array prop `[{ label, href? }]`; last item rendered as `<span aria-current="page">` (non-clickable); separator `›` via CSS
- `tbt-pagination` — standalone pagination bar extracted from `tbt-table`; props: `total`, `page`, `page-size`; fires `tbt-page-change { page }`; ellipsis for large page counts; `tbt-table` now uses it internally
- `tbt-skeleton` — animated shimmer placeholder; variants: `text` (with `lines` prop), `block`, `circle`, `card` (composite with avatar + title + lines)
- `tbt-confirm()` — Promise-based confirmation helper built on `tbt-modal`
  - `await confirm({ title, message, confirmLabel, cancelLabel, variant, size })` → `Promise<boolean>`
  - Resolves `true` on confirm, `false` on cancel / X button / ESC / backdrop click
  - Programmatically creates and removes a `<tbt-modal>` — no boilerplate HTML needed
  - Replaces 10+ lines of modal wiring with one `await` expression
  - `demo/demo.html` — both submit and delete modals replaced with `confirm()` calls
- `tbt-toast` — toast notification overlay
  - Imperative API: `toast.success/danger/info/warning(msg, opts)` — lazy-creates a singleton `<tbt-toast>` in `<body>`
  - Options: `duration` (ms, default 4000) and `persistent` (no auto-dismiss)
  - Stacks up to 5 toasts; oldest is evicted when limit is exceeded
  - Slide-in / slide-out animation (direction adapts to position)
  - Positions: `top-right` (default), `top-left`, `bottom-right`, `bottom-left`
  - Click × to dismiss manually; fires `tbt-dismiss` event with `{ id }`
  - `demo/specimen.html` — "Notifications" section with one button per variant
- `LICENSE.txt` — proprietary copyright notice (Teibto Co., Ltd., all rights reserved); public repo is for demo/portfolio purposes only
- `.github/workflows/pages.yml` — GitHub Pages deploy workflow; triggers on every push to `master`; deploys repo root so all three README badge links resolve at `kingcomen.github.io/tbt-ds/`
- `custom-elements.json` — CEM manifest covering all 31 components; `@fires` and `@slot` tags added at class level so IDE autocomplete shows events and slots
- `custom-elements.json` added to `package.json` `files` array so it is included in npm publishes
- `scripts/build-bundle.js` — Rollup bundle (entry: `components/index.js` → `dist/tbt-ds.min.js` + `dist/tbt-theme.css`); CDN Lit imports are rewritten to local npm at build time; output ≈ 28.8 KB gzip
- `scripts/lint-governance.js` — 6 governance rules: no hex colors in components, no `@latest` URLs, `customElements.define` present, `@version` tag present, consistent Lit CDN URL, no hardcoded colors in demo inline styles
- `scripts/sync-version.js` — single-command version bumper: propagates a new semver across `package.json`, all `components/**/*.js` `@version` tags, and `README.md`; supports `--dry-run`
- `web-test-runner.config.js` + `tests/` — 51 unit tests across all components via `@web/test-runner`; importMap redirects CDN Lit to local npm during tests; tests added for tbt-toast, tbt-confirm, tbt-breadcrumb, tbt-pagination, tbt-skeleton, tbt-data-table
- `tbt-playground` — zero-boilerplate dev harness; `schema` prop drives a live controls panel that mutates the first child element; types: `text`, `number`, `boolean`, `select`, `text-content`
- `.github/workflows/visual.yml` — visual regression CI via Playwright (`toHaveScreenshot`); runs on PRs to master; uploads diff artifacts on failure
- `playwright.config.js` + `tests/visual/pages.spec.js` — 4 baseline screenshot tests (specimen light, specimen dark, demo, icon-svg)
- `dist/` added to `.gitignore`

### Changed
- `tbt-icons-css.js` — Tabler Icons CDN URL pinned from `@latest` to `@3.44.0` to prevent unexpected icon renames breaking production
- `demo/specimen.html`, `demo/demo.html`, `demo/help.html`, `demo/icon-svg.html` — Tabler Icons CDN URL pinned to `@3.44.0`
- `tbt-button.js`, `tbt-menubar.js`, `tbt-table.js` — all `#FFFFFF`/`#fff` literals replaced with `var(--tbt-text-inverse)` design token
- `tbt-modal.js` — `<dialog>` gains `aria-labelledby="modal-title"`; `<h3>` gains matching `id`; native `cancel` event (ESC key) prevented and routed through `_cancel()` so `tbt-cancel` always fires on ESC
- `tbt-subtab.js` — ARIA tablist keyboard nav: ArrowLeft/ArrowRight/Home/End move focus between tabs; roving `tabindex` pattern
- `tbt-multiselect.js` — `role="combobox"` on trigger, `role="listbox"` on dropdown, `role="option"` + `aria-selected` on items; keyboard: Enter/Space toggles, Escape closes, ArrowDown opens
- `tbt-search.js` — `role="searchbox"` + `aria-label` on native input
- `tbt-table.js` — `scope="col"` on all `<th>`; sortable columns get `aria-sort="none|ascending|descending"`; pagination buttons get `aria-label`
- `theme/tbt-theme.css` — added `--tbt-text-inverse` token (`#FFFFFF`) for text on dark/primary backgrounds
- `tbt-input`, `tbt-dropdown`, `tbt-checkbox`, `tbt-toggle`, `tbt-multiselect` — all are now `formAssociated` (`ElementInternals`); values propagate into native `<form>` via `setFormValue()` so a plain `fetch(new FormData(form))` picks them up with no extra wiring

---

## [1.18.0] — 2026-05-22

### Added
- `tbt-line-items` v1.0.0 — self-contained inline-editable line items table with automatic totals
  - Inline `<input>` / `<select>` in each table cell — no modal required
  - Event delegation on `<tbody>`: single `input`, `change`, `click` listeners handle all rows
  - Hybrid Lit + manual DOM: Lit manages outer structure and reactive summary; tbody is managed via `innerHTML` / `insertAdjacentHTML` to prevent cursor loss during editing
  - Reactive summary section (subtotal / VAT / grand total) — only re-renders when `_totals` state changes, never the tbody
  - `rows` getter/setter — normalises incoming data, computes initial totals
  - `addRow()` method — appends blank row and focuses Item input; uses `insertAdjacentHTML` to avoid touching existing rows
  - `getTotal()` method — returns `{ subtotal, vat, total }` synchronously
  - `tbt-change` event — fires on every edit, add, or delete with `{ rows, subtotal, vat, total }`
  - Props: `unitOptions`, `accountOptions`, `currency`, `vat-rate`, `show-summary`, `readonly`, `loading`
  - Loading skeleton state (3 animated rows)
  - Read-only mode — plain-text cells, delete buttons hidden
  - Empty state with `tbt-svg name="empty"` when no rows
- `demo/demo.html` — updated to use `<tbt-line-items>` component
  - Replaced ~100 lines of custom table + totals code with the component API (~20 lines)
  - Removed page-level CSS for table, inline inputs, and delete button (moved into component shadow DOM)

---

## [1.17.0] — 2026-05-22

### Added
- `tbt-icons-css.js` — shared Tabler CSS injector module
  - All 16 components that use `<i class="ti ti-*">` inside shadow DOM now import `tablerLink` and inject it at the top of their render template
  - Fixes icons not rendering in shadow DOM — Tabler CSS from light DOM doesn't pierce shadow boundaries; `<link>` inside each shadow root is required
  - Browsers cache the CSS file — one network request regardless of component instance count
- `tbt-icon` v1.1.0 — ERP semantic icon aliases
  - `ICON_ALIASES` map: 80+ aliases covering document actions, CRUD, approval/workflow, document types, finance, inventory, people/org, time, and misc
  - Raw Tabler icon names still work as-is — aliases are a layer on top, no breaking change
  - Examples: `save` → `device-floppy`, `approve` → `circle-check`, `reject` → `circle-x`, `invoice` → `file-invoice`, `money` → `currency-baht`

### Fixed
- `tbt-app-shell` v1.2.0 — sidebar visible on mobile first paint
  - Added `@media (max-width: 768px)` CSS to hide sidebar immediately before ResizeObserver fires (prevents flash)
  - Changed compact threshold from `< 600px` → `≤ 768px` — covers more phone/small-tablet sizes
- `tbt-menubar` v1.1.0 — hamburger not showing on 600–768px devices
  - Changed compact threshold from `< 600px` → `≤ 768px` to match `tbt-app-shell` — both components now use the same breakpoint

---

## [1.16.0] — 2026-05-22

### Added
- `tbt-svg` v1.0.0 — SVG illustration component
  - 7 built-in named illustrations: `empty` `search` `success` `error` `warning` `draft` `no-access`
  - `src` prop — fetches external SVG URL via `fetch()`, strips `<script>` and event-handler attributes for safety, injects sanitised markup
  - Slot — accepts inline `<svg>` content from the consumer page
  - `size` prop (default 80px) sets width + height; `width`/`height` props for independent overrides
  - `label` prop — when set, adds `role="img"` + `aria-label`; otherwise `aria-hidden="true"` (decorative)
  - Loading spinner state while fetch is in progress
  - Error fallback (photo-off icon) when fetch fails
  - All built-in illustrations use `style="fill:var(--tbt-*)"` — CSS custom properties resolve correctly in shadow DOM (unlike SVG presentation attributes)

---

## [1.15.0] — 2026-05-22

### Fixed
- `tbt-summary` v1.1.0 — mobile layout broken
  - Removed `min-width: 280px` and `align-items: flex-end` from `.auto-summary` — caused overflow and misalignment on narrow screens
  - Added `width: 100%; box-sizing: border-box` so the box fills its container at any width
  - Reduced row `gap` from `--tbt-space-12` (48px) → `--tbt-space-4` (16px) — prevents label/value crowding on narrow screens
  - `tbt-summary-item`: reduced `gap` from `--tbt-space-8` (32px) → `--tbt-space-4` (16px); added `min-width: 0` to prevent flex overflow
  - Added `white-space: nowrap` on values so amounts never wrap mid-number

---

## [1.14.0] — 2026-05-22

### Added
- `tbt-icon` v1.0.0 — Tabler icon wrapper component
  - Size scale via tokens: `xs` (11px) `sm` (14px) `md` (16px, default) `lg` (20px) `xl` (28px) `2xl` (36px)
  - Semantic color: `primary` `secondary` `muted` `success` `warning` `danger` `info`
  - `spin` prop — continuous rotation animation for `loader-2`, `refresh`, etc.
  - Accessibility: `aria-hidden="true"` by default (decorative); set `label` prop to make icon meaningful
  - `display: inline-flex; flex-shrink: 0` — safe for use inside flex/grid layouts

---

## [1.13.0] — 2026-05-22

### Added
- `tbt-approval-flow` v1.0.0 — approval chain visualization
  - **Horizontal** (default) — compact row layout for card headers and summary areas
  - **Vertical** — detailed column layout for sidebar/detail panels with comment block
  - Step statuses: `pending` `current` `approved` `rejected` `skipped`
  - Pulsing ring animation on `current` step to draw approver attention
  - Connector line color reflects previous step outcome (green=approved, red=rejected, grey=pending)
  - `comment` field renders as a styled blockquote in vertical mode
  - Loading skeleton for both orientations
  - Self-contained — no dependency on other tbt-* components

---

## [1.12.0] — 2026-05-21

### Added
- `tbt-checkbox` v1.0.0 — styled checkbox input
  - CSS-drawn checkmark + minus (no icon-font dependency for the indicator)
  - `indeterminate` state for parent-of-group patterns
  - `error` + `helper` text; `required` asterisk on label
  - `value` getter/setter (Boolean) — compatible with `tbt-form` data collection
  - Focus ring via `:focus-visible`; full disabled state
- `tbt-toggle` v1.0.0 — sliding on/off toggle switch
  - 36×20px track, animated thumb, primary color when on
  - Optional `label-on` / `label-off` status text below main label
  - `value` getter/setter (Boolean) — compatible with `tbt-form` data collection
  - `role="switch"` + `aria-checked` for screen readers
- `tbt-form` — added `tbt-checkbox` and `tbt-toggle` to `FORM_INPUTS` selector

---

## [1.11.0] — 2026-05-21

### Added
- `tbt-audit-log` v1.0.0 — vertical timeline component for document/record activity history
  - Dot per entry colored by action type (created/updated/approved/rejected/submitted/cancelled/deleted/printed/emailed/attached/viewed)
  - Relative timestamp (`2h ago`, `3d ago`) with full datetime tooltip
  - Field-level change diffs (before/after with strikethrough/highlight)
  - `compact` mode: hides changes, tighter spacing
  - `max-height` prop for scrollable lists
  - Loading skeleton with shimmer animation
  - Empty state with history icon
  - Full dark mode via `--tbt-*` tokens

---

## [1.10.0] — 2026-05-21

### Changed (BREAKING)
- `tbt-form` v1.1.0 — `tbt-submit` event detail เปลี่ยนจาก `{ formData: FormData }` เป็น `{ data: Object }` (key = `name` attr, value = component `.value`)
  - แก้ root cause: `new FormData()` ไม่เก็บค่าจาก shadow DOM inputs
  - เพิ่ม `_collectData()`: `querySelectorAll` tbt-* elements, รวบรวม `name`/`value` เอง
  - เพิ่ม click listener + `composedPath()` เพื่อ intercept `tbt-button[type="submit"]` ที่อยู่ใน shadow DOM
  - ย้าย inline `<ul>` style → CSS class `.error-list`
  - เพิ่ม `.footer:not(:has(*)) { display: none; }` ซ่อน footer เมื่อไม่มี content

### Added
- `tbt-input`, `tbt-dropdown`, `tbt-datepicker`, `tbt-multiselect` — เพิ่ม `name: { type: String }` property รองรับ tbt-form data collection

---

## [1.9.0] — 2026-05-21

### Fixed
- `tbt-menubar` — hamburger ไม่แสดงในตัวอย่างที่ embed ใน container: เปลี่ยนจาก `@media` (viewport) เป็น `ResizeObserver` (component width < 600px); เพิ่ม opacity icon เป็น 0.85 + font-size 22px
- `tbt-app-shell` — backdrop + drawer เริ่มจาก `top: 56px` แทน `top: 0` ทำให้ menubar/hamburger ไม่โดนบัง; ใช้ `ResizeObserver` ร่วมกับ `[compact]` attribute แทน `@media` เพื่อ sync กับ menubar

## [1.8.0] — 2026-05-21

### Added
- **Mobile sidebar drawer** (≤768px):
  - `tbt-menubar` — hamburger button (`ti-menu-2`) แสดงเฉพาะ mobile, nav items ซ่อน; fires `tbt-menu-toggle`
  - `tbt-app-shell` — ฟัง `tbt-menu-toggle`: sidebar กลายเป็น `position: fixed` overlay drawer, backdrop overlay, auto-expand sidebar เมื่อ open, close เมื่อ click backdrop หรือ sidebar item
  - `tbt-sidebar` — toggle button ซ่อนบน mobile ผ่าน `--_sidebar-toggle-display: none` จาก app-shell

## [1.7.0] — 2026-05-21

### Fixed
- `tbt-input` — `error` prop ไม่ reflect → `:host([error])` CSS ไม่ทำงานเมื่อ set ผ่าน JS property; แก้ `min/max/step/maxlength` ส่ง `nothing` แทน `''` เมื่อไม่มีค่า
- `tbt-datepicker` — เหมือน tbt-input + แก้ inline style `font-size:12px` → CSS class `.error-icon`
- `tbt-dropdown` — `error` prop reflect
- `tbt-multiselect` — `error` prop reflect; normalize `this.value` เป็น `string[]` ก่อน toggle เพื่อแก้ type mismatch เมื่อ options ใช้ numeric value; แก้ inline style error icon
- `tbt-modal` — `_onBackdropClick` ใช้ `e.target === e.currentTarget` แทน `shadowRoot.querySelector()` ทุก click

## [1.6.0] — 2026-05-21

### Fixed
- `tbt-sidebar` collapse — label ซ่อนพร้อม animation, icon center อัตโนมัติ
  - ใช้ CSS custom properties (`--_lbl-max-width`, `--_item-gap`, `--_item-justify`, `--_item-ph`) inherit ลง `tbt-sidebar-item` เมื่อ `[collapsed]`
  - `tbt-sidebar-item` label animate `max-width` + `opacity` → 0 เมื่อ collapse
  - เพิ่ม `title` attribute บน `<a>` เพื่อแสดง tooltip เมื่อ collapse

## [1.5.0] — 2026-05-21

### Added
- `tbt-menu-group` — `icon` prop: แสดง Tabler icon ก่อน label บน trigger button
- `tbt-menu-item` — dropdown context: ใช้ CSS custom properties (`--_item-*`) สำหรับสี ทำให้ items ใน dropdown แสดงสีถูกต้องบน light background แทน white-on-white

## [1.4.0] — 2026-05-21

### Added
- `tbt-table` v1.4.0 — `responsive` prop: แคบกว่า 600px เปลี่ยนเป็น card view อัตโนมัติ
  - ใช้ `ResizeObserver` บน component (ไม่ใช่ media query — ทำงานตาม container width)
  - Column `mobileTitle: true` กำหนด card header; default = first column
  - Pagination, sort, href, html ทำงานได้ทั้งใน table และ card mode

## [1.3.0] — 2026-05-21

### Added
- `tbt-table` v1.3.0 — sticky header works in both modes:
  - `max-height` set → scroll within table, header sticks inside
  - no `max-height` → page scrolls, header sticks to viewport (fixed via `overflow-y: clip`)
  - `--tbt-table-sticky-top` CSS variable for offset (e.g. menubar height)

## [1.2.0] — 2026-05-21

### Added
- `tbt-table` v1.2.0 — column `href: (row) => string` renders cell value as `<a>` link

## [1.1.0] — 2026-05-21

### Added
- `tbt-table` v1.1.0 — `max-height` (vertical scroll), resizable columns, sticky header

## [1.0.0] — 2026-05-21

### Added
- `tbt-theme.css` — design tokens (Navy Blue brand, gradient accent, semantic colors, spacing, typography, dark mode)
- **Layout**: `tbt-app-shell`, `tbt-menubar` + `tbt-menu-item` + `tbt-menu-group`, `tbt-sidebar` + `tbt-sidebar-item`
- **Navigation**: `tbt-subtab` + `tbt-tab`
- **Actions**: `tbt-button` (primary/secondary/danger/ghost/accent), `tbt-modal` (default/confirm/danger)
- **Feedback**: `tbt-badge` (6 variants), `tbt-alert` (4 variants, dismissible)
- **Form inputs**: `tbt-input`, `tbt-dropdown`, `tbt-multiselect`, `tbt-datepicker`, `tbt-search`, `tbt-form`
- **Display**: `tbt-field`, `tbt-field-grid`, `tbt-section`, `tbt-table` (sort + pagination), `tbt-summary` + `tbt-summary-item`
- `demo/specimen.html` — interactive component showcase (19 components)

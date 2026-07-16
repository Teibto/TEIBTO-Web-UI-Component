# Changelog — TEIBTO Web UI Component

All notable changes to this project are documented here.
Format: [Semantic Versioning](https://semver.org)

---

## [Unreleased]

_(nothing yet)_

## [1.44.1] - 2026-07-16

### Fixed

- **Ghost button text contrast** — `tbt-button[variant="ghost"]` used plain
  secondary (#64748B) which measures 4.43:1 on the page background, just
  under WCAG AA 4.5; now uses `--tbt-text-secondary-strong`. Found by the
  v1.44.0 post-deploy axe pass (last remaining serious violation).

## [1.44.0] - 2026-07-16

### Added

- **NetSuite-style list toolbar on the bill receipt list** (RFC 0007, #40 —
  layer C). Title, search, status filter, and the create button share one
  toolbar row (`.tbt-page-toolbar`); the table follows directly — the
  separate header card and section title are gone, and so is the last inline
  `style=` on the page.
- **NetSuite-style form anatomy on the bill receipt form** (RFC 0007, #40 —
  layer B). Action bar moved to the TOP (sticky while scrolling, new
  `.tbt-action-bar--top` utility); the four KPI cards became a compact
  summary strip inside the page header (`.tbt-page-header__stats`); line
  items / approval / history are now Subtabs (`tbt-tabs`), with the add-line
  button in a `.tbt-panel-toolbar` row inside the first tab.
- **ERP density mode** (RFC 0007, #40 — layer A). `<html data-density="erp">`
  compacts the whole DS through tokens only: section padding 20→12px, content
  padding 24→16px, base text 14→13px, card radius 12→6px, subtler shadow, and
  table rows ~44→~30px via the new `--tbt-table-cell-py` hook in `tbt-table`.
  `tbt_page.render` sets it by default on Suitelet pages (`opts.density:
  'default'` opts out); pages that don't opt in are pixel-identical.


### Added

- **Production sidebar (`templates/tbt_nav.js`)** (#28) — Suitelet pages now
  render a nav of ONLY the modules deployed on the account, every href
  resolved through `N/url` at request time (nothing can 404). Bill receipt
  list/form pass `sidebar: nav.sidebar()` + `active: 'bill-receipt'` — the
  dead-link `DEFAULT_SIDEBAR` (dev-server paths) no longer appears on
  NetSuite, and the active item is the actual page, not "Invoices".
  `DEFAULT_SIDEBAR` stays for dev-server demo pages.
- **Brand logo icon** (#28) — square icon (the gradient "O" cut from the
  Teibto wordmark, `netsuite/assets/teibtologo.png`, 256×256 RGBA) uploaded
  to `/SuiteScripts/Teibto/assets/teibtologo.png`; `tbt_page.js` already
  resolves it as an optional asset, so the sidebar brand now shows logo +
  text.

### Fixed

- **`scripts/dev-suitelet.mjs` hardcoded one DS version in its static route**
  — after the v1.43.2 release bump every DS asset 404'd on the local preview
  server and the page smoke suite failed (`shadowRoot` null on all
  components). The dist route now matches any `/ds/v<X>/dist/` and the
  server's own links follow `package.json`, so a release bump can't break it
  again.

### Docs

- RFC 0006 — `tbt-datepicker` display format `YYYY-MM-DD` / พ.ศ. (#29,
  Proposed).

## [1.43.2] - 2026-07-16

### Added

- **`tbt-dropdown` `auto-width` attribute** (#27) — sizes the select to its
  longest option instead of filling the container, for compact filter usage
  in a section's actions slot where the default `width:100%` collapsed to
  min-content and truncated the placeholder ("ทุกสถ…"). Applied to the bill
  receipt list's status filter.

### Fixed

- **Mobile hamburger overlapped the drawer's brand** (#27) — `tbt-app-shell`
  now reflects a `drawer-open` attribute while the mobile drawer is open, and
  `tbt_page.js` hides the floating ☰ trigger during that state ("Teibto ERP"
  was read as "o ERP").
- **Bill receipt form lost its record identity after the first save — a
  second "บันทึกร่าง" created a duplicate record** (#22). `save()` in
  `bill_receipt_lib.js` now returns `{ id, tranid }`, the RESTlet passes the
  generated tranid back, and the form adopts it: header/title update, the URL
  gains `&id=` via `history.replaceState`, and action buttons re-evaluate per
  the returned status. "ส่งตรวจรับ" on a never-saved form now saves as draft
  first instead of failing with a raw backend transition error (#26).
- **Bill receipt UX polish** (#26): validation and transition messages from
  the backend are now Thai (they surface verbatim in the form's alert);
  approval-flow badges show Thai (`tbt-approval-flow` gained an additive
  per-step `statusLabel` override); Thai `placeholder`/`empty-message` on the
  vendor dropdown, lines table, list table, and audit log; the header
  subtitle no longer renders a dangling "· รับเมื่อ" on a new form; single
  primary per state ("ส่งตรวจรับ" primary, "บันทึกร่าง" secondary); back
  button uses the arrow icon and falls back to the list page when opened as
  a direct link (`data.listUrl`); the list shows the edit pencil only on
  Draft rows.
- **`tbt-section` header crushed its title into mid-word line breaks when the
  actions slot was wide on narrow screens** (#23, 375px: "รายการใบวางบิล" broke
  around the search box). The header now wraps — the actions slot moves to its
  own row below the title once the container is too narrow (`flex-wrap` +
  12rem title basis).
- **a11y fixes from the 2026-07-16 axe baseline** (#24): the `tbt-section`
  toggle button gets an `aria-label` fallback when the section has no title
  (was an axe *critical* — name-less button); `tbt-table` renders an
  `aria-label` on header cells with no label (actions column); table header
  text uses the new `--tbt-text-secondary-strong` token (4.5:1 on `bg-hover`,
  plain secondary was 4.27); `tbt-dropdown` placeholder text moved from
  muted (2.56:1 on white) to secondary (4.76:1).
- **`tbt-stat` icon rendered the raw attribute name instead of resolving the
  ERP alias map** (#25, found by the 2026-07-16 UX QA baseline). The card
  emitted `ti ti-money` / `ti ti-payment` — classes that do not exist in the
  Tabler webfont — so two of the four summary cards on the bill receipt form
  showed empty colored boxes. `ICON_ALIASES` is now exported from
  `tbt-icon.js` and `tbt-stat` resolves through it (`money` →
  `currency-baht`, `payment` → `credit-card`); raw Tabler names still pass
  through unchanged.
- **Bill receipt line loss on submit: SuiteQL date round-trip + destructive
  replace order** (found by the SB2 smoke run, 2026-07-16). `load()` returned
  line dates in the account's date format (`16/7/2026`); submitting a reloaded
  draft fed that into `fromIso()`, which produced an Invalid Date that threw
  inside `replaceLines` — after the old lines were already deleted, so the
  record lost all its lines while the header had already moved to Submitted.
  Three-layer fix in `bill_receipt_lib.js`: (1) `TO_CHAR(..., 'YYYY-MM-DD')`
  in the load/list SQL so dates leave the DB as ISO, (2) `replaceLines`
  converts every value before deleting anything, (3) strict `fromIso` +
  `validate()` reports a non-ISO line date as a validation error.

### Added

- **`--tbt-text-secondary-strong` theme token** — secondary text that still
  meets WCAG AA 4.5:1 on tinted surfaces (`bg-hover`); equals plain secondary
  in dark themes where contrast is already sufficient.
- **SDF script objects for the bill receipt module** (2026-07-16) — Suitelet
  list/form + RESTlet as `netsuite/objects/customscript_tbt_*.xml`, so
  `suitecloud project:deploy` creates the script records + deployments with the
  exact ids the code resolves (no manual UI setup; DEPLOY.md steps updated).
  Record XMLs fixed to pass SDF validation: `FREEFORMTEXT` → `TEXT`, dropped
  unsupported `includenumber` / `icon` / `enablemailmerge` fields. First real
  deployment landed on `4089685_SB2` — both pages verified in-browser (list =
  real-data path `demo:false`, form loads 693 live vendors, DS assets load from
  N/file-resolved URLs per #17).

### Fixed

- **Bill receipt save failed on the account: custom records require the native
  `Name` field** (found by the DEPLOY.md smoke run on SB2, 2026-07-16) —
  `bill_receipt_lib.save` now mirrors the tranid into `name` on create, and
  `replaceLines` sets each line's `name` to its invoice no. Before the fix the
  RESTlet returned `{ok:false, "Please enter value(s) for: Name"}` on every save.
- **`tbt-page-runtime.js` `post()` treated HTTP 200 + `{ok:false}` as success**
  — the page showed "บันทึกสำเร็จ" while the server rejected the save. `post()`
  now throws on `body.ok === false` as well as HTTP errors (regression tests
  added in `tests/tbt-page-runtime.test.js`).
- **`tbt_page.js`: resolve File Cabinet URLs via `N/file` instead of the
  path-style `/sc/SuiteScripts/...` (#17).** NetSuite returns "Page Not Found"
  for path-style File Cabinet URLs (verified on SB2) — every page rendered by
  `tbt_page.render()` would 404 on all three DS assets. `render()` now loads
  each asset via `file.load(path).url` at request time (carries the required
  `h=` token, survives token rotation on re-upload) and fails fast with
  `TBT_DS_ASSET_NOT_FOUND` + a deploy hint when the DS version is not on the
  account. Path-style DS URLs inside template bodies (e.g. the module import
  in `so-form.html`) are rewritten to the resolved URL too, so templates stay
  readable and keep working in local dev. The sidebar logo is resolved the
  same way but treated as optional (missing file drops the `<img>`, logged via
  `log.debug`). `FC_BASE` export replaced by `resolveDsUrl(name)` (nothing
  consumed `FC_BASE`). Dev parity: `dev-suitelet.mjs` `N/file` stub now handles
  absolute `SuiteScripts/...` paths and returns `.url` mapping to the local
  `/sc/` static route.
- **`scripts/sync-sdf.js`: SDF staging path missed the `dist/` layer.** The
  v1.42.1 decision moved File Cabinet files under
  `/SuiteScripts/Teibto/ds/v<X.Y.Z>/dist/` and all runtime code (`tbt_page.js`
  `FC_BASE`, every template, `dev-suitelet.mjs`) follows it — but `sync-sdf.js`
  still staged files flat at `v<X.Y.Z>/`, so every SDF deploy landed on a path
  no page references (404). Unnoticed because v1.43.0 was never uploaded to the
  account. Also added `tbt-page-runtime.js` to the sync list — `tbt_page.js`
  emits a `<script>` tag for it, but it was never copied to staging, so
  server-rendered Suitelet pages would 404 on the runtime as well.

## [1.43.1] — 2026-07-16

### Fixed

- **a11y: keyboard option navigation for `tbt-multiselect`.** Options were
  mouse-only — keyboard users could open the listbox but not move to or toggle
  any option. Ported the roving-highlight pattern from `tbt-dropdown`
  (`_activeIdx`, Arrow/Home/End, `aria-activedescendant`); Enter/Space toggles
  the highlighted option and keeps the list open.
- **a11y: keyboard-operable column sort for `tbt-table`.** Sortable `<th>` is
  now focusable (`tabindex=0`) and sorts on Enter/Space, with a focus-visible
  outline. Non-sortable headers stay out of the tab order.
- **`tbt-line-items`: refresh Account/Unit dropdowns when their options change.**
  `accountOptions`/`unitOptions` set AFTER `rows` (e.g. an async
  chart-of-accounts fetch) left existing rows' selects stale; `updated()` now
  rebuilds the tbody for them, preserving each row's selected value.
- **a11y: keyboard expand/collapse for `tbt-tree`.** ArrowRight expands a
  collapsed branch, ArrowLeft collapses an expanded one, alongside Enter/Space
  select.
- **a11y: keyboard open/close for `tbt-menu-group`.** ArrowDown opens (focusing
  the first item), Escape closes (restoring focus to the trigger); corrected
  `aria-haspopup` from `"true"` to `"menu"`.
- **a11y: `tbt-drawer` restores focus to the opener on close**, matching
  `tbt-modal`.
- **a11y: form error messages announced via `role="alert"`** in `tbt-input`,
  `tbt-textarea`, `tbt-checkbox`, `tbt-radio`, `tbt-dropdown`, `tbt-datepicker`,
  `tbt-date-range`, and `tbt-file-upload` (matching `tbt-number-input` /
  `tbt-tag-input`).
- **a11y: fallback accessible name for unlabeled `tbt-toggle`** (aria-label
  applied only when no visible label is present).

### Added

- **Governance retrofit per `teibto-dev-standards` v0.13.0** (2026-07-16) —
  brought the repo up to the team playbook after moving into the Teibto org:
  `CLAUDE.md`, `CODEOWNERS` (@wichtking), `CONTRIBUTING.md`, `SECURITY.md`,
  `CODE_OF_CONDUCT.md`, `.gitattributes`, `.github/PULL_REQUEST_TEMPLATE.md`,
  issue forms (bug / feature), `.github/workflows/quality-gate.yml` (variant B)
  and canonical `scripts/secret-scan.sh`. `.gitignore` now blocks `.env*` /
  `*.key` / `*.pem` / `.qa-profiles/`; LICENSE notes vendored third-party
  libraries keep their licenses. Profile: `standard` · classification: `Internal`.
- **Employee expense claim — production backend.** Second module on the
  bill-receipt reference pattern (header + 1:N lines + status state machine):
  `netsuite/expense_meta.js` (ids + state machine), `expense_lib.js`
  (validate / list / load / employees / save), `rl_expense.js` (RESTlet, the
  only writer — re-reads status, enforces permission → state-machine →
  validation), SDF `customrecord_tbt_expense_claim` + `_line`, and
  `sl_expense_claim.js` reading real data via the lib + `N/url` with a demo
  fallback banner. Fixed the submit payload to send the employee internal id
  (not the display name). DEPLOY.md + smoke test extended. Verified locally:
  lint + build + 575 unit + smoke green (expense page: 3 lines, 3 approval
  steps, demo banner shown, no console errors); real N/query/N/record →
  sandbox checklist.
- **Vendor bill receipt (รับวางบิล) — production backend.** Replaces the mock
  scaffold with real SuiteScript:
  - `netsuite/objects/customrecord_tbt_bill_receipt.xml` + `_line.xml` — SDF
    custom records (header + 1:N invoice lines), field ids matching the meta module.
  - `netsuite/bill_receipt_meta.js` — single source of truth: record/field ids +
    status state machine (Draft→Submitted→Approved/Rejected→Paid).
  - `netsuite/bill_receipt_lib.js` — `validate` / `list` (SuiteQL) / `load` /
    `vendors` / `save` (N/record, replace-lines) + permission gate.
  - `netsuite/rl_bill_receipt.js` — RESTlet, the only writer: re-reads current
    status from the DB and enforces permission → state-machine → validation
    server-side (never trusts the client).
  - `sl_bill_receipt_list/form.js` now read real data via the lib and resolve
    URLs via `N/url`; they fall back to demo data with a warning banner when the
    custom record isn't deployed yet (also the path `npm run test:smoke` exercises).
  - `netsuite/DEPLOY.md` — SDF deploy steps, script/deployment ids, approver-role
    wiring, and a sandbox smoke checklist (this backend can't be unit-tested
    outside NetSuite).

## [1.43.0] — 2026-05-30

### Fixed

- **`tbt-line-items` (v1.43.0)** — the horizontal/vertical scroll wrapper (`.lines-wrap`) is now keyboard-focusable (`tabindex="0"` + `role="group"` + `aria-label`), fixing the axe `scrollable-region-focusable` violation so keyboard-only users can scroll the line grid. Also clears the same failure surfaced through `tbt-lines-block`, which composes `tbt-line-items`.
- **`tbt-table` (v1.43.0)** — now emits `tbt-row-click` (`detail: { row }`) when a body row is clicked, with a `cursor: pointer` affordance. The event was already consumed by 8 list templates (and `tbtPageRuntime.wireRowActions`, whose capture-phase guard is documented as "fires before tbt-row-click") but `tbt-table` never dispatched it — every "click row to open document" interaction was a silent no-op. Covered by a new unit test.
- **`tbt-table` + `tbt-line-items` (v1.43.0)** — removed hex color fallbacks from the right-click pin/unpin context menu (`var(--tbt-*, #hex)` → `var(--tbt-*)`, 14 occurrences). The menu mounts on `document.body`, where tokens resolve from `:root` in `tbt-theme.css`, so the fallbacks were dead weight. Satisfies governance rule 1 (no hex literals) — `npm run lint` now passes clean.

### Added

- **`tbt-chart` (v1.43.0) — SVG chart component for dashboards.** Bar, line, area, donut, pie, and sparkline in one element, single-series (`.data`) or multi-series (`.series`). Pure Lit + inline SVG; every colour is a `var(--tbt-*)` token via `currentColor`, so dark mode applies automatically and no hex appears — no canvas, no CDN library, CSP-safe. A `ResizeObserver` draws in real pixel coordinates (crisp text/strokes, no viewBox stretch). Native `<title>` tooltips + `role="img"` for a11y; `tbt-chart-select` event on bar/slice/point click. Design recorded in `rfcs/0001-tbt-chart.md`. Wired into `templates/dashboard.html` (sales bar + status donut) and demoed in `demo/specimen.html`.
- **`tbt-chart` analytical types (v1.43.0)** — added `combo` (bars + lines on a dual axis), `waterfall` (P&L/cash-flow bridge with up/down/total colours), `stacked` (+ `percent` for 100% stacked), `pareto` (auto-sorted bars + cumulative-% line + 80% marker), and `gauge` (180° arc, value vs `target`). New props: `value`, `max`, `target`, `percent`, `right-suffix`; new per-series keys `kind`/`axis` (combo) and per-datum `total` (waterfall). Still pure SVG + tokens, no dependency. Design in `rfcs/0002-tbt-chart-analytical.md`; demoed in `demo/specimen.html`.
- **`templates/bill-receipt-*` + `sl_bill_receipt_*.js` — vendor bill receipt (รับวางบิล) module.** Two Suitelets composed entirely from DS components + `var(--tbt-*)` tokens:
  - `sl_bill_receipt_list.js` + `bill-receipt-list.html` — voucher list: search + status filter + `tbt-table` with status badges and view/edit row actions.
  - `sl_bill_receipt_form.js` + `bill-receipt-form.html` — voucher document: header + document-info field-grid + summary stats + vendor-invoice lines (`tbt-table` + add/edit modal, auto-VAT) + `tbt-approval-flow` + `tbt-audit-log`. Edit only while status is `Draft`; `Submitted` exposes approve/reject; `Approved`/`Paid` are read-only.
  - `scripts/dev-suitelet.mjs` — registered `/bill-receipt/list` + `/bill-receipt/form` preview routes.
- **Page composition utility classes** in `theme/tbt-theme.css` — token-only, no hex. Lets Suitelet body templates drop inline-style duplication:
  - `.tbt-page-header` + `.tbt-page-header__title` + `.tbt-page-header__subtitle`
  - `.tbt-stats-grid` — auto-fit grid for `tbt-stat` cards
  - `.tbt-action-bar` — bottom button row with top divider
  - `.tbt-modal-actions` — right-aligned modal footer buttons
  - `.tbt-page-alerts` — wrapper around stacked `tbt-alert` pair
- **`dist/tbt-page-runtime.js`** — shared client-side helper (`window.tbtPageRuntime`), auto-loaded by `tbt_page.render()`. Exposes:
  - `currency(n, prefix='฿')` · `setStatusBadge(el, label)` · `showAlert(id, msg)` · `hideAlerts(...ids)` · `post(url, payload)` · `sumBy(rows, field)`
- **`templates/_mock_lookups.js`** — shared mock lookup module (employees, currencies, subsidiaries, payment-terms, vendors, customers, etc.) so kit/starter Suitelets import via `define([…, './_mock_lookups'], …)` instead of duplicating arrays per file. Replace each list with N/search in production.

### Changed

- **`tbt-sidebar`** (v1.43.0) — added `brand` + `footer` slots; merged collapse toggle into the brand row to save vertical space. Backward-compatible: existing usages without brand/footer render unchanged.
- **`tbt-app-shell`** (v1.43.0) — drawer + backdrop top offset uses `var(--tbt-menubar-height, 56px)` so pages without a menubar can set `--tbt-menubar-height: 0`.
- **`netsuite/tbt_page.js`** — menubar removed; user info + theme toggle moved into the sidebar footer; floating hamburger button replaces menubar trigger on mobile (≤768px).
- Refactored all 9 body templates to use utility classes + `tbtPageRuntime`. Net reduction: ~120 lines of duplicated inline style + helper functions across the suite.

### Added

- **`templates/time-tracking-*` + `sl_tt_*.js` — full Time tracking module.** Three Suitelets that compose a complete workflow on top of the standard Teibto layout, using only DS components and `var(--tbt-*)` tokens.
  - `sl_tt_entry.js` + `time-tracking-entry.html` — Employee weekly entry: header + filters + summary stats + entries table (modal-driven add/edit) + approval flow + Save / Submit action bar.
  - `sl_tt_approval.js` + `time-tracking-approval.html` — Manager queue: filters + summary + pending list (row-click → detail modal with full entry breakdown + Approve / Reject).
  - `sl_tt_report.js` + `time-tracking-report.html` — Reporting dashboard: filters + KPI strip (utilization, billable, capacity, overtime) + top projects table + activity log + Export CSV / Print.
- **`netsuite/tbt_page.js`** — added `time-tracking` to `DEFAULT_SIDEBAR` (icon: `time`).
- **`templates/kit-*` — ready-to-use schema-driven kits.**
  - `kit-doc.html` — universal `<tbt-doc-form>` body that picks a schema by name from the DS bundle, wires `tbt-submit` → POST to `restletUrl`, and shows success/error via `tbt-alert`.
  - `sl_kit_customer.js` → `CUSTOMER_SCHEMA` — profile, contact, billing/shipping address, terms.
  - `sl_kit_sales_order.js` → `SALES_ORDER_SCHEMA` — doc info, shipping, lines, approval.
  - `sl_kit_purchase_order.js` → `PO_SCHEMA` — doc info, lines, approval, audit.
  - Each kit thin entry only carries `record` + `optionLists` + `restletUrl`; layout, fields, icons, colors, and field widgets all come from DS — nothing outside the design system is referenced.
- **`netsuite/tbt_page.js`** — server-side Suitelet page helper (SuiteScript 2.1 Fat Module). One `tbtPage.render({ title, active, data, body })` call emits the full `<head>` (theme CSS + bundled `tbt-ds.min.js`), `tbt-app-shell` + `tbt-menubar` + `tbt-sidebar` wrap, and a safely-escaped `window.__DATA__` injection. No per-page boilerplate.
  - `DS_VERSION` constant — single source of truth for File Cabinet URLs. Bumping the DS = edit one line.
  - Default menu + sidebar items (`opts.menu`, `opts.sidebar` to override per page).
  - JSON injection escapes `</`, `<!--`, `-->`, U+2028, U+2029 — safe against script-tag and HTML-comment breakout.
  - Throws `error.create({ name: 'TBT_PAGE_MISSING_ARG', … })` on missing `title` or `body` — surfaces, never silent-defaults.
- **`templates/`** — three copy-paste page bodies + matching thin-entry Suitelets:
  - `document-page.html` / `sl_starter_document.js` — header + field-grid + lines-block + action bar.
  - `list-page.html` / `sl_starter_list.js` — search + new button + paginated `tbt-table`.
  - `dashboard.html` / `sl_starter_dashboard.js` — KPI strip (`tbt-stat`) + pending tasks + audit log.
- **`package.json` `tbt.file-cabinet-path`** — moved to `/SuiteScripts/Teibto/ds/v1.42.1/dist/`. Bundled `tbt-ds.min.js` + `tbt-theme.css` now live under the `dist/` subfolder of the versioned File Cabinet path.

### Notes

- The existing Rollup build (`npm run build`) already inlines Lit 3 into `dist/tbt-ds.min.js` via `nodeResolve` — no toolchain change required. Tabler icons remain a separate webfont CSS fetched at runtime.

---

## [1.42.1] — 2026-05-29

### Fixed

- **`tbt-icons-css`** — Icons rendered as tofu (empty squares) in deployed Suitelets despite Tabler CSS loading 200 OK.
  - Root cause: Chromium does NOT fetch font files for `@font-face` declared only inside shadow DOM stylesheets. Codepoints got set on `::before` pseudo-elements but glyphs were missing.
  - Fix: inject Tabler `<link>` into `document.head` once on module load (idempotent via `data-tbt-tabler` marker). `@font-face` now registers at document level → browser actually fetches `.woff2`.
  - Existing per-component `${tablerLink}` retained — class rules (`.ti-*:before { content }`) do not cross shadow boundaries.
  - Verified end-to-end via deployed `tbt-sidebar-item` in SDB Suitelet.

---

## [1.42.0] — 2026-05-29

### Added

- **`tbt-stat`** — Stat / KPI card สำหรับ dashboard metrics พร้อม trend indicator และ icon.
  - Props: `value`, `label`, `trend` (ใส่ `+` หรือ `-` prefix เพื่อ auto-detect variant), `trend-variant` (success|danger|neutral override), `icon` (Tabler name), `variant` (primary|success|warning|danger|info)
  - Grid layout: label/value/trend ใน column ซ้าย, icon span 2 rows ในคอลัมน์ขวา
  - Accent line ด้านบน card ตาม `variant`
  - Icon background/color ตาม `variant` อัตโนมัติ
  - `value` fallback เป็น `—` เมื่อไม่มีค่า

---

## [1.41.0] — 2026-05-29

### Added

- **`tbt-list` + `tbt-list-item`** — Vertical data list สำหรับแสดง key/value rows พร้อม icon และ action slot. เหมาะสำหรับ profile card, drawer detail, settings panel.
  - `tbt-list` props: `compact` (Boolean, ลด padding), `divided` (Boolean, เพิ่ม border ระหว่าง items)
  - `tbt-list-item` props: `label`, `value` (fallback text), `icon` (Tabler name), `muted`
  - `tbt-list-item` slots: default slot สำหรับ rich value (เช่น `<tbt-badge>`), `action` slot สำหรับ button ขวามือ
  - CSS custom properties: `--tbt-list-label-width` (default 140px), รับ `compact`/`divided` จาก parent ผ่าน CSS inheritance
  - `tbt-list-item` มี `role="listitem"` อัตโนมัติ

---

## [1.40.0] — 2026-05-29

### Added

- **`tbt-popover`** — Click-triggered floating panel สำหรับ action menu, info card, และ quick form. Wrapper component — default slot คือ trigger, `content` slot คือเนื้อหา popup.
  - Props: `open` (Boolean, reflect), `placement` (top|bottom|left|right, default: bottom)
  - Events: `tbt-open`, `tbt-close`
  - ปิดอัตโนมัติเมื่อคลิกนอก popover หรือกด Escape
  - Set `aria-expanded` + `aria-haspopup` บน slotted trigger อัตโนมัติ
  - `aria-hidden="true"` เมื่อปิด; `role="dialog"` บน panel

---

## [1.39.0] — 2026-05-28

### Added

- **`tbt-tooltip`** — Tooltip แสดงเมื่อ hover หรือ focus บน trigger element. Wrapper component — slotted content คือ trigger, `content` prop คือข้อความที่แสดง.
  - Props: `content` (String), `placement` (top|bottom|left|right, default: top), `delay` (ms, default: 200)
  - ARIA: `role="tooltip"` + `aria-describedby` ใน shadow root
  - ไม่แสดงเมื่อ `content` ว่าง; ยกเลิก timer อัตโนมัติเมื่อ disconnect

---

## [1.38.0] — 2026-05-28

### Added

- **`tbt-drawer`** — Slide-in drawer panel สำหรับ filter panel, detail view, และ side form. ใช้ `<dialog>` + `showModal()` พร้อม focus trap อัตโนมัติ.
  - Props: `open` (Boolean, reflect), `placement` (right|left|bottom, default: right), `title`, `size` (sm|md|lg|full, default: md), `closable` (Boolean, default: true)
  - Slots: default body slot, `footer` slot
  - Events: `tbt-close` — fired เมื่อกด ×, คลิก backdrop, หรือกด Escape
  - CSS transition: slide-in/out 280ms cubic-bezier
  - Responsive sizes: sm=320px, md=420px, lg=560px, full=100% (right/left); sm=30%, md=50%, lg=70% height (bottom)

---

## [1.37.0] — 2026-05-28

### Added

- **`tbt-chip`** — Toggleable chip / filter tag. ใช้สำหรับ filter bar, category selection, และ toggle-able tags.
  - Props: `variant` (neutral|primary|success|warning|danger|info), `selected` (Boolean, reflect), `removable`, `disabled`, `icon` (Tabler icon name), `size` (sm|md|lg)
  - Events: `tbt-toggle → { selected: boolean }`, `tbt-remove`
  - Keyboard: Enter/Space toggles; remove button aria-labeled "Remove"
  - Selected state ใช้ variant color (primary by default); unselected เป็น neutral

---

## [1.36.0] — 2026-05-28

### Added

- **`tbt-empty-state`** — Empty state display สำหรับ table, list, search result ที่ไม่มีข้อมูล. รองรับ icon, title, description, actions slot, และ 3 sizes.
  - Props: `icon` (Tabler icon name, default: 'inbox'), `title` (default: 'No data'), `description`, `size` (sm|md|lg)
  - Slot: `actions` สำหรับ CTA buttons
  - Icon wrap มี `aria-hidden="true"` เพื่อไม่ให้ screen reader อ่านซ้ำ

---

## [1.35.0] — 2026-05-28

### Added

- **`tbt-tag-input`** — Tag / chip input สำหรับ keywords, labels, และ multi-value text entry. พิมพ์แล้วกด Enter เพื่อเพิ่ม tag, ลบด้วย × button หรือ Backspace เมื่อ input ว่าง. Form-associated รองรับ required validation.
  - Props: `label`, `name`, `placeholder`, `required`, `disabled`, `error`, `helper`, `max` (จำนวน tag สูงสุด, 0 = ไม่จำกัด)
  - Value: property `.value` รับ/คืน `string[]`; form value เป็น comma-separated string
  - Event: `tbt-change → { values: string[] }`
  - Keyboard: Enter เพิ่ม tag, Backspace ลบ tag สุดท้ายเมื่อ input ว่าง, Escape ล้าง input
  - ไม่เพิ่ม tag ซ้ำ; focus กลับ input อัตโนมัติหลังลบ tag

---

## [1.34.0] — 2026-05-28

### Added

- **`tbt-progress`** — Horizontal progress bar สำหรับ upload, import batch, และ processing feedback. รองรับ determinate (0–100%), indeterminate (sliding animation), 4 variants, 3 sizes, label + show-value display.
  - Props: `value` (0–100), `label`, `variant` (primary|success|warning|danger), `size` (sm|md|lg), `show-value`, `indeterminate`
  - Accessible: `role="progressbar"` + `aria-valuenow` / `aria-valuemin` / `aria-valuemax` / `aria-busy`

---

## [1.33.0] — 2026-05-28

### Added

- **`tbt-timeline`** — Vertical event timeline สำหรับ document history, process flow, audit trail. แต่ละ entry มี label, timestamp, user, icon, variant, content. รองรับ `compact` mode และ `max-height` scrollable container.
  - Entry fields: `label`, `timestamp`, `user`, `icon`, `variant` (primary|success|warning|danger|info|neutral), `content`
  - Props: `entries` (Array), `compact` (Boolean), `max-height` (CSS string)
  - Accessible: `<ol aria-label="Timeline">` + `<li>` structure

---

## [1.32.0] — 2026-05-28

### Added

- **`tbt-number-input`** — Formatted number input สำหรับ ERP financial fields. แสดง comma thousands separator โดยอัตโนมัติ, prefix/suffix สำหรับ currency/unit, Arrow key increment/decrement, min/max clamping, form-associated.
  - Props: `value`, `label`, `name`, `min`, `max`, `step`, `decimal`, `prefix`, `suffix`, `placeholder`, `required`, `disabled`, `readonly`, `error`, `helper`
  - Event: `tbt-change → { value: number | null }` (null เมื่อ clear)
  - พฤติกรรม: focus → raw number, blur → formatted (comma-separated), Enter → commit

---

## [1.31.0] — 2026-05-28

### Added

- **`tbt-split-button`** — Split button สำหรับ ERP document workflows (Save / Save & Submit / Save & Print ฯลฯ). Primary action + dropdown secondary actions ในปุ่มเดียว, รองรับ variant/size/icon/loading/disabled, keyboard nav ครบ (Arrow, Esc, Tab), axe-clean.
  - Props: `label`, `variant` (primary|secondary|danger|ghost), `icon`, `actions` (Array), `loading`, `disabled`, `size` (sm|md|lg)
  - Events: `tbt-click` (main button), `tbt-action → { value, label }` (secondary action)

---

## [1.30.0] — 2026-05-28

### Added

- **`tbt-color-picker`** — Color swatch picker for ERP category/tag coloring. 20-color default palette (4×5 grid), optional custom hex input (`allow-custom`), full keyboard navigation (Arrow keys / Enter / Esc), form-associated, accessible labels/roles.
  - Props: `value`, `label`, `name`, `palette`, `allow-custom`, `disabled`, `required`, `error`
  - Event: `tbt-change → { value: string }` (hex string, e.g. `#0D1171`)

### Chore

- `scripts/lint-governance.js` — เพิ่ม `HEX_EXEMPT` set เพื่อ exempt `tbt-color-picker.js` จาก Rule 1 (palette hex data ไม่ใช่ CSS styling)
- `components/index.js` — register `tbt-color-picker`

### Test

- เพิ่ม `tests/tbt-color-picker.test.js` — 14 cases รวม axe pass

---

## [1.29.0] — 2026-05-28

### Accessibility

- **`tbt-line-items`** — เพิ่ม `aria-label` บน input/select ทุกช่องในแถว (Item, Description, Qty, Unit, Unit price, Account) เพื่อให้ AT อ่านออกเมื่อ user navigate ใน table
- **`tbt-icon`** — เพิ่ม `role="img"` เมื่อ `label` prop ถูกตั้งค่า (ขจัด `aria-label` on role=generic violation ตาม ARIA 1.2)
- **`tbt-dropdown`** — เพิ่ม `aria-label` บน native `<select>` ใน `_renderNative()` เพื่อให้มี accessible name
- **`tbt-stepper`** — เพิ่ม `role="img"` บน `.circle` div เพื่อให้ `aria-label` valid
- **`tbt-date-range`** — เพิ่ม `label="From"` และ `label="To"` บน inner `tbt-datepicker` elements
- **`tbt-tabs`** — แทน cross-shadow `aria-labelledby` บน panels ด้วย `aria-label` โดยตรง; ลบ `aria-controls` ออกจาก shadow DOM tab buttons (cross-shadow IDREF ไม่สามารถ resolve ได้ตาม spec)

### Test

- เพิ่ม `axe.run()` assertions ครอบคลุม 28 test files ที่เหลือ: tbt-address, tbt-alert, tbt-app-shell, tbt-approval-flow, tbt-audit-log, tbt-badge, tbt-breadcrumb, tbt-confirm, tbt-data-table, tbt-date-range, tbt-doc-form, tbt-field-grid, tbt-field, tbt-file-upload, tbt-form, tbt-icon, tbt-line-items, tbt-lines-block, tbt-pagination, tbt-playground, tbt-section, tbt-sidebar, tbt-skeleton, tbt-stepper, tbt-summary, tbt-svg, tbt-tabs, tbt-toast
- อัปเดต tbt-tabs: แทน `aria-controls` test ด้วย `aria-selected` state test
- **365 tests, 0 failures** — axe coverage ครบ 100% ทุก component

---

## [1.28.0] — 2026-05-28

### Accessibility

- **`tbt-input`** — เพิ่ม `aria-invalid`, `aria-describedby` บน native input; เพิ่ม `id` บน error-msg และ helper div
- **`tbt-textarea`** — เพิ่ม `aria-invalid`, `aria-describedby`; เพิ่ม `id` บน error-msg และ helper div (pattern เดียวกับ tbt-input)
- **`tbt-multiselect`** — เพิ่ม `_uid`, `aria-controls`, `aria-owns` บน trigger; แยก `role="listbox"` เป็น inner div พร้อม `id` + `aria-label`; เพิ่ม `aria-label="Search options"` บน search input; แทน `<input type="checkbox">` ด้วย CSS-only `.cb-visual` span เพื่อขจัด nested-interactive violation
- **`tbt-subtab`** — `_syncTabs()` เพิ่ม `role="tabpanel"`, `aria-label`, `tabindex` บน `tbt-tab` host elements
- **`tbt-modal`** — เพิ่ม `aria-modal="true"` บน `<dialog>`

### Test

- เพิ่ม `axe.run()` assertions (critical/serious filter) ใน: tbt-input, tbt-textarea, tbt-multiselect, tbt-subtab, tbt-modal, tbt-checkbox, tbt-toggle, tbt-search, tbt-table, tbt-button
- เพิ่ม structural a11y tests สำหรับ tbt-subtab tabpanel roles และ tbt-modal aria-modal
- **334 tests, 0 failures**

---

## [1.27.0] — 2026-05-28

### Accessibility

- **`tbt-datepicker`** — เพิ่ม `id="dp-input"` + `for="dp-input"` เชื่อม label กับ input, `aria-invalid`, `aria-describedby` ชี้ไป error/helper element
- **`tbt-dropdown`** (searchable) — เพิ่ม keyboard navigation สมบูรณ์: Arrow Up/Down เลื่อน highlight, Home/End ไปปลาย, Enter commit ตัวเลือกที่ highlight อยู่; เพิ่ม `aria-activedescendant` บน trigger + search input, `id` บนแต่ละ option element, CSS visual state `[data-kbd-active]`
- **`tbt-menu-group`** — เพิ่ม `aria-haspopup="true"` + `aria-expanded` บน trigger button, `role="menu"` บน dropdown div
- **`tbt-menu-item`** — เพิ่ม `aria-current="page"` บน anchor เมื่อ `active`
- **`tbt-sidebar-item`** — เพิ่ม `aria-current="page"` บน anchor เมื่อ `active`

### Test

- ติดตั้ง `axe-core` เป็น devDependency และ inject `axe.min.js` เป็น global ใน WTR test HTML
- เพิ่ม `describe('a11y')` blocks ใน test files ของ tbt-datepicker, tbt-dropdown, tbt-menubar, tbt-sidebar
- เพิ่ม keyboard navigation tests ใน tbt-dropdown

---

## [1.26.2] — 2026-05-25

### Fixed

- **`tbt-button`** — inner `<button>` ไม่มี `type` attribute ทำให้ browser default เป็น `type="submit"` และ submit native `<form>` โดยไม่ตั้งใจ; เพิ่ม `type` prop (default: `'button'`) และ forward ไปที่ inner button
- **`tbt-line-items`** — `firstUpdated()` เพิ่ม event listeners ด้วย anonymous arrow functions ที่ลบด้วย `removeEventListener` ไม่ได้ ทำให้ listeners stack เมื่อ component reconnect; เปลี่ยนเป็น bound instance properties + เพิ่ม `disconnectedCallback` สำหรับ cleanup
- **`tbt-field`** — `_hasSlotContent()` ถูกเรียกใน `render()` โดย query `shadowRoot?.querySelector('slot')` ซึ่งอาจเป็น `null` ใน first render; แก้โดยย้ายเป็น `_hasSlot` reactive state ที่ update ผ่าน `slotchange` event แทน

### Accessibility

- **`tbt-tabs`** — `TbtTabsPanel` ใช้ `aria-label` ผิด pattern; แก้โดยให้ tab buttons มี `id` และ panels ใช้ `aria-labelledby` ชี้ไปที่ button ID ตาม ARIA APG tab pattern
- **`tbt-skeleton`** — ไม่มี `role="status"` ทำให้ screen reader ไม่ประกาศ loading state; เพิ่ม `role="status"` และ `aria-label="Loading..."` ใน `connectedCallback`
- **`tbt-pagination`** — ellipsis `…` ไม่มี ARIA annotation ทำให้ screen reader อ่าน "dot dot dot"; เพิ่ม `aria-hidden="true"` บน ellipsis span

---

## [1.26.1] — 2026-05-25

### Fixed

- **`tbt-search`** — debounce timer ไม่ถูก clear เมื่อ element ถูก unmount; เพิ่ม `disconnectedCallback` ด้วย `clearTimeout(this._timer)` ป้องกัน event ที่ค้างอยู่หลัง unmount
- **`tbt-multiselect`** — outside-click ปิด dropdown ผิดเวลาเมื่อคลิกใน Shadow DOM ของ component อื่น; เปลี่ยนจาก `this.contains(e.target)` เป็น `e.composedPath().includes(this)`
- **`tbt-dropdown`** — bug เดียวกับ `tbt-multiselect` ใน searchable mode; แก้ด้วย `composedPath()` เช่นกัน
- **`tbt-menubar`** — `tbt-menu-group` outside-click; แก้ด้วย `composedPath()` เช่นกัน
- **`tbt-input`** — error focus ring ใช้ hardcoded `rgb(239 68 68 / 0.18)` แทน token; เปลี่ยนเป็น `color-mix(in srgb, var(--tbt-danger) 18%, transparent)`
- **`tbt-checkbox`** — error focus ring เดียวกัน; แก้ด้วย `color-mix()` เช่นกัน
- **`tbt-textarea`** — error focus ring เดียวกัน; แก้ด้วย `color-mix()` เช่นกัน
- **`tbt-approval-flow`** — `@keyframes tbt-flow-pulse` ใช้ hardcoded `rgb(13 17 113 / 0.30)`; เปลี่ยนเป็น `color-mix(in srgb, var(--tbt-primary) 30%, transparent)`
- **`tbt-modal`** — (1) `querySelector('[slot="footer"]')` ใน `render()` ไม่ reactive กับ slot ที่เพิ่มทีหลัง; แก้ด้วย `slotchange` event + `_hasCustomFooter` reactive state — (2) backdrop ใช้ hardcoded `rgb(15 23 42 / 0.55)`; เปลี่ยนเป็น `var(--tbt-overlay)` — (3) focus ไม่กลับไปที่ element เดิมหลังปิด modal; เพิ่ม `_prevFocus` restore ใน `updated()`
- **`tbt-app-shell`** — sidebar shadow และ mobile backdrop ใช้ hardcoded `rgb()`; เปลี่ยนเป็น `var(--tbt-shadow-sidebar)` และ `var(--tbt-overlay-sm)`
- **`tbt-toggle`** — thumb shadow ใช้ hardcoded `rgb(0 0 0 / 0.18)`; เปลี่ยนเป็น `color-mix(in srgb, black 18%, transparent)`
- **`tbt-form`** — (1) nested `tbt-form` ทำให้ submit button ของ inner form ยิง `_submit()` บน outer form ด้วย; แก้ด้วย closest-form boundary check — (2) `_collectData()` เก็บ inputs ของ nested form ซ้ำซ้อน; เพิ่ม `el.closest('tbt-form') !== this` filter
- **`tbt-section`** — `role="button"` บน `<header>` element ทับ landmark semantics; `aria-expanded` อยู่ผิด element; แก้โดยใส่ `<button class="toggle-btn">` ไว้ใน `<header>` แทน พร้อม `aria-controls` และ `:focus-visible` ring
- **`tbt-table`** — `_colWidths` ไม่ถูก reset เมื่อ `columns` prop เปลี่ยน; ทำให้ column width เก่าค้างอยู่; แก้ใน `updated()` ให้ clear และ re-measure เมื่อ `columns` เปลี่ยน

### Added (theme tokens)

- `--tbt-overlay` — `rgb(15 23 42 / 0.55)` สำหรับ modal backdrop
- `--tbt-overlay-sm` — `rgb(15 23 42 / 0.45)` สำหรับ sidebar backdrop (mobile)
- `--tbt-shadow-sidebar` — `4px 0 24px rgb(0 0 0 / 0.18)` สำหรับ sidebar slide-in shadow

---

## [1.26.0] — 2026-05-23

### Added
- 3 new schemas in `components/tbt-doc-schemas.js`:
  - `QUOTATION_SCHEMA` — doc info + lines + approval. Includes a "Convert to SO" submit action.
  - `FULFILLMENT_SCHEMA` — references a sales order; doc info + shipping address + notes + approval. Special "picked items" line shape rendered per-demo (no `type:'lines'` section in the schema for now).
  - `RECEIPT_SCHEMA` — customer payment receipt; doc info (customer, amount, payment method, bank account) + audit. "Apply to open invoices" table rendered per-demo.
- `demo/sales-process.html` — full single-page workflow demo. App-shell + sidebar nav across 7 screens (Dashboard / Customer / Quotation / Sales Order / Fulfillment / Invoice / Receipt). Each transaction screen has a `tbt-stepper` showing position in the chain.
- Dashboard layout — KPI strip + quick-action row + pending tasks (`tbt-data-table`) + recent activity (`tbt-audit-log`). No new component; pattern uses existing primitives + per-page CSS.
- README "Sales process" composition section covering the workflow stepper, dashboard layout, and single-page screen-swap pattern.
- Visual baseline for `sales-process.html` (dashboard view).

### Lookup keys added to the JSDoc reference list
`payment-methods`, `sales-orders`, `fulfillment-statuses`, `bank-accounts`.

---

## [1.25.0] — 2026-05-23

### Added
- `tbt-textarea` — multiline text input. Form-associated. Mirrors `tbt-input`'s `label/name/value/placeholder/required/disabled/readonly/error/helper` API plus `rows` (default 3) and `maxlength`. Wires `valueMissing` constraint.
- `tbt-address` — composite address field (street/city/state/postcode/country). Form-associated; `value` is a nested object. When `name` is set, submits a `FormData` with prefixed keys (`<name>.street`, `<name>.city`, etc.). `required` mode enforces street + city + country.
- `tbt-doc-form` — schema-driven document form scaffold. Reads a plain-JS schema and renders sections (fields / lines / approval / audit) plus a footer action row. Public API: `.schema`, `.value` (cascading), `.lines`, `.approvalSteps`, `.auditEntries`, `.optionLists`, `.disabled`, `.readonly`. Events: `tbt-change`, `tbt-action`, `tbt-submit`.
- `tbt-doc-schemas.js` — pre-built schemas: `PO_SCHEMA`, `CUSTOMER_SCHEMA`, `SALES_ORDER_SCHEMA`, `INVOICE_SCHEMA`. Drop one in with a lookup-data `optionLists` and the form renders. New consumers go from ~140 lines of hand-composed markup to ~5 lines.

### Changed
- `tbt-form.js`: `FORM_INPUTS` constant extended to include `tbt-textarea`, `tbt-date-range`, `tbt-file-upload`, `tbt-address` so the existing `tbt-form` data collector also picks them up.
- `scripts/lint-governance.js`: `tbt-doc-schemas.js` added to `UTIL_MODULES` (exempt from the "every tbt-*.js must call customElements.define" rule, same as `tbt-confirm.js` and `tbt-icons-css.js`).

### Docs
- Consolidated demo pages: `demo/help.html` removed; `demo/specimen.html` now uses the `tbt-app-shell` + categorized `tbt-sidebar` layout from the deleted help page (7 nav groups: Theme · Layout · Navigation · Actions · Feedback · Form · Display) + a new "Form templates" group with 4 entries. Scroll-spy highlights the active sidebar item as you scroll. Anchor IDs on every section. (Originally landed in 1.24.x but only documented here.)

---

## [1.24.3] — 2026-05-23

### Changed
- `tbt-menubar`: switched to `var(--tbt-accent-gradient)` (linear-gradient 135°, `#8B35C8` → `#59BBF6`) — the same gradient already used for the header h1 in specimen. Text/hover/active back to white-on-colored (`rgba(255,255,255,…)` + `var(--tbt-text-inverse)`). The gradient is theme-independent so the menubar looks the same in light and dark mode; only the page content around it switches.

---

## [1.24.2] — 2026-05-23

### Changed
- `tbt-menubar`: switched from dark navy (`var(--tbt-primary)`) to a light/neutral background (`var(--tbt-bg-card)`) with a 1px bottom border. Text and hover/active states now use the standard text/surface tokens (`--tbt-text-secondary`, `--tbt-text-primary`, `--tbt-bg-hover`, `--tbt-primary-bg`/`--tbt-primary-text` for active) — automatically theme-aware. `tbt-menu-item` and `tbt-menu-group` updated to match. `specimen.html`'s slotted theme toggle (`.theme-btn`) likewise switched from white-on-dark to token-based. (Superseded by 1.24.3.)

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

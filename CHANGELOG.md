# Changelog — TBT-DS

All notable changes to this project are documented here.
Format: [Semantic Versioning](https://semver.org)

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

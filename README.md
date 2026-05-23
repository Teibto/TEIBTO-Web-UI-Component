# TEIBTO Web UI Component — Teibto Design System

Lit 3 Web Components design system for Teibto ERP — built for NetSuite Suitelet custom HTML pages.

<div align="center">

[![Interactive Demo](https://img.shields.io/badge/🎮_Interactive_Demo-Purchase_Order_Page-FF6B35?style=for-the-badge)](https://kingcomen.github.io/tbt-ds/demo/demo.html)
&nbsp;&nbsp;
[![Icons & SVG](https://img.shields.io/badge/✨_Icons_%26_SVG-Gallery-10B981?style=for-the-badge)](https://kingcomen.github.io/tbt-ds/demo/icon-svg.html)
&nbsp;&nbsp;
[![Component Showcase](https://img.shields.io/badge/🚀_Component_Showcase-Specimen-0D1171?style=for-the-badge)](https://kingcomen.github.io/tbt-ds/demo/specimen.html)

</div>

---

- **38 components** — layout, navigation, forms, data display, feedback, and illustrations
- **No build step** in development — Lit 3 loads from CDN as ES modules
- **Design tokens** via `--tbt-*` CSS custom properties — automatic dark mode
- **Mobile-first** — sidebar drawer, responsive table card view, touch-friendly inputs
- **80+ ERP icon aliases** — semantic names like `save`, `approve`, `invoice`, `payment`

---

## Contents

- [Quick start](#quick-start)
- [Project structure](#project-structure)
- [Page template](#page-template)
- [Component reference](#component-reference)
- [Design tokens](#design-tokens)
- [Composition patterns](#composition-patterns)
- [NetSuite deployment](#netsuite-deployment)
- [Governance rules](#governance-rules)
- [Development](#development)

---

## Quick start

```html
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Teibto · Page Name</title>
  <link rel="stylesheet" href="/sc/SuiteScripts/Teibto/ds/v1.24.3/tbt-theme.css">
  <script type="module" src="/sc/SuiteScripts/Teibto/ds/v1.24.3/index.js"></script>
</head>
<body>
  <tbt-app-shell>
    <tbt-menubar slot="menubar" title="Teibto ERP"></tbt-menubar>
    <main slot="content">
      <tbt-section title="Hello world">
        <tbt-button variant="primary" icon="save">Save</tbt-button>
      </tbt-section>
    </main>
  </tbt-app-shell>
</body>
</html>
```

---

## Project structure

```
tbt-ds/
├── components/
│   ├── index.js                # Barrel — imports all 38 tbt-* components
│   ├── tbt-icons-css.js        # Shared Tabler CSS injector for shadow DOM
│   │
│   ├── tbt-app-shell.js        # Page wrapper (menubar + sidebar + content)
│   ├── tbt-menubar.js          # Top nav bar + hamburger (mobile ≤ 768px)
│   ├── tbt-sidebar.js          # Collapsible left sidebar + sidebar-item
│   ├── tbt-subtab.js           # In-page tab nav (legacy — see tbt-tabs for new work)
│   ├── tbt-tabs.js             # Horizontal tab switcher + tbt-tabs-panel
│   ├── tbt-breadcrumb.js       # Breadcrumb trail navigation
│   ├── tbt-pagination.js       # Standalone pagination bar
│   ├── tbt-stepper.js          # Multi-step progress indicator
│   │
│   ├── tbt-button.js           # Action button (primary / secondary / danger / ghost / accent)
│   ├── tbt-modal.js            # Dialog modal (default / confirm / danger)
│   ├── tbt-confirm.js          # Promise-based confirm() helper built on tbt-modal
│   │
│   ├── tbt-icon.js             # Tabler icon wrapper — 80+ ERP semantic aliases
│   ├── tbt-badge.js            # Status badge (6 variants)
│   ├── tbt-alert.js            # Inline alert (4 variants, dismissible)
│   ├── tbt-toast.js            # Transient toast notifications
│   ├── tbt-skeleton.js         # Shimmer placeholder for loading states
│   ├── tbt-svg.js              # SVG illustration (7 built-ins + src fetch + inline slot)
│   │
│   ├── tbt-form.js             # Form wrapper with shadow-DOM data collection
│   ├── tbt-input.js            # Text / number / email / password input
│   ├── tbt-dropdown.js         # Select dropdown
│   ├── tbt-multiselect.js      # Multi-select with chips
│   ├── tbt-datepicker.js       # Date picker with calendar popup
│   ├── tbt-date-range.js       # Dual date range picker (from/to)
│   ├── tbt-file-upload.js      # Drag-and-drop file upload zone
│   ├── tbt-search.js           # Search input with debounce
│   ├── tbt-checkbox.js         # Checkbox (with indeterminate state)
│   ├── tbt-toggle.js           # On/off toggle switch
│   │
│   ├── tbt-field.js            # Label + value display pair
│   ├── tbt-field-grid.js       # Responsive grid of tbt-field
│   ├── tbt-section.js          # Content card with optional title + actions slot
│   ├── tbt-table.js            # Data table (sort, pagination, responsive card view)
│   ├── tbt-data-table.js       # Server-side data table (fetch + loading + retry)
│   ├── tbt-summary.js          # Document totals block
│   ├── tbt-approval-flow.js    # Approval chain (horizontal / vertical)
│   ├── tbt-audit-log.js        # Activity timeline with field-level diffs
│   ├── tbt-line-items.js       # Inline-editable line items table + auto totals
│   └── tbt-lines-block.js      # Compound: section + line-items + add button + totals
│
├── theme/
│   └── tbt-theme.css           # All design tokens — single source of truth
│
├── demo/
│   ├── demo.html               # Interactive Purchase Order page (fully editable form)
│   ├── icon-svg.html           # Icon gallery + SVG illustration browser
│   └── specimen.html           # Component showcase (all 38 components)
│
├── CHANGELOG.md
└── package.json
```

---

## Page template

### Standard document page

```html
<tbt-app-shell>
  <tbt-menubar slot="menubar" logo="/assets/logo.png" title="Teibto ERP">
    <tbt-menu-item href="/dashboard" label="หน้าหลัก"></tbt-menu-item>
    <tbt-menu-group label="ขาย">
      <tbt-menu-item href="/quotation" label="ใบเสนอราคา"></tbt-menu-item>
      <tbt-menu-item href="/sales-order" label="Sales order"></tbt-menu-item>
    </tbt-menu-group>
  </tbt-menubar>

  <tbt-sidebar slot="sidebar" collapsible>
    <tbt-sidebar-item icon="dashboard" label="Dashboard" href="/dashboard"></tbt-sidebar-item>
    <tbt-sidebar-item icon="invoice"   label="Invoice"   href="/invoice" active></tbt-sidebar-item>
    <tbt-sidebar-item icon="settings"  label="Settings"  href="/settings"></tbt-sidebar-item>
  </tbt-sidebar>

  <main slot="content">

    <tbt-section title="Invoice · INV-0001">
      <tbt-field-grid columns="4">
        <tbt-field label="Document no." value="INV-0001"></tbt-field>
        <tbt-field label="Customer"     value="บริษัท ABC จำกัด"></tbt-field>
        <tbt-field label="Date"         value="22 May 2026"></tbt-field>
        <tbt-field label="Status">
          <tbt-badge variant="warning">Pending</tbt-badge>
        </tbt-field>
      </tbt-field-grid>
    </tbt-section>

    <tbt-section title="Line items">
      <tbt-button slot="actions" variant="primary" icon="add" size="sm">Add line</tbt-button>
      <tbt-table id="line-table" paginate page-size="50"></tbt-table>
    </tbt-section>

    <tbt-section>
      <tbt-summary>
        <tbt-summary-item label="Subtotal"    value="฿100,000.00"></tbt-summary-item>
        <tbt-summary-item label="VAT 7%"      value="฿7,000.00"></tbt-summary-item>
        <tbt-summary-item label="Grand total" value="฿107,000.00" highlight></tbt-summary-item>
      </tbt-summary>
    </tbt-section>

    <div style="display:flex;gap:var(--tbt-space-3);margin-top:var(--tbt-space-5)">
      <tbt-button variant="primary"   icon="save">Save</tbt-button>
      <tbt-button variant="secondary" icon="print">Print</tbt-button>
      <tbt-button variant="danger"    icon="delete">Delete</tbt-button>
    </div>

  </main>
</tbt-app-shell>

<script type="module">
  document.getElementById('line-table').columns = [
    { key: 'item',   label: 'Item',   sortable: true, mobileTitle: true },
    { key: 'qty',    label: 'Qty',    align: 'right' },
    { key: 'price',  label: 'Price',  align: 'right' },
    { key: 'amount', label: 'Amount', align: 'right', sortable: true },
  ];
  document.getElementById('line-table').rows = [/* data array */];
</script>
```

### List / search page

```html
<tbt-section title="Invoice list">
  <div slot="actions" style="display:flex;gap:var(--tbt-space-3)">
    <tbt-search id="search" placeholder="Search documents…" debounce="300"></tbt-search>
    <tbt-button variant="primary" icon="add">New</tbt-button>
  </div>
  <tbt-table id="table" paginate page-size="50" responsive></tbt-table>
</tbt-section>

<script type="module">
  document.getElementById('search').addEventListener('tbt-search', e => {
    // filter rows...
  });
</script>
```

---

## Component reference

### Layout

#### `tbt-app-shell`
Page wrapper. Provides sticky menubar, collapsible sidebar, and scrollable content area. On mobile (≤ 768px) the sidebar becomes a slide-in drawer triggered by the hamburger button.

**Slots:** `menubar` · `sidebar` · `content`

---

#### `tbt-menubar`
Top navigation bar. Automatically switches to hamburger mode on ≤ 768px.

| Prop | Type | Description |
|---|---|---|
| `logo` | String | Logo image URL |
| `title` | String | Brand name |

**Slots:** default (nav items) · `end` (right-side actions like user/notifications)  
**Events:** `tbt-menu-toggle`

Children: `tbt-menu-item`, `tbt-menu-group`

```html
<tbt-menubar title="Teibto ERP">
  <tbt-menu-item href="/dashboard" label="หน้าหลัก"></tbt-menu-item>
  <tbt-menu-group label="ขาย" icon="sales-order">
    <tbt-menu-item href="/quotation" label="ใบเสนอราคา"></tbt-menu-item>
  </tbt-menu-group>
  <div slot="end" style="display:flex;gap:8px">
    <tbt-icon name="notification" size="lg" color="secondary"></tbt-icon>
    <tbt-icon name="user"         size="lg" color="secondary"></tbt-icon>
  </div>
</tbt-menubar>
```

---

#### `tbt-sidebar` / `tbt-sidebar-item`
Collapsible left navigation panel. On mobile, hidden by default and opened as a drawer via hamburger.

| Prop | Type | Description |
|---|---|---|
| `collapsible` | Boolean | Show collapse toggle button |
| `collapsed` | Boolean | Collapsed state (icons only) |

`tbt-sidebar-item`: `icon` (ERP alias) · `label` · `href` · `active`

```html
<tbt-sidebar collapsible>
  <tbt-sidebar-item icon="home"           label="Dashboard"      href="/dash"></tbt-sidebar-item>
  <tbt-sidebar-item icon="purchase-order" label="Purchase order" href="/po" active></tbt-sidebar-item>
  <tbt-sidebar-item icon="settings"       label="Settings"       href="/settings"></tbt-sidebar-item>
</tbt-sidebar>
```

---

#### `tbt-subtab` / `tbt-tab`
In-page tab navigation. Legacy — for new work prefer [`tbt-tabs`](#tbt-tabs--tbt-tabs-panel) below (proper ARIA, focus management, keyboard nav).

```html
<tbt-subtab>
  <tbt-tab label="General info">
    <tbt-field-grid columns="4">...</tbt-field-grid>
  </tbt-tab>
  <tbt-tab label="Audit log">
    <tbt-audit-log ...></tbt-audit-log>
  </tbt-tab>
</tbt-subtab>
```

---

#### `tbt-tabs` / `tbt-tabs-panel`
Horizontal tab switcher with WAI-ARIA roles, arrow-key navigation, and focus management.

| Prop on `tbt-tabs` | Type | Description |
|---|---|---|
| `active` | Number | Active tab index (default `0`) |

**Events:** `tbt-change` → `{ active: number, label: string }`  
**Keyboard:** ArrowLeft / ArrowRight / Home / End cycle through tabs

```html
<tbt-tabs active="0">
  <tbt-tabs-panel label="General">
    <tbt-field-grid columns="4">...</tbt-field-grid>
  </tbt-tabs-panel>
  <tbt-tabs-panel label="Finance">...</tbt-tabs-panel>
  <tbt-tabs-panel label="Shipping">...</tbt-tabs-panel>
</tbt-tabs>
```

---

#### `tbt-breadcrumb`
Navigation breadcrumb. Last item is rendered as non-clickable current page.

```html
<tbt-breadcrumb .items=${[
  { label: 'Dashboard', href: '/dash' },
  { label: 'Invoices',  href: '/invoices' },
  { label: 'INV-0001' },
]}></tbt-breadcrumb>
```

---

#### `tbt-pagination`
Standalone pagination bar; ellipsis for large page counts. Used internally by `tbt-table` — exposed here for custom contexts.

| Prop | Type | Description |
|---|---|---|
| `total` | Number | Total row count |
| `page` | Number | Current page (1-based) |
| `page-size` | Number | Rows per page |

**Events:** `tbt-page-change` → `{ page: number }`

```html
<tbt-pagination total="237" page="1" page-size="20"></tbt-pagination>
```

---

#### `tbt-stepper`
Horizontal multi-step progress indicator. Active step carries `aria-current="step"`.

```html
<tbt-stepper active="1" .steps=${[
  { label: 'Draft' },
  { label: 'Review' },
  { label: 'Approve' },
  { label: 'Done' },
]}></tbt-stepper>

<!-- Error state on a step -->
<tbt-stepper active="1" .steps=${[
  { label: 'Draft' },
  { label: 'Review', error: true },
  { label: 'Done' },
]}></tbt-stepper>
```

Step shape: `{ label, description?, error? }`. Steps before `active` show a check; the active step is highlighted; remaining steps are dimmed.

---

### Actions

#### `tbt-button`

| Prop | Values | Default |
|---|---|---|
| `variant` | `primary` `secondary` `danger` `ghost` `accent` | `primary` |
| `size` | `sm` `md` `lg` | `md` |
| `icon` | ERP alias or Tabler icon name | — |
| `loading` | Boolean | — |
| `disabled` | Boolean | — |

```html
<tbt-button variant="primary"   icon="save">Save</tbt-button>
<tbt-button variant="secondary" icon="print">Print</tbt-button>
<tbt-button variant="danger"    icon="delete">Delete</tbt-button>
<tbt-button variant="ghost"     icon="external">View</tbt-button>
<tbt-button variant="accent">Gradient</tbt-button>
<tbt-button variant="primary" loading>Saving…</tbt-button>
```

---

#### `tbt-modal`

| Prop | Values | Default |
|---|---|---|
| `variant` | `default` `confirm` `danger` | `default` |
| `title` | String | — |
| `open` | Boolean | — |

**Slots:** default (body) · `footer`  
**Events:** `tbt-close`

```html
<tbt-modal id="del-modal" title="Delete document" variant="danger">
  <p>This action cannot be undone.</p>
  <div slot="footer" style="display:flex;gap:12px">
    <tbt-button variant="danger"    id="confirm-del">Delete</tbt-button>
    <tbt-button variant="secondary" id="cancel-del">Cancel</tbt-button>
  </div>
</tbt-modal>

<script type="module">
  document.getElementById('del-modal').open = true;
  document.getElementById('cancel-del').addEventListener('click', () => {
    document.getElementById('del-modal').open = false;
  });
</script>
```

---

#### `confirm()` helper
Promise-based confirmation built on `tbt-modal`. No boilerplate HTML required.

```javascript
import { confirm } from '/sc/SuiteScripts/Teibto/ds/v1.24.3/tbt-confirm.js';

const ok = await confirm({
  title: 'Delete document?',
  message: 'This action cannot be undone.',
  confirmLabel: 'Delete',
  cancelLabel: 'Cancel',
  variant: 'danger',
});
if (ok) await deleteRecord();
```

Resolves `true` on confirm, `false` on cancel / ESC / backdrop click / X button.

---

### Icons & Illustrations

#### `tbt-icon`
Tabler Icons wrapper with 80+ ERP semantic aliases. Browse all aliases interactively at **[icon-svg.html](https://kingcomen.github.io/tbt-ds/demo/icon-svg.html)**.

| Prop | Values | Default |
|---|---|---|
| `name` | ERP alias or raw Tabler name | — |
| `size` | `xs` `sm` `md` `lg` `xl` `2xl` | `md` |
| `color` | `inherit` `primary` `secondary` `muted` `success` `warning` `danger` `info` | `inherit` |
| `spin` | Boolean | — |
| `label` | String | — (decorative by default) |

**ERP alias groups:**

| Group | Examples |
|---|---|
| Document actions | `save` `print` `email` `attach` `export` `import` `download` `upload` |
| CRUD | `add` `edit` `delete` `copy` `view` `search` `filter` `refresh` `more` |
| Approval / Workflow | `approve` `reject` `submit` `cancel` `pending` `draft` `review` `sign` |
| Navigation | `back` `forward` `home` `menu` `close` `expand` `collapse` |
| User & Auth | `user` `users` `logout` `settings` `profile` `role` `permission` |
| Document types | `invoice` `receipt` `quotation` `purchase-order` `sales-order` `payment` `report` |
| Finance | `money` `bank` `tax` `discount` `price` `total` |
| Inventory | `product` `warehouse` `stock` `barcode` |
| Communication | `comment` `note` `notification` `alert` `info` `warning` `success` `error` |
| Time | `calendar` `date` `time` `history` `schedule` `deadline` |
| People & Org | `company` `branch` `employee` `department` |
| Misc | `chart` `dashboard` `loader` `check` `star` `tag` `category` |

```html
<!-- Semantic ERP aliases (recommended) -->
<tbt-icon name="save"    size="lg" color="primary"></tbt-icon>
<tbt-icon name="approve" size="lg" color="success"></tbt-icon>
<tbt-icon name="reject"  size="lg" color="danger"></tbt-icon>
<tbt-icon name="loader"  size="lg" color="primary" spin></tbt-icon>
<tbt-icon name="invoice" size="xl"></tbt-icon>

<!-- Raw Tabler name also works -->
<tbt-icon name="device-floppy"></tbt-icon>

<!-- Accessible (meaningful icon) -->
<tbt-icon name="user" label="User profile" size="lg"></tbt-icon>
```

Size reference: `xs`=11px · `sm`=14px · `md`=16px · `lg`=20px · `xl`=28px · `2xl`=36px

---

#### `tbt-svg`
SVG illustration component for empty states, success/error pages, and decorative graphics.

| Prop | Type | Description |
|---|---|---|
| `name` | String | Built-in illustration name |
| `src` | String | External SVG URL (fetched + sanitized) |
| `size` | Number | Width and height in px (default 80) |
| `width` / `height` | Number | Independent dimension overrides |
| `label` | String | Accessible label (`role="img"`); omit for decorative |

Built-in names: `empty` · `search` · `success` · `error` · `warning` · `draft` · `no-access`

```html
<!-- Built-in illustrations -->
<tbt-svg name="empty"   size="100"></tbt-svg>
<tbt-svg name="success" size="80"></tbt-svg>
<tbt-svg name="error"   size="80"></tbt-svg>

<!-- External SVG -->
<tbt-svg src="/assets/illustration.svg" size="120"></tbt-svg>

<!-- Inline SVG via slot -->
<tbt-svg label="Custom icon" size="64">
  <svg viewBox="0 0 24 24">...</svg>
</tbt-svg>
```

---

### Feedback

#### `tbt-badge`

| `variant` | Color |
|---|---|
| `success` | Green |
| `warning` | Amber |
| `danger` | Red |
| `info` | Blue |
| `primary` | Navy |
| `neutral` | Grey |

```html
<tbt-badge variant="success">Approved</tbt-badge>
<tbt-badge variant="warning">Pending approval</tbt-badge>
<tbt-badge variant="danger">Rejected</tbt-badge>
<tbt-badge variant="info">In review</tbt-badge>
```

---

#### `tbt-alert`

```html
<tbt-alert variant="success" dismissible>Document saved successfully.</tbt-alert>
<tbt-alert variant="warning" dismissible>Document has unsaved changes.</tbt-alert>
<tbt-alert variant="danger"  dismissible>Save failed — please try again.</tbt-alert>
<tbt-alert variant="info">This document is awaiting approval.</tbt-alert>
```

---

#### `tbt-toast`
Transient notification — slides in, auto-dismisses, stacks if multiple. Trigger via the static `show()` helper from any script.

```javascript
import { showToast } from '/sc/SuiteScripts/Teibto/ds/v1.24.3/tbt-toast.js';

showToast({ variant: 'success', message: 'Saved.',          duration: 3000 });
showToast({ variant: 'danger',  message: 'Network error.',  duration: 5000 });
```

Variants: `success` · `warning` · `danger` · `info`. Multiple toasts stack in the corner.

---

#### `tbt-skeleton`
Animated shimmer placeholder for loading states.

```html
<tbt-skeleton variant="text" lines="3"></tbt-skeleton>
<tbt-skeleton variant="block" style="width:200px;height:120px"></tbt-skeleton>
<tbt-skeleton variant="circle" style="width:48px;height:48px"></tbt-skeleton>
<tbt-skeleton variant="card"></tbt-skeleton>
```

Variants: `text` (with `lines` prop) · `block` · `circle` · `card` (avatar + title + lines).

---

### Form inputs

All form inputs share: `label` · `name` · `required` · `disabled` · `readonly` · `error` · `helper`

Use `tbt-form` to collect values from shadow DOM inputs automatically.

#### `tbt-form`
Fires `tbt-submit` with `{ data: { fieldName: value } }` when a `tbt-button[type="submit"]` is clicked.

```html
<tbt-form id="my-form">
  <tbt-input    label="Vendor"  name="vendor"  required></tbt-input>
  <tbt-dropdown label="Status"  name="status"
    .options=${[{value:'A',label:'Approved'},{value:'P',label:'Pending'}]}>
  </tbt-dropdown>
  <tbt-button type="submit" variant="primary">Save</tbt-button>
</tbt-form>

<script type="module">
  document.getElementById('my-form')
    .addEventListener('tbt-submit', e => console.log(e.detail.data));
</script>
```

---

#### `tbt-input`

```html
<tbt-input label="Document no."  name="tranid" value="PO-0001" readonly></tbt-input>
<tbt-input label="Amount"        name="amount" type="number" required></tbt-input>
<tbt-input label="Email"         name="email"  type="email" error="Invalid format"></tbt-input>
<tbt-input label="Password"      name="pass"   type="password"></tbt-input>
```

---

#### `tbt-dropdown`

Options are set as a JavaScript property (Array of `{ value, label }`).

```html
<tbt-dropdown id="dd-vendor" label="Vendor" name="vendor" required></tbt-dropdown>

<script type="module">
  const dd = document.getElementById('dd-vendor');
  dd.options = [
    { value: 'V001', label: 'บจก. ABC จำกัด' },
    { value: 'V002', label: 'บจก. XYZ จำกัด' },
  ];
  dd.value = 'V001';
  dd.addEventListener('tbt-change', e => console.log(e.detail.value));
</script>
```

---

#### `tbt-multiselect`

```html
<tbt-multiselect id="dd-tags" label="Tags" name="tags"></tbt-multiselect>

<script type="module">
  const ms = document.getElementById('dd-tags');
  ms.options = [{ value:'1', label:'Urgent' }, { value:'2', label:'Recurring' }];
  ms.value   = ['1'];
  ms.addEventListener('tbt-change', e => console.log(e.detail.values));
</script>
```

---

#### `tbt-datepicker`

```html
<tbt-datepicker label="Document date" name="date"    value="2026-05-22" required></tbt-datepicker>
<tbt-datepicker label="Due date"      name="duedate" value="2026-06-22"></tbt-datepicker>
```

Event: `tbt-change` → `e.detail.value` (ISO date string `YYYY-MM-DD`)

---

#### `tbt-date-range`
Dual date range picker (from/to) — form-associated. When `name-from`/`name-to` are set, submits a `FormData` with both fields. `required` participates in constraint validation (`valueMissing`).

```html
<tbt-date-range
  label="Reporting period"
  name-from="period_from"
  name-to="period_to"
  from="2026-01-01"
  to="2026-12-31"
  required></tbt-date-range>
```

Event: `tbt-change` → `{ from, to }` (each ISO `YYYY-MM-DD` or `''` if empty)

---

#### `tbt-file-upload`
Drag-and-drop file upload zone with per-file size validation. Form-associated — when `name` is set, submits one `FormData` entry per file under that name.

| Prop | Type | Description |
|---|---|---|
| `name` | String | Field name in `FormData` |
| `accept` | String | Accepted MIME types / extensions (e.g. `.pdf,.jpg`) |
| `multiple` | Boolean | Allow multiple files |
| `max-size` | Number | Per-file size limit in bytes |
| `required` | Boolean | Wires `valueMissing` constraint |

**Event:** `tbt-change` → `{ files: File[] }`  
**Property:** `files` (getter) — current `File[]` snapshot

```html
<tbt-file-upload
  label="Attachments"
  name="receipts"
  multiple
  accept=".pdf,.jpg,.png,.xlsx"
  max-size="5242880"></tbt-file-upload>
```

---

#### `tbt-search`

```html
<tbt-search placeholder="Search documents…" debounce="300"></tbt-search>
```

Event: `tbt-search` → `e.detail.value`

---

#### `tbt-checkbox` / `tbt-toggle`

```html
<tbt-checkbox name="active"  label="Active"              checked></tbt-checkbox>
<tbt-checkbox name="notify"  label="Send notification"   indeterminate></tbt-checkbox>

<tbt-toggle name="autopay" label="Auto-pay"
  label-on="Enabled" label-off="Disabled"></tbt-toggle>
```

Both expose a `value` (Boolean) property and fire `tbt-change`.

---

### Display

#### `tbt-field` / `tbt-field-grid`
Read-only label + value pairs. Use for view mode; switch to `tbt-input`/`tbt-dropdown` for edit mode.

```html
<tbt-field-grid columns="4">
  <tbt-field label="Document no." value="PO-0001"></tbt-field>
  <tbt-field label="Vendor"       value="บจก. ABC จำกัด"></tbt-field>
  <tbt-field label="Date"         value="22 May 2026"></tbt-field>
  <tbt-field label="Status">
    <tbt-badge variant="success">Approved</tbt-badge>
  </tbt-field>
</tbt-field-grid>
```

`columns`: 1–6, default 2 — collapses to 1 on mobile automatically.

---

#### `tbt-section`

```html
<!-- Simple card -->
<tbt-section title="Document info">
  <tbt-field-grid columns="4">...</tbt-field-grid>
</tbt-section>

<!-- With action button in top-right -->
<tbt-section title="Line items">
  <tbt-button slot="actions" variant="primary" icon="add" size="sm">Add line</tbt-button>
  <tbt-table ...></tbt-table>
</tbt-section>

<!-- No title (plain card) -->
<tbt-section>
  <tbt-summary>...</tbt-summary>
</tbt-section>
```

---

#### `tbt-table`

| Prop | Type | Description |
|---|---|---|
| `columns` | Array | Column definitions |
| `rows` | Array | Data rows |
| `paginate` | Boolean | Enable pagination |
| `page-size` | Number | Rows per page (default 20) |
| `loading` | Boolean | Skeleton state |
| `responsive` | Boolean | Card view on narrow containers |
| `max-height` | String | Scrollable height e.g. `400px` |

Column definition:

```javascript
{
  key:         'amount',
  label:       'Amount',
  sortable:    true,
  align:       'right',                 // left | center | right
  html:        true,                    // render value as raw HTML string
  href:        row => `/inv/${row.id}`, // render as <a> link
  mobileTitle: true,                    // card header in responsive mode
  resizable:   false,                   // disable column drag-resize
}
```

---

#### `tbt-data-table`
Server-side data table — wraps `tbt-table` and adds a `fetch` callback for server-side paging, sorting, and loading states. Plug into any RESTlet or SuiteQL endpoint.

| Prop | Type | Description |
|---|---|---|
| `fetch` | Function | `async ({ page, pageSize, sort, order }) => ({ rows, total })` |
| `columns` | Array | Column definitions (same shape as `tbt-table`) |
| `page-size` | Number | Rows per page |

**Methods:** `refresh()` — re-fetches current page (call after create/update/delete)  
**Events:** `tbt-load-error` on fetch failure (Retry button shown via `tbt-alert`)

```html
<tbt-data-table id="inv-table" page-size="50"></tbt-data-table>

<script type="module">
  const table = document.getElementById('inv-table');
  table.columns = [
    { key: 'tranid',  label: 'No.',    sortable: true },
    { key: 'vendor',  label: 'Vendor' },
    { key: 'amount',  label: 'Amount', align: 'right', sortable: true },
  ];
  table.fetch = async ({ page, pageSize, sort, order }) => {
    const r = await fetch(`/restlet?page=${page}&size=${pageSize}&sort=${sort}&order=${order}`);
    return r.json();  // { rows: [...], total: 237 }
  };
</script>
```

---

#### `tbt-summary`

```html
<tbt-summary>
  <tbt-summary-item label="Subtotal"    value="฿100,000.00"></tbt-summary-item>
  <tbt-summary-item label="Discount 5%" value="−฿5,000.00"></tbt-summary-item>
  <tbt-summary-item label="VAT 7%"      value="฿6,650.00"></tbt-summary-item>
  <tbt-summary-item label="Grand total" value="฿101,650.00" highlight></tbt-summary-item>
</tbt-summary>
```

Dynamic update: `document.getElementById('tot').value = '฿120,000.00'`

---

#### `tbt-approval-flow`

```html
<tbt-approval-flow orientation="horizontal" id="flow"></tbt-approval-flow>

<script type="module">
  document.getElementById('flow').steps = [
    { id:'1', label:'Request',  approver:'Wichit',  status:'approved',
      timestamp:'2026-05-20T09:00:00Z', comment:'Verified budget' },
    { id:'2', label:'Manager',  approver:'Somchai',  status:'current' },
    { id:'3', label:'Director', approver:'Apinya',   status:'pending' },
  ];
</script>
```

`orientation`: `horizontal` (compact row) · `vertical` (detailed with comments)  
Step `status`: `pending` · `current` · `approved` · `rejected` · `skipped`

---

#### `tbt-audit-log`

```html
<tbt-audit-log id="log" max-height="400px"></tbt-audit-log>

<script type="module">
  document.getElementById('log').entries = [
    { id:'3', timestamp:'2026-05-22T10:00:00Z', user:'Somchai', action:'approved',
      label:'Document approved' },
    { id:'2', timestamp:'2026-05-22T09:00:00Z', user:'Wichit',  action:'updated',
      label:'Amount updated',
      changes:[{ field:'Grand total', from:'฿98,000', to:'฿107,000' }] },
    { id:'1', timestamp:'2026-05-22T08:00:00Z', user:'Wichit',  action:'created',
      label:'Document created' },
  ];
</script>
```

Props: `compact` (Boolean) · `max-height` (String)  
Action types: `created` `updated` `approved` `rejected` `submitted` `cancelled` `deleted` `printed` `emailed` `attached` `viewed`

---

#### `tbt-line-items`

Self-contained inline-editable line items table with automatic totals. Combines the table, inline inputs, and subtotal/VAT/grand total summary into one component.

| Prop | Type | Default | Description |
|---|---|---|---|
| `rows` | Array (get/set) | `[]` | Row objects `{ id?, item, desc, qty, unit, price, account }` |
| `unitOptions` | Array | Pcs/Box/Set/Roll | `[{ value, label }]` for Unit column |
| `accountOptions` | Array | `[]` | `[{ value, label }]` for Account column |
| `currency` | String | `฿` | Currency prefix |
| `vat-rate` | Number | `0.07` | VAT rate 0–1 |
| `show-summary` | Boolean | `true` | Show subtotal/VAT/grand total below table |
| `readonly` | Boolean | `false` | View-only mode — plain text, no editing |
| `loading` | Boolean | `false` | Skeleton placeholder state |

Methods: `addRow()` · `getTotal()` → `{ subtotal, vat, total }`  
Event: `tbt-change` → `{ rows, subtotal, vat, total }` — fires on every edit, add, or delete

```html
<tbt-section title="Line items">
  <tbt-button slot="actions" variant="primary" icon="add" size="sm" id="add-btn">Add line</tbt-button>
  <tbt-line-items id="li" currency="฿" vat-rate="0.07"></tbt-line-items>
</tbt-section>

<script type="module">
  const li = document.getElementById('li');
  li.accountOptions = [
    { value:'5100', label:'5100 - Office supplies' },
    { value:'5200', label:'5200 - IT equipment' },
  ];
  li.rows = [
    { item:'Laptop', desc:'Dell 14" i7', qty:5, unit:'Pcs', price:35000, account:'5200' },
  ];
  document.getElementById('add-btn').addEventListener('click', () => li.addRow());
  li.addEventListener('tbt-change', e => {
    console.log(e.detail.rows, e.detail.total);
  });
</script>
```

---

#### `tbt-lines-block`
Compound component — wraps `tbt-section` + `tbt-line-items` + Add button + totals in a single tag. Use this instead of composing the three by hand. Table fits content up to `max-height`, then scrolls.

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | String | — | Section title |
| `add-label` | String | `Add line` | Add-button label |
| `currency` | String | `฿` | Currency prefix |
| `vat-rate` | Number | `0.07` | VAT rate |
| `show-summary` | Boolean | `true` | Show subtotal/VAT/total below |
| `max-height` | String | `320px` | Max-height of scrollable table area |
| `disabled` | Boolean | — | Disable Add button |

`rows` (get/set) and `getTotal()` delegate to the inner `tbt-line-items`. Forwards `tbt-change` with the same `{ rows, subtotal, vat, total }` payload.

```html
<tbt-lines-block id="lb" title="Line items" currency="฿" vat-rate="0.07" max-height="320px">
</tbt-lines-block>

<script type="module">
  document.getElementById('lb').rows = window.__DATA__.lines;
</script>
```

---

## Design tokens

All tokens live in `theme/tbt-theme.css`. Components use only `var(--tbt-*)` — never hardcode values.

### Brand

```css
--tbt-primary:         #0D1171   /* Navy blue */
--tbt-primary-light:   #1E2B99
--tbt-primary-bg:      #EEF0FF
--tbt-accent-gradient: linear-gradient(135deg, #8B35C8, #59BBF6)
```

### Semantic colors

```css
--tbt-success: #10B981    --tbt-success-bg: #ECFDF5    --tbt-success-text: #065F46
--tbt-warning: #F59E0B    --tbt-warning-bg: #FEF3C7    --tbt-warning-text: #92400E
--tbt-danger:  #EF4444    --tbt-danger-bg:  #FEE2E2    --tbt-danger-text:  #991B1B
--tbt-info:    #3B82F6    --tbt-info-bg:    #DBEAFE    --tbt-info-text:    #1E40AF
```

### Surface & text

```css
--tbt-bg-page:          #F5F7FA
--tbt-bg-card:          #FFFFFF
--tbt-bg-hover:         #F0F2FF
--tbt-bg-active:        #E2E6FF
--tbt-border:           #E2E8F0
--tbt-border-strong:    #CBD5E1
--tbt-text-primary:     #0F172A
--tbt-text-secondary:   #64748B
--tbt-text-muted:       #94A3B8
```

### Spacing (4 px scale)

```css
--tbt-space-1: 4px    --tbt-space-2: 8px    --tbt-space-3: 12px
--tbt-space-4: 16px   --tbt-space-5: 20px   --tbt-space-6: 24px
--tbt-space-8: 32px   --tbt-space-10: 40px  --tbt-space-12: 48px
```

### Typography

```css
--tbt-font:      'Inter', 'IBM Plex Sans Thai', system-ui, sans-serif
--tbt-font-mono: 'JetBrains Mono', 'Courier New', monospace

--tbt-size-xs: 11px   --tbt-size-sm: 12px    --tbt-size-base: 14px
--tbt-size-md: 16px   --tbt-size-lg: 20px    --tbt-size-xl:   28px   --tbt-size-2xl: 36px

--tbt-weight-normal: 400   --tbt-weight-medium: 500
--tbt-weight-semibold: 600 --tbt-weight-bold: 700
```

### Radius & shadow

```css
--tbt-radius-sm: 6px    --tbt-radius-md: 8px
--tbt-radius-lg: 12px   --tbt-radius-pill: 9999px

--tbt-shadow-sm:    0 1px 2px rgb(13 17 113 / 0.06)
--tbt-shadow-md:    0 4px 12px rgb(13 17 113 / 0.08)
--tbt-shadow-focus: 0 0 0 3px rgb(139 53 200 / 0.20)
```

---

## Composition patterns

### Pass data: Suitelet → page

```javascript
// sl_po.js (server-side)
const data = { tranId: 'PO-0001', vendor: 'บจก. ABC', lines: [...] };
context.response.write(
  template.replace('</body>',
    `<script>window.__DATA__ = ${JSON.stringify(data)};</script></body>`)
);
```

```javascript
// Page script (client-side)
const data = window.__DATA__;
document.querySelector('tbt-table').rows = data.lines;
document.getElementById('dd-vendor').value = data.vendor;
```

### Send data to server (RESTlet)

```javascript
async function save(payload) {
  const res = await fetch('/app/site/hosting/restlet.nl?script=xxx&deploy=1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}
```

### Empty state with illustration

```html
<div style="text-align:center;padding:var(--tbt-space-12)">
  <tbt-svg name="empty" size="100"></tbt-svg>
  <div style="margin-top:var(--tbt-space-3);font-family:var(--tbt-font)">
    <div style="font-weight:var(--tbt-weight-medium);color:var(--tbt-text-primary)">
      No documents yet
    </div>
    <div style="font-size:var(--tbt-size-sm);color:var(--tbt-text-secondary);margin-top:4px">
      Create your first document to get started.
    </div>
  </div>
  <div style="margin-top:var(--tbt-space-4)">
    <tbt-button variant="primary" icon="add">New document</tbt-button>
  </div>
</div>
```

### Inline editable table (line items)

Use `tbt-line-items` for the standard ERP document line items pattern — no custom table code needed. See `demo/demo.html` for a full working example.

```html
<tbt-section title="Line items">
  <tbt-button slot="actions" variant="primary" icon="add" size="sm" id="add-btn">Add line</tbt-button>
  <tbt-line-items id="li" currency="฿" vat-rate="0.07"></tbt-line-items>
</tbt-section>

<script type="module">
  const li = document.getElementById('li');
  li.accountOptions = ACCOUNTS;  // [{ value, label }]
  li.rows = window.__DATA__.lines;
  document.getElementById('add-btn').addEventListener('click', () => li.addRow());

  // Read totals on every change
  li.addEventListener('tbt-change', e => {
    console.log(e.detail.rows, e.detail.total);
  });

  // Read current state on save
  async function save() {
    const { rows } = li;  // getter returns snapshot
    const { total } = li.getTotal();
    await postToRESTlet({ lines: rows, total });
  }
</script>
```

---

## NetSuite deployment

### File Cabinet structure

```
/SuiteScripts/Teibto/ds/v1.24.3/
  tbt-theme.css
  index.js
  tbt-icons-css.js
  tbt-*.js              (one file per component)

/SuiteScripts/Teibto/{module}/
  sl_{module}_{action}.js     ← Suitelet script
  sl_{module}_{action}.html   ← HTML template (served from File Cabinet)

/SuiteScripts/Teibto/assets/
  teibtologo.png
```

### Standard page `<head>`

```html
<link rel="stylesheet" href="/sc/SuiteScripts/Teibto/ds/v1.24.3/tbt-theme.css">
<script type="module"  src="/sc/SuiteScripts/Teibto/ds/v1.24.3/index.js"></script>
```

> Always pin to an exact version. Never use `/latest/`.

### Upload with SuiteCloud CLI

```bash
cd tbt-ds/tbt-ds               # SDF project folder
suitecloud account:setup        # first-time auth (opens browser)
suitecloud file:upload --paths "/SuiteScripts/Teibto/ds/v1.24.3/*"
```

---

## Governance rules

| Rule | Reason |
|---|---|
| No hex colors in `components/**/*.js` | Tokens enable dark mode and consistent theming |
| No `<style>` blocks on consumer pages | Styles belong inside components |
| No visual `style="..."` attributes | Use `var(--tbt-*)` token overrides instead |
| No raw HTML primitives when `tbt-*` exists | Consistency, accessibility, and shadow DOM isolation |
| Sentence case for all UI labels | "Document info" not "Document Info" |
| Code in English; comments may be Thai | Searchable codebase |
| Version-pin all File Cabinet paths | Prevents live pages from breaking on DS updates |

---

## Development

```bash
cd tbt-ds
npm run serve   # Dev server → http://localhost:8080
```

Demo pages:

| Page | URL | Purpose |
|---|---|---|
| Interactive demo | `/demo/demo.html` | Full Purchase Order page — editable form, inline line items, approval flow |
| Icons & SVG | `/demo/icon-svg.html` | All 80+ icon aliases + SVG illustrations with live search and copy |
| Component showcase | `/demo/specimen.html` | All 38 components in one page |

No build step needed in development — components import Lit 3 from CDN.

For production:
```bash
npm run build   # Bundles to tbt-ds.min.js for File Cabinet upload
```

---

## Versioning

| Change type | Bump |
|---|---|
| Bug fix, style tweak | PATCH `1.x.y` |
| New component, new prop | MINOR `1.x.0` |
| Removed/renamed prop, breaking change | MAJOR `x.0.0` + migration guide |

Update `package.json`, `CHANGELOG.md`, and File Cabinet path on every version bump.

---

**Author:** Wichit Wongta — Teibto Co., Ltd.

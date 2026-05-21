# TBT-DS — Teibto Design System

Lit 3 Web Components design system for Teibto ERP — built for NetSuite Suitelet custom HTML pages.

<div align="center">

[![Interactive Demo](https://img.shields.io/badge/🎮_Interactive_Demo-Purchase_Order_Page-FF6B35?style=for-the-badge)](https://kingcomen.github.io/tbt-ds/demo/demo.html)
&nbsp;&nbsp;
[![Live Demo](https://img.shields.io/badge/🚀_Component_Showcase-Specimen-0D1171?style=for-the-badge)](https://kingcomen.github.io/tbt-ds/demo/specimen.html)
&nbsp;&nbsp;
[![API Reference](https://img.shields.io/badge/📖_API_Reference-Component_Docs-8B35C8?style=for-the-badge)](https://kingcomen.github.io/tbt-ds/demo/help.html)

</div>

---

- **27 components** covering layout, navigation, forms, data display, and feedback
- **No build step** in development — Lit loads from CDN as ES modules
- **Design tokens** via CSS custom properties (`--tbt-*`) — full dark mode support
- **Mobile-first** — sidebar drawer, responsive table card view, touch-friendly inputs

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
  <link rel="stylesheet" href="/sc/SuiteScripts/Teibto/ds/v1.17.0/tbt-theme.css">
  <script type="module" src="/sc/SuiteScripts/Teibto/ds/v1.17.0/index.js"></script>
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
│   ├── index.js                # Barrel — imports all tbt-* components
│   ├── tbt-icons-css.js        # Shared Tabler CSS injector for shadow DOM
│   │
│   ├── tbt-app-shell.js        # Page wrapper (menubar + sidebar + content)
│   ├── tbt-menubar.js          # Top navigation bar + hamburger (mobile)
│   ├── tbt-sidebar.js          # Collapsible left sidebar + sidebar-item
│   ├── tbt-subtab.js           # Tab navigation + tab panel
│   │
│   ├── tbt-button.js           # Action button (5 variants)
│   ├── tbt-modal.js            # Dialog modal (default / confirm / danger)
│   │
│   ├── tbt-icon.js             # Tabler icon wrapper (80+ ERP aliases)
│   ├── tbt-badge.js            # Status badge (6 variants)
│   ├── tbt-alert.js            # Inline alert (4 variants, dismissible)
│   │
│   ├── tbt-form.js             # Form wrapper with shadow-DOM data collection
│   ├── tbt-input.js            # Text / number / email input
│   ├── tbt-dropdown.js         # Select dropdown
│   ├── tbt-multiselect.js      # Multi-select with chips
│   ├── tbt-datepicker.js       # Date picker with calendar popup
│   ├── tbt-search.js           # Search input with debounce
│   ├── tbt-checkbox.js         # Checkbox (with indeterminate state)
│   ├── tbt-toggle.js           # On/off toggle switch
│   │
│   ├── tbt-field.js            # Label + value display pair
│   ├── tbt-field-grid.js       # Responsive grid of tbt-field
│   ├── tbt-section.js          # Content card with optional title + actions slot
│   ├── tbt-table.js            # Data table (sort, pagination, responsive card view)
│   ├── tbt-summary.js          # Document totals block (subtotal / VAT / grand total)
│   ├── tbt-approval-flow.js    # Approval chain (horizontal / vertical)
│   ├── tbt-audit-log.js        # Activity timeline
│   └── tbt-svg.js              # SVG illustration (7 built-ins + src fetch + slot)
│
├── theme/
│   └── tbt-theme.css           # ALL design tokens — the only source of truth for colors/spacing
│
├── demo/
│   ├── specimen.html           # Interactive component showcase
│   └── help.html               # Component API reference
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

    <!-- Header section -->
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

    <!-- Line items -->
    <tbt-section title="Line items">
      <tbt-table
        .columns=${[
          { key: 'item',   label: 'Item',   sortable: true },
          { key: 'qty',    label: 'Qty',    align: 'right' },
          { key: 'price',  label: 'Price',  align: 'right' },
          { key: 'amount', label: 'Amount', align: 'right' }
        ]}
        .rows=${lines}
        paginate
        page-size="50">
      </tbt-table>
    </tbt-section>

    <!-- Totals -->
    <tbt-section>
      <tbt-summary subtotal="100000" vat="7000"></tbt-summary>
    </tbt-section>

    <!-- Footer actions -->
    <footer style="display:flex;gap:var(--tbt-space-3);margin-top:var(--tbt-space-5)">
      <tbt-button variant="primary"    icon="save">Save</tbt-button>
      <tbt-button variant="secondary"  icon="print">Print</tbt-button>
      <tbt-button variant="secondary">Cancel</tbt-button>
    </footer>

  </main>
</tbt-app-shell>
```

### List / search page

```html
<tbt-section title="Invoice list">
  <div slot="actions" style="display:flex;gap:var(--tbt-space-3)">
    <tbt-search placeholder="Search..." @tbt-search=${e => search(e.detail.value)}></tbt-search>
    <tbt-button variant="primary" icon="add">New</tbt-button>
  </div>
  <tbt-table .columns=${cols} .rows=${rows} paginate page-size="50"></tbt-table>
</tbt-section>
```

---

## Component reference

### Layout

#### `tbt-app-shell`
Page wrapper. Provides sticky menubar, optional collapsible sidebar, and scrollable content area. On mobile (≤ 768px) the sidebar becomes a slide-in drawer.

| Attribute | Type | Default | Description |
|---|---|---|---|
| `no-sidebar` | Boolean | — | Hides the sidebar slot entirely |

**Slots:** `menubar` · `sidebar` · `content`

---

#### `tbt-menubar`
Top navigation bar. Switches to hamburger mode on ≤ 768px.

| Attribute | Type | Description |
|---|---|---|
| `logo` | String | Logo image URL |
| `title` | String | Brand title text |

**Slots:** default (nav items) · `end` (right-side actions)
**Events:** `tbt-menu-toggle` — fired when hamburger is clicked

Children: `tbt-menu-item`, `tbt-menu-group`

```html
<tbt-menubar logo="/assets/logo.png" title="Teibto ERP">
  <tbt-menu-item href="/dashboard" label="หน้าหลัก" active></tbt-menu-item>
  <tbt-menu-group label="ขาย" icon="shopping-bag">
    <tbt-menu-item href="/quotation" label="ใบเสนอราคา"></tbt-menu-item>
  </tbt-menu-group>
  <tbt-button slot="end" variant="ghost" icon="logout">Logout</tbt-button>
</tbt-menubar>
```

---

#### `tbt-sidebar` / `tbt-sidebar-item`
Collapsible left navigation panel.

| Attribute | Type | Description |
|---|---|---|
| `collapsible` | Boolean | Show collapse toggle button |
| `collapsed` | Boolean | Collapsed state (icon-only) |

`tbt-sidebar-item` props: `icon` · `label` · `href` · `active`

```html
<tbt-sidebar collapsible>
  <tbt-sidebar-item icon="home"    label="Dashboard" href="/dashboard"></tbt-sidebar-item>
  <tbt-sidebar-item icon="invoice" label="Invoice"   href="/invoice" active></tbt-sidebar-item>
</tbt-sidebar>
```

---

#### `tbt-subtab` / `tbt-tab`
Tab navigation within a page.

```html
<tbt-subtab>
  <tbt-tab label="General info" active>
    <tbt-field-grid columns="3">...</tbt-field-grid>
  </tbt-tab>
  <tbt-tab label="Line items">
    <tbt-table ...></tbt-table>
  </tbt-tab>
</tbt-subtab>
```

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
<tbt-button variant="danger"    icon="delete">Delete</tbt-button>
<tbt-button variant="secondary" icon="print">Print</tbt-button>
<tbt-button variant="ghost"     icon="external">View</tbt-button>
<tbt-button variant="accent">Accent gradient</tbt-button>
<tbt-button variant="primary" loading>Saving…</tbt-button>
```

---

#### `tbt-modal`

| Prop | Values | Default |
|---|---|---|
| `variant` | `default` `confirm` `danger` | `default` |
| `title` | String | — |
| `open` | Boolean (reflect) | — |

**Slots:** default (body) · `footer`
**Events:** `tbt-close`

```html
<tbt-modal title="Confirm delete" variant="danger" id="del-modal">
  <p>This action cannot be undone.</p>
  <div slot="footer">
    <tbt-button variant="danger"    @click=${confirm}>Delete</tbt-button>
    <tbt-button variant="secondary" @click=${close}>Cancel</tbt-button>
  </div>
</tbt-modal>

<script>
  document.getElementById('del-modal').open = true;
</script>
```

---

### Feedback

#### `tbt-icon`
Tabler icon wrapper with 80+ ERP semantic aliases.

| Prop | Values | Default |
|---|---|---|
| `name` | ERP alias or raw Tabler name | — |
| `size` | `xs` `sm` `md` `lg` `xl` `2xl` | `md` |
| `color` | `inherit` `primary` `secondary` `muted` `success` `warning` `danger` `info` | `inherit` |
| `spin` | Boolean | — |
| `label` | String | — (decorative) |

**Common ERP aliases:**

| Alias | Icon | Alias | Icon |
|---|---|---|---|
| `save` | device-floppy | `approve` | circle-check |
| `edit` | pencil | `reject` | circle-x |
| `delete` | trash | `submit` | send |
| `add` | plus | `cancel` | ban |
| `print` | printer | `pending` | clock |
| `email` | mail | `draft` | file-text |
| `invoice` | file-invoice | `payment` | credit-card |
| `search` | search | `filter` | filter |
| `history` | history | `loader` | loader-2 (+ spin) |

```html
<tbt-icon name="save" size="lg" color="primary"></tbt-icon>
<tbt-icon name="approve" color="success"></tbt-icon>
<tbt-icon name="loader" spin color="primary"></tbt-icon>
<!-- Raw Tabler name also works -->
<tbt-icon name="device-floppy"></tbt-icon>
```

---

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
<tbt-badge variant="warning">Pending</tbt-badge>
<tbt-badge variant="danger">Rejected</tbt-badge>
```

---

#### `tbt-alert`

| `variant` | `dismissible` |
|---|---|
| `success` `warning` `danger` `info` | Boolean |

```html
<tbt-alert variant="warning" dismissible>
  Document has unsaved changes.
</tbt-alert>
```

---

### Form inputs

All form inputs support: `label` · `name` · `required` · `disabled` · `error` · `helper`

Use `tbt-form` to wrap inputs and collect values from shadow DOM automatically.

#### `tbt-form`
Wraps form inputs. Fires `tbt-submit` with `{ data: { fieldName: value } }`.

```html
<tbt-form id="my-form">
  <tbt-input    label="Document no." name="tranid" required></tbt-input>
  <tbt-dropdown label="Status"       name="status"
    .options=${[{value:'A',label:'Approved'},{value:'P',label:'Pending'}]}>
  </tbt-dropdown>
  <tbt-button type="submit" variant="primary">Save</tbt-button>
</tbt-form>

<script>
  document.getElementById('my-form')
    .addEventListener('tbt-submit', e => console.log(e.detail.data));
</script>
```

---

#### `tbt-input`

```html
<tbt-input label="Amount" name="amount" type="number" required></tbt-input>
<tbt-input label="Email"  name="email"  type="email" error="Invalid format"></tbt-input>
```

---

#### `tbt-dropdown`

```html
<tbt-dropdown
  label="Subsidiary"
  name="subsidiary"
  .options=${[{value:'1',label:'Teibto HQ'},{value:'2',label:'Teibto Branch'}]}
  @tbt-change=${e => console.log(e.detail.value)}>
</tbt-dropdown>
```

---

#### `tbt-multiselect`

```html
<tbt-multiselect
  label="Tags"
  name="tags"
  .options=${opts}
  .value=${['1','2']}
  @tbt-change=${e => console.log(e.detail.values)}>
</tbt-multiselect>
```

---

#### `tbt-datepicker`

```html
<tbt-datepicker
  label="Due date"
  name="duedate"
  value="2026-05-22"
  @tbt-change=${e => console.log(e.detail.value)}>
</tbt-datepicker>
```

---

#### `tbt-search`

```html
<tbt-search
  placeholder="Search documents..."
  debounce="300"
  @tbt-search=${e => search(e.detail.value)}>
</tbt-search>
```

---

#### `tbt-checkbox` / `tbt-toggle`

```html
<tbt-checkbox name="active" label="Active" checked></tbt-checkbox>
<tbt-checkbox name="notify" label="Send notification" indeterminate></tbt-checkbox>

<tbt-toggle name="autopay" label="Auto-pay" label-on="On" label-off="Off"></tbt-toggle>
```

---

### Display

#### `tbt-field` / `tbt-field-grid`

```html
<tbt-field-grid columns="3">
  <tbt-field label="Document no." value="INV-0001"></tbt-field>
  <tbt-field label="Customer"     value="บริษัท ABC"></tbt-field>
  <tbt-field label="Status">
    <tbt-badge variant="success">Approved</tbt-badge>
  </tbt-field>
</tbt-field-grid>
```

`tbt-field-grid` props: `columns` (1–6, default 2) — responsive, collapses to 1 on mobile

---

#### `tbt-section`

```html
<!-- With title -->
<tbt-section title="Document info">
  <tbt-field-grid columns="4">...</tbt-field-grid>
</tbt-section>

<!-- With actions slot -->
<tbt-section title="Line items">
  <div slot="actions">
    <tbt-button variant="primary" icon="add">Add line</tbt-button>
  </div>
  <tbt-table ...></tbt-table>
</tbt-section>
```

---

#### `tbt-table`

| Prop | Type | Description |
|---|---|---|
| `columns` | Array | Column definitions (see below) |
| `rows` | Array | Data rows |
| `paginate` | Boolean | Enable pagination |
| `page-size` | Number | Rows per page (default 20) |
| `loading` | Boolean | Show skeleton |
| `responsive` | Boolean | Card view on narrow containers |
| `max-height` | String | Scrollable height (e.g. `400px`) |

Column definition:
```javascript
{
  key:         'amount',
  label:       'Amount',
  sortable:    true,
  align:       'right',          // left | center | right
  html:        true,             // render value as HTML
  href:        row => `/inv/${row.id}`, // render as link
  mobileTitle: true              // used as card header in responsive mode
}
```

---

#### `tbt-summary`

```html
<!-- Auto mode (props) -->
<tbt-summary subtotal="100000" vat="7000" currency="฿"></tbt-summary>

<!-- Manual mode (slot) -->
<tbt-summary>
  <tbt-summary-item label="Subtotal"     value="฿100,000.00"></tbt-summary-item>
  <tbt-summary-item label="Discount 5%"  value="−฿5,000.00"></tbt-summary-item>
  <tbt-summary-item label="VAT 7%"       value="฿6,650.00"></tbt-summary-item>
  <tbt-summary-item label="Grand total"  value="฿101,650.00" highlight></tbt-summary-item>
</tbt-summary>
```

---

#### `tbt-approval-flow`

```html
<tbt-approval-flow
  orientation="horizontal"
  .steps=${[
    { id:'1', label:'Request',  status:'approved', approver:'Wichit', timestamp:'2026-05-20T09:00:00Z' },
    { id:'2', label:'Manager',  status:'current',  approver:'Somchai' },
    { id:'3', label:'Director', status:'pending' }
  ]}>
</tbt-approval-flow>
```

`orientation`: `horizontal` (default) · `vertical`
Step `status`: `pending` · `current` · `approved` · `rejected` · `skipped`

---

#### `tbt-audit-log`

```html
<tbt-audit-log
  .entries=${[
    { id:'1', timestamp:'2026-05-22T10:00:00Z', user:'Wichit', action:'approved',
      label:'Document approved' },
    { id:'2', timestamp:'2026-05-22T09:00:00Z', user:'Wichit', action:'updated',
      label:'Amount updated',
      changes:[{ field:'Amount', from:'100,000', to:'107,000' }] }
  ]}>
</tbt-audit-log>
```

Props: `compact` (Boolean) · `max-height` (String)
Action types: `created` `updated` `approved` `rejected` `submitted` `cancelled` `deleted` `printed` `emailed` `attached` `viewed`

---

#### `tbt-svg`

```html
<!-- Built-in illustration -->
<tbt-svg name="empty" size="100"></tbt-svg>
<tbt-svg name="success" size="80"></tbt-svg>

<!-- External SVG -->
<tbt-svg src="/assets/my-illustration.svg" size="120"></tbt-svg>

<!-- Inline SVG -->
<tbt-svg label="Custom icon">
  <svg viewBox="0 0 24 24">...</svg>
</tbt-svg>
```

Built-in names: `empty` · `search` · `success` · `error` · `warning` · `draft` · `no-access`

---

## Design tokens

All tokens are CSS custom properties in `theme/tbt-theme.css`. Use `var(--tbt-*)` only — never hardcode values.

### Brand colors

```css
--tbt-primary:       #0D1171   /* Navy blue */
--tbt-primary-light: #1E2B99
--tbt-primary-bg:    #EEF0FF   /* Tinted background */
--tbt-accent-gradient: linear-gradient(135deg, #8B35C8 0%, #59BBF6 100%)
```

### Semantic colors

```css
--tbt-success: #10B981    --tbt-success-bg: #ECFDF5
--tbt-warning: #F59E0B    --tbt-warning-bg: #FEF3C7
--tbt-danger:  #EF4444    --tbt-danger-bg:  #FEE2E2
--tbt-info:    #3B82F6    --tbt-info-bg:    #DBEAFE
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
--tbt-size-xs:   11px   --tbt-size-sm:   12px   --tbt-size-base: 14px
--tbt-size-md:   16px   --tbt-size-lg:   20px   --tbt-size-xl:   28px
--tbt-size-2xl:  36px
```

---

## Composition patterns

### Pass data from Suitelet server → page

```javascript
// sl_invoice.js (server-side)
const data = { tranId: 'INV-0001', lines: [...] };
context.response.write(
  template.replace('</body>', `<script>window.__DATA__ = ${JSON.stringify(data)};</script></body>`)
);
```

```javascript
// Page script (client-side)
const data = window.__DATA__;
document.querySelector('tbt-table').rows = data.lines;
```

### Send data back to server (RESTlet)

```javascript
async function save(payload) {
  const res = await fetch('/app/site/hosting/restlet.nl?script=xxx&deploy=1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}
```

### Empty state with illustration

```html
<div style="text-align:center;padding:var(--tbt-space-12) var(--tbt-space-6)">
  <tbt-svg name="empty" size="100"></tbt-svg>
  <div style="margin-top:var(--tbt-space-3);font-family:var(--tbt-font)">
    <div style="font-weight:var(--tbt-weight-medium)">No documents yet</div>
    <div style="font-size:var(--tbt-size-sm);color:var(--tbt-text-secondary);margin-top:4px">
      Create your first document to get started.
    </div>
  </div>
  <div style="margin-top:var(--tbt-space-4)">
    <tbt-button variant="primary" icon="add">New document</tbt-button>
  </div>
</div>
```

---

## NetSuite deployment

### File Cabinet structure

```
/SuiteScripts/Teibto/ds/v1.17.0/
  tbt-theme.css       ← design tokens
  index.js            ← loads all components
  tbt-*.js            ← individual component files
  tbt-icons-css.js    ← shared Tabler CSS injector

/SuiteScripts/Teibto/{module}/
  sl_{module}_{action}.js     ← Suitelet server script
  sl_{module}_{action}.html   ← HTML template (loaded from File Cabinet)

/SuiteScripts/Teibto/assets/
  teibtologo.png
```

### Standard page `<head>`

```html
<link rel="stylesheet" href="/sc/SuiteScripts/Teibto/ds/v1.17.0/tbt-theme.css">
<script type="module" src="/sc/SuiteScripts/Teibto/ds/v1.17.0/index.js"></script>
```

> Always pin to an exact version path. Never use `/latest/`.

### Upload with SuiteCloud CLI

```bash
cd tbt-ds/tbt-ds           # SDF project folder
suitecloud account:setup   # first-time auth (opens browser)
suitecloud file:upload --paths "/SuiteScripts/Teibto/ds/v1.17.0/*"
```

---

## Governance rules

| Rule | Reason |
|---|---|
| No hex color literals in `components/**/*.js` | All colors must come from `var(--tbt-*)` tokens so dark mode and theming work |
| No `<style>` blocks on consumer pages | Styles belong in components |
| No `style="..."` for visual properties | Use token overrides via CSS custom properties only |
| No raw HTML primitives when a `tbt-*` component exists | Consistency and accessibility |
| Sentence case for all UI labels | "Document info" not "Document Info" |
| Code in English; comments may be Thai | Searchable codebase |
| Version-pin production File Cabinet paths | Prevents breaking changes from affecting live pages |

---

## Development

```bash
# Dev server (http://localhost:8081)
npm run serve

# Open the component showcase
open http://localhost:8081/demo/specimen.html

# Open the API reference
open http://localhost:8081/demo/help.html
```

No build step needed in development — components import Lit 3 directly from CDN.

For production, bundle with:
```bash
npm run build   # outputs tbt-ds.min.js
```

---

## Versioning

| Change type | Bump |
|---|---|
| Bug fix, style tweak | PATCH `1.x.y` |
| New component, new prop | MINOR `1.x.0` |
| Removed/renamed prop, breaking change | MAJOR `x.0.0` + migration guide |

Update `package.json`, `CHANGELOG.md`, and the File Cabinet path on every version bump.

---

## Author

**Wichit Wongta** — Teibto Co., Ltd.

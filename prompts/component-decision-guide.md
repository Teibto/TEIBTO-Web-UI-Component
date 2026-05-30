# Component decision guide

Reference สำหรับ AI: เมื่อได้ requirement บอกเป็น "ฟังก์ชัน/intent" → เลือก tbt-* component ที่เหมาะ.

ใช้คู่กับ `prompts/new-suitelet.md` — guide นี้บอก **เลือกอะไร**, template นั้นบอก **วาง layout ยังไง**.

---

## 1. Function → Component map

### Display data

| ต้องการ | ใช้ component | หมายเหตุ |
|---|---|---|
| ดู record เดี่ยว (read-only) | `tbt-field-grid` + `tbt-field` | columns 2–4 ตามจำนวน field |
| ดูสถานะ | `tbt-badge` (success/warning/danger/info/primary/neutral) | sentence case |
| ดู label+value list แนวตั้ง | `tbt-list` + `tbt-list-item` | profile card, drawer detail |
| ดูจำนวนหรือ KPI | `tbt-stat` ใน `.tbt-stats-grid` | มี trend + variant |
| ดูแนวโน้ม / สัดส่วน / วิเคราะห์ | `tbt-chart` | bar/line/area/donut/pie/sparkline + combo/waterfall/stacked/pareto/gauge — `.data` (เดี่ยว) / `.series` (หลาย) |
| ดูสรุปยอด document | `tbt-summary` + `tbt-summary-item` | subtotal / VAT / total |
| ดูตาราง | `tbt-table` | paginate, sortable, responsive |
| ดูตาราง server-side fetch | `tbt-data-table` | มี loading state + retry |
| ดู document totals หลายบรรทัด | `tbt-line-items` / `tbt-lines-block` | inline edit + auto totals |
| ดูประวัติการ approve | `tbt-approval-flow` | horizontal/vertical |
| ดู activity log | `tbt-audit-log` | timestamp + diff |
| ดู workflow steps | `tbt-stepper` | active index + error state |
| ดู breadcrumb | `tbt-breadcrumb` | last item = current (non-clickable) |
| ดู illustration empty state | `tbt-svg` + `tbt-button` | 7 built-ins: empty/search/success/error/warning/draft/no-access |

### Input

| ต้องการ field type | ใช้ component | เมื่อไหร่ |
|---|---|---|
| Text ทั่วไป | `tbt-input` | default type=text |
| ตัวเลข | `tbt-input type="number"` หรือ `tbt-number-input` | number-input เพิ่ม spin + format |
| Email / password | `tbt-input type="email/password"` | validation built-in |
| ข้อความยาว | `tbt-textarea` | rows 2–5 ตามความยาวคาด |
| วันที่เดี่ยว | `tbt-datepicker` | ISO YYYY-MM-DD output |
| ช่วงวันที่ | `tbt-date-range` | name-from + name-to |
| เลือก 1 จาก list | `tbt-dropdown` | options array {value,label}; searchable ถ้า > 10 items |
| เลือกหลายค่า | `tbt-multiselect` | chips view |
| เปิด/ปิด | `tbt-toggle` | label-on/label-off ชัด |
| ทำเครื่องหมาย ✓ | `tbt-checkbox` | รองรับ indeterminate |
| ค้นหา | `tbt-search` | มี debounce |
| Upload file | `tbt-file-upload` | drag-drop + size validation |
| Tag list | `tbt-tag-input` | Enter เพื่อ add chip |
| ที่อยู่ครบ | `tbt-address` | street/city/state/postcode/country |
| สี | `tbt-color-picker` | ใช้น้อย, เฉพาะ branding setting |

### Action

| ต้องการ | ใช้ component | variant |
|---|---|---|
| ปุ่ม CTA หลัก | `tbt-button variant="primary"` | + icon save/submit/add |
| ปุ่ม Cancel | `tbt-button variant="ghost"` | + icon cancel |
| ปุ่ม Delete/Reject | `tbt-button variant="danger"` | + icon delete/reject |
| ปุ่มรอง | `tbt-button variant="secondary"` | + icon print/email/export |
| ปุ่ม + เมนู dropdown | `tbt-split-button` | กดส่วนหลัก = default action; กดลูกศร = เมนู |
| ปุ่มทำให้เลือกได้ | `tbt-popover` | trigger + content slot |

### Feedback

| ต้องการ | ใช้ component | เมื่อไหร่ |
|---|---|---|
| แจ้งผลลัพธ์ inline | `tbt-alert variant="success/danger/warning/info"` | ในหน้า, dismissible |
| แจ้งผล floating | `tbt-toast` ผ่าน `showToast()` | success ของการ save, info |
| Loading placeholder | `tbt-skeleton` | variant text/block/circle/card |
| Progress bar | `tbt-progress` | indeterminate หรือ % |
| Confirm dialog | `tbt-modal variant="confirm/danger"` หรือ `confirm()` helper | promise-based |
| Tooltip | `tbt-tooltip` | hint สั้นๆ บน hover |

### Composition

| ต้องการ | ใช้ component |
|---|---|
| Page wrapper | `tbt-app-shell` (ผ่าน `tbt_page.render`) |
| Navigation บน | (ไม่ใช้ menubar แล้ว — sidebar เป็นหลัก) |
| Navigation ซ้าย | `tbt-sidebar` + `tbt-sidebar-item` |
| Card / section | `tbt-section title="..."` + action slot |
| Tabs / Subtabs | `tbt-tabs` + `tbt-tabs-panel` (ARIA-compliant) — note: Teibto calls in-form tabs **"Subtabs"** (terminology) |
| Form wrapper | `tbt-form` (auto-collect ผ่าน `name`) |
| Schema-driven form | `tbt-doc-form` + schema จาก `tbt-doc-schemas` |
| Modal/dialog | `tbt-modal variant="default/confirm/danger"` |
| Side drawer | `tbt-drawer` |
| Field group | `tbt-field-grid columns="2/3/4"` |
| Lines + auto totals | `tbt-lines-block` |

---

## 2. Layout pattern by page intent

### Intent: "create/edit document" (PO, SO, Invoice, Customer) — **Main + Subtabs pattern**

ใน Teibto convention — record form มี **Main section** อยู่บน + **Subtabs** ด้านล่างที่แยก detail ออกเป็นกลุ่ม (เลียนแบบ NetSuite native UI)

```
Page header (title + status badge)
└─ .tbt-page-header

Main section: Document info — header fields ที่สำคัญ (always visible)
└─ tbt-section title="Document info" + tbt-field-grid columns=4
   (tranid, customer/vendor, date, total amount, etc.)

Subtabs (tbt-tabs ภายใน tbt-section — เรียกว่า "Subtab" ใน Teibto)
├─ Items       → tbt-lines-block หรือ tbt-line-items
├─ Shipping    → tbt-address + ship-via + memo
├─ Approval    → tbt-approval-flow + reviewer comment
├─ Audit       → tbt-audit-log
├─ Related     → tbt-list ของ linked records (quotation/invoice/fulfillment/payment)
└─ Accounting  → subsidiary / currency / terms / GL memo

Action bar (bottom)
└─ .tbt-action-bar + tbt-button × N (mode-aware: new/view/edit)
```

**Subtab list ที่ใช้บ่อยใน ERP record:**
| Subtab | Content |
|---|---|
| Items / Lines | inline-editable line items + totals |
| Shipping | address + ship via + shipping memo |
| Approval | approval flow + comment |
| Audit | audit log (history of changes) |
| Related | linked records (one-to-many: source / generated docs) |
| Accounting | GL coding, subsidiary, currency, terms |
| Communication | comments + attachments + email log (optional) |

**ทางลัด:** ถ้ามี schema สำเร็จ + ไม่ต้องการ subtabs → ใช้ `erp-form.html` + `tbt-doc-form` (stack ของ sections)  
ถ้าต้องการ subtabs (เช่น SO, Invoice ที่มี detail หลาย dimension) → custom `<rec>-form.html` ตาม pattern `so-form.html`

---

### Intent: "list / search records"

```
Page header (title + count badge)
└─ .tbt-page-header

Filters section
└─ tbt-section + tbt-field-grid + tbt-search + tbt-dropdown + tbt-date-range

Summary stats (optional)
└─ tbt-section + .tbt-stats-grid + tbt-stat × 4

List section
└─ tbt-section + tbt-button[slot=actions slot=New] + tbt-table paginate

Empty state (when 0 results)
└─ tbt-svg name=search + tbt-button "Clear filters"
```

---

### Intent: "dashboard / reporting"

```
Page header (title + period badge)
└─ .tbt-page-header

Filters
└─ tbt-section + tbt-date-range + tbt-dropdown

KPI strip
└─ tbt-section + .tbt-stats-grid + tbt-stat × 4 (with trend)

Main data — 1 of:
  - tbt-table (top N)
  - tbt-data-table (server-paginated)
  - 2-column grid: tbt-section + tbt-section (split: chart-like data + activity log)

Activity log
└─ tbt-section + tbt-audit-log

Action bar
└─ .tbt-action-bar + Export CSV / Print
```

---

### Intent: "approval queue"

```
Page header (title + pending count badge)
└─ .tbt-page-header

Filters (team / period / status)
└─ tbt-section + tbt-field-grid + tbt-dropdown + tbt-search

Summary stats
└─ tbt-section + .tbt-stats-grid + tbt-stat (pending / approved / rejected / avg turn-around)

Pending list
└─ tbt-section + tbt-table (row-click pattern)

Detail modal (opened from row click)
└─ tbt-modal + tbt-field-grid + tbt-table (inner detail) + tbt-textarea (comment)
  └─ slot=footer: .tbt-modal-actions + Approve/Reject/Cancel
```

---

### Intent: "step-by-step wizard"

```
Page header
└─ .tbt-page-header

Stepper (state of progress)
└─ tbt-stepper active=N

Current step section
└─ tbt-section + form fields per step

Navigation
└─ .tbt-action-bar + Back / Continue
```

---

### Intent: "single form (settings, profile, simple create)"

```
Page header (title + subtitle)
└─ .tbt-page-header

Form section
└─ tbt-section + tbt-form + tbt-field-grid
   (group related fields per section if many)

Action bar
└─ inside tbt-form: .tbt-action-bar + Save / Cancel
```

---

## 3. Form field decision — by data shape

| Data shape | Field component | Notes |
|---|---|---|
| string (short) | `tbt-input` | required + placeholder |
| string (long) | `tbt-textarea rows="2-5"` | maxlength ถ้ามี limit |
| string (one-of N) | `tbt-dropdown` (n>10 → `searchable`) | options array |
| string array | `tbt-multiselect` | chips view |
| string array (free) | `tbt-tag-input` | Enter to add |
| number | `tbt-input type="number"` หรือ `tbt-number-input` | step + min/max |
| boolean | `tbt-toggle` หรือ `tbt-checkbox` | toggle = setting; checkbox = consent |
| date | `tbt-datepicker` | ISO output |
| date range | `tbt-date-range` | name-from + name-to |
| address (composite) | `tbt-address` | nested value |
| file(s) | `tbt-file-upload` | accept + max-size |
| color | `tbt-color-picker` | rare |
| password | `tbt-input type="password"` | + helper "min 8 chars" |
| URL | `tbt-input type="url"` | validates |
| email | `tbt-input type="email"` | validates |

**Default required fields:** key identifier + foreign key + amount + date. Optional: memo, notes, attachments.

---

## 4. Action pattern — what variant + icon to use

| Action | Variant | Icon alias |
|---|---|---|
| Save / Save draft | primary | save |
| Submit for approval | primary | submit |
| Approve | primary | approve |
| Reject | danger | reject |
| Cancel | ghost / secondary | cancel |
| Delete | danger | delete |
| Print | secondary | print |
| Email | secondary | email |
| Export | primary / secondary | export |
| Import | secondary | import |
| Add (line / row) | primary, size="sm" | add |
| Edit | ghost / secondary | edit |
| Duplicate | ghost | copy |
| View detail | ghost | view |
| Search | (inside tbt-search) | search (auto) |
| New (top-right list) | primary | add |
| Refresh | ghost | refresh |
| Filter | secondary | filter |
| More | ghost | more |

---

## 5. Domain → schema map (ถ้ามีอยู่แล้ว — ใช้ kit แทนเขียนเอง)

| Domain | Schema export | Kit thin-entry pattern |
|---|---|---|
| Customer | `CUSTOMER_SCHEMA` | `sl_kit_customer.js` |
| Sales Order | `SALES_ORDER_SCHEMA` | `sl_kit_sales_order.js` |
| Purchase Order | `PO_SCHEMA` | `sl_kit_purchase_order.js` |
| Invoice (AR) | `INVOICE_SCHEMA` | (เพิ่มเองตาม pattern) |
| Quotation | `QUOTATION_SCHEMA` | (เพิ่มเอง) |
| Item Fulfillment | `FULFILLMENT_SCHEMA` | (เพิ่มเอง) |

---

## 6. Anti-patterns — อย่าให้ AI ทำแบบนี้

| ❌ ห้าม | ✅ ทำแทน |
|---|---|
| `<button>` ใช้ปุ่มทั่วไป | `tbt-button` |
| `<div class="card">` กล่อง | `tbt-section` |
| `<input>` raw | `tbt-input` / `tbt-textarea` / etc. |
| `<select>` raw | `tbt-dropdown` |
| `<table>` raw | `tbt-table` |
| `<dialog>` หรือ custom modal | `tbt-modal` |
| Inline `style="color: ..."` ทับ token | `var(--tbt-*)` |
| Inline `style` ที่เป็น layout duplicate | `.tbt-page-header` / `.tbt-action-bar` / `.tbt-stats-grid` |
| Custom alert div | `tbt-alert` ใน `.tbt-page-alerts` |
| Custom currency format | `window.tbtPageRuntime.currency()` |
| Custom fetch wrapper | `window.tbtPageRuntime.post()` |
| Custom status badge logic | `window.tbtPageRuntime.setStatusBadge()` |
| Mock data duplicated per file | `./_mock_lookups` import |
| ใส่ค่า record ดิบใน `html: true` column ของ `tbt-table` | `rt.badge(label, variant)` หรือ `rt.escapeHtml(v)` — column นี้ render ผ่าน `unsafeHTML` = XSS ถ้าไม่ escape |
| New CSS framework (Bootstrap/Tailwind) | DS tokens เท่านั้น |
| Chart library (Chart.js/D3) | ใช้ `tbt-chart` (bar/line/area/donut/pie/sparkline + combo/waterfall/stacked/pareto/gauge); เฉพาะ heatmap/treemap/sankey/zoom จึง escalate เป็น `tbt-echart` (RFC ใหม่) |

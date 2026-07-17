# Prompt template — สร้างหน้า Suitelet ใหม่ตามมาตรฐาน Teibto

Copy template ที่เหมาะกับ scope แล้ว fill in spec → ส่งให้ Claude.

> วิธีทำงานเต็มวงจร (request → UI + Backend, control pipeline 9 ด่าน) อยู่ที่
> [`docs/FORM-KIT-PLAYBOOK.md`](../docs/FORM-KIT-PLAYBOOK.md) · skill `teibto-form-kit`

---

## ⚡ ระดับ 1 — Quick (1 บรรทัด, ใช้กับ Module ที่มี schema สำเร็จรูป)

> สร้างหน้า Suitelet **\<NAME\>** ใช้ schema-driven kit (`kit-doc.html` + `tbt-doc-schemas.js`)
> โดยใช้ **\<SCHEMA_NAME\>** + mock data + wire ใน dev server route `/kit/<slug>`

**ตัวอย่าง:**
> สร้างหน้า Suitelet **Quotation** ใช้ schema-driven kit โดยใช้ **QUOTATION_SCHEMA** + mock data + wire ใน dev server route `/kit/quotation`

ใช้ได้กับ schemas: `CUSTOMER_SCHEMA`, `SALES_ORDER_SCHEMA`, `PO_SCHEMA`, `INVOICE_SCHEMA`, `QUOTATION_SCHEMA`, `FULFILLMENT_SCHEMA`.

---

## 🎯 ระดับ 2 — Standard (มี spec, ใช้สำหรับหน้า custom)

```
สร้างหน้า Suitelet ใหม่ใน tbt-ds project ตามมาตรฐาน Teibto

### Spec
- ชื่อหน้า          : <Page name — เช่น "Time tracking entry">
- Sidebar active key : <key — เช่น "time-tracking">
- URL route          : /<path>
- Use case           : <entry | list | dashboard | approval | report | form>
- Sections ที่ต้องมี (ตามลำดับ):
  1. Page header   (title + status badge)
  2. <Filter / Summary / Main data / Approval / ...>
  3. ...
- Actions          : <Save | Submit | Cancel | Print | Export | ...>
- Mock data fields : <ระบุ shape หรือบอกให้ gen เอง>

### Constraints (non-negotiable)
- ยึด layout มาตรฐาน Teibto: page header → filters → summary stats → main → action bar
- ใช้ tbt-* components เท่านั้น (ไม่มี <button>, <div class="card">, ไม่มี HTML primitive ที่ DS แทนได้)
- ใช้ icon ERP alias เท่านั้น (raw Tabler name ใช้เมื่อจำเป็นจริง)
- ใช้ var(--tbt-*) tokens เท่านั้น — ห้าม hex, ห้าม inline visual style (color/font/size hard-coded)
- ใช้ utility classes สำหรับ pattern ซ้ำ (ห้าม inline duplicate):
    `.tbt-page-header` / `.tbt-page-header__title` / `.tbt-page-header__subtitle`
    `.tbt-stats-grid` / `.tbt-action-bar` / `.tbt-modal-actions` / `.tbt-page-alerts`
- ใช้ `window.tbtPageRuntime` helpers แทนการเขียนซ้ำ:
    `currency`, `setStatusBadge`, `showAlert`, `hideAlerts`, `post`, `sumBy`
- ใช้ `./_mock_lookups` สำหรับ shared mock (employees, currencies, payment-terms, vendors, customers, …)
- Sentence case labels ("Document info" ไม่ใช่ "Document Info")
- Code ภาษาอังกฤษ, comment ภาษาไทยได้

### Deliverables (1 หน้า = 2 ไฟล์)
1. templates/<slug>.html       — body template (tbt-section blocks + script type="module")
2. templates/sl_<slug>.js      — thin entry SuiteScript 2.1, ~30 lines
   - @NApiVersion 2.1 / @NScriptType Suitelet / @NModuleScope SameAccount
   - @author Wichit Wongta
   - define([ 'N/file', './tbt_page' ], (file, tbtPage) => ({ onRequest(ctx) {...} }))
   - ทำ tbtPage.render({ title, active, data, body, user? })
3. เพิ่ม route ใน scripts/dev-suitelet.mjs (ENTRIES + index hub button)
4. ถ้าเป็น module ใหม่ → เพิ่ม sidebar item ใน DEFAULT_SIDEBAR ของ netsuite/tbt_page.js
5. Update CHANGELOG.md [Unreleased] section

### Verification (รันก่อนตอบ done)
- npm run build  → bundle ผ่าน
- npm run lint   → governance ผ่าน
- npm test       → unit tests ผ่าน
- curl -s -o /dev/null -w "%{http_code}" http://localhost:8090/<route>  → 200 (server-side render)
- **npm run test:smoke** → โหลดหน้าจริงในเบราว์เซอร์: ไม่มี console error + component render จริง
  (curl เช็คแค่ HTML — build/curl ผ่านแต่ runtime พังได้ ดู tbt-ds-pitfalls §21)
- รายงานสรุป pass/fail พร้อมตัวเลขจริง
```

---

## 🤖 ระดับ 4 — Design mode (AI เลือก component + layout ให้เอง)

ใช้เมื่อ:
- รู้แค่ **purpose** ของหน้า / มีแค่ business intent — ไม่อยากออกแบบ layout เอง
- อยากให้ AI map intent → component ตาม **Component decision guide**

ก่อนใช้ AI ต้องอ่าน `prompts/component-decision-guide.md` ก่อน (function → component map + layout patterns by intent + form field by data shape + anti-patterns).

```
ออกแบบและสร้างหน้า Suitelet ใหม่ในมาตรฐาน Teibto

### Purpose / business intent
- เรื่องที่ทำ        : <1-2 ประโยค business goal — เช่น "พนักงานคลังบันทึกการรับเข้าสินค้าจาก PO">
- บทบาทคนใช้        : <employee | manager | finance | admin | customer>
- สิ่งที่ user ต้องทำได้: <bullet list ของ actions — ดูข้อมูล / แก้ไข / approve / export / ฯลฯ>
- ข้อมูลหลักที่จัดการ : <record / entity ที่จัดการ — มี field อะไรบ้างคร่าวๆ>

### Constraints (ตาม Teibto)
- ใช้ component decision guide เลือก tbt-* ที่เหมาะ — ห้ามใช้ third-party
- ใช้ layout pattern จาก guide ตามประเภท page (entry / list / dashboard / approval / wizard / form)
- ทุก field ที่เป็น lookup ต้องผ่าน `_mock_lookups` (ถ้ามี shared list) หรือ inline ใน Suitelet ถ้าเฉพาะหน้านี้
- ทุก action ต้องใช้ variant + icon ที่ตรงกับ "Action pattern" ใน guide
- ทุก inline-style duplicate ที่มี class ใช้ → ต้องใช้ class (.tbt-page-header / .tbt-action-bar / .tbt-stats-grid / .tbt-modal-actions / .tbt-page-alerts)

### Deliverables + Verification ตาม template ระดับ 2

### Decision log (เพิ่ม)
ก่อน generate ไฟล์ — รายงาน decision log สั้น ๆ (5-10 บรรทัด):
1. Page type ที่เลือก (entry / list / dashboard / approval / wizard / form) + เหตุผล
2. Sections ที่ใช้ + เหตุผลที่ตัดสินใจเลือก component นั้น
3. Schema สำเร็จที่ใช้ ถ้ามี (CUSTOMER_SCHEMA / PO_SCHEMA / ฯลฯ) หรือเหตุที่สร้างเอง
4. Fields + types — แต่ละ field เลือก input component อะไร เพราะอะไร
5. Actions ใน action bar / modal — ทำไมเลือก variant นี้
```

**ตัวอย่าง Tier 4 — "สร้างหน้าจัดการคลังสินค้า"**

> ออกแบบและสร้างหน้า Suitelet ใหม่ในมาตรฐาน Teibto
>
> Purpose:
> - เรื่องที่ทำ: หน้าสำหรับ warehouse staff ดูสินค้าคงคลัง + เพิ่ม/แก้ไข item, ตรวจ low-stock alert
> - บทบาท: warehouse staff
> - User ต้องทำได้:
>   - ดูรายการ item ทั้งหมด พร้อม current stock + reorder point
>   - filter ตาม warehouse, category, low-stock status
>   - เห็น KPI: total items / total value / low-stock count / out-of-stock count
>   - เพิ่ม item ใหม่ (modal) หรือคลิก row เพื่อแก้ไข
>   - export CSV
> - ข้อมูลหลัก: item record (SKU, name, category, warehouse, current qty, reorder point, unit cost)
>
> Constraints ตาม Teibto + decision log

AI จะ:
1. รายงาน decision log: เลือก "list page" pattern + reason
2. List sections: page header + filters + KPI strip + items table + Action bar
3. แต่ละ field map กับ type ตาม guide (SKU → tbt-input, category → tbt-dropdown, etc.)
4. Wire + test เหมือนระดับ 2

---

## 🔧 ระดับ 3 — Full control (control field-by-field)

ใช้เมื่อ:
- Custom field arrangement ที่ schema สำเร็จไม่ครอบ
- ต้องการ modal / popover / tab pattern เฉพาะ
- มี business logic ที่ต้องเชื่อมหลาย Suitelet

```
สร้างหน้า Suitelet <Name> ตามมาตรฐาน Teibto

### Layout (ระบุทุก section ตามลำดับ)

| # | Section type     | Title         | Content                                          |
|---|------------------|---------------|--------------------------------------------------|
| 1 | Page header      | -             | <title text> + tbt-badge (status)                |
| 2 | Filters          | Filters       | tbt-field-grid columns=4:                        |
|   |                  |               |  - <field name> (<type>) - <required?>           |
|   |                  |               |  - ...                                           |
| 3 | Summary stats    | Summary       | tbt-stat × <N>: <label> / <variant> / <icon>     |
| 4 | Main data        | <Title>       | tbt-table | tbt-line-items | tbt-list | ...    |
|   |                  |               | action slot: tbt-button (<label> / <icon>)       |
| 5 | Approval         | Approval      | tbt-approval-flow horizontal                     |
| 6 | Audit log        | Audit         | tbt-audit-log                                    |
| 7 | Modal (optional) | <Title>       | tbt-form ภายใน → field-grid + footer Save/Cancel |
| 8 | Action bar       | -             | Save | Submit | Cancel (variant + icon)         |

### Mock data shape
{
  <field>: <example value>,
  ...
  <array field>: [{ <row shape> }, ...]
}

### Events to wire
- <element id> → <event name> → <action description>

### Cross-page navigation
- ปุ่ม "New" → navigate to <other route>
- Row click → open modal | navigate to <route>?id=<row.id>

### Constraints + Deliverables + Verification
(เหมือนระดับ 2)
```

---

## 📋 ตัวอย่าง prompt จริง 3 ตัว

### ตัวอย่าง 1 (Quick) — สร้าง Quotation kit

> สร้างหน้า Suitelet **Quotation** ใช้ schema-driven kit
> โดยใช้ **QUOTATION_SCHEMA** + mock data 2 lines + wire ใน dev server route `/kit/quotation`

### ตัวอย่าง 2 (Standard) — Time tracking entry (ที่เพิ่งทำไป)

> สร้างหน้า Suitelet ใหม่ — **Time tracking entry**
> - Sidebar key: `time-tracking` (เพิ่มใน default ถ้ายังไม่มี)
> - Route: `/time/entry`
> - Use case: employee weekly time log
> - Sections: page header (name + week + status badge) · filters (employee + week date-range + project + status) · summary stats 4 ตัว (Total/Billable/Non-billable/Utilization%) · time entries table (add/edit via modal) · approval flow · action bar (Save draft + Submit + Cancel)
> - Mock 8 entries ข้าม 5 วัน
> - Auto-recompute stats เมื่อ entries เปลี่ยน
> - Submit → POST mock RESTlet

### ตัวอย่าง 3 (Full control) — Inventory adjustment

> สร้าง Suitelet **Inventory adjustment** ตามมาตรฐาน Teibto
>
> Layout:
> 1. Page header: "Inventory adjustment · ADJ-<no>" + status badge
> 2. Filters: warehouse (dropdown), reason (dropdown), date (datepicker), employee (dropdown)
> 3. Summary: 3 tbt-stat — Total items / Total qty change / Total cost impact
> 4. Items section title "Adjustment lines" — tbt-line-items (item / desc / current qty / new qty / variance / reason)
>    action slot: "Add line" + "Import from CSV"
> 5. Approval flow horizontal
> 6. Action bar: Save draft / Submit for approval / Cancel
>
> Mock 5 lines (mixed positive + negative adjustment)
> Route: `/inventory/adjustment`
> Sidebar key: `inventory` (เพิ่มใหม่ใน default — icon: `stock`)
```

---

## 💡 Tips

- **ใส่ scope ให้ชัด** — ระบุ "employee entry" vs "manager approval" vs "report" — 3 อันนี้ใช้ pattern คนละแบบ
- **ระบุ schema ก่อนถ้ามี** — ใช้ kit-doc.html ประหยัด code 90%
- **อย่าระบุสี/font** — ปล่อยให้ DS token จัดการ
- **ระบุ event ที่ต้องการ** — ถ้าไม่บอก AI จะใส่แค่ console.log
- **ทดสอบใน dev server ก่อน** — Claude จะ curl test ทุก route ที่เพิ่ม + รายงาน status code

---

## 🚫 อย่าสั่งแบบนี้ (AI จะ over-engineer)

- ❌ "ทำหน้า Time tracking ที่สวยที่สุด" → ไม่มี spec, AI จะเดา (อาจใส่ component นอก DS)
- ❌ "ใช้ Material UI" → ออกนอก DS
- ❌ "ใส่ chart, graph, animation" → ไม่มีใน DS, AI จะหยิบ third-party
- ❌ "ออกแบบ logo, color scheme" → DS เป็น single source, ห้ามแตะ token

## ✅ สั่งแบบนี้

- ✅ ระบุ use case ชัด → AI map กับ pattern มาตรฐาน
- ✅ ระบุ sections ตามลำดับ → AI สร้าง layout ที่ predictable
- ✅ ระบุ field/data shape → AI สร้าง mock + wire ตรง
- ✅ "ใช้ icon alias เท่านั้น" / "ใช้ schema ที่มีอยู่" → กัน AI ออกนอก scope

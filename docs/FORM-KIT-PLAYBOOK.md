# Form Kit Playbook — จาก "คำสั่งงาน" สู่หน้า Suitelet (UI + Backend) อย่างเป็นระบบ

เอกสารนี้คือ **วิธีทำงาน (method)** สำหรับรับโจทย์ "ทำหน้า form เรื่อง X" แล้วประกอบ
`tbt-*` components ที่มีอยู่ให้ออกมาเป็นหน้าใช้งานจริง โดยแบ่งเป็น **UI layer** กับ
**Backend layer (Suitelet + RESTlet)** ที่ชัดเจน — และรองรับการ **modify/customize** ภายหลัง

Canonical: ไฟล์นี้คือแหล่งเดียวของ *workflow "request → whole page"* — skill `teibto-form-kit`
ขับ workflow นี้, `teibto-ui-component` (component API) และ `tbt-ds-pitfalls` (กับดัก) เป็น reference
ประกอบ ส่วนกลไกหน้าเดี่ยว (data contract, applySaved, sidebar) อยู่ที่ [`UI-PLAYBOOK.md`](./UI-PLAYBOOK.md)

---

## 1. โมเดล 3 ระนาบ (3 planes)

| ระนาบ | คืออะไร | ของจริงในโปรเจกต์ |
|---|---|---|
| **Method** | วิธีเดินจาก request → page (reusable, versioned) | skill `teibto-form-kit` + ไฟล์นี้ |
| **UI** | HTML body + `tbt-*` (schema-driven หรือ explicit) | `kit-doc.html` + `tbt-doc-form` + `tbt-doc-schemas` · escape hatch: `so-form.html` |
| **Backend** | Suitelet (เสิร์ฟหน้า) + RESTlet (เขียน) + lib (data) + meta (field ids) + Objects (deploy) | reference: `sl_tbt_doc_kit.js` + `rl_doc_kit.js` · production pattern: bill-receipt |

หลักการ: **UI ไม่มี business logic** (อ่าน `window.__DATA__`, ประกอบ component, ห้าม `<style>`/
hardcode สี) · **Backend เป็นที่เดียวที่เขียนข้อมูล** (RESTlet) และ resolve URL ทุกเส้นผ่าน
`N/url.resolveScript`

---

## 2. สองโหมดการใช้งาน: "เรียกใช้" vs "ปรับ"

```
                    โจทย์เข้ามา
                        │
          ┌─────────────┴─────────────┐
   ตรงกับ schema ที่มี?          ต้อง layout/interaction พิเศษ?
          │ ใช่                        │ ใช่
   ┌──────┴──────┐              ┌──────┴──────┐
   │ CALL        │              │ ADAPT       │
   │ ชี้ Suitelet │              │ แก้ schema JS │  (เพิ่ม field/section/column)
   │ ที่ schema    │              │ หรือ fork    │
   │ ?schema=... │              │ explicit tpl │  (so-form.html pattern)
   └─────────────┘              └─────────────┘
```

- **CALL** — schema มีครบ (8 ตัว: `PO`, `SALES_ORDER`, `CUSTOMER`, `INVOICE`, `QUOTATION`,
  `FULFILLMENT`, `RECEIPT`) → ใช้ generic Suitelet `sl_tbt_doc_kit` ด้วย `?schema=<NAME>&id=<id>`
- **ADAPT (schema-level)** — แก้ object `<T>_SCHEMA` ใน `components/tbt-doc-schemas.js`
  (fields / sections / columns / `vatRate`) แล้ว rebuild bundle
- **ADAPT (template-level)** — ต้องการ layout เฉพาะ (subtabs, ปุ่มพิเศษ, interaction) →
  fork เป็น explicit template แบบ `so-form.html`
- **ADAPT (backend-level)** — เพิ่ม `<t>_lib` / `<t>_meta`, ใส่ validation hook ใน RESTlet

---

## 3. Control pipeline — 9 ด่านมี gate

ทุกด่านมี **exit-gate** ที่เช็คได้ก่อนไปด่านถัดไป · map กับ team standard ตรง ๆ

| # | ด่าน | ผลลัพธ์ | Gate (ผ่านเมื่อ) |
|---|---|---|---|
| 0 | **Intake** (รับคำสั่งงาน) | Form Spec (ดู §4) | ผู้สั่งงาน confirm spec |
| 1 | **Issue-first** | GitHub issue | มีเลข issue (กฎทีม — repo GitHub) |
| 2 | **Design** | เลือก engine (schema/explicit) จาก decision-tree · ร่าง schema/template + `<t>_meta` | จดแนวทางไว้ใน issue |
| 3 | **UI build** | ประกอบ component · preview `npm run dev:suitelet` | **QA เบราว์เซอร์จริง (pixels)**: render ครบทุก mode, ไม่มี console error |
| 4 | **Backend build** | Suitelet + RESTlet + lib + meta + Objects · wire `restletUrl` | save path ต่อครบ |
| 5 | **Verify** | `lint` + `test` + `test:smoke` + save round-trip บน browser | เขียวหมด |
| 6 | **Stage SDF** | `sync:sdf` → `project:validate` → `deploy --dryrun` | dryrun = **additions only** |
| 7 | **Deploy** | `project:deploy` | ผู้ใช้อนุมัติ |
| 8 | **Release** | version bump + CHANGELOG + tag + QA บน sandbox | tag = release (R7) |

> กฎที่ไม่มีข้อยกเว้น: ด่าน 1 (issue-first) และ ด่าน 3/5 (verify pixels) — เคยพลาดจากการ
> verify ด้วย eval แทน screenshot (summary แสดง ฿0.00 ทั้งที่ DOM ถูก) ดู [[browser-qa-pixel-truth]]

---

## 4. Intake — Form Spec (ด่าน 0)

รับโจทย์แล้วเก็บให้ครบก่อนออกแบบ — เทมเพลตนี้คือ output ของด่าน 0:

```yaml
topic:        sales-order          # ชื่อเรื่อง (kebab)
record:       Sales Order          # record/ธุรกรรมที่แทน
modes:        [new, view, edit]    # โหมดที่ต้องมี
fields:                            # header fields
  - { name: customer, label: Customer, type: dropdown, required: true, options: customers }
  - { name: date,     label: Date,     type: date,     required: true }
sections:     [Document info, Shipping, Accounting]   # หรือ subtabs
lines:        true                 # มี line items ไหม (+ vatRate)
approval:     true                 # มี approval flow ไหม
audit:        false                # มี audit log ไหม
lookups:      [customers, sales-reps, subsidiaries, currencies, payment-terms, ship-via]
save_target:  RESTlet customscript_tbt_rl_<topic>   # ปลายทาง save
```

Gate: ผู้สั่งงาน confirm spec นี้ก่อนเขียนโค้ด (ถ้า field/section ยังไม่นิ่ง อย่าเพิ่งลงมือ)

---

## 5. UI layer (ด่าน 3)

**เส้นทาง CALL (default):**
1. เลือก `<T>_SCHEMA` ที่ตรง (หรือเพิ่มใหม่ใน `tbt-doc-schemas.js` แล้ว `npm run build`)
2. เสิร์ฟผ่าน `kit-doc.html` — มันอ่าน `window.__DATA__`: `schemaName`, `optionLists`,
   `record`, `restletUrl`, และ optional `lines` / `approvalSteps` / `auditEntries`
3. preview: `npm run dev:suitelet` → `http://localhost:8090/kit/doc?schema=<NAME>&id=<id>`

**เส้นทาง ADAPT (explicit):** fork `so-form.html` — subtabs (`tbt-tabs` + `tbt-tabs-panel`),
mode-aware action bar, view-mode field replacement · ดูกับดักใน `tbt-ds-pitfalls`

Gate ด่าน 3: เปิดจริงในเบราว์เซอร์ ทุก mode render, totals/summary ถูก, `errors --json` ว่าง
— **อ่าน screenshot (pixels) เป็นหลักฐาน ไม่ใช่ eval**

---

## 6. Backend layer (ด่าน 4)

ต่อ 1 เรื่อง `<t>` (mirror bill-receipt — production reference):

| ไฟล์ | หน้าที่ |
|---|---|
| `templates/sl_<t>_form.js` | Suitelet เสิร์ฟหน้า: resolve mode, load record + lookups, inject `__DATA__`, `tbtPage.render` |
| `netsuite/rl_<t>.js` | **RESTlet — ที่เดียวที่เขียน** (create/update/delete) · re-read status จาก DB, permission → state machine → validate → persist |
| `netsuite/<t>_lib.js` | data access + lookups (N/query/N/record) · mock → real เป็น drop-in |
| `netsuite/<t>_meta.js` | field-id **single source of truth** + status state machine |
| `netsuite/objects/customscript_tbt_sl_<t>_form.xml`, `..._rl_<t>.xml`, `customrecord_*.xml` | SDF Objects (script + deployment) |
| entry ใน `templates/tbt_nav.js` | sidebar production (href ผ่าน `N/url.resolveScript`) |

Reference kit ที่มาพร้อม playbook นี้ = **generic + stub writer** (ไว้เดินให้ครบ loop ก่อนมี backend จริง):

- `templates/sl_tbt_doc_kit.js` — generic Suitelet, `?schema=&id=`, เสิร์ฟ `kit-doc.html`
- `netsuite/rl_doc_kit.js` — RESTlet **stub**: validate payload + echo id (ไม่เขียน record)
- Objects: `customscript_tbt_sl_doc_kit.xml`, `customscript_tbt_rl_doc_kit.xml`
- แปลง stub → writer จริง: แทน echo ด้วย `record.create/load` ตามแบบ `rl_bill_receipt.js`

---

## 7. Deploy (ด่าน 6–8)

ผ่าน SuiteCloud SDF เหมือนทุกโมดูล — รายละเอียดเต็มที่ [`UI-PLAYBOOK.md` §5](./UI-PLAYBOOK.md)
และ [`../netsuite/DEPLOY.md`](../netsuite/DEPLOY.md). สรุปเฉพาะ kit:

```sh
npm run build && npm run sync:sdf     # bundle + คัดลอกเข้า sdf/
# คัดลอกไฟล์ kit เข้า sdf/src/FileCabinet/SuiteScripts/Teibto/ + Objects เข้า sdf/src/Objects/
cd sdf
suitecloud project:validate            --authid teibto-sb2
suitecloud project:deploy   --dryrun   --authid teibto-sb2   # ต้องเห็น "additions only"
suitecloud project:deploy              --authid teibto-sb2   # เมื่ออนุมัติ
```

> `deploy.xml` เป็น full-wildcard → dryrun ต้องแสดงเฉพาะ *additions* ของไฟล์ kit ใหม่
> ถ้าเห็นว่าจะ *modify* Objects เดิม (bill-receipt/expense) หรือ AccountConfiguration → **หยุด**
> reconcile ก่อน (DEPLOY.md เตือนไว้)

---

## 8. Definition of done (เช็คก่อน merge)

- [ ] Form Spec confirm แล้ว (ด่าน 0) · มี GitHub issue (ด่าน 1)
- [ ] UI render ครบทุก mode, totals/summary ถูก, ไม่มี console error — **มี screenshot เป็นหลักฐาน**
- [ ] Save round-trip ทำงาน (UI → RESTlet → alert)
- [ ] `npm run lint` + `npm test` + `npm run test:smoke` เขียว
- [ ] CHANGELOG `[Unreleased]` อัปเดต · production pin DS version (ห้าม latest)
- [ ] SDF `project:validate` ผ่าน · `deploy --dryrun` = additions only

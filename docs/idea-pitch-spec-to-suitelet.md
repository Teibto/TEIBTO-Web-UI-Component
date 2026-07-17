# 💡 Idea Pitch — "Spec-to-Suitelet"

> **สถานะ (2026-07-17):** ร่าง Pitch เสร็จแล้ว (draft v1) — เนื้อหา 6 หัวข้อครบ
> รอตัดสินใจ format ตอน present (Teibto deck .pptx / Word / PDF) และรอ feedback
> ปรับโทน/ความยาว. ไฟล์นี้เขียนไว้เพื่อย้ายเครื่องแล้วทำต่อได้.

**หัวข้องาน:** เขียน Idea Pitch สำหรับงาน Suitelet Template โดยดึง components จาก repo `TEIBTO-Web-UI-Component` (TBT-DS)
**ผู้เสนอ:** Peerapol N. · **วันที่:** 2026-07-17 · **Repo อ้างอิง:** TBT-DS v1.46.1
**Target level:** ☑ Level 3 — AI Architect

---

## ที่มา / บริบทที่ค้นเจอใน repo (ใช้เป็นฐานของ pitch)

หัวใจของไอเดียอยู่ที่ **form-kit / doc-kit** ที่เพิ่งเข้ามาใน v1.46:

- `components/` — **65 Lit 3 web components** (`tbt-*`) พร้อม design tokens (`--tbt-*`) + dark mode
- `tbt-doc-form.js` + `tbt-doc-schemas.js` — ฟอร์มเอกสารแบบ **schema-driven** (มี `PO_SCHEMA`,
  `CUSTOMER_SCHEMA`, `SALES_ORDER_SCHEMA`, `INVOICE_SCHEMA` สำเร็จรูป)
- `netsuite/tbt_page.js` — helper `render(opts)` ที่ emit ทั้ง HTML document จาก call เดียว
  (`DS_VERSION` อยู่บรรทัดเดียว → pin เวอร์ชันอัตโนมัติ)
- `templates/sl_tbt_doc_kit.js` + `templates/kit-doc.html` — generic schema-driven Suitelet
  (`?schema=SALES_ORDER_SCHEMA&id=...`) — "call or adapt" entry point
- `netsuite/rl_doc_kit.js` — RESTlet handler แม่แบบสำหรับ save
- `docs/FORM-KIT-PLAYBOOK.md` — เพลย์บุ๊ก request→page kit
- Starter templates: `document-page.html` / `list-page.html` / `dashboard.html` + thin Suitelets
- Governance: pin `teibto-dev-standards` v0.13.0 (R1 authorship, R2 dates, R6 secret-scan,
  R7 tag=release), `npm run lint` (ห้าม hex, tokens only, sentence case)

---

## 1 · The process & the pain — งานอะไร และวันนี้ต้นทุนเท่าไหร่

**งานที่จะเปลี่ยน:** การสร้าง **Suitelet custom HTML page** ทุกครั้งที่ลูกค้าต้องการฟอร์ม/หน้าเอกสารใหม่
ใน NetSuite (PO, Quotation, Sales Order, Invoice, Expense Claim, หน้า List, Dashboard ฯลฯ)

**ต้นทุนวันนี้:**
- ต่อ 1 หน้า dev ต้องเขียนเองตั้งแต่ `<head>`, app shell, menubar, sidebar, ฟอร์ม, ตาราง line
  items, ปุ่ม action, จน RESTlet ที่รับ save — กินเวลา **หลายชั่วโมงถึงเป็นวัน**
- **งานซ้ำซาก + copy-paste** จากหน้าเก่า ทำให้ layout/label/สีเพี้ยนกันไปคนละหน้า และมักลืม pin
  เวอร์ชัน DS (เสี่ยงหน้า production พังตอน DS อัปเดต)
- Rework จากการรีวิว governance (hex สีต้องเป็น token, sentence case, ห้าม `<style>` บนหน้า
  consumer) — จับผิดด้วยมือ เสียรอบ PR
- ความรู้เรื่อง "หน้าไหนใช้ component ไหน" อยู่ในหัว dev ไม่กี่คน → คนใหม่ต่อยาก

---

## 2 · Your idea — จะสร้างอะไร และ AI ทำงานหนักตรงไหน

**สร้าง "Spec-to-Suitelet Generator"** — เครื่องมือที่รับ *คำอธิบายเอกสารเป็นภาษาไทย/อังกฤษ*
แล้วให้ AI (Claude Code) อ่าน repo TBT-DS ทั้งก้อน แล้วผลิตหน้า Suitelet ที่ทำงานได้จริงและ
ผ่าน governance ออกมาให้เลย

**AI ทำงานหนักแทนคน 4 ด่าน:**
1. **เข้าใจ intent** — แปลง "ขอฟอร์มใบเบิกค่าใช้จ่าย มีหัวเอกสาร + line items + approval flow"
   เป็นโครง section/field
2. **เลือก component + สร้าง schema** — map ความต้องการเข้ากับ 65 components และ pre-built schema
   (`PO_SCHEMA`, `INVOICE_SCHEMA`…) ที่มีอยู่ ต่อยอดด้วย `tbt-doc-form` แทนการเขียน HTML มือ
3. **generate ไฟล์ครบชุด** — schema JS + thin Suitelet ที่เรียก `tbt_page.render()` + HTML body
   (เฉพาะ `tbt-*`) + RESTlet handler ตามแพตเทิร์น `rl_doc_kit` โดย **pin เวอร์ชัน DS อัตโนมัติ**
4. **self-review ตาม governance** — รัน `npm run lint` / secret-scan / เช็ก R1,R2,R6,R7 ในเพลย์บุ๊ก
   `teibto-dev-standards` ก่อนส่ง PR

พูดง่าย ๆ: จาก **"อธิบายเอกสาร" → หน้า NetSuite ที่ deploy ได้ ภายในไม่กี่นาที** แทนที่จะเป็นครึ่งวัน

---

## 3 · Target level

☑ **Level 3 — AI Architect (a system, cross-functional)**

> เพราะมันไม่ใช่แค่ playbook ส่วนตัว แต่เป็น *ระบบ* ที่เชื่อม design system (repo) → AI generator →
> NetSuite deployment เป็นสายพานเดียว ใช้ได้ทั้งทีม dev, ทีม implement/consult, และส่งต่อ
> ความสามารถให้คนใหม่ทันที

---

## 4 · Tools you'll use

- **Claude Code** — ตัวหลัก: อ่าน repo, generate schema/Suitelet/RESTlet, self-review governance
  (มี skill `teibto-codereview`, `teibto-km-generator` อยู่แล้ว)
- **NetSuite** (SuiteScript 2.1 + SuiteCloud CLI) — ปลายทาง deploy ผ่าน `suitecloud file:upload`
- **Git / GitHub** — repo TBT-DS เป็น "แหล่งความจริง" ของ component + PR governance flow
- **Google Workspace / Slack** — เผยแพร่ playbook + แจ้งทีมเวลา generate หน้าใหม่
- 🚩 **Net-new (อยากลอง):** **NotebookLM** — ป้อน README + FORM-KIT-PLAYBOOK เข้าไปทำ
  "knowledge base ถาม-ตอบ component" ให้ทีม self-serve

---

## 5 · Expected impact

| ด้าน | ผลที่คาด |
|---|---|
| **เวลา** | หน้าเอกสารมาตรฐาน จาก ~4–8 ชม. → **~15–30 นาที** (ลด ~80–90%) |
| **คุณภาพ** | UI สม่ำเสมอ 100% (token/sentence-case/version-pin บังคับโดย generator) → rework ตอนรีวิวเกือบเป็นศูนย์ |
| **ใครได้ประโยชน์** | ทีม dev (ไม่ต้องเขียน boilerplate), ทีม implement/consult (ปั้น prototype ให้ลูกค้าดูได้เอง), ลูกค้า (ได้หน้าจอเร็วขึ้น) |
| **Cross-functional** | Sales/PM สั่ง demo หน้าจอได้โดยไม่ต้องรอคิว dev — ลด dependency ข้ามทีม |

---

## 6 · What you need from us

- Sandbox NetSuite account + SuiteCloud CLI auth สำหรับทดสอบ deploy จริง
- ตัวอย่างเอกสาร/ฟอร์มจริง 3–5 แบบจากงานลูกค้า (เป็น test cases)
- เวลาช่วง ~1 สปรินต์ในการวาง generator + เขียน template แม่แบบเพิ่มเติมใน `templates/`
- (ถ้าได้) สิทธิ์เพิ่ม repo `teibto-dev-standards` เพื่อฝัง governance-check ให้ AI เรียกอัตโนมัติ

---

## TODO — ทำต่อหลังย้ายเครื่อง

- [ ] เลือก format สำหรับ present: **Teibto deck (.pptx)** (มี skill `teibto-deck`) / Word / PDF
- [ ] ทบทวนตัวเลข impact (~80–90%, 15–30 นาที) ให้ตรงกับข้อมูลจริงของทีม
- [ ] เพิ่มตัวอย่างเอกสารจริง 3–5 แบบเป็น test cases (หัวข้อ 6)
- [ ] (optional) แนบ diagram สายพาน: spec → AI → schema+Suitelet+RESTlet → deploy

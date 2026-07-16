# QA Report — UX/UI baseline โมดูลรับวางบิล (Suitelet list + form)

เอกสารนี้สำหรับทีม TBT-DS อ่านแล้วเห็น baseline UX/UI ของหน้ารับวางบิลบน SB2 ทั้งหมด
พร้อมรายการ finding เรียงตาม severity และแนวทางแก้เป็นราย PR

- **Date:** 2026-07-16
- **Account:** SB2 (4089685_SB2) · DS v1.43.1 · Suitelet `customscript_tbt_sl_bill_receipt_list` / `_form`
- **Verdict:** ⚠️ ใช้งานได้จริงทั้ง flow แต่มี finding 18 รายการ (1 data-risk, 3 ต้องแก้ก่อน production)

## Scenario

Baseline UX/UI ครั้งแรกของโมดูลรับวางบิล (functional smoke ผ่านครบ 8/8 ไปแล้วเมื่อ 2026-07-16)
ครอบคลุม 5 แกน: visual ทุก state · dark mode · responsive 375/768px · a11y (axe-core 4.10.2) ·
จุด UX ที่สังเกตจากรอบ smoke

- Test data: `BR-2569-0001` (id=2, Approved, 2 lines, ฿3,745) + `BR-2569-0002` (id=3, Draft — สร้างใหม่รอบนี้)
- Viewport: 1440×900 (desktop) · 768×1024 · 375×812 · light + dark

## Steps

1. เปิด list → screenshot light/dark, วัด dropdown สถานะ, ตรวจ sidebar links
2. เปิด form view (id=2) → screenshot บน/ล่าง, ตรวจ readonly state, สี currency (computed style)
3. เปิด form new → กด "ส่งตรวจรับ" ทั้งฟอร์มว่าง (ดู error path) → เปิด modal เพิ่มใบแจ้งหนี้ → ESC
4. Toggle dark mode (`#tbt-theme-toggle`) → ตรวจ persist ข้ามหน้า → screenshot ทุกหน้า
5. Viewport 375px: list card view, hamburger drawer, form stack · 768px: table scroll
6. รัน axe-core บนทั้ง 2 หน้า (list + form view)
7. สร้าง draft จริง: กรอก vendor/วันที่ → save (เจอ validation) → เพิ่ม line ผ่าน modal → save สำเร็จ
   → ตรวจ state หลัง save → เปิด id=3 ยืนยัน edit mode

## Result — expected vs actual

| สิ่งที่ตรวจ | Expected | Actual | Verdict |
|---|---|---|---|
| Visual desktop light ทุก state | ตรง DS token/spacing | ตรง ยกเว้น icon `tbt-stat` หาย 2/4 ใบ | ⚠️ |
| Dark mode ทั้ง 2 หน้า + modal | token ครบ ไม่มีสีหลุด | ครบ, persist ผ่าน `localStorage` ข้ามหน้า | ✅ |
| Responsive 375px | ไม่มี layout แตก | card view ดี แต่หัว section แตกคำคร่อม search + hamburger ทับ content | ❌ |
| Responsive 768px | ใช้งานได้ | table เลื่อนแนวนอน มี scrollbar ชัด (สถานะหลุดขอบ — column priority) | ✅ |
| a11y (axe) | 0 critical | 1 critical (ปุ่ม toggle `tbt-section` ไม่มีชื่อ) + 8 contrast | ❌ |
| Alert หลังกดปุ่ม | ผู้ใช้เห็นเสมอ | scroll เข้า viewport อัตโนมัติ — เห็นจริง | ✅ |
| Save draft → state | header/URL อัปเดตเป็น record ใหม่ | ค้าง "(ใหม่)", URL ไม่มี `id=`, กดซ้ำ = duplicate | ❌ |
| Edit mode (Draft id=3) | field แก้ได้ + ปุ่มครบ | ถูกต้อง (`readonly` หลุดครบ, save/submit โชว์) | ✅ |
| View mode (Approved id=2) | field ล็อก ปุ่ม approve ซ่อน | ถูกต้อง (`readonly` ครบ, เหลือ พิมพ์/กลับ) | ✅ |

- Console errors: none (ตรวจระหว่าง flow หลัก)
- Evidence: `shots/01`–`20` (รายชื่อไฟล์ = state ที่ถ่าย)
- Test records ที่สร้างค้างไว้: `BR-2569-0002` (id=3, Draft, 1 line ฿1,070) บน SB2 — เก็บไว้เป็น fixture edit-mode

## Findings

เรียงตาม severity · "จุดแก้" อ้าง path จริงใน repo

### F1 — กดบันทึกซ้ำสร้าง record ซ้ำ (data risk) · HIGH

`templates/bill-receipt-form.html` ฟังก์ชัน `submit()` ทิ้ง response ของ `rt.post` —
`v.id` ไม่ถูกอัปเดตหลัง save สำเร็จ ผล 3 อย่าง: header ค้าง "ใบวางบิล · (ใหม่)",
URL ไม่มี `id=` (refresh = ฟอร์มว่าง), และกด "บันทึกร่าง" อีกครั้ง = สร้าง `BR-2569-XXXX`
ใบใหม่ทันที (พิสูจน์แล้ว: หลัง save สำเร็จหน้าไม่รู้จัก id ของ `BR-2569-0002` ที่ตัวเองเพิ่งสร้าง)
· Evidence: `shots/18` + `shots/19`
**จุดแก้:** รับ `id`/`tranid` จาก RESTlet response → เซ็ต `v.id`, อัปเดต header + `history.replaceState`

### F2 — Sidebar ลิงก์ตายทั้งแผง + active ผิดเมนู · HIGH

หน้าใช้ `DEFAULT_SIDEBAR` ของ `netsuite/tbt_page.js` (`/dashboard`, `/customer/list`, …)
ซึ่งเป็น path ของ dev server — คลิกบน NetSuite = 404 ทุกเมนู และ `active: 'invoice'`
ไฮไลต์ "Invoices" ทั้งที่หน้าคือ "รับวางบิล"
**จุดแก้:** ออกแบบ sidebar production (เมนูเฉพาะโมดูลที่ deploy จริง, href เป็น scriptlet URL)
ส่งผ่าน `opts.sidebar` ต่อหน้า — ต้องตัดสินใจโครงเมนูก่อน (ดู Decisions)

### F3 — หัว section แตกคำคร่อม search บน mobile · HIGH (mobile)

375px: "รายการใบวางบิล" แตกเป็น "รายการ" / "บิล" โดยมี search box + dropdown แทรกกลาง
(header ของ `tbt-section` ไม่ stack เมื่อมี actions slot ยาว) · Evidence: `shots/11`
**จุดแก้:** `components/tbt-section.js` — breakpoint ให้ title กับ actions ขึ้นคนละแถว

### F4 — a11y: ปุ่ม toggle section ไม่มีชื่อ + contrast ตก · HIGH (axe)

axe บนทั้ง 2 หน้า: `button-name` critical ที่ `.toggle-btn` ของ `tbt-section` (ทุก instance) ·
contrast `#94a3b8` บนขาว = 2.56 (placeholder ของ `tbt-dropdown`) และ header ตาราง
`#64748b` บน `#f0f2ff` = 4.27 ที่ 11px (< 4.5) · รอง: ไม่มี `h1`, ไม่มี landmark, `th` ว่าง (คอลัมน์ actions)
**จุดแก้:** `aria-label` ที่ toggle-btn · ปรับ token สี placeholder/หัวตาราง · `th` actions ใส่ `aria-label`

### F5 — icon หายใน `tbt-stat` · MEDIUM

`components/tbt-stat.js:119` render `ti ti-${this.icon}` ตรง ๆ ไม่ผ่าน name map ของ
`tbt-icon` — `money`/`payment` กลายเป็น `ti-money`/`ti-payment` ซึ่งไม่มีใน Tabler → กล่องว่าง
(ที่ `invoice`/`receipt` รอดเพราะบังเอิญมี class ชื่อนั้นจริง) · Evidence: `shots/02`, `shots/04`
**จุดแก้:** ให้ `tbt-stat` ใช้ `<tbt-icon name=…>` หรือ import ICON_MAP เดียวกัน + unit test icon ทุกชื่อใน map

### F6 — Submit จากฟอร์มยังไม่ save ได้ error ดิบ · MEDIUM

กด "ส่งตรวจรับ" บนฟอร์มใหม่ → alert "ส่งตรวจรับไม่สำเร็จ: Cannot submit a record in status \"new\""
(ข้อความ backend ดิบ ปนอังกฤษ ผู้ใช้ไม่รู้ต้องทำอะไรต่อ) · Evidence: `shots/06`
**จุดแก้:** ซ่อน/disable "ส่งตรวจรับ" จนกว่าจะ save แล้ว หรือทำ save-then-submit + แปลข้อความ

### F7 — ข้อความ validation จาก backend เป็นอังกฤษ · MEDIUM

"บันทึกไม่สำเร็จ: At least one vendor invoice line is required" — `netsuite/bill_receipt_lib.js`
โยน message อังกฤษแล้ว client ต่อ string ตรง ๆ
**จุดแก้:** error code → คำแปลฝั่ง client (หรือ lib ส่ง message ไทย)

### F8 — hamburger ทับ brand ใน drawer + ลอยทับ content · MEDIUM

เปิด drawer แล้วปุ่ม ☰ ทับ "Teibto ERP" เหลือ "o ERP" · ตอน scroll ปุ่มลอยทับเนื้อหา
(ไม่มีแถบพื้นหลัง) · Evidence: `shots/12`, `shots/14`
**จุดแก้:** `tbt-app-shell` — ซ่อน ☰ เมื่อ drawer เปิด (หรือเลื่อนเข้า drawer) + พิจารณา top bar บนมือถือ

### F9 — dropdown "ทุกสถานะ" truncate · MEDIUM

กว้าง 78px แสดง "ทุกสถ…" ทุก viewport (วัดจริง: placeholder ยาวกว่า box) · Evidence: `shots/01`
**จุดแก้:** `min-width` ตามความยาว option ที่ยาวสุด หรือ `fit-content` ที่ `tbt-dropdown`

### F10 — วันที่สอง format ในหน้าเดียว · LOW

Header/list แสดง ISO "2026-07-16" แต่ field ใน form เป็น native date input แสดง "07/16/2026"
(US locale ของ browser) — ขัด R2 ของทีม (YYYY-MM-DD)
**จุดแก้:** `tbt-datepicker` โหมดแสดงผล ISO/พ.ศ. เอง (RFC — กระทบทุก template)

### F11 — ภาษาอังกฤษปนใน UI ไทย · LOW

"Select…" (dropdown) · "No data" (`tbt-table`) · "No activity yet" (timeline) ·
badge การอนุมัติ "Approved / Awaiting / Pending" ขณะ list ใช้ "อนุมัติแล้ว"
**จุดแก้:** เพิ่ม attr `placeholder`/`empty-text` ที่ template ส่งภาษาไทย + map สถานะ approval เป็นไทย

### F12 — เศษ UI ย่อย · LOW

- Header ฟอร์มใหม่มี "· รับเมื่อ" ห้อยลอยทั้งที่ยังไม่มีวันที่ (`shots/04`)
- ปุ่ม "กลับ" ใช้ `icon="cancel"` (⊘) สื่อ "ห้าม" — ควรเป็น arrow-left · และ `history.back()`
  เปิดจาก direct link แล้วกดไม่ไปไหน (ควร fallback ไป list)
- ปุ่ม primary 2 ปุ่มคู่กัน (บันทึกร่าง + ส่งตรวจรับ) น้ำหนักเท่ากัน — ควรเหลือ primary เดียว
- Modal เปิดแล้ว focus อยู่ที่ตัว modal ไม่ลง field แรก
- List โชว์ icon ดินสอ (แก้ไข) บน row Approved ที่แก้ไม่ได้จริง — affordance หลอก

### สิ่งที่ผ่านดี (เก็บเป็นมาตรฐาน)

Dark mode ครบทุก component + persist · mobile card view ของ table · modal (จัดกลาง, ESC, backdrop) ·
alert scroll-into-view · view/edit mode ล็อก field ถูกต้องตามสถานะ · สี currency ใน table
เป็น token ปกติ (ตรวจ computed style แล้ว — ที่ดูแดงในภาพคือ artifact ของ screenshot)

## Decisions ที่ต้องการเจ้าของ

| เรื่อง | ตัวเลือก | ใครตัดสิน |
|---|---|---|
| โครง sidebar production | เมนูเฉพาะโมดูลที่มีจริง (รับวางบิล + Expense เมื่อ deploy) vs เมนูเต็มแบบ disabled | Wichit |
| โลโก้ brand | upload `teibtologo.png` เข้า `/SuiteScripts/Teibto/assets/` vs text-only ต่อ | Wichit |

## แผนแก้ (PR แยกเรื่อง ตาม convention)

1. `fix(tbt-stat)`: icon ผ่าน ICON_MAP + test — F5
2. `fix(tbt-section)`: mobile header stack + `aria-label` toggle — F3, F4 (ส่วน component)
3. `fix(theme)`: contrast token placeholder/หัวตาราง — F4 (ส่วนสี)
4. `fix(bill-receipt-form)`: save→id update, submit guard, ข้อความไทย, back fallback, ปุ่ม hierarchy, subtitle ห้อย — F1, F6, F7, F11, F12
5. `fix(tbt-dropdown|app-shell)`: dropdown width + hamburger — F8, F9
6. RFC: `tbt-datepicker` display format ไทย/ISO — F10
7. Design: production sidebar + logo (รอ decision) — F2

ทุก PR: verify ใน browser จริงบน SB2 ก่อน merge · แตะ `dist/` เมื่อไหร่ cut v1.43.2+

## Verification — v1.43.2 deploy บน SB2 (2026-07-16 รอบบ่าย)

Fixes ทั้งหมด (ยกเว้น F2/F10 ที่รอ decision/RFC) merge + deploy + verify บน browser จริงแล้ว
(PR #30–#35 · release v1.43.2 · issues #22–#27 ปิด):

| Finding | ผล verify บน SB2 | Evidence |
|---|---|---|
| F1 save duplicate | save ใหม่ → "บันทึกสำเร็จ · BR-2569-0003" + header/URL/title อัปเดต · save ซ้ำ → record เดิม (list มี 0003 ใบเดียว) | `shots/23` |
| F3 header แตกคำ | 375px: title เต็มบรรทัด, filter ลงแถวใหม่ | `shots/24` |
| F4 axe | aria-label fallback + token contrast ใช้งานจริง (วัด computed) | — |
| F5 icon | ทั้ง 4 stat cards มี glyph (`currency-baht`, `credit-card`) | — |
| F6+F7 ข้อความ | submit ฟอร์มว่าง → "กรุณาเลือกผู้จำหน่าย; กรุณาระบุวันที่รับวางบิล; …" ไทยล้วน | `shots/22` |
| F8 hamburger | drawer เปิด → `drawer-open` reflect + ☰ ซ่อน | `shots/25` |
| F9 dropdown | "ทุกสถานะ" เต็มคำ (105px จากเดิม 78px) | `shots/21` |
| F11 ภาษา | badge "อนุมัติแล้ว", audit "ยังไม่มีประวัติการทำรายการ", empty-message ไทย | — |
| F12 ปุ่ม/affordance | back icon arrow + ดินสอเฉพาะ row Draft (view ×2, edit ×1) | `shots/21` |

| F2 sidebar + logo | **ปิดแล้ว** (PR #37): `tbt_nav.js` เมนูเฉพาะโมดูลจริง + active ถูกหน้า + โลโก้ icon (ตัว O gradient) โหลดขึ้นจริง — verify ทั้ง list/form | `shots/26`, `shots/27` |

ค้างรายการเดียว: F10 datepicker format — RFC 0006 เขียนแล้ว (Proposed, #29) รอรีวิว
Test records บน SB2 หลังรอบนี้: BR-2569-0001 (Approved), BR-2569-0002 (Draft), BR-2569-0003 (Draft, id=4)

## รอบ 2 — ERP density + โครงหน้าแนว NetSuite (v1.44.0/1.44.1, RFC 0007, #40)

Feedback "การวางยังไม่สมส่วน อยากได้แนว NetSuite" → ปรับ 3 ชั้น + verify บน SB2:

| เกณฑ์ | ผลวัดจริง | Evidence |
|---|---|---|
| แถวตาราง ≤32px | 32px (เดิม ~44) | `shots/28` |
| Section padding ≤12px | 12px (เดิม 20) | — |
| ปุ่มหลักเห็นโดยไม่ scroll | action bar บนสุด + sticky (top 128px) | `shots/29` |
| สรุปยอดใน header strip | 1 ใบ · ฿500 · ฿35 · ฿535 แสดงขวาของ header | `shots/29` |
| Subtab 3 แท็บ | สลับได้ + modal เพิ่มบรรทัดใน tab แรกทำงาน | — |
| List toolbar แถวเดียว | title ซ้าย · search/filter/สร้าง ขวา · ตารางต่อทันที | `shots/28` |
| Dark + 375px | ผ่าน (stats strip + ปุ่ม wrap เรียบร้อย) | `shots/30`, `shots/31` |
| axe | **0 critical/serious** (v1.44.1 เก็บปุ่ม ghost 4.43→AA) | `shots/32` |

**v1.44.2 (feedback ผู้ใช้ screenshot กรอบแดง — พื้นที่เหลือเยอะ):** ปิดแล้ว —
`tbt-section` ซ่อน header เปล่าบนการ์ด `not-collapsible` ไม่มี title (แถบตาย ~40px ทุกใบ) +
cap `tbt-search` 280px ใน `.tbt-page-toolbar` · วัดจริงหลัง deploy: title top 29px,
ตารางเริ่ม 74px, toolbar แถวเดียว (`shots/33`) · form: action bar 108px, header hidden 2/3 sections
(`shots/34`)

---
เอกสารนี้ขัดกับความจริงเมื่อไหร่ (component แก้แล้ว, layout เปลี่ยน) → อัปเดตผ่าน PR ที่แก้เรื่องนั้น
หรือเปิด QA รอบใหม่ใน `qa/<date>-<topic>/` · เจ้าของ: Wichit Wongta

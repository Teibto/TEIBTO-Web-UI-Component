# QA — Expense claim module deploy (#47)

- วันที่: 2026-07-16 · ผู้ทดสอบ: Wichit Wongta (agent-assisted)
- Scope: deploy โมดูล expense claim ขึ้น SB2 + หน้า entry โครง ERP anatomy (RFC 0007)
- Environment: `4089685_SB2` · script 3337 (`customscript_tbt_sl_expense_claim`) · RESTlet 3336 (`customscript_tbt_rl_expense`) · DS v1.44.2

## ผลรวม

ผ่านทุกแกน — deploy สำเร็จ, หน้าเปิด data จริง (`demo:false`, พนักงาน 225 ราย),
flow save → submit → approve เดินจบบน record จริง, axe 0 critical/serious,
375px ไม่มี horizontal overflow, dark mode ปกติ, console ไม่มี error

## Flow จริงที่ทดสอบ (record EXP-2569-0002, id=2)

| ขั้น | ผล |
|---|---|
| Save ฟอร์มเปล่า | ❌ถูกปฏิเสธ — ข้อความไทยจาก RESTlet: "กรุณาเลือกพนักงาน; กรุณาระบุงวดที่เบิก; ต้องมีรายการค่าใช้จ่ายอย่างน้อย 1 รายการ…" (shots/02) |
| Save draft (พนักงาน + งวด + 1 รายการ 350฿) | ✅ id=2, tranid `EXP-2569-0002`, URL เติม `&id=2`, header + title อัปเดต (shots/04) |
| Refresh ด้วย `?id=2` | ✅ โหลดจาก DB ครบ — วันที่กลับมาเป็น ISO (`TO_CHAR` fix), หมวดแสดง label ไทย |
| Save ซ้ำ | ✅ ยัง id=2 — ไม่สร้าง record ซ้ำ (`applySaved` pattern #22) |
| Submit | ✅ สถานะ "รออนุมัติ", ปุ่มสลับเป็น อนุมัติ/ตีกลับ (shots/05) |
| Approve | ✅ สถานะ "อนุมัติแล้ว", ปุ่ม action หายครบ |
| Crafted POST `submit` บน Approved | ✅ ถูก state machine ปฏิเสธ: "ไม่สามารถส่งอนุมัติในสถานะ \"อนุมัติแล้ว\" ได้" |
| Refresh record Approved | ✅ ฟิลด์ readonly, ปุ่มเพิ่มรายการหาย (shots/06) |

## แกนอื่น

- **axe-core 4.10.2**: 0 critical / 0 serious (หน้า record Approved)
- **375×812**: `scrollWidth` = 375 — ไม่มี horizontal overflow (shots/08)
- **Dark mode**: toggle ทำงาน render ปกติ (shots/07)
- **Sidebar**: เมนู "เบิกค่าใช้จ่าย" (icon `report-money` glyph ขึ้นจริง U+EECD) + active ถูกหน้า, "รับวางบิล" ยังอยู่ครบ
- **Console**: ไม่มี error (มีแต่ log "All dependencies are loaded.")

## Observations (ไม่ blocking)

1. **EXP-2569-0001 (id=1)** — เกิดจาก save ครั้งแรกช่วง session ไม่เสถียรหลัง deploy:
   record ถูกสร้างฝั่ง server แต่ response หายเพราะหน้า reload ผ่าน NetSuite auth
   (URL เปลี่ยนเป็นรูป numeric) ก่อน `applySaved` ทัน — เก็บไว้เป็น test fixture (Draft)
2. **หลัง approve โดยไม่ refresh ฟิลด์ยังไม่ readonly** (ปุ่มหายแล้ว จึงแก้อะไรไม่ได้จริง) —
   behavior เดียวกับ bill-receipt-form ที่ผ่าน QA แล้ว ถ้าจะแก้ควรแก้ทั้งคู่ใน issue เดียว
3. **`tbt-sidebar-item` ไม่ resolve `ICON_ALIASES`** (pitfalls §23 latent gap) — workaround:
   `tbt_nav.js` ใช้ชื่อ Tabler จริง `report-money` แทน alias `expense`
4. **Session SB2 หลุดกลางรอบทดสอบ 2 ครั้ง** — login ผ่าน `customerlogin.jsp` กลับมาได้ทุกครั้ง
   ไม่เจอ 2FA (สอดคล้อง handoff)

## Fixtures บน SB2 หลังรอบนี้

- EXP-2569-0001 (id=1, Draft) — ghost จาก observation 1
- EXP-2569-0002 (id=2, Approved) — flow หลัก

## Screenshots

`shots/01-new-form.png` ฟอร์มใหม่ · `02-validation-thai.png` validation ไทย ·
`03-filled-form.png` กรอกครบ · `04-saved-draft.png` save แล้ว ·
`05-submitted.png` รออนุมัติ · `06-approved-readonly.png` อนุมัติแล้ว (view) ·
`07-dark.png` dark · `08-mobile-375.png` 375px

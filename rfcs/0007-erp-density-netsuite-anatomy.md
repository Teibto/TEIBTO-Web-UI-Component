# RFC 0007 — ERP density + โครงหน้าแนว NetSuite

- Status: **Accepted** (ทิศทางอนุมัติโดย Wichit ในเซสชันรีวิว 2026-07-16)
- Author: Wichit Wongta
- Issue: #40
- Target version: 1.44.0 (MINOR — opt-in density + โครงหน้าใหม่ของ template)

## Summary

หน้า Suitelet ปัจจุบันเป็นแนว "SaaS dashboard": ทุก section เป็นการ์ดลอย (radius 12px +
เงา + padding 20px), ตาราง row ~44px, ปุ่ม action อยู่ล่างสุด, สรุปยอดเป็น KPI card ใหญ่
4 ใบ — ผู้ใช้รู้สึก "ไม่สมส่วน" และอยากได้ความรู้สึกแบบ NetSuite (แน่น แบน ต่อเนื่อง
ปุ่มบนซ้าย) RFC นี้เพิ่ม **density mode `erp`** ที่ระดับ token และปรับ**โครงหน้า**
ของ template ให้ตรงกายวิภาคหน้า NetSuite

## Design

### ชั้น A — density token (opt-in ที่ root, ไม่แตะ component)

```html
<html data-density="erp">   <!-- tbt_page.render ตั้งให้เป็น default; opts.density ปิดได้ -->
```

```css
:root[data-density="erp"] {
  --tbt-space-5: 12px;          /* section padding 20 → 12 */
  --tbt-space-6: 16px;          /* content padding 24 → 16 */
  --tbt-size-base: 13px;        /* 14 → 13 */
  --tbt-radius-lg: 6px;         /* การ์ด 12 → 6 */
  --tbt-shadow-sm: 0 1px 2px rgb(15 23 42 / 0.06);   /* เงาจาง เกือบแบน */
  --tbt-table-cell-py: 5px;     /* row ~44px → ~30px */
}
```

- `tbt-table` เปลี่ยน padding แนวตั้งของ td/th จากเลข hardcode เป็น
  `var(--tbt-table-cell-py, 10px)` — default เดิมไม่เปลี่ยน หน้าที่ไม่ opt-in ไม่กระทบ
- component อื่นกิน token อยู่แล้ว → แน่นขึ้นเองทั้งระบบ

### ชั้น B — form anatomy (bill-receipt-form เป็นหน้านำร่อง)

```
┌────────────────────────────────────────────────────────────┐
│ ใบวางบิล · BR-2569-0003  [ร่าง]    1 ใบ · ฿500 · VAT ฿35 · ฿535 │ ← header + summary strip
│ [ส่งตรวจรับ] [บันทึกร่าง] [พิมพ์] [กลับ]                       │ ← action bar บนสุด (sticky)
├────────────────────────────────────────────────────────────┤
│ ข้อมูลใบวางบิล (field grid เดิม)                              │
├────────────────────────────────────────────────────────────┤
│ [รายการใบแจ้งหนี้ (2)] [การอนุมัติ] [ประวัติ]   ← tbt-tabs      │
│  ตารางเต็มกว้าง แน่น                                          │
└────────────────────────────────────────────────────────────┘
```

- CSS utility ใหม่ใน `theme/tbt-theme.css` (page composition zone):
  `.tbt-action-bar--top` — sticky top ภายใน scroll container, พื้น `--tbt-bg-page`,
  เส้นคั่นล่าง · `.tbt-page-header__stats` — ตัวเลขสรุป inline ขวาของ header
- ตัด section "สรุปยอด" (KPI card 4 ใบ) → ตัวเลข 4 ค่าใน header strip
  (`tbt-stat` ยังอยู่สำหรับ dashboard)
- section รายการใบแจ้งหนี้ / การอนุมัติ / ประวัติ → `tbt-tabs` 3 panel
  (convention ทีมเรียก "Subtab") — ปุ่ม "เพิ่มใบแจ้งหนี้" อยู่ใน panel แรก

### ชั้น C — list anatomy

- Header card เดิม (title + คำอธิบาย + ปุ่มใหญ่) + section แยก → **toolbar แถวเดียว**:
  title ซ้าย · search + filter สถานะ + ปุ่ม "สร้างใบวางบิล" ขวา แล้วตารางต่อทันที
- ใช้ `tbt-section` เดิม (density ทำให้แบนลงเอง) — ไม่สร้าง component ใหม่

## สิ่งที่ไม่ทำใน RFC นี้

- ไม่แตะ dark mode logic (token สี ไม่เปลี่ยน)
- ไม่ทำ density `comfortable`/`compact` หลายระดับ — มีแค่ default กับ `erp`
- ไม่ restyle NetSuite native pages — เฉพาะ Suitelet ของเรา

## เกณฑ์ตรวจรับ

- [ ] วัดจริงบน SB2: row ตาราง ≤32px · section padding ≤12px · ปุ่มหลักเห็นโดยไม่ scroll
- [ ] Subtab 3 แท็บทำงาน (สลับ, เพิ่มบรรทัดใน tab แรก, จำนวนแถวขึ้นบน tab label)
- [ ] Definition of done ตาม `docs/UI-PLAYBOOK.md` §4 ครบ (console, dark, 375/768, axe, real flow)
- [ ] Screenshot เทียบก่อน/หลังเก็บใน `qa/`
- [ ] หน้า/เดโมที่ไม่ opt-in หน้าตาเดิมทุก pixel (default token ไม่เปลี่ยนค่า)

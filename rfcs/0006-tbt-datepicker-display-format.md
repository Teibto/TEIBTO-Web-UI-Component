# RFC 0006 — `tbt-datepicker` display format (YYYY-MM-DD / พ.ศ.)

- Status: **Proposed**
- Author: Wichit Wongta
- Issue: #29 (จาก UX QA baseline 2026-07-16, finding F10)
- Target version: TBD (MINOR — additive prop, พฤติกรรม default เปลี่ยนเฉพาะ display)

## Summary

`tbt-datepicker` ปัจจุบันเป็น native `<input type="date">` ตรง ๆ — browser แสดงวันที่ตาม
locale ของเครื่องผู้ใช้ (`07/16/2026` บน en-US) ขณะที่ทุกส่วนอื่นของหน้า (header, list,
line table) แสดง ISO `2026-07-16` ตาม R2 → ผู้ใช้เห็นสอง format บนจอเดียว
RFC นี้เสนอให้ component ควบคุม display เอง: default เป็น ISO `YYYY-MM-DD`
พร้อมทางเลือก `era="be"` แสดงปี พ.ศ.

## Motivation

- R2 (teibto-dev-standards): วันที่เป็น `YYYY-MM-DD` ทุกที่
- QA จริงบน SB2: form field แสดง `07/16/2026` แต่ header บรรทัดถัดกันแสดง
  `รับเมื่อ 2026-07-16` — สับสนและดูไม่เนียบ (`qa/2026-07-16-bill-receipt-ux/shots/02`)
- native date input ปรับ format ไม่ได้ (browser ล็อกตาม OS locale) — ต้องเปลี่ยนวิธี render

## Design

คง native `<input type="date">` ไว้เป็น **editor** (ได้ calendar picker ฟรี, mobile UX ดี,
value เป็น ISO อยู่แล้ว) แต่ **ซ้อน display layer** เมื่อ input ไม่ได้ focus:

```
สภาวะปกติ (blur):   [ 2026-07-16          📅 ]   ← span แสดง ISO/พ.ศ. ทับ input
กำลังแก้ (focus):   [ native date input       ]   ← เปิด picker ตาม browser ปกติ
```

- `value` ยังเป็น ISO string เสมอ (ไม่กระทบ data contract / RESTlet round-trip)
- display span อ่านจาก `value` → format ตาม prop

### API (additive)

```html
<tbt-datepicker label="วันที่รับวางบิล" value="2026-07-16"></tbt-datepicker>
<!-- default: แสดง "2026-07-16" -->

<tbt-datepicker era="be"></tbt-datepicker>
<!-- แสดง "2569-07-16" (ปี พ.ศ. = ค.ศ. + 543) — value ยังเป็น ISO ค.ศ. -->
```

| Prop | ค่า | ความหมาย |
|---|---|---|
| `era` | `"ce"` (default) · `"be"` | ปีที่แสดงผล — ค.ศ. หรือ พ.ศ. (display เท่านั้น) |

ไม่มี prop เลือก pattern อิสระ (dd/mm ฯลฯ) — R2 บังคับ `YYYY-MM-DD` อยู่แล้ว
การเปิดให้ปรับ pattern = ชวนให้ละเมิดมาตรฐานเอง

### Readonly / view mode

โหมด `readonly` แสดง span format แล้วเหมือนกัน (วันนี้ readonly แสดงตาม locale ของ
browser — ผิด R2 เช่นกัน)

## เกณฑ์ตรวจรับ

- [ ] field วันที่บนฟอร์มรับวางบิลแสดง `2026-07-16` ตรงกับ header/list (ทั้ง view/edit)
- [ ] focus → native picker เปิดปกติ · เลือกวันที่ → display อัปเดตทันทีตอน blur
- [ ] `era="be"` แสดงปี พ.ศ. โดย `value`/round-trip ยังเป็น ISO ค.ศ.
- [ ] test: display format, era, focus/blur toggle, readonly, axe ผ่าน
- [ ] ทุก template ที่ใช้ `tbt-datepicker` ไม่ต้องแก้อะไร (default ดีขึ้นเอง)

## ทางเลือกที่พิจารณาแล้วไม่เอา

1. **custom calendar ทั้งตัว** — ได้ format อิสระแต่แลกกับ a11y/mobile/maintenance
   ที่ native ให้ฟรี · overkill สำหรับปัญหา display อย่างเดียว
2. **text input + parse เอง** — เสีย calendar picker และเปิดช่อง input ผิด format
3. **ปล่อยตาม locale + ตั้ง locale บัญชี NetSuite** — ควบคุมเครื่องผู้ใช้ไม่ได้จริง
   (browser ใช้ OS locale ไม่ใช่ NetSuite preference)

## Impact

- กระทบทุก template ที่ใช้ `tbt-datepicker` (bill receipt, expense, starter kits) —
  เปลี่ยนเฉพาะสิ่งที่ตาเห็น ไม่กระทบ value/event contract
- ต้อง regression: modal เพิ่มใบแจ้งหนี้ (วันที่ default วันนี้), date round-trip
  save→load (บทเรียน CHANGELOG v1.43.1)

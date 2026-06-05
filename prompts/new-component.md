# Prompt template — สร้าง / ต่อยอด tbt-* component

คู่กับ `new-suitelet.md` (สร้าง **หน้า**) — ไฟล์นี้สำหรับงาน **component** ของ DS เอง.
ก่อนสั่ง: เช็ค `component-decision-guide.md` ก่อนว่ามี component ที่ทำได้อยู่แล้วไหม —
ถ้ามี ให้ **ใช้/ต่อยอด** อย่าสร้างใหม่.

> กฎเหล็ก: **component ใหม่ต้องมี RFC ก่อน** (`rfcs/NNNN-<name>.md`). การต่อยอด
> component เดิมที่เพิ่ม API เยอะ ก็ควรมี RFC สั้นๆ บันทึกการตัดสินใจ.

---

## ⚡ ระดับ 1 — ต่อยอด component เดิม (1–3 บรรทัด)

```
ต่อยอด <tbt-xxx> ใน tbt-ds: เพิ่ม <prop/variant/type/behavior>
เพื่อ <ใช้ทำอะไร>. ทำตาม governance + test + verify ในเบราว์เซอร์จริง.
```

**ตัวอย่าง (จริงจาก session นี้):**
> ต่อยอด `tbt-chart`: เพิ่ม type `combo / waterfall / stacked / pareto / gauge`
> สำหรับงานวิเคราะห์. SVG + token เดิม, มี RFC + test + demo.

---

## 🎯 ระดับ 2 — component ใหม่ (มี spec → ได้ RFC ก่อน)

```
สร้าง component ใหม่ <tbt-xxx> ใน tbt-ds

### Intent
- ใช้ทำอะไร / แก้ปัญหาอะไร ที่ component เดิมทำไม่ได้
- วางที่ไหนในหน้า (dashboard tile / form field / page wrapper ...)

### API ที่อยากได้ (หรือให้ AI ออกแบบ)
- Properties : <prop: type — ความหมาย> (หรือ "ออกแบบให้")
- Slots      : <ถ้ามี>
- Events     : <tbt-xxx-... detail {...}>
- Variants   : <ถ้ามี>

### Data shape (ถ้ารับข้อมูล)
- <{ ... } หรือบอกให้ gen mock>

### Constraints (non-negotiable — ดู §ด้านล่าง)
### ขั้นตอน: เขียน RFC ก่อน → ให้ผม confirm API → ค่อย implement
```

---

## 🤖 ระดับ 3 — Design mode (บอกแค่ปัญหา ให้ AI ออกแบบ)

```
Dashboard/หน้า X ต้องการ <ความสามารถ — เช่น "กราฟวิเคราะห์ยอดขาย">.
ควรจัดการ component อย่างไร? เสนอทางเลือก + ข้อจำกัด NetSuite ให้เลือก,
แล้วทำ RFC + implement ตามที่เลือก.
```

AI ต้อง: เสนอ 2–3 ทางพร้อม trade-off (เขียนเอง vs lib, CSP, theme, bundle) →
ให้ผมเลือก → scope ให้แคบ (simplicity-first) → RFC → build.

---

## Constraints (ทุกระดับ — ยึดตาม governance)

- **Lit 3** จาก CDN เดิม (`https://cdn.jsdelivr.net/npm/lit@3/+esm`) — ห้าม drift URL
- **สีจาก `var(--tbt-*)` เท่านั้น** — ห้าม hex literal (lint บล็อก). SVG ใช้
  `fill/stroke="currentColor"` + CSS class ที่ set `color: var(--tbt-*)` → dark mode auto
- **Shadow DOM** — style อยู่ใน `static styles = css\`\`` เท่านั้น. อย่า portal ไป
  `document.body` (เสีย CSS scope — ดู pitfalls §6); ถ้าต้อง escape overflow ใช้ Popover API
- **ห้าม dependency ใหม่** เว้นแต่ RFC อนุมัติ (lib ต้อง host File Cabinet, bundle, version-lock — CSP)
- JSDoc header: `@component` / `@version X.Y.Z` / `@author Wichit Wongta`
- ระวัง pitfalls: backtick ใน CSS comment (§1), sticky/`border-collapse` (§3),
  hybrid `<tbody>` re-render (§7), scroll region `tabindex="0"` (a11y)

---

## Deliverables (component ใหม่ = 4–6 จุด)

1. `components/tbt-xxx.js` — `extends LitElement`, `customElements.define('tbt-xxx', ...)`
2. **export ใน `components/index.js`** (กลุ่มที่เหมาะ — ไม่ลืม ไม่งั้น bundle ไม่มี)
3. `tests/tbt-xxx.test.js` — render ต่อ variant/type + event + **axe** (a11y)
4. demo ใน `demo/specimen.html`; ถ้าเป็น visual ที่ specimen จับไม่ถึง (อยู่ใน app-shell
   ที่ scroll ภายใน) → demo page แยก normal-flow + visual snapshot (เช่น `demo/chart.html`)
5. `rfcs/NNNN-<name>.md` (component ใหม่ / การต่อยอดใหญ่)
6. `CHANGELOG.md [Unreleased]` + `@version` = เวอร์ชัน batch ที่กำลังทำ
   (อย่าแตะ `package.json` — bump ตอน cut release)

---

## Definition of done (รันจริง รายงานเลขจริง — ห้ามเดา)

```
npm run lint        → governance ผ่าน (no-hex, define, @version)
npm run build       → bundle ผ่าน + bundle มี tbt-xxx จริง
npm test            → unit ผ่านทั้ง suite (ไม่ใช่แค่ไฟล์ใหม่)
npm run test:smoke  → ถ้าแตะหน้า Suitelet: ไม่มี console error + render จริง
npm run test:visual → ถ้าเป็น component visual: snapshot ผ่าน (regen baseline ถ้า demo เปลี่ยน)
```
+ ถ้าเป็นงาน UI: **เปิดในเบราว์เซอร์จริง 1 ครั้ง** เช็ค console (build ผ่าน ≠ runtime ผ่าน — pitfalls §21)
+ surface ของที่เจอระหว่างทาง (bug เดิม, snapshot หลุด, ข้อจำกัด) — อย่ากลบ

---

## 💡 สิ่งที่ทำให้ "สั่งง่าย ได้งานดี"

- **บอก intent + ข้อจำกัด ไม่ต้องบอกวิธี** — AI เลือก component/แนวทางจาก guide เอง
- **ให้ AI เสนอ trade-off เมื่อมี fork จริง** (เขียนเอง vs lib, scope เล็ก vs เต็ม) แล้วคุณเลือก
- **กำหนด "done" ชัด** (เทมเพลตด้านบน) → AI loop จนเขียวเองโดยไม่ต้องจ้ำจี้
- **ขอ commit แยกตาม concern** (fix / feat / test) ให้ประวัติอ่านง่าย
- เริ่มจาก scope เล็กที่สุดที่แก้ปัญหาได้ — ขยายทีหลังถ้าจำเป็น (simplicity-first)

## 🚫 อย่าสั่งแบบนี้
- "ทำกราฟสวยๆ" — ไม่มี intent/ข้อมูล → over-engineer. บอกว่าวิเคราะห์อะไร, ข้อมูล shape ไหน
- "เพิ่ม lib ตัวนี้เลย" โดยไม่ดู CSP/governance — ให้ AI ประเมินก่อน
- "สร้าง component ใหม่" ทั้งที่ `component-decision-guide.md` มีของที่ทำได้แล้ว

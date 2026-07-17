# UI Playbook — สร้างหน้า Suitelet ด้วย TBT-DS อย่างเป็นระบบ

เอกสารนี้สำหรับคนที่จะสร้างหรือแก้หน้า Suitelet ในระบบ Teibto ERP
อ่านแล้วเดินงานได้ครบวงจร: สร้างหน้า → ทดสอบ → release → deploy → QA บน account จริง
โดยไม่ทำผิดพลาดที่ทีมเคยจ่ายบทเรียนไปแล้ว (อ้างอิงจาก UX QA baseline 2026-07-16, issues #22–#29)

Canonical: ไฟล์นี้คือแหล่งเดียวของ workflow UI — skill `teibto-ui-component` (API reference)
และ `tbt-ds-pitfalls` (กับดักเชิงเทคนิค) ลิงก์กลับมาที่นี่

## 1. ภาพรวม flow

```
RFC (component ใหม่เท่านั้น) → เขียน template + Suitelet → unit test + lint
→ PR (แยกเรื่อง, squash) → cut version → deploy File Cabinet → verify บน browser จริง → ปิด issue
```

กติกาที่ไม่มีข้อยกเว้น:

| กติกา | ที่มา |
|---|---|
| Component ใหม่ต้องมี RFC ใน `rfcs/` ก่อน | CONTRIBUTING |
| PR แยกเรื่อง 1 PR = 1 ประเด็น · squash-only | governance |
| ทุกการเปลี่ยน = CHANGELOG `[Unreleased]` | R7 |
| Production อ้าง DS แบบ pin version (`/ds/v<X.Y.Z>/`) ห้าม latest | CLAUDE.md |
| แก้อะไรก็ตามที่ผู้ใช้เห็น → verify บน SB2 ผ่าน browser จริงก่อนปิด | ทีม convention |

## 2. สร้างหน้าใหม่

โครงหน้า = 3 ไฟล์ (ดูตัวอย่างจริง: bill receipt — production-grade reference):

| ไฟล์ | หน้าที่ |
|---|---|
| `templates/sl_<page>.js` | Suitelet บาง ๆ: โหลด data, resolve URL, เรียก `tbtPage.render()` |
| `templates/<page>.html` | body: DS components + `<script type="module">` อ่าน `window.__DATA__` |
| `netsuite/<module>_lib.js` + `_meta.js` | data access + validation + state machine (แชร์ Suitelet/RESTlet) |

กติกา data contract:

- URL ใช้ internal id (`?id=3`) · แสดงผลใช้ tranid (`BR-2569-0002`)
- Suitelet resolve URL ทุกเส้นที่หน้าใช้ผ่าน `N/url.resolveScript` แล้วส่งเข้า data
  (`restletUrl`, `listUrl`, `formUrl`) — ห้าม hardcode path (`/sc/...` = 404 บน NetSuite, issue #17)
- ทุกหน้าต้องส่ง `listUrl` ให้ปุ่มกลับ fallback ได้เมื่อเปิดจาก direct link

## 3. กติกา UI ที่เคยพลาดแล้ว (บังคับเช็คทุกหน้าใหม่)

แต่ละข้อคือ bug จริงจาก QA 2026-07-16 — รายละเอียดเชิงเทคนิคอยู่ใน skill `tbt-ds-pitfalls`

1. **Save ต้องรับ identity กลับ** — RESTlet คืน `{ ok, id, tranid, status }` และหน้า
   ต้องมี `applySaved()`: เซ็ต `v.id/tranid/status`, อัปเดต header + `document.title`,
   `history.replaceState` เติม `&id=`, re-evaluate ปุ่มตามสถานะ
   ทิ้ง response = กดบันทึกซ้ำสร้าง record ซ้ำ (#22)
2. **Submit จากฟอร์มยังไม่ save** → save เป็น draft ก่อนใน handler เดียวกัน
   ห้ามปล่อยให้ backend ตอบ transition error ดิบ (#26)
3. **ทุก string ที่ผู้ใช้เห็นเป็นไทย** — รวม `placeholder`, `empty-message`,
   badge (`statusLabel` ของ approval-flow), และ**ข้อความ error จาก backend**
   (validate/transition ใน `_lib.js`/`_meta.js` โชว์ตรงใน alert — เขียนเป็นไทยตั้งแต่ต้นทาง) (#26)
4. **Icon ผ่าน alias map เสมอ** — component ที่ render Tabler เอง ต้อง resolve ผ่าน
   `ICON_ALIASES` (export จาก `tbt-icon.js`) ห้าม `ti ti-${name}` ตรง ๆ (#25)
5. **ปุ่ม**: primary เดียวต่อสถานะ · ปุ่มกลับใช้ `icon="back"` (ไม่ใช่ `cancel` ⊘) +
   fallback `listUrl` · action icon ใน list โชว์เฉพาะที่ทำได้จริง (ดินสอเฉพาะ Draft) (#26)
6. **Filter dropdown ใน actions slot ของ section** → ใส่ `auto-width`
   (ไม่งั้น collapse เหลือ min-content แล้ว truncate placeholder) (#27)
7. **Header ของหน้า**: subtitle ประกอบจากส่วนที่มีค่า — ห้ามมี separator/label ห้อยลอย
   บนฟอร์มใหม่ (#26)

## 4. Definition of done — เช็คก่อน merge ทุก PR ที่แตะ UI

```sh
npm run lint                        # governance: token-only, no hex
npx web-test-runner tests/<ที่แตะ>.test.js --node-resolve
npm run build                       # bundle ต้องผ่าน (แต่ผ่าน ≠ runtime รอด — ดูข้อถัดไป)
```

แล้วเปิด browser จริง (dev server หรือ SB2):

- [ ] Console ไม่มี error (bundle ผ่านแต่ runtime พังได้ — pitfalls §21)
- [ ] Light + dark (toggle ที่ footer sidebar — ต้อง persist ข้ามหน้า)
- [ ] 375px: hamburger + card view + header section ไม่แตกคำ · 768px: table เลื่อนแนวนอนได้
- [ ] axe-core: 0 critical/serious (inject จาก CDN แล้ว `axe.run(document)`)
- [ ] เดิน flow จริงจนจบ: save → เลขเอกสารขึ้น + URL มี id → refresh แล้วได้หน้าเดิม → save ซ้ำไม่สร้าง record ใหม่

## 5. Release + deploy ไป NetSuite (SuiteCloud SDF — canonical ตั้งแต่ v1.46.0)

เลิก File Cabinet upload มือแล้ว — deploy ผ่าน SDF project (`tbt-ds/` staging, gitignored,
`defaultAuthId: teibto-sb2`). ทำจริง v1.46.0 (2026-07-17). รายละเอียด `netsuite/DEPLOY.md`.

1. `node scripts/sync-version.js X.Y.Z` — อัปเดต `package.json` + `components/*.js @version`
   + `README.md` + `templates/*.html` (`/ds/vX.Y.Z/`) + `netsuite/tbt_page.js` `DS_VERSION`
   ให้อัตโนมัติ (#62 ครอบให้แล้ว — ไม่ต้องแก้มือ) · ย้าย CHANGELOG `[Unreleased]` → `[X.Y.Z] - YYYY-MM-DD` เอง
2. `npm run build` → `dist/tbt-ds.min.js` + `tbt-theme.css` (+ `tbt-page-runtime.js` hand-authored)
3. `npm run sync:sdf` → **copy เฉพาะ `dist/` เข้า staging** — ⚠️ ไม่ copy `tbt_page.js`/backend
   ให้ `cp netsuite/tbt_page.js sdf/src/FileCabinet/SuiteScripts/Teibto/` เอง (+ source อื่นที่แก้:
   `netsuite/*.js`, `templates/sl_*.js`, `*.html`) ไม่งั้น deploy สำเร็จแต่ DS_VERSION บน account ยัง
   stale (เจอจริง 2026-07-16). เช็คด้วย `diff` ก่อน deploy
4. `cd sdf` → `suitecloud project:validate --server` → `suitecloud project:deploy --dryrun`
5. **อ่าน dryrun ก่อน deploy เสมอ (footgun).** bundle-only release ต้องเห็นแค่ `Create folder` +
   `Upload file` ใต้ `~/FileCabinet/.../ds/vX.Y.Z/` (+ `tbt_page.js`). ถ้าโชว์ `Update object` ของ
   record/field/script/deployment (bill-receipt/expense) = `deploy.xml` เต็มมี `~/Objects/*` จะ
   re-push ทับ Object ทั้ง 40+ ตัว เสี่ยง drift → **scope `deploy.xml` เหลือ**
   `<deploy><files><path>~/FileCabinet/*</path></files></deploy>` (backup ตัวเต็มไว้ คืนหลัง deploy)
   แล้ว dryrun ซ้ำให้เหลือแค่ file ops (ทำจริง v1.46.0 → deploy 2 วินาที)
6. `suitecloud project:deploy` — สร้างโฟลเดอร์ version ใหม่ (ห้ามทับ version เก่า — pages ที่ pin
   version เดิมต้องยังโหลดได้)
7. Verify (ไม่ต้อง browser): `MSYS_NO_PATHCONV=1 suitecloud file:import --paths "/SuiteScripts/Teibto/tbt_page.js"`
   แล้ว `diff` `DS_VERSION` กับ source (git-bash แปลง path ต้อง `MSYS_NO_PATHCONV=1`)
8. Browser smoke (ยืนยัน consumer จริง) — ดู skill `netsuite-qa-browser` §SB2. จุดสำคัญ: บน SB2
   bundle โหลดผ่าน `media.nl?id=..` (N/file.url) ไม่ใช่ path `/ds/vX.Y.Z/` → **ตรวจ version ด้วย
   dynamic-import**: `import(<media.nl js url>)` แล้วเช็ค export ที่มีเฉพาะ version นั้น (เช่น
   `m.initListPage` = v1.46.0/#64) + `demoBanner === none` (backend จริง ไม่ fallback)
9. tag `vX.Y.Z` + GitHub release

## 6. QA รอบใหม่ (baseline/regression)

เก็บผลใน `qa/<YYYY-MM-DD>-<topic>/` (qa-report.md + shots/) ตาม template ของ
`teibto-doc-standard` — 5 แกน: visual ทุก state · dark · responsive 375/768 · axe · flow จริง
ตัวอย่างเต็ม: `qa/2026-07-16-bill-receipt-ux/`

## 7. Sidebar production (`templates/tbt_nav.js`)

หน้า Suitelet ทุกหน้าบน NetSuite ต้องใช้ `nav.sidebar()` — เมนูมีเฉพาะโมดูลที่ deploy จริง
href resolve ผ่าน `N/url` ตอน request (ไม่มีทางเกิดลิงก์ตาย) เพิ่มโมดูลใหม่ = เพิ่ม entry
เดียวใน `MODULES` ของ `tbt_nav.js` + `cp` เข้า staging ตอน deploy
`DEFAULT_SIDEBAR` ใน `tbt_page.js` มีไว้สำหรับ demo บน dev server เท่านั้น
โลโก้ brand: `netsuite/assets/teibtologo.png` (icon จัตุรัส) → File Cabinet
`/SuiteScripts/Teibto/assets/` — `tbt_page` resolve เป็น optional asset เอง

## 8. เรื่องที่ยังเปิดอยู่ (อย่าเผลอทำซ้ำก่อนตัดสินใจ)

- วันที่ใน `tbt-datepicker` แสดงตาม locale browser (mm/dd/yyyy) ขัด R2 —
  RFC 0006 สถานะ Proposed (#29) รอรีวิวก่อน implement

---
เอกสารนี้ขัดกับความจริงเมื่อไหร่ → แก้ใน PR เดียวกับโค้ดที่ทำให้มันล้าสมัย · เจ้าของ: Wichit Wongta

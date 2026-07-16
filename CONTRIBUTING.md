# Contributing — กติกาการทำงานใน repo นี้

> เอกสารนี้สำหรับทุกคนที่จะแก้โค้ดหรือเอกสารใน repo นี้ — อ่านแล้วเดินงานได้ตั้งแต่เปิด Issue จนถึง release
> กติกากลางของทีมอยู่ที่ [teibto-dev-standards](https://github.com/Teibto/teibto-dev-standards) (repo นี้ pin tag `v0.13.0`)

## Flow 8 ขั้น

| ขั้น | ทำอะไร | เงื่อนไขผ่าน |
|------|--------|--------------|
| 1. Issue | เปิดผ่าน issue form (bug / feature) — CLI ต้อง mirror หัวข้อให้ครบ | มีเกณฑ์ตรวจรับชัดเจน |
| 2. Assign | จองงานด้วยการ assign ตัวเอง | 1 คนต่อ issue · งานมี assignee แล้วห้ามทำซ้อน |
| 3. Branch | แตกจาก `main`: `feat/<name>` หรือ `fix/<name>` | 1 issue = 1 branch = 1 PR |
| 4. QA | `npm run lint` + `npm test` เขียว · component ใหม่/แก้ visual เปิด `demo/specimen.html` ตรวจ light + dark | เขียวครบก่อนเปิด PR |
| 5. PR | เปิดเข้า `main` ตาม template · doc ที่กระทบไปกับ PR เดียวกัน (README / CHANGELOG / rfcs) | reviewer ≥ 1 · quality-gate ผ่าน |
| 6. Squash | merge แบบ squash เท่านั้น (ระบบปิด merge commit/rebase ไว้แล้ว) | head branch ถูกลบอัตโนมัติ |
| 7. Deploy | อัปโหลด `dist/` ขึ้น File Cabinet `/SuiteScripts/Teibto/ds/v<X.Y.Z>/` ตาม [netsuite/DEPLOY.md](netsuite/DEPLOY.md) | hash-verify ไฟล์บนปลายทาง |
| 8. Release | ย้าย `[Unreleased]` ใน CHANGELOG เป็น version · bump `package.json` (`npm run version:sync`) · tag `v<X.Y.Z>` | tag message มีวันที่ `YYYY-MM-DD` |

## กติกากันงานซ้อน

- assign = จอง — เห็นชื่อคนอื่นบน issue แล้วอย่าเริ่มงานเดียวกัน
- จะแตะไฟล์ที่ PR อื่นเปิดค้างอยู่ (ดูจาก Files changed ของ PR นั้น) ให้คุยกันก่อน
- repo ต้องเหลือเฉพาะ branch ถาวรคือ `main` — เจอ branch ค้างหลัง merge ให้ตรวจ PR ของมันแล้วลบ

## Docs impact — แก้ตรงไหน ต้องตามไปแก้อะไร

| แก้อะไร | doc ที่ต้องไปด้วยใน PR เดียวกัน |
|---------|--------------------------------|
| component ใหม่ | RFC ใน `rfcs/` (ก่อนเขียนโค้ด) · README §Component reference · test ใน `tests/` |
| API/prop ของ component เดิม | README ส่วนที่เกี่ยว · CHANGELOG `[Unreleased]` |
| design token | `theme/tbt-theme.css` เท่านั้น + README §Design tokens |
| backend ใน `netsuite/` | `netsuite/DEPLOY.md` |
| กติกาใน CONTRIBUTING / CLAUDE.md | ต้องเดิน PR เสมอ ห้าม direct push |

## ความรู้อยู่ที่ไหน

| เรื่อง | ไฟล์ |
|--------|------|
| API ทุก component | `custom-elements.json` + README §Component reference |
| กติกา governance ของ DS (ห้าม hex, tokens only) | `scripts/lint-governance.js` + CLAUDE.md |
| วิธี deploy ขึ้น NetSuite | `netsuite/DEPLOY.md` |
| ของห้ามหลุด + secret หลุดต้องทำอะไร | [SECURITY.md](SECURITY.md) |
| กติกาการปฏิบัติต่อกัน | [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) |

---
*กติกานี้ขัดกับความจริงเมื่อไหร่ แก้ผ่าน PR ทันทีตาม flow ปกติ — อย่าปล่อยให้ตัวหนังสือกับ practice เดินคนละทาง*

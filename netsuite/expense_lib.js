/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * expense_lib.js — data access + validation for the employee expense claim
 * custom record. Shared by the Suitelet (read) and the RESTlet (write). Mirrors
 * bill_receipt_lib. Cannot be unit-tested outside NetSuite — see DEPLOY.md.
 */
define(['N/record', 'N/query', 'N/runtime', './expense_meta'],
(record, query, runtime, meta) => {

  const { REC, LINE_REC, F, LF } = meta;

  /* ── Validation ────────────────────────────────────────────────────── */

  // Messages are user-facing (shown verbatim in the form's error alert) —
  // Thai, matching the UI language (UI-PLAYBOOK §3.3).
  function validate(claim, lines) {
    const errs = [];
    if (!claim) { errs.push('ไม่พบข้อมูลใบเบิกค่าใช้จ่าย'); return errs; }
    if (!claim.employee) errs.push('กรุณาเลือกพนักงาน');
    if (!claim.period) errs.push('กรุณาระบุงวดที่เบิก');
    const rows = lines || [];
    if (!rows.length) errs.push('ต้องมีรายการค่าใช้จ่ายอย่างน้อย 1 รายการ — กด "เพิ่มค่าใช้จ่าย" ก่อนบันทึก');
    rows.forEach((r, i) => {
      const n = i + 1;
      if (!r.date) errs.push(`รายการที่ ${n}: กรุณาระบุวันที่`);
      else if (!/^\d{4}-\d{2}-\d{2}$/.test(String(r.date))) {
        errs.push(`รายการที่ ${n}: วันที่ต้องอยู่ในรูปแบบ YYYY-MM-DD (ได้รับ "${r.date}")`);
      }
      if (!r.category) errs.push(`รายการที่ ${n}: กรุณาเลือกหมวดค่าใช้จ่าย`);
      if (!r.merchant) errs.push(`รายการที่ ${n}: กรุณาระบุร้านค้า/ผู้ให้บริการ`);
      if (!(Number(r.amount) > 0)) errs.push(`รายการที่ ${n}: จำนวนเงินต้องมากกว่า 0`);
    });
    return errs;
  }

  /* ── Helpers ───────────────────────────────────────────────────────── */

  const p2 = (n) => String(n).padStart(2, '0');
  const toIso = (d) => d ? (d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate())) : '';
  // Strict: a non-ISO string must fail loudly here — passing an Invalid Date
  // into record.setValue throws mid-write (same trap bill_receipt_lib hit on
  // SB2 2026-07-16: replaceLines had already deleted the old lines).
  const fromIso = (s) => {
    if (!s) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s));
    if (!m) throw new Error(`Invalid date "${s}" — expected YYYY-MM-DD`);
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  };

  /* ── List ──────────────────────────────────────────────────────────── */

  function list(filters) {
    const f = filters || {};
    const where = ['1=1'];
    const params = [];
    if (f.status)   { where.push(`h.${F.status} = ?`);   params.push(f.status); }
    if (f.employee) { where.push(`h.${F.employee} = ?`); params.push(f.employee); }

    const sql = `
      SELECT h.id, h.${F.tranid} AS tranid, h.${F.employee} AS employeeid,
             BUILTIN.DF(h.${F.employee}) AS employee,
             h.${F.period} AS period, h.${F.status} AS status, h.${F.total} AS total,
             (SELECT COUNT(*) FROM ${LINE_REC} l WHERE l.${LF.parent} = h.id) AS linecount
      FROM ${REC} h
      WHERE ${where.join(' AND ')}
      ORDER BY h.id DESC`;

    return query.runSuiteQL({ query: sql, params }).asMappedResults().map((r) => ({
      id: r.id,
      tranid: r.tranid,
      employee: r.employee,
      employeeId: String(r.employeeid || ''),
      period: r.period || '',
      lineCount: Number(r.linecount || 0),
      total: Number(r.total || 0),
      status: r.status || 'Draft',
    }));
  }

  /* ── Load one claim + lines ────────────────────────────────────────── */

  function load(id) {
    const rec = record.load({ type: REC, id });
    const claim = {
      id,
      tranid:     rec.getValue(F.tranid),
      employeeId: String(rec.getValue(F.employee) || ''),
      employee:   rec.getText(F.employee),
      period:     rec.getValue(F.period),
      status:     rec.getValue(F.status) || 'Draft',
    };
    // TO_CHAR forces ISO regardless of the account's date format preference —
    // raw SuiteQL dates come back as e.g. "16/7/2026", which breaks the
    // load → edit → save round-trip (fromIso expects ISO).
    const lineSql = `
      SELECT id, TO_CHAR(${LF.date}, 'YYYY-MM-DD') AS dt, ${LF.category} AS category, ${LF.merchant} AS merchant,
             ${LF.amount} AS amount, ${LF.billable} AS billable, ${LF.receipt} AS receipt, ${LF.memo} AS memo
      FROM ${LINE_REC} WHERE ${LF.parent} = ? ORDER BY id`;
    const lines = query.runSuiteQL({ query: lineSql, params: [id] }).asMappedResults().map((r) => ({
      id: String(r.id),
      date: r.dt ? String(r.dt).slice(0, 10) : '',
      category: r.category || '',
      merchant: r.merchant || '',
      amount: Number(r.amount || 0),
      billable: r.billable === true || r.billable === 'T',
      receipt: r.receipt || '',
      memo: r.memo || '',
    }));
    return { claim, lines };
  }

  /* ── Employee options ──────────────────────────────────────────────── */

  function employees() {
    const sql = `SELECT id, entityid FROM employee WHERE isinactive = 'F' ORDER BY entityid`;
    return query.runSuiteQL({ query: sql }).asMappedResults().map((r) => ({
      value: String(r.id), label: r.entityid,
    }));
  }

  /* ── Save (create/update header + replace lines) ───────────────────── */

  function save(claim, lines, nextStatus, editsFields) {
    const isNew = !claim.id;
    const rec = isNew ? record.create({ type: REC }) : record.load({ type: REC, id: claim.id });

    // Returned to the client so the form can adopt the generated claim no.
    // after the first save (without it the page stays in "new" state and a
    // second save creates a duplicate — same bug as bill receipt QA F1).
    let tranid = claim.tranid || '';
    if (isNew) {
      tranid = nextTranId();
      rec.setValue(F.tranid, tranid);
      // Custom records require the native Name field — mirror the tranid so
      // NetSuite lists/search stay readable.
      rec.setValue('name', tranid);
    } else if (!tranid) {
      tranid = String(rec.getValue(F.tranid) || '');
    }

    if (editsFields) {
      rec.setValue(F.employee, Number(claim.employee) || claim.employee);
      rec.setValue(F.period, claim.period || '');
      rec.setValue(F.total, (lines || []).reduce((s, r) => s + Number(r.amount || 0), 0));
    }
    rec.setValue(F.status, nextStatus);
    const id = rec.save({ enableSourcing: true, ignoreMandatoryFields: false });

    if (editsFields) replaceLines(id, lines || []);
    return { id, tranid };
  }

  function replaceLines(parentId, lines) {
    // Convert every value BEFORE deleting anything — record writes are not
    // transactional, so a conversion error after the delete pass would destroy
    // the existing lines with nothing to replace them (bill receipt hit this
    // on SB2 2026-07-16 via the non-ISO SuiteQL date round-trip).
    const prepared = (lines || []).map((r) => ({
      name: r.merchant || 'line', // native Name is mandatory
      date: fromIso(r.date),
      category: r.category || '',
      merchant: r.merchant || '',
      amount: Number(r.amount || 0),
      billable: !!r.billable,
      receipt: r.receipt || '',
      memo: r.memo || '',
    }));

    const existing = query.runSuiteQL({
      query: `SELECT id FROM ${LINE_REC} WHERE ${LF.parent} = ?`, params: [parentId],
    }).asMappedResults();
    existing.forEach((e) => record.delete({ type: LINE_REC, id: e.id }));

    prepared.forEach((p) => {
      const lr = record.create({ type: LINE_REC });
      lr.setValue('name', p.name);
      lr.setValue(LF.parent, parentId);
      lr.setValue(LF.date, p.date);
      lr.setValue(LF.category, p.category);
      lr.setValue(LF.merchant, p.merchant);
      lr.setValue(LF.amount, p.amount);
      lr.setValue(LF.billable, p.billable);
      lr.setValue(LF.receipt, p.receipt);
      lr.setValue(LF.memo, p.memo);
      lr.save();
    });
  }

  function nextTranId() {
    const by = new Date().getFullYear() + 543;
    const prefix = 'EXP-' + by + '-';
    const rs = query.runSuiteQL({
      query: `SELECT COUNT(*) AS n FROM ${REC} WHERE ${F.tranid} LIKE ?`, params: [prefix + '%'],
    }).asMappedResults();
    const n = Number(rs[0] && rs[0].n || 0) + 1;
    return prefix + String(n).padStart(4, '0');
  }

  /* ── Permission gate ───────────────────────────────────────────────── */

  function permissionError(action) {
    if (['approve', 'reject', 'pay'].indexOf(action) === -1) return '';
    const role = runtime.getCurrentUser().role;
    // 3 = Administrator · 1038 = TT - Accountant (ผู้อนุมัติจริง, #48 — confirmed 2026-07-16)
    const APPROVER_ROLES = [3, 1038];
    const TH = { approve: 'อนุมัติ', reject: 'ตีกลับ', pay: 'บันทึกจ่ายคืน' };
    return APPROVER_ROLES.indexOf(role) === -1
      ? 'คุณไม่มีสิทธิ์' + (TH[action] || action) + 'ใบเบิกค่าใช้จ่าย' : '';
  }

  return { validate, list, load, employees, save, permissionError, toIso, fromIso };
});

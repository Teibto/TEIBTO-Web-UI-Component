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

  function validate(claim, lines) {
    const errs = [];
    if (!claim) { errs.push('Missing claim'); return errs; }
    if (!claim.employee) errs.push('Employee is required');
    if (!claim.period) errs.push('Period is required');
    const rows = lines || [];
    if (!rows.length) errs.push('At least one expense line is required');
    rows.forEach((r, i) => {
      const n = i + 1;
      if (!r.date) errs.push(`Line ${n}: date is required`);
      if (!r.category) errs.push(`Line ${n}: category is required`);
      if (!r.merchant) errs.push(`Line ${n}: merchant is required`);
      if (!(Number(r.amount) > 0)) errs.push(`Line ${n}: amount must be greater than 0`);
    });
    return errs;
  }

  /* ── Helpers ───────────────────────────────────────────────────────── */

  const p2 = (n) => String(n).padStart(2, '0');
  const toIso = (d) => d ? (d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate())) : '';
  const fromIso = (s) => { if (!s) return null; const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d); };

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
    const lineSql = `
      SELECT id, ${LF.date} AS dt, ${LF.category} AS category, ${LF.merchant} AS merchant,
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
    if (isNew) rec.setValue(F.tranid, nextTranId());

    if (editsFields) {
      rec.setValue(F.employee, Number(claim.employee) || claim.employee);
      rec.setValue(F.period, claim.period || '');
      rec.setValue(F.total, (lines || []).reduce((s, r) => s + Number(r.amount || 0), 0));
    }
    rec.setValue(F.status, nextStatus);
    const id = rec.save({ enableSourcing: true, ignoreMandatoryFields: false });

    if (editsFields) replaceLines(id, lines || []);
    return id;
  }

  function replaceLines(parentId, lines) {
    const existing = query.runSuiteQL({
      query: `SELECT id FROM ${LINE_REC} WHERE ${LF.parent} = ?`, params: [parentId],
    }).asMappedResults();
    existing.forEach((e) => record.delete({ type: LINE_REC, id: e.id }));

    lines.forEach((r) => {
      const lr = record.create({ type: LINE_REC });
      lr.setValue(LF.parent, parentId);
      lr.setValue(LF.date, fromIso(r.date));
      lr.setValue(LF.category, r.category || '');
      lr.setValue(LF.merchant, r.merchant || '');
      lr.setValue(LF.amount, Number(r.amount || 0));
      lr.setValue(LF.billable, !!r.billable);
      lr.setValue(LF.receipt, r.receipt || '');
      lr.setValue(LF.memo, r.memo || '');
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
    const APPROVER_ROLES = [3]; // 3 = Administrator — replace at deploy time
    return APPROVER_ROLES.indexOf(role) === -1
      ? 'You do not have permission to ' + action + ' an expense claim' : '';
  }

  return { validate, list, load, employees, save, permissionError, toIso, fromIso };
});

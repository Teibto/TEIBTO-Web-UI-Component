/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * bill_receipt_lib.js — data access + validation for the vendor bill receipt
 * (รับวางบิล) custom record. Pure server logic, shared by the Suitelet (read)
 * and the RESTlet (write). No UI, no globals.
 *
 * Production note: this is real N/record + N/query code written against the
 * schema in bill_receipt_meta.js. It cannot be unit-tested outside NetSuite
 * (the N/* modules only exist in the SuiteScript runtime), so it ships with
 * the deploy guide instead — see netsuite/DEPLOY.md.
 */
define(['N/record', 'N/query', 'N/search', 'N/runtime', './bill_receipt_meta'],
(record, query, search, runtime, meta) => {

  const { REC, LINE_REC, F, LF } = meta;

  /* ── Validation ────────────────────────────────────────────────────── */

  // Validate the inbound voucher payload. Returns an array of error strings
  // (empty = valid). Server-side gate — never trust the client.
  function validate(voucher, lines) {
    // Messages are user-facing (shown verbatim in the form's error alert) —
    // Thai, matching the UI language.
    const errs = [];
    if (!voucher) { errs.push('ไม่พบข้อมูลใบวางบิล'); return errs; }
    if (!voucher.vendor) errs.push('กรุณาเลือกผู้จำหน่าย');
    if (!voucher.receiveDate) errs.push('กรุณาระบุวันที่รับวางบิล');
    if (!voucher.dueDate) errs.push('กรุณาระบุวันครบกำหนดชำระ');
    if (voucher.receiveDate && voucher.dueDate && voucher.dueDate < voucher.receiveDate) {
      errs.push('วันครบกำหนดชำระต้องไม่ก่อนวันที่รับวางบิล');
    }
    const rows = lines || [];
    if (!rows.length) errs.push('ต้องมีใบแจ้งหนี้อย่างน้อย 1 รายการ — กด "เพิ่มใบแจ้งหนี้" ก่อนบันทึก');
    rows.forEach((r, i) => {
      const n = i + 1;
      if (!r.invoiceNo) errs.push(`รายการที่ ${n}: กรุณาระบุเลขที่ใบแจ้งหนี้`);
      if (!r.invoiceDate) errs.push(`รายการที่ ${n}: กรุณาระบุวันที่ใบแจ้งหนี้`);
      else if (!/^\d{4}-\d{2}-\d{2}$/.test(String(r.invoiceDate))) {
        errs.push(`รายการที่ ${n}: วันที่ต้องอยู่ในรูปแบบ YYYY-MM-DD (ได้รับ "${r.invoiceDate}")`);
      }
      if (!(Number(r.amount) > 0)) errs.push(`รายการที่ ${n}: ยอดก่อนภาษีต้องมากกว่า 0`);
      if (Number(r.vat) < 0) errs.push(`รายการที่ ${n}: ภาษีมูลค่าเพิ่มติดลบไม่ได้`);
    });
    return errs;
  }

  /* ── Helpers ───────────────────────────────────────────────────────── */

  const toIso = (d) => {
    if (!d) return '';
    // NetSuite Date object → 'YYYY-MM-DD'
    const p = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  };
  const fromIso = (s) => {
    if (!s) return null;
    // Strict: a non-ISO string must fail loudly here — passing an Invalid Date
    // into record.setValue throws mid-write (replaceLines had already deleted
    // the old lines when this bit us on SB2, 2026-07-16).
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s));
    if (!m) throw new Error(`Invalid date "${s}" — expected YYYY-MM-DD`);
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  };

  /* ── Read: list (SuiteQL — one round-trip, header + line aggregate) ──── */

  function list(filters) {
    const f = filters || {};
    const where = ['1=1'];
    const params = [];
    if (f.status) { where.push(`h.${F.status} = ?`); params.push(f.status); }
    if (f.vendor) { where.push(`h.${F.vendor} = ?`); params.push(f.vendor); }

    const sql = `
      SELECT h.id, h.${F.tranid} AS tranid, h.${F.vendor} AS vendorid,
             BUILTIN.DF(h.${F.vendor}) AS vendor,
             TO_CHAR(h.${F.receiveDate}, 'YYYY-MM-DD') AS receivedate,
             TO_CHAR(h.${F.dueDate}, 'YYYY-MM-DD') AS duedate,
             h.${F.status} AS status, h.${F.total} AS total,
             (SELECT COUNT(*) FROM ${LINE_REC} l WHERE l.${LF.parent} = h.id) AS invoicecount
      FROM ${REC} h
      WHERE ${where.join(' AND ')}
      ORDER BY h.${F.receiveDate} DESC, h.id DESC`;

    const rs = query.runSuiteQL({ query: sql, params });
    return rs.asMappedResults().map((r) => ({
      id: r.id,
      tranid: r.tranid,
      vendor: r.vendor,
      vendorId: String(r.vendorid),
      receiveDate: r.receivedate ? String(r.receivedate).slice(0, 10) : '',
      dueDate: r.duedate ? String(r.duedate).slice(0, 10) : '',
      invoiceCount: Number(r.invoicecount || 0),
      total: Number(r.total || 0),
      status: r.status || 'Draft',
    }));
  }

  /* ── Read: one voucher + its lines ─────────────────────────────────── */

  function load(id) {
    const rec = record.load({ type: REC, id });
    const voucher = {
      id,
      tranid:      rec.getValue(F.tranid),
      vendorId:    String(rec.getValue(F.vendor) || ''),
      vendor:      rec.getText(F.vendor),
      receiveDate: toIso(rec.getValue(F.receiveDate)),
      dueDate:     toIso(rec.getValue(F.dueDate)),
      contact:     rec.getValue(F.contact),
      reference:   rec.getValue(F.reference),
      status:      rec.getValue(F.status) || 'Draft',
    };

    // TO_CHAR forces ISO regardless of the account's date format preference —
    // raw SuiteQL dates come back as e.g. "16/7/2026", which breaks the
    // load → edit → save round-trip (fromIso expects ISO).
    const lineSql = `
      SELECT id, ${LF.invoiceNo} AS invoiceno,
             TO_CHAR(${LF.invoiceDate}, 'YYYY-MM-DD') AS invoicedate,
             ${LF.poNo} AS pono, ${LF.amount} AS amount, ${LF.vat} AS vat, ${LF.memo} AS memo
      FROM ${LINE_REC} WHERE ${LF.parent} = ? ORDER BY id`;
    const lines = query.runSuiteQL({ query: lineSql, params: [id] }).asMappedResults().map((r) => ({
      id: String(r.id),
      invoiceNo: r.invoiceno,
      invoiceDate: r.invoicedate ? String(r.invoicedate).slice(0, 10) : '',
      poNo: r.pono || '',
      amount: Number(r.amount || 0),
      vat: Number(r.vat || 0),
      memo: r.memo || '',
    }));

    return { voucher, lines };
  }

  /* ── Vendor options for the dropdown ───────────────────────────────── */

  function vendors() {
    const sql = `SELECT id, entityid, companyname FROM vendor WHERE isinactive = 'F' ORDER BY entityid`;
    return query.runSuiteQL({ query: sql }).asMappedResults().map((r) => ({
      value: String(r.id),
      label: r.companyname || r.entityid,
    }));
  }

  /* ── Write: create/update header + replace lines (transactional-ish) ── */

  // Persist a voucher. `nextStatus` is the validated target status from the
  // state machine; `editsFields` says whether header/line edits are allowed
  // for this transition (approve/reject/pay change only status).
  function save(voucher, lines, nextStatus, editsFields) {
    const isNew = !voucher.id;
    const rec = isNew
      ? record.create({ type: REC })
      : record.load({ type: REC, id: voucher.id });

    // Returned to the client so the form can adopt the generated document no.
    // after the first save (F1: without it the page stayed in "new" state).
    let tranid = voucher.tranid || '';
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
      rec.setValue(F.vendor, Number(voucher.vendor) || voucher.vendor);
      rec.setValue(F.receiveDate, fromIso(voucher.receiveDate));
      rec.setValue(F.dueDate, fromIso(voucher.dueDate));
      rec.setValue(F.contact, voucher.contact || '');
      rec.setValue(F.reference, voucher.reference || '');
      rec.setValue(F.total, (lines || []).reduce((s, r) => s + Number(r.amount || 0) + Number(r.vat || 0), 0));
    }
    rec.setValue(F.status, nextStatus);
    const id = rec.save({ enableSourcing: true, ignoreMandatoryFields: false });

    if (editsFields) replaceLines(id, lines || []);
    return { id, tranid };
  }

  // Replace all child lines for a voucher: delete existing, re-create from
  // payload. Simpler + correct for a small line count (a voucher has a handful
  // of invoices, not thousands) and avoids diffing edge cases.
  function replaceLines(parentId, lines) {
    // Convert every value BEFORE deleting anything — record writes are not
    // transactional, so a conversion error after the delete pass would
    // destroy the existing lines with nothing to replace them (happened on
    // SB2 2026-07-16 via the non-ISO SuiteQL date round-trip).
    const prepared = (lines || []).map((r) => ({
      name: r.invoiceNo || 'line', // native Name is mandatory
      invoiceNo: r.invoiceNo || '',
      invoiceDate: fromIso(r.invoiceDate),
      poNo: r.poNo || '',
      amount: Number(r.amount || 0),
      vat: Number(r.vat || 0),
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
      lr.setValue(LF.invoiceNo, p.invoiceNo);
      lr.setValue(LF.invoiceDate, p.invoiceDate);
      lr.setValue(LF.poNo, p.poNo);
      lr.setValue(LF.amount, p.amount);
      lr.setValue(LF.vat, p.vat);
      lr.setValue(LF.memo, p.memo);
      lr.save();
    });
  }

  // BR-YYYY-#### running number. Uses the Buddhist year to match Teibto docs
  // (2569 = 2026). Counts existing rows in the year; good enough for a voucher
  // volume — swap for a NetSuite numbering plugin if true gap-free is required.
  function nextTranId() {
    const ce = new Date().getFullYear();
    const by = ce + 543;
    const prefix = 'BR-' + by + '-';
    const rs = query.runSuiteQL({
      query: `SELECT COUNT(*) AS n FROM ${REC} WHERE ${F.tranid} LIKE ?`, params: [prefix + '%'],
    }).asMappedResults();
    const n = Number(rs[0] && rs[0].n || 0) + 1;
    return prefix + String(n).padStart(4, '0');
  }

  /* ── Permission gate ───────────────────────────────────────────────── */

  // Returns '' if allowed, or a reason string. Approve/reject/pay require an
  // approver permission (custom role driven via runtime). Tune the permission
  // id to your account; the deploy guide documents how.
  function permissionError(action) {
    const isApprovalAction = ['approve', 'reject', 'pay'].indexOf(action) !== -1;
    if (!isApprovalAction) return '';
    // Example: gate on a deployment-time custom permission. Until that permission
    // exists, gate on the Administrator/AP-manager role via runtime as a stopgap.
    const role = runtime.getCurrentUser().role;
    // 3 = Administrator. Replace with your approver role id(s) at deploy time.
    const APPROVER_ROLES = [3];
    if (APPROVER_ROLES.indexOf(role) === -1) {
      return 'You do not have permission to ' + action + ' a bill receipt';
    }
    return '';
  }

  return { validate, list, load, vendors, save, permissionError, toIso, fromIso };
});

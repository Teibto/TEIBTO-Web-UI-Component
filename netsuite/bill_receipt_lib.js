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
    const errs = [];
    if (!voucher) { errs.push('Missing voucher'); return errs; }
    if (!voucher.vendor) errs.push('Vendor is required');
    if (!voucher.receiveDate) errs.push('Receive date is required');
    if (!voucher.dueDate) errs.push('Due date is required');
    if (voucher.receiveDate && voucher.dueDate && voucher.dueDate < voucher.receiveDate) {
      errs.push('Due date must be on or after the receive date');
    }
    const rows = lines || [];
    if (!rows.length) errs.push('At least one vendor invoice line is required');
    rows.forEach((r, i) => {
      const n = i + 1;
      if (!r.invoiceNo) errs.push(`Line ${n}: invoice no. is required`);
      if (!r.invoiceDate) errs.push(`Line ${n}: invoice date is required`);
      if (!(Number(r.amount) > 0)) errs.push(`Line ${n}: amount must be greater than 0`);
      if (Number(r.vat) < 0) errs.push(`Line ${n}: VAT cannot be negative`);
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
    const [y, m, d] = String(s).split('-').map(Number);
    return new Date(y, m - 1, d);
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
             h.${F.receiveDate} AS receivedate, h.${F.dueDate} AS duedate,
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

    const lineSql = `
      SELECT id, ${LF.invoiceNo} AS invoiceno, ${LF.invoiceDate} AS invoicedate,
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

    if (isNew) {
      const tranid = nextTranId();
      rec.setValue(F.tranid, tranid);
      // Custom records require the native Name field — mirror the tranid so
      // NetSuite lists/search stay readable.
      rec.setValue('name', tranid);
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
    return id;
  }

  // Replace all child lines for a voucher: delete existing, re-create from
  // payload. Simpler + correct for a small line count (a voucher has a handful
  // of invoices, not thousands) and avoids diffing edge cases.
  function replaceLines(parentId, lines) {
    const existing = query.runSuiteQL({
      query: `SELECT id FROM ${LINE_REC} WHERE ${LF.parent} = ?`, params: [parentId],
    }).asMappedResults();
    existing.forEach((e) => record.delete({ type: LINE_REC, id: e.id }));

    lines.forEach((r) => {
      const lr = record.create({ type: LINE_REC });
      lr.setValue('name', r.invoiceNo || 'line'); // native Name is mandatory
      lr.setValue(LF.parent, parentId);
      lr.setValue(LF.invoiceNo, r.invoiceNo || '');
      lr.setValue(LF.invoiceDate, fromIso(r.invoiceDate));
      lr.setValue(LF.poNo, r.poNo || '');
      lr.setValue(LF.amount, Number(r.amount || 0));
      lr.setValue(LF.vat, Number(r.vat || 0));
      lr.setValue(LF.memo, r.memo || '');
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

/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * rl_bill_receipt.js — write endpoint for the vendor bill receipt (รับวางบิล).
 * The page POSTs { action, voucher, lines } here; this is the ONLY place that
 * mutates the record, so all the rules live server-side:
 *   1. permission gate (approve/reject/pay need an approver role)
 *   2. state-machine check (the requested action must be legal for the
 *      record's CURRENT status, re-read from the DB — never trust the client)
 *   3. field validation (vendor, dates, at least one valid line)
 *   4. persist via bill_receipt_lib.save
 *
 * Returns { ok, id, status, tranid } on success, or HTTP-style error body
 * { ok:false, message } that tbtPageRuntime.post() surfaces as an alert.
 */
define(['N/record', './bill_receipt_meta', './bill_receipt_lib'],
(record, meta, lib) => {

  function post(body) {
    try {
      const payload = typeof body === 'string' ? JSON.parse(body) : (body || {});
      const action = payload.action;
      const voucher = payload.voucher || {};
      const lines = payload.lines || [];

      // 1. permission
      const permErr = lib.permissionError(action);
      if (permErr) return err(permErr);

      // 2. current status — re-read from DB (the client's copy is advisory only)
      let currentStatus = null;
      if (voucher.id) {
        const cur = record.load({ type: meta.REC, id: voucher.id });
        currentStatus = cur.getValue(meta.F.status) || meta.STATUS.DRAFT;
      }
      const trans = meta.checkTransition(action, currentStatus);
      if (!trans.ok) return err(trans.message);

      // 3. field validation — only when the transition edits fields
      if (trans.editsFields) {
        const verrs = lib.validate(voucher, lines);
        if (verrs.length) return err(verrs.join('; '));
      }

      // 4. persist
      const id = lib.save(voucher, lines, trans.to, trans.editsFields);
      return { ok: true, id, status: trans.to, tranid: voucher.tranid || undefined };

    } catch (e) {
      // Surface the real reason; log the stack for the admin.
      log.error({ title: 'rl_bill_receipt', details: e.stack || e.message });
      return err(e.message || 'Server error');
    }
  }

  function err(message) { return { ok: false, message }; }

  return { post };
});

/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * rl_expense.js — write endpoint for the employee expense claim. The page POSTs
 * { action, claim, lines }; this is the ONLY writer, so all rules live here:
 *   1. permission gate (approve/reject/pay need an approver role)
 *   2. state-machine check (re-reads current status from the DB)
 *   3. field validation (employee, period, ≥1 valid line)
 *   4. persist via expense_lib.save
 * Mirrors rl_bill_receipt.
 */
define(['N/record', './expense_meta', './expense_lib'], (record, meta, lib) => {

  function post(body) {
    try {
      const payload = typeof body === 'string' ? JSON.parse(body) : (body || {});
      const action = payload.action;
      const claim = payload.claim || {};
      const lines = payload.lines || [];

      const permErr = lib.permissionError(action);
      if (permErr) return err(permErr);

      let currentStatus = null;
      if (claim.id) {
        const cur = record.load({ type: meta.REC, id: claim.id });
        currentStatus = cur.getValue(meta.F.status) || meta.STATUS.DRAFT;
      }
      const trans = meta.checkTransition(action, currentStatus);
      if (!trans.ok) return err(trans.message);

      if (trans.editsFields) {
        const verrs = lib.validate(claim, lines);
        if (verrs.length) return err(verrs.join('; '));
      }

      // save() returns the persisted identity — the client's tranid copy is
      // empty on first save, so the generated one must come from the server.
      const saved = lib.save(claim, lines, trans.to, trans.editsFields);
      return { ok: true, id: saved.id, tranid: saved.tranid, status: trans.to };

    } catch (e) {
      log.error({ title: 'rl_expense', details: e.stack || e.message });
      return err(e.message || 'Server error');
    }
  }

  function err(message) { return { ok: false, message }; }

  return { post };
});

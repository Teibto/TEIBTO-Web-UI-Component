/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * expense_meta.js — single source of truth for the employee expense claim
 * custom record schema + status state machine. Same shape as bill_receipt_meta
 * (header + 1:N lines). The SDF XML and the server scripts both reference THESE
 * ids — change a field id here only.
 *
 * Record: customrecord_tbt_expense_claim       (claim header)
 * Child : customrecord_tbt_expense_claim_line  (expense lines, 1:N)
 */
define([], () => {

  const REC = 'customrecord_tbt_expense_claim';
  const LINE_REC = 'customrecord_tbt_expense_claim_line';

  // Header fields
  const F = {
    tranid:   'custrecord_tbt_exp_tranid',     // FREEFORMTEXT — EXP-YYYY-####
    employee: 'custrecord_tbt_exp_employee',   // SELECT → employee
    period:   'custrecord_tbt_exp_period',     // FREEFORMTEXT — e.g. "May 2026"
    status:   'custrecord_tbt_exp_status',     // FREEFORMTEXT (state machine)
    total:    'custrecord_tbt_exp_total',      // CURRENCY (cached = sum lines)
  };

  // Line fields
  const LF = {
    parent:   'custrecord_tbt_expl_parent',    // SELECT → header (the 1:N link)
    date:     'custrecord_tbt_expl_date',      // DATE
    category: 'custrecord_tbt_expl_category',  // FREEFORMTEXT (category value)
    merchant: 'custrecord_tbt_expl_merchant',  // FREEFORMTEXT
    amount:   'custrecord_tbt_expl_amount',    // CURRENCY
    billable: 'custrecord_tbt_expl_billable',  // CHECKBOX
    receipt:  'custrecord_tbt_expl_receipt',   // FREEFORMTEXT (URL)
    memo:     'custrecord_tbt_expl_memo',      // FREEFORMTEXT
  };

  const STATUS = {
    DRAFT: 'Draft', SUBMITTED: 'Submitted', APPROVED: 'Approved',
    REJECTED: 'Rejected', PAID: 'Paid',
  };

  // action → { from: [allowed current states], to, editsFields }
  const TRANSITIONS = {
    save:    { from: [STATUS.DRAFT, STATUS.REJECTED, null], to: STATUS.DRAFT,     editsFields: true },
    submit:  { from: [STATUS.DRAFT, STATUS.REJECTED],       to: STATUS.SUBMITTED, editsFields: true },
    approve: { from: [STATUS.SUBMITTED],                    to: STATUS.APPROVED,  editsFields: false },
    reject:  { from: [STATUS.SUBMITTED],                    to: STATUS.REJECTED,  editsFields: false },
    pay:     { from: [STATUS.APPROVED],                     to: STATUS.PAID,      editsFields: false },
  };

  function checkTransition(action, currentStatus) {
    const t = TRANSITIONS[action];
    if (!t) return { ok: false, message: 'Unknown action: ' + action };
    const cur = currentStatus || null;
    if (t.from.indexOf(cur) === -1) {
      return { ok: false, message: `Cannot ${action} a claim in status "${cur || 'new'}"` };
    }
    return { ok: true, to: t.to, editsFields: t.editsFields };
  }

  return { REC, LINE_REC, F, LF, STATUS, TRANSITIONS, checkTransition };
});

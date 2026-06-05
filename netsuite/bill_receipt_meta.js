/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * bill_receipt_meta.js — single source of truth for the vendor bill receipt
 * (รับวางบิล) custom record schema + status state machine.
 *
 * Both the SDF object XML (objects/customrecord_tbt_bill_receipt.xml) and the
 * server scripts (sl_bill_receipt_list/form, rl_bill_receipt) reference THESE
 * ids. If a field id changes, change it here only — never hand-type a field id
 * in a second place, or they WILL drift and fail silently at deploy time.
 *
 * Record: customrecord_tbt_bill_receipt  (the "voucher" header)
 * Child : customrecord_tbt_bill_receipt_line  (vendor-invoice lines, 1:N)
 */
define([], () => {

  /* ── Record + field ids (must match the SDF XML exactly) ───────────── */

  const REC = 'customrecord_tbt_bill_receipt';
  const LINE_REC = 'customrecord_tbt_bill_receipt_line';

  // Header fields on customrecord_tbt_bill_receipt
  const F = {
    tranid:      'custrecord_tbt_br_tranid',       // FREEFORMTEXT — display no. BR-YYYY-####
    vendor:      'custrecord_tbt_br_vendor',       // SELECT → vendor
    receiveDate: 'custrecord_tbt_br_receive_date', // DATE
    dueDate:     'custrecord_tbt_br_due_date',     // DATE
    contact:     'custrecord_tbt_br_contact',      // FREEFORMTEXT
    reference:   'custrecord_tbt_br_reference',    // FREEFORMTEXT
    status:      'custrecord_tbt_br_status',       // FREEFORMTEXT (state machine value, not a NS list)
    total:      'custrecord_tbt_br_total',         // CURRENCY (cached header total = sum lines)
  };

  // Line fields on customrecord_tbt_bill_receipt_line
  const LF = {
    parent:      'custrecord_tbt_brl_parent',      // SELECT → customrecord_tbt_bill_receipt (the 1:N link)
    invoiceNo:   'custrecord_tbt_brl_invoice_no',  // FREEFORMTEXT
    invoiceDate: 'custrecord_tbt_brl_invoice_date',// DATE
    poNo:        'custrecord_tbt_brl_po_no',       // FREEFORMTEXT
    amount:      'custrecord_tbt_brl_amount',      // CURRENCY (pre-tax)
    vat:         'custrecord_tbt_brl_vat',         // CURRENCY
    memo:        'custrecord_tbt_brl_memo',        // FREEFORMTEXT
  };

  /* ── Status state machine ──────────────────────────────────────────── */
  /* The UI gates buttons by status, but that is convenience only. The
     RESTlet enforces THIS table server-side: a transition not listed here is
     rejected no matter what the client sends. */

  const STATUS = {
    DRAFT: 'Draft', SUBMITTED: 'Submitted', APPROVED: 'Approved',
    REJECTED: 'Rejected', PAID: 'Paid',
  };

  // action → { from: [allowed current states], to: next state }
  const TRANSITIONS = {
    save:    { from: [STATUS.DRAFT, null],            to: STATUS.DRAFT,     editsFields: true },
    submit:  { from: [STATUS.DRAFT],                  to: STATUS.SUBMITTED, editsFields: true },
    approve: { from: [STATUS.SUBMITTED],              to: STATUS.APPROVED,  editsFields: false },
    reject:  { from: [STATUS.SUBMITTED],              to: STATUS.REJECTED,  editsFields: false },
    pay:     { from: [STATUS.APPROVED],               to: STATUS.PAID,      editsFields: false },
  };

  /**
   * Validate a requested action against the record's current status.
   * @returns {{ok:true, to:string, editsFields:boolean} | {ok:false, message:string}}
   */
  function checkTransition(action, currentStatus) {
    const t = TRANSITIONS[action];
    if (!t) return { ok: false, message: 'Unknown action: ' + action };
    const cur = currentStatus || null;
    if (t.from.indexOf(cur) === -1) {
      return { ok: false, message: `Cannot ${action} a record in status "${cur || 'new'}"` };
    }
    return { ok: true, to: t.to, editsFields: t.editsFields };
  }

  return { REC, LINE_REC, F, LF, STATUS, TRANSITIONS, checkTransition };
});

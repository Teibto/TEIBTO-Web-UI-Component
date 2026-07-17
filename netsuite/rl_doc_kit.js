/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 * @since 2026-07-17
 *
 * rl_doc_kit.js — save endpoint for the generic document form kit (sl_tbt_doc_kit).
 *
 * This is a STUB writer: it validates the posted payload and echoes back a
 * document id, but does NOT persist a record. It exists so the kit's save
 * round-trip is exercisable end-to-end (UI → RESTlet → alert) before a topic
 * gets its real backend. To turn a topic into a real writer, replace the echo
 * with record.create/record.load per the FORM-KIT playbook (mirror
 * netsuite/rl_bill_receipt.js: permission → state machine → validate → persist).
 *
 * POST body = the flat form data from tbt-doc-form: { <field>: value, …, lines }.
 * Returns { ok, id, tranid, message } on success; throws (→ non-2xx) on a
 * validation error so the page shows its error alert.
 */
define([ 'N/error' ], (error) => {

  function post(body) {
    const data = typeof body === 'string' ? JSON.parse(body || '{}') : (body || {});

    // Minimal, schema-agnostic validation. A real backend validates via the
    // topic's *_meta field ids; here we only check the common document shape.
    const party = data.customer || data.vendor || data.entity;
    if (!party)     throw error.create({ name: 'TBT_KIT_NO_PARTY', message: 'Select a customer/vendor first.' });
    if (!data.date) throw error.create({ name: 'TBT_KIT_NO_DATE',  message: 'Date is required.' });
    if (Array.isArray(data.lines) && data.lines.length === 0) {
      throw error.create({ name: 'TBT_KIT_NO_LINES', message: 'Add at least one line item.' });
    }

    // Echo — no persistence. tranid is the client's if editing, else a stub.
    const tranid = data.tranid || 'DOC-NEW';
    return { ok: true, id: 0, tranid, message: `Validated ${tranid} (stub — no record written).` };
  }

  return { post };
});

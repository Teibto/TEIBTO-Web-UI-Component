/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * sl_invoice_form.js — Invoice form (new / view / edit) using shared erp-form.html.
 */
define([ 'N/file', './tbt_page', './_mock_lookups' ], (file, tbtPage, lookups) => ({

  onRequest(ctx) {
    const body    = file.load({ id: './erp-form.html' }).getContents();
    const idParam = ctx.request.parameters?.id   || '';
    const param   = ctx.request.parameters?.mode || '';
    const mode = !idParam || idParam === 'new' ? 'new' : (param === 'edit' ? 'edit' : 'view');
    const id = Number(idParam);

    const MOCK_INV = {
      1: { id: 1, tranid: 'INV-2026-0001', customer: 100, date: '2026-04-20', duedate: '2026-05-20', po_number: 'CUST-PO-7788', salesrep: 2001, subsidiary: 1, currency: 1, terms: 31, memo: 'Consulting — April 2026.', status: 'Paid' },
      2: { id: 2, tranid: 'INV-2026-0002', customer: 200, date: '2026-04-25', duedate: '2026-05-25', po_number: 'CUST-PO-8801', salesrep: 2002, subsidiary: 1, currency: 1, terms: 31, memo: 'Implementation services.', status: 'Pending approval' },
      3: { id: 3, tranid: 'INV-2026-0003', customer: 100, date: '2026-05-02', duedate: '2026-06-01', po_number: 'CUST-PO-9912', salesrep: 2001, subsidiary: 1, currency: 1, terms: 31, memo: 'Monthly retainer.', status: 'Approved' },
    };
    const record = mode === 'new' ? {} : (MOCK_INV[id] || MOCK_INV[1]);

    const lines = mode === 'new' ? [] : [
      { item: 'Consulting hours',     desc: 'Senior consultant — 40 h', qty: 40, unit: 'Hrs', price: 1800 },
      { item: 'Project management',   desc: 'PM oversight — 16 h',      qty: 16, unit: 'Hrs', price: 2200 },
      { item: 'Travel reimbursement', desc: 'Site visits',              qty: 1,  unit: 'Lot', price: 12000 },
    ];

    const auditEntries = mode === 'new' ? [] : [
      { id: '3', timestamp: '2026-05-25T14:00:00Z', user: 'Somchai', action: 'submitted', label: 'Submitted for approval' },
      { id: '2', timestamp: '2026-05-23T09:00:00Z', user: 'Wichit',  action: 'updated',   label: 'Lines updated' },
      { id: '1', timestamp: '2026-05-22T08:00:00Z', user: 'Wichit',  action: 'created',   label: 'Invoice created' },
    ];

    const data = {
      schemaName:  'INVOICE_SCHEMA',
      recordLabel: 'Invoice',
      mode,
      record,
      lines,
      auditEntries,
      optionLists: {
        customers:       lookups.customers,
        'sales-reps':    lookups['sales-reps'],
        subsidiaries:    lookups.subsidiaries,
        currencies:      lookups.currencies,
        'payment-terms': lookups['payment-terms'],
      },
      listUrl:    '/invoice/list',
      selfUrl:    '/invoice/form',
      restletUrl: '/app/site/hosting/restlet.nl?script=customscript_tbt_rl_invoice&deploy=1',
    };

    ctx.response.write(tbtPage.render({
      title:  mode === 'new' ? 'New invoice' : (mode === 'edit' ? 'Edit invoice' : 'Invoice'),
      active: 'invoice',
      data,
      body,
    }));
  },

}));

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * sl_po_form.js — Purchase order form (new / view / edit) using shared erp-form.html.
 */
define([ 'N/file', './tbt_page', './_mock_lookups' ], (file, tbtPage, lookups) => ({

  onRequest(ctx) {
    const body    = file.load({ id: './erp-form.html' }).getContents();
    const idParam = ctx.request.parameters?.id   || '';
    const param   = ctx.request.parameters?.mode || '';
    const mode = !idParam || idParam === 'new' ? 'new' : (param === 'edit' ? 'edit' : 'view');
    const id = Number(idParam);

    const MOCK_PO = {
      1: { id: 1, tranid: 'PO-2026-0001', vendor: 500, date: '2026-05-20', due: '2026-06-20', subsidiary: 1, department: 10, currency: 1, terms: 31, memo: 'Office supplies Q2/2026.', status: 'Approved' },
      2: { id: 2, tranid: 'PO-2026-0002', vendor: 501, date: '2026-05-22', due: '2026-06-22', subsidiary: 1, department: 10, currency: 1, terms: 31, memo: 'IT equipment refresh.',    status: 'Pending approval' },
      3: { id: 3, tranid: 'PO-2026-0003', vendor: 500, date: '2026-05-23', due: '2026-06-23', subsidiary: 1, department: 11, currency: 1, terms: 31, memo: 'Stationery restock.',     status: 'Approved' },
    };
    const record = mode === 'new' ? {} : (MOCK_PO[id] || MOCK_PO[1]);

    const lines = mode === 'new' ? [] : [
      { item: 'Laptop',  desc: 'Dell 14" i7', qty: 5,  unit: 'Pcs', price: 35000 },
      { item: 'Monitor', desc: '27" 4K IPS',  qty: 10, unit: 'Pcs', price: 12000 },
    ];

    const approvalSteps = mode === 'new' ? [] : [
      { id: '1', label: 'Request',  approver: 'Wichit',  status: 'approved', timestamp: '2026-05-22T08:00:00Z' },
      { id: '2', label: 'Manager',  approver: 'Somchai', status: 'approved', timestamp: '2026-05-22T11:00:00Z' },
      { id: '3', label: 'Director', approver: 'Apinya',  status: 'approved', timestamp: '2026-05-22T14:30:00Z' },
    ];

    const auditEntries = mode === 'new' ? [] : [
      { id: '2', timestamp: '2026-05-23T09:00:00Z', user: 'Wichit', action: 'updated', label: 'Lines updated' },
      { id: '1', timestamp: '2026-05-22T08:00:00Z', user: 'Wichit', action: 'created', label: 'Document created' },
    ];

    const data = {
      schemaName:  'PO_SCHEMA',
      recordLabel: 'Purchase order',
      mode,
      record,
      lines,
      approvalSteps,
      auditEntries,
      optionLists: {
        vendors:         lookups.vendors,
        subsidiaries:    lookups.subsidiaries,
        departments:     lookups.departments,
        currencies:      lookups.currencies,
        'payment-terms': lookups['payment-terms'],
      },
      listUrl:    '/po/list',
      selfUrl:    '/po/form',
      restletUrl: '/app/site/hosting/restlet.nl?script=customscript_tbt_rl_po&deploy=1',
    };

    ctx.response.write(tbtPage.render({
      title:  mode === 'new' ? 'New purchase order' : (mode === 'edit' ? 'Edit purchase order' : 'Purchase order'),
      active: 'purchase-order',
      data,
      body,
    }));
  },

}));

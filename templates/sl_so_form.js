/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * sl_so_form.js — Sales Order FORM page (new / view / edit modes).
 *
 * URL pattern:
 *   ?id=new                 → create
 *   ?id=SO-XXXX             → view (default)
 *   ?id=SO-XXXX&mode=edit   → edit
 *
 * In production: replace MOCK_RECORD with record.load on view/edit;
 * record.create on save.
 */
define([ 'N/file', './tbt_page', './_mock_lookups' ], (file, tbtPage, lookups) => ({

  onRequest(ctx) {
    const body  = file.load({ id: './so-form.html' }).getContents();
    const idParam = ctx.request.parameters?.id   || '';
    const param   = ctx.request.parameters?.mode || '';

    const mode = !idParam || idParam === 'new'
      ? 'new'
      : (param === 'edit' ? 'edit' : 'view');
    const id = Number(idParam);

    // Mock SO table indexed by internal id. In production: record.load(...).
    const MOCK_SO = {
      1: { id: 1, tranid: 'SO-2026-0001', customer: 100, date: '2026-05-22', expected: '2026-06-15', salesrep: 2001, subsidiary: 1, currency: 1, terms: 31, po_number: 'CUST-PO-7788', ship_to: { street: '99/9 Sukhumvit Rd.', city: 'Bangkok', state: 'BKK', postcode: '10110', country: 'Thailand' }, ship_via: 41, memo: 'Deliver to receiving dock 2.', status: 'Approved' },
      2: { id: 2, tranid: 'SO-2026-0002', customer: 200, date: '2026-05-23', expected: '2026-06-16', salesrep: 2002, subsidiary: 1, currency: 1, terms: 31, po_number: 'CUST-PO-8801', ship_to: { street: '88/2 Silom Rd.', city: 'Bangkok', state: 'BKK', postcode: '10500', country: 'Thailand' }, ship_via: 42, memo: 'Office delivery.', status: 'Pending approval' },
      3: { id: 3, tranid: 'SO-2026-0003', customer: 100, date: '2026-05-24', expected: '2026-06-17', salesrep: 2001, subsidiary: 1, currency: 1, terms: 31, po_number: 'CUST-PO-9912', ship_to: { street: '99/9 Sukhumvit Rd.', city: 'Bangkok', state: 'BKK', postcode: '10110', country: 'Thailand' }, ship_via: 41, memo: 'Repeat order.', status: 'Approved' },
    };
    const record = mode === 'new' ? {} : (MOCK_SO[id] || MOCK_SO[1]);

    const lines = mode === 'new' ? [] : [
      { item: 'Laptop 14"',  desc: 'Dell i7 16GB', qty: 2, unit: 'Pcs', price: 35000 },
      { item: 'Monitor 27"', desc: '4K IPS',       qty: 4, unit: 'Pcs', price: 12000 },
      { item: 'USB-C dock',  desc: 'Anker A8390',  qty: 5, unit: 'Pcs', price: 2900 },
    ];

    // Item master suggestions — datalist for the Item column autocomplete.
    // In production: replace with N/search on inventoryitem / serviceitem.
    const itemOptions = [
      { value: 'Laptop 14"',           label: 'Laptop 14"' },
      { value: 'Laptop 15"',           label: 'Laptop 15"' },
      { value: 'Monitor 27"',          label: 'Monitor 27"' },
      { value: 'Monitor 32"',          label: 'Monitor 32"' },
      { value: 'USB-C dock',           label: 'USB-C dock' },
      { value: 'Wireless keyboard',    label: 'Wireless keyboard' },
      { value: 'Wireless mouse',       label: 'Wireless mouse' },
      { value: 'Webcam HD',            label: 'Webcam HD' },
      { value: 'Headset noise-cancel', label: 'Headset noise-cancel' },
      { value: 'Cloud subscription',   label: 'Cloud subscription' },
      { value: 'Consulting hours',     label: 'Consulting hours' },
      { value: 'Implementation',       label: 'Implementation' },
      { value: 'Training day',         label: 'Training day' },
      { value: 'Premium support',      label: 'Premium support' },
    ];

    const approvalSteps = mode === 'new' ? [] : [
      { id: '1', label: 'Sales rep', approver: 'Wichit',  status: 'approved', timestamp: '2026-05-22T09:00:00Z' },
      { id: '2', label: 'Manager',   approver: 'Somchai', status: 'approved', timestamp: '2026-05-22T11:00:00Z' },
      { id: '3', label: 'Director',  approver: 'Apinya',  status: 'approved', timestamp: '2026-05-22T14:30:00Z' },
    ];

    const auditEntries = mode === 'new' ? [] : [
      { id: '4', timestamp: '2026-05-22T14:30:00Z', user: 'Apinya',  action: 'approved',  label: 'Final approval' },
      { id: '3', timestamp: '2026-05-22T11:00:00Z', user: 'Somchai', action: 'approved',  label: 'Manager approval' },
      { id: '2', timestamp: '2026-05-22T09:00:00Z', user: 'Wichit',  action: 'submitted', label: 'Submitted for approval',
        changes: [{ field: 'Status', from: 'Draft', to: 'Pending approval' }] },
      { id: '1', timestamp: '2026-05-22T08:00:00Z', user: 'Wichit',  action: 'created',   label: 'Document created' },
    ];

    const related = mode === 'new' ? {} : {
      quotation:    { tranid: 'QT-2026-0001' },
      invoices:     [{ tranid: 'INV-2026-0003' }],
      fulfillments: [{ tranid: 'FUL-2026-0009' }],
      payments:     [],
    };

    const data = {
      schemaName:  'SALES_ORDER_SCHEMA',
      recordLabel: 'Sales order',
      mode,
      record,
      lines,
      itemOptions,
      approvalSteps,
      auditEntries,
      related,
      optionLists: {
        customers:       lookups.customers,
        'sales-reps':    lookups['sales-reps'],
        subsidiaries:    lookups.subsidiaries,
        currencies:      lookups.currencies,
        'payment-terms': lookups['payment-terms'],
        'ship-via':      lookups['ship-via'],
      },
      listUrl:    '/so/list',
      selfUrl:    '/so/form',
      restletUrl: '/app/site/hosting/restlet.nl?script=customscript_tbt_rl_so&deploy=1',
    };

    ctx.response.write(tbtPage.render({
      title:  mode === 'new'  ? 'New sales order'
            : mode === 'edit' ? 'Edit sales order'
                              : 'Sales order',
      active: 'sales-order',
      data,
      body,
    }));
  },

}));

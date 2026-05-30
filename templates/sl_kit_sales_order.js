/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * sl_kit_sales_order.js — Sales Order create/edit form (schema-driven).
 * Uses SALES_ORDER_SCHEMA from tbt-doc-schemas (no custom layout).
 *
 * URL: ?id=<tranid>   empty → new, value → edit
 *
 * In production: replace MOCK_* with record.load / search.create.
 */
define([ 'N/file', './tbt_page', './_mock_lookups' ], (file, tbtPage, lookups) => ({

  onRequest(ctx) {
    const body = file.load({ id: './kit-doc.html' }).getContents();
    const id   = ctx.request.parameters?.id || '';

    const record = id ? {
      tranid:     id,
      customer:   'C001',
      date:       '2026-05-30',
      expected:   '2026-06-15',
      salesrep:   'REP_001',
      subsidiary: 'S01',
      currency:   'THB',
      terms:      'NET30',
      po_number:  'CUST-PO-7788',
      ship_to:    { street: '99/9 Sukhumvit Rd.', city: 'Bangkok', state: 'BKK', postcode: '10110', country: 'Thailand' },
      ship_via:   'KERRY',
      memo:       'Deliver to receiving dock 2.',
    } : {};

    const data = {
      schemaName: 'SALES_ORDER_SCHEMA',
      record,
      lines: id ? [
        { item: 'Laptop 14"',  desc: 'Dell i7 16GB', qty: 2, unit: 'Pcs', price: 35000 },
        { item: 'Monitor 27"', desc: '4K IPS',       qty: 4, unit: 'Pcs', price: 12000 },
      ] : [],
      approvalSteps: id ? [
        { id: '1', label: 'Sales rep', approver: 'Wichit',  status: 'approved', timestamp: '2026-05-30T09:00:00Z' },
        { id: '2', label: 'Manager',   approver: 'Somchai', status: 'current'  },
        { id: '3', label: 'Director',  approver: 'Apinya',  status: 'pending'  },
      ] : [],
      optionLists: {
        customers:       lookups.customers,
        'sales-reps':    lookups['sales-reps'],
        subsidiaries:    lookups.subsidiaries,
        currencies:      lookups.currencies,
        'payment-terms': lookups['payment-terms'],
        'ship-via':      lookups['ship-via'],
      },
      restletUrl: '/app/site/hosting/restlet.nl?script=customscript_tbt_rl_so&deploy=1',
    };

    ctx.response.write(tbtPage.render({
      title:  id ? 'Edit sales order' : 'New sales order',
      active: 'sales-order',
      data,
      body,
    }));
  },

}));

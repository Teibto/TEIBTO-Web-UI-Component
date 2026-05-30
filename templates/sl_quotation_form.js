/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * sl_quotation_form.js — Quotation form (new / view / edit) using shared erp-form.html.
 */
define([ 'N/file', './tbt_page', './_mock_lookups' ], (file, tbtPage, lookups) => ({

  onRequest(ctx) {
    const body    = file.load({ id: './erp-form.html' }).getContents();
    const idParam = ctx.request.parameters?.id   || '';
    const param   = ctx.request.parameters?.mode || '';
    const mode = !idParam || idParam === 'new' ? 'new' : (param === 'edit' ? 'edit' : 'view');
    const id = Number(idParam);

    const MOCK_QT = {
      1: { id: 1, tranid: 'QT-2026-0001', customer: 100, date: '2026-05-20', expirydate: '2026-06-19', salesrep: 2001, subsidiary: 1, currency: 1, terms: 31, memo: 'Quote valid for 30 days.', status: 'Accepted' },
      2: { id: 2, tranid: 'QT-2026-0002', customer: 200, date: '2026-05-22', expirydate: '2026-06-21', salesrep: 2002, subsidiary: 1, currency: 1, terms: 31, memo: 'Bulk pricing applied.', status: 'Sent' },
      3: { id: 3, tranid: 'QT-2026-0003', customer: 100, date: '2026-04-15', expirydate: '2026-05-14', salesrep: 2001, subsidiary: 1, currency: 1, terms: 31, memo: 'Expired — needs renewal.', status: 'Expired' },
    };
    const record = mode === 'new' ? {} : (MOCK_QT[id] || MOCK_QT[1]);

    const lines = mode === 'new' ? [] : [
      { item: 'Cloud subscription', desc: 'Annual license × 25 seats', qty: 25, unit: 'Seat', price: 4800 },
      { item: 'Implementation',     desc: 'Initial setup + training',  qty: 1,  unit: 'Lot',  price: 85000 },
      { item: 'Premium support',    desc: '12-month coverage',         qty: 12, unit: 'Mo',   price: 9500 },
    ];

    const approvalSteps = mode === 'new' ? [] : [
      { id: '1', label: 'Sales rep', approver: 'Wichit',  status: 'approved', timestamp: '2026-05-22T09:00:00Z' },
      { id: '2', label: 'Manager',   approver: 'Somchai', status: 'current'  },
      { id: '3', label: 'Customer',  approver: 'TBC',     status: 'pending'  },
    ];

    const data = {
      schemaName:  'QUOTATION_SCHEMA',
      recordLabel: 'Quotation',
      mode,
      record,
      lines,
      approvalSteps,
      optionLists: {
        customers:       lookups.customers,
        'sales-reps':    lookups['sales-reps'],
        subsidiaries:    lookups.subsidiaries,
        currencies:      lookups.currencies,
        'payment-terms': lookups['payment-terms'],
      },
      listUrl:    '/quotation/list',
      selfUrl:    '/quotation/form',
      restletUrl: '/app/site/hosting/restlet.nl?script=customscript_tbt_rl_quotation&deploy=1',
    };

    ctx.response.write(tbtPage.render({
      title:  mode === 'new' ? 'New quotation' : (mode === 'edit' ? 'Edit quotation' : 'Quotation'),
      active: 'quotation',
      data,
      body,
    }));
  },

}));

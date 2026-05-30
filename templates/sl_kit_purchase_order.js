/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * sl_kit_purchase_order.js — Purchase Order create/edit form (schema-driven).
 * Uses PO_SCHEMA from tbt-doc-schemas (no custom layout).
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
      vendor:     'V001',
      date:       '2026-05-30',
      due:        '2026-06-30',
      subsidiary: 'S01',
      department: 'DEPT_IT',
      currency:   'THB',
      terms:      'NET30',
      memo:       'Office supplies Q2/2026.',
    } : {};

    const data = {
      schemaName: 'PO_SCHEMA',
      record,
      lines: id ? [
        { item: 'Laptop',  desc: 'Dell 14" i7', qty: 5,  unit: 'Pcs', price: 35000 },
        { item: 'Monitor', desc: '27" 4K IPS',  qty: 10, unit: 'Pcs', price: 12000 },
      ] : [],
      approvalSteps: id ? [
        { id: '1', label: 'Request',  approver: 'Wichit',  status: 'approved', timestamp: '2026-05-29T08:00:00Z' },
        { id: '2', label: 'Manager',  approver: 'Somchai', status: 'current'  },
        { id: '3', label: 'Director', approver: 'Apinya',  status: 'pending'  },
      ] : [],
      auditEntries: id ? [
        { id: '2', timestamp: '2026-05-30T09:00:00Z', user: 'Wichit', action: 'updated', label: 'Lines updated' },
        { id: '1', timestamp: '2026-05-29T08:00:00Z', user: 'Wichit', action: 'created', label: 'Document created' },
      ] : [],
      optionLists: {
        vendors:         lookups.vendors,
        subsidiaries:    lookups.subsidiaries,
        departments:     lookups.departments,
        currencies:      lookups.currencies,
        'payment-terms': lookups['payment-terms'],
      },
      restletUrl: '/app/site/hosting/restlet.nl?script=customscript_tbt_rl_po&deploy=1',
    };

    ctx.response.write(tbtPage.render({
      title:  id ? 'Edit purchase order' : 'New purchase order',
      active: 'purchase-order',
      data,
      body,
    }));
  },

}));

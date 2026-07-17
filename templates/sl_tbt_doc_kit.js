/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 * @since 2026-07-17
 *
 * sl_tbt_doc_kit.js — GENERIC schema-driven document form Suitelet.
 *
 * The single reusable "call or adapt" entry point of the form kit: point it at
 * any schema exported from tbt-doc-schemas (shipped in the DS bundle) and it
 * serves kit-doc.html through tbt_page.render. Adapt = edit the schema JS; no
 * per-topic Suitelet needed for the common case.
 *
 * URL:
 *   ?schema=SALES_ORDER_SCHEMA          → new
 *   ?schema=SALES_ORDER_SCHEMA&id=SO-1  → edit (prefilled)
 *
 * In production: replace the MOCK_DATA map with record.load / N/query per topic,
 * and swap _mock_lookups for a real N/query lookups lib (see doc_kit_lib pattern
 * in the playbook). The save endpoint is the doc-kit RESTlet (rl_doc_kit).
 */
define([ 'N/file', 'N/url', './tbt_page', './_mock_lookups' ], (file, url, tbtPage, lookups) => {

  // schema → nav key (for sidebar highlight) + demo record/lines/approval.
  // Only the topics wired for demo need an entry; unknown schemas still render
  // (empty record = blank new form).
  const KITS = {
    SALES_ORDER_SCHEMA: {
      active: 'sales-order',
      title:  'Sales order',
      record: {
        tranid: 'SO-2026-0001', customer: 100, date: '2026-05-22', expected: '2026-06-15',
        salesrep: 2001, subsidiary: 1, currency: 1, terms: 31, po_number: 'CUST-PO-7788',
        memo: 'Deliver to receiving dock 2.',
      },
      lines: [
        { item: 'Laptop 14"',  desc: 'Dell i7 16GB', qty: 2, unit: 'Pcs', price: 35000 },
        { item: 'Monitor 27"', desc: '4K IPS',       qty: 4, unit: 'Pcs', price: 12000 },
        { item: 'USB-C dock',  desc: 'Anker A8390',  qty: 5, unit: 'Pcs', price: 2900 },
      ],
      approvalSteps: [
        { id: '1', label: 'Sales rep', approver: 'Wichit',  status: 'approved', timestamp: '2026-05-22T09:00:00Z' },
        { id: '2', label: 'Manager',   approver: 'Somchai', status: 'current'  },
        { id: '3', label: 'Director',  approver: 'Apinya',  status: 'pending'  },
      ],
    },
  };

  function onRequest(ctx) {
    const body       = file.load({ id: './kit-doc.html' }).getContents();
    const schemaName = ctx.request.parameters?.schema || 'SALES_ORDER_SCHEMA';
    const id         = ctx.request.parameters?.id || '';

    const kit = KITS[schemaName] || { active: '', title: 'Document' };
    const isEdit = !!id;

    const data = {
      schemaName,
      record:        isEdit ? (kit.record || {}) : {},
      lines:         isEdit ? (kit.lines || []) : [],
      approvalSteps: isEdit ? (kit.approvalSteps || []) : [],
      optionLists: {
        customers:       lookups.customers,
        'sales-reps':    lookups['sales-reps'],
        subsidiaries:    lookups.subsidiaries,
        departments:     lookups.departments,
        currencies:      lookups.currencies,
        'payment-terms': lookups['payment-terms'],
        'ship-via':      lookups['ship-via'],
        vendors:         lookups.vendors,
      },
      // The only writer — resolved so it never 404s if the deployment id changes.
      restletUrl: url.resolveScript({
        scriptId:     'customscript_tbt_rl_doc_kit',
        deploymentId: 'customdeploy_tbt_rl_doc_kit',
      }),
    };

    ctx.response.write(tbtPage.render({
      title:  isEdit ? `Edit ${kit.title.toLowerCase()}` : `New ${kit.title.toLowerCase()}`,
      active: kit.active,
      data,
      body,
    }));
  }

  return { onRequest };
});

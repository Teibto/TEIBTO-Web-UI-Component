/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * sl_starter_form.js — thin entry for a create/edit form Suitelet.
 *
 * Reads ?id= from the URL: empty → new record, value → edit record.
 *
 * In production replace MOCK_* with:
 *   record.load({ type: 'purchaseorder', id })   — for edit
 *   search.create(...) / N/query                 — for vendor / subsidiary lookup
 */
define([ 'N/file', './tbt_page' ], (file, tbtPage) => ({

  onRequest(ctx) {
    const body = file.load({ id: './form-page.html' }).getContents();
    const id   = ctx.request.parameters?.id || '';

    // Mock — replace with record.load in production.
    const record = id ? {
      tranid: id, vendor: 'V001', date: '2026-05-30',
      dueDate: '2026-06-30', subsidiary: 'S01', currency: 'THB',
      memo: 'Sample memo',
    } : {};

    // Mock — replace with search.create / N/query in production.
    const data = {
      record,
      options: {
        vendor: [
          { value: 'V001', label: 'บจก. ABC จำกัด' },
          { value: 'V002', label: 'บจก. XYZ จำกัด' },
        ],
        subsidiary: [
          { value: 'S01', label: 'Teibto HQ' },
          { value: 'S02', label: 'Teibto BKK Branch' },
        ],
        currency: [
          { value: 'THB', label: 'THB — Thai Baht' },
          { value: 'USD', label: 'USD — US Dollar' },
        ],
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

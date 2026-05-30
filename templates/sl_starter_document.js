/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * sl_starter_document.js — thin entry for a standard document page.
 * Loads mock data, calls tbt_page.render(), writes response. ~15 lines.
 *
 * In production: replace MOCK_DATA with a record.load / SuiteQL fetch.
 */
define([ 'N/file', './tbt_page' ], (file, tbtPage) => ({

  onRequest(ctx) {
    const body = file.load({ id: './document-page.html' }).getContents();
    const data = {
      tranId:  'PO-2569-0042',
      vendor:  'บจก. ABC จำกัด',
      date:    '2026-05-20',
      dueDate: '2026-06-19',
      status:  'Pending approval',
      author:  'Wichit Wongta',
      lines: [
        { item: 'Laptop',  desc: 'Dell 14" i7', qty: 5,  unit: 'Pcs', price: 35000 },
        { item: 'Monitor', desc: '27" 4K',      qty: 10, unit: 'Pcs', price: 12000 },
      ],
    };
    ctx.response.write(tbtPage.render({
      title:  'Purchase order',
      active: 'purchase-order',
      data,
      body,
    }));
  },

}));

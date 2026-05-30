/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * sl_starter_list.js — thin entry for a list / search page.
 * Loads mock rows, calls tbt_page.render(), writes response. ~15 lines.
 *
 * In production: replace MOCK_DATA with search.create / SuiteQL fetch.
 */
define([ 'N/file', './tbt_page' ], (file, tbtPage) => ({

  onRequest(ctx) {
    const body = file.load({ id: './list-page.html' }).getContents();
    const data = {
      rows: [
        { tranid: 'INV-0001', vendor: 'บจก. ABC', date: '2026-05-22', amount: 107000, status: 'Approved' },
        { tranid: 'INV-0002', vendor: 'บจก. XYZ', date: '2026-05-23', amount:  48500, status: 'Pending'  },
        { tranid: 'INV-0003', vendor: 'บจก. DEF', date: '2026-05-24', amount: 215000, status: 'Approved' },
      ],
      total: 3,
    };
    ctx.response.write(tbtPage.render({
      title:  'Invoice list',
      active: 'invoice',
      data,
      body,
    }));
  },

}));

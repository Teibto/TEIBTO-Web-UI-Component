/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * sl_so_list.js — Sales Order LIST page (main entry).
 * Row click navigates to form?id=<tranid>; New button → form?id=new.
 *
 * In production: replace MOCK_ORDERS with N/search on salesorder.
 */
define([ 'N/file', './tbt_page', './_mock_lookups' ], (file, tbtPage, lookups) => ({

  onRequest(ctx) {
    const body = file.load({ id: './so-list.html' }).getContents();

    const data = {
      customers: lookups.customers,
      statuses: [
        { value: 'Draft',             label: 'Draft' },
        { value: 'Pending approval',  label: 'Pending approval' },
        { value: 'Approved',          label: 'Approved' },
        { value: 'Rejected',          label: 'Rejected' },
      ],
      orders: [
        { id: 1, tranid: 'SO-2026-0001', customer: 'บจก. ABC จำกัด',  customerId: 100, date: '2026-05-22', salesrep: 'Wichit',  amount: 287000, status: 'Approved' },
        { id: 2, tranid: 'SO-2026-0002', customer: 'บจก. XYZ จำกัด',  customerId: 200, date: '2026-05-23', salesrep: 'Somchai', amount: 156500, status: 'Pending approval' },
        { id: 3, tranid: 'SO-2026-0003', customer: 'บจก. ABC จำกัด',  customerId: 100, date: '2026-05-24', salesrep: 'Wichit',  amount:  98000, status: 'Approved' },
        { id: 4, tranid: 'SO-2026-0004', customer: 'บจก. DEF จำกัด',  customerId: 300, date: '2026-05-25', salesrep: 'Apinya',  amount: 412000, status: 'Draft' },
        { id: 5, tranid: 'SO-2026-0005', customer: 'บจก. XYZ จำกัด',  customerId: 200, date: '2026-05-26', salesrep: 'Wichit',  amount:  62500, status: 'Rejected' },
        { id: 6, tranid: 'SO-2026-0006', customer: 'บจก. ABC จำกัด',  customerId: 100, date: '2026-05-27', salesrep: 'Somchai', amount: 198000, status: 'Pending approval' },
        { id: 7, tranid: 'SO-2026-0007', customer: 'บจก. GHI จำกัด',  customerId: 400, date: '2026-05-28', salesrep: 'Apinya',  amount: 345000, status: 'Approved' },
        { id: 8, tranid: 'SO-2026-0008', customer: 'บจก. DEF จำกัด',  customerId: 300, date: '2026-05-29', salesrep: 'Wichit',  amount: 124500, status: 'Pending approval' },
      ],
      formUrl: '/so/form',  // production: '/app/site/hosting/scriptlet.nl?script=customscript_tbt_sl_so_form&deploy=1'
    };

    ctx.response.write(tbtPage.render({
      title:  'Sales orders',
      active: 'sales-order',
      data,
      body,
    }));
  },

}));

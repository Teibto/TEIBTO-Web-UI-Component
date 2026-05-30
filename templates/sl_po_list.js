/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * sl_po_list.js — Purchase order list.
 */
define([ 'N/file', './tbt_page', './_mock_lookups' ], (file, tbtPage, lookups) => ({

  onRequest(ctx) {
    const body = file.load({ id: './po-list.html' }).getContents();

    const data = {
      vendors: lookups.vendors,
      statuses: [
        { value: 'Draft',             label: 'Draft' },
        { value: 'Pending approval',  label: 'Pending approval' },
        { value: 'Approved',          label: 'Approved' },
        { value: 'Rejected',          label: 'Rejected' },
      ],
      records: [
        { id: 1, tranid: 'PO-2026-0001', vendor: 'บจก. ABC จำกัด', vendorId: 500, date: '2026-05-20', due: '2026-06-20', amount: 542000, status: 'Approved' },
        { id: 2, tranid: 'PO-2026-0002', vendor: 'บจก. XYZ จำกัด', vendorId: 501, date: '2026-05-22', due: '2026-06-22', amount: 198500, status: 'Pending approval' },
        { id: 3, tranid: 'PO-2026-0003', vendor: 'บจก. ABC จำกัด', vendorId: 500, date: '2026-05-23', due: '2026-06-23', amount:  87000, status: 'Approved' },
        { id: 4, tranid: 'PO-2026-0004', vendor: 'บจก. XYZ จำกัด', vendorId: 501, date: '2026-05-25', due: '2026-06-25', amount: 312000, status: 'Draft' },
        { id: 5, tranid: 'PO-2026-0005', vendor: 'บจก. ABC จำกัด', vendorId: 500, date: '2026-05-27', due: '2026-06-27', amount:  45500, status: 'Rejected' },
        { id: 6, tranid: 'PO-2026-0006', vendor: 'บจก. XYZ จำกัด', vendorId: 501, date: '2026-05-28', due: '2026-06-28', amount: 228000, status: 'Pending approval' },
      ],
      formUrl: '/po/form',
    };

    ctx.response.write(tbtPage.render({
      title:  'Purchase orders',
      active: 'purchase-order',
      data,
      body,
    }));
  },

}));

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * sl_quotation_list.js — Quotation list.
 */
define([ 'N/file', './tbt_page', './_mock_lookups' ], (file, tbtPage, lookups) => ({

  onRequest(ctx) {
    const body = file.load({ id: './quotation-list.html' }).getContents();

    const data = {
      customers: lookups.customers,
      statuses: [
        { value: 'Draft',    label: 'Draft' },
        { value: 'Sent',     label: 'Sent' },
        { value: 'Accepted', label: 'Accepted' },
        { value: 'Rejected', label: 'Rejected' },
        { value: 'Expired',  label: 'Expired' },
      ],
      records: [
        { id: 1, tranid: 'QT-2026-0001', customer: 'บจก. ABC จำกัด', customerId: 100, date: '2026-05-20', expirydate: '2026-06-19', amount: 287000, status: 'Accepted' },
        { id: 2, tranid: 'QT-2026-0002', customer: 'บจก. XYZ จำกัด', customerId: 200, date: '2026-05-22', expirydate: '2026-06-21', amount: 156500, status: 'Sent' },
        { id: 3, tranid: 'QT-2026-0003', customer: 'บจก. ABC จำกัด', customerId: 100, date: '2026-04-15', expirydate: '2026-05-14', amount:  98000, status: 'Expired' },
        { id: 4, tranid: 'QT-2026-0004', customer: 'บจก. DEF จำกัด', customerId: 300, date: '2026-05-25', expirydate: '2026-06-24', amount: 412000, status: 'Sent' },
        { id: 5, tranid: 'QT-2026-0005', customer: 'บจก. XYZ จำกัด', customerId: 200, date: '2026-05-27', expirydate: '2026-06-26', amount:  62500, status: 'Draft' },
        { id: 6, tranid: 'QT-2026-0006', customer: 'บจก. GHI จำกัด', customerId: 400, date: '2026-05-28', expirydate: '2026-06-27', amount: 345000, status: 'Sent' },
      ],
      formUrl: '/quotation/form',
    };

    ctx.response.write(tbtPage.render({
      title:  'Quotations',
      active: 'quotation',
      data,
      body,
    }));
  },

}));

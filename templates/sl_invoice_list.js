/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * sl_invoice_list.js — Invoice (AR) list.
 */
define([ 'N/file', './tbt_page', './_mock_lookups' ], (file, tbtPage, lookups) => ({

  onRequest(ctx) {
    const body = file.load({ id: './invoice-list.html' }).getContents();

    const data = {
      customers: lookups.customers,
      statuses: [
        { value: 'Draft',             label: 'Draft' },
        { value: 'Pending approval',  label: 'Pending approval' },
        { value: 'Approved',          label: 'Approved' },
        { value: 'Paid',              label: 'Paid' },
      ],
      records: [
        { id: 1, tranid: 'INV-2026-0001', customer: 'บจก. ABC จำกัด', customerId: 100, date: '2026-04-20', duedate: '2026-05-20', amount: 287000, status: 'Paid' },
        { id: 2, tranid: 'INV-2026-0002', customer: 'บจก. XYZ จำกัด', customerId: 200, date: '2026-04-25', duedate: '2026-05-25', amount: 156500, status: 'Pending approval' },
        { id: 3, tranid: 'INV-2026-0003', customer: 'บจก. ABC จำกัด', customerId: 100, date: '2026-05-02', duedate: '2026-06-01', amount:  98000, status: 'Approved' },
        { id: 4, tranid: 'INV-2026-0004', customer: 'บจก. DEF จำกัด', customerId: 300, date: '2026-04-15', duedate: '2026-05-15', amount: 412000, status: 'Approved' },
        { id: 5, tranid: 'INV-2026-0005', customer: 'บจก. XYZ จำกัด', customerId: 200, date: '2026-05-10', duedate: '2026-06-10', amount:  62500, status: 'Draft' },
        { id: 6, tranid: 'INV-2026-0006', customer: 'บจก. GHI จำกัด', customerId: 400, date: '2026-05-15', duedate: '2026-06-14', amount: 198000, status: 'Approved' },
      ],
      formUrl: '/invoice/form',
    };

    ctx.response.write(tbtPage.render({
      title:  'Invoices',
      active: 'invoice',
      data,
      body,
    }));
  },

}));

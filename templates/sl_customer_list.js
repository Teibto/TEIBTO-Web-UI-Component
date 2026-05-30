/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * sl_customer_list.js — Customer master list.
 */
define([ 'N/file', './tbt_page', './_mock_lookups' ], (file, tbtPage, lookups) => ({

  onRequest(ctx) {
    const body = file.load({ id: './customer-list.html' }).getContents();

    const data = {
      categories:   lookups['customer-categories'],
      subsidiaries: lookups.subsidiaries,
      salesreps:    lookups['sales-reps'],
      records: [
        { id: 100, entityid: 'C001', companyname: 'บจก. ABC จำกัด', taxid: '0105563234567', category: 52, categoryLabel: 'Wholesale', subsidiary: 1, salesrep: 2001, salesrepName: 'Wichit',  creditlimit: 500000,  outstanding: 245000 },
        { id: 200, entityid: 'C002', companyname: 'บจก. XYZ จำกัด', taxid: '0105557891234', category: 53, categoryLabel: 'VIP',       subsidiary: 1, salesrep: 2002, salesrepName: 'Somchai', creditlimit: 1500000, outstanding: 890000 },
        { id: 300, entityid: 'C003', companyname: 'บจก. DEF จำกัด', taxid: '0105561112233', category: 51, categoryLabel: 'Retail',    subsidiary: 2, salesrep: 2001, salesrepName: 'Wichit',  creditlimit: 200000,  outstanding: 250000 },
        { id: 400, entityid: 'C004', companyname: 'บจก. GHI จำกัด', taxid: '0105559998877', category: 52, categoryLabel: 'Wholesale', subsidiary: 1, salesrep: 2002, salesrepName: 'Somchai', creditlimit: 800000,  outstanding: 412000 },
        { id: 500, entityid: 'C005', companyname: 'บจก. JKL จำกัด', taxid: '0105556665544', category: 53, categoryLabel: 'VIP',       subsidiary: 2, salesrep: 2001, salesrepName: 'Wichit',  creditlimit: 2000000, outstanding: 1850000 },
        { id: 600, entityid: 'C006', companyname: 'บจก. MNO จำกัด', taxid: '0105554443322', category: 51, categoryLabel: 'Retail',    subsidiary: 1, salesrep: 2002, salesrepName: 'Somchai', creditlimit: 150000,  outstanding:  62000 },
      ],
      formUrl: '/customer/form',
    };

    ctx.response.write(tbtPage.render({
      title:  'Customers',
      active: 'customer',
      data,
      body,
    }));
  },

}));

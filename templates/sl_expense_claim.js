/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * sl_expense_claim.js — Expense claim entry.
 * Thin entry: loads mock data + renders via tbt_page.render.
 *
 * In production: replace MOCK_* with N/search on expensereport record
 * + N/runtime for current user.
 */
define([ 'N/file', './tbt_page', './_mock_lookups' ], (file, tbtPage, lookups) => ({

  onRequest(ctx) {
    const body = file.load({ id: './expense-claim.html' }).getContents();
    const claimId = ctx.request.parameters?.id || 'EXP-2026-0042';

    const data = {
      claim: {
        id:         claimId,
        employee:   'Wichit Wongta',
        employeeId: 'EMP_001',
        period:     '25 - 31 May 2026',
        status:     'Draft',
      },
      employees: lookups.employees,
      categories: [
        { value: 'FOOD',      label: 'Food & beverage' },
        { value: 'TRAVEL',    label: 'Travel & transport' },
        { value: 'HOTEL',     label: 'Accommodation' },
        { value: 'EQUIPMENT', label: 'Equipment & supplies' },
        { value: 'PARKING',   label: 'Parking & tolls' },
        { value: 'PHONE',     label: 'Phone & internet' },
        { value: 'OTHER',     label: 'Other' },
      ],
      statuses: lookups.statuses.payment,
      lines: [
        { id: 'EX-1001', date: '2026-05-25', category: 'TRAVEL',    categoryLabel: 'Travel & transport',   merchant: 'Grab Thailand',     amount: 350,   billable: true,  receipt: 'https://example.com/r1.pdf', memo: 'Client meeting · BKK' },
        { id: 'EX-1002', date: '2026-05-25', category: 'FOOD',      categoryLabel: 'Food & beverage',      merchant: 'Sushi Hiro',        amount: 1850,  billable: true,  receipt: 'https://example.com/r2.pdf', memo: 'Client lunch (4 pax)' },
        { id: 'EX-1003', date: '2026-05-26', category: 'HOTEL',     categoryLabel: 'Accommodation',        merchant: 'Renaissance Hotel', amount: 4500,  billable: true,  receipt: 'https://example.com/r3.pdf', memo: '1 night · client visit' },
        { id: 'EX-1004', date: '2026-05-27', category: 'EQUIPMENT', categoryLabel: 'Equipment & supplies', merchant: 'Office Mate',       amount: 890,   billable: false, receipt: '',                              memo: 'USB-C dock' },
        { id: 'EX-1005', date: '2026-05-28', category: 'PARKING',   categoryLabel: 'Parking & tolls',      merchant: 'EasyPass',          amount: 125,   billable: false, receipt: 'https://example.com/r5.pdf', memo: 'Tolls to airport' },
        { id: 'EX-1006', date: '2026-05-29', category: 'PHONE',     categoryLabel: 'Phone & internet',     merchant: 'AIS',               amount: 599,   billable: false, receipt: 'https://example.com/r6.pdf', memo: 'Monthly mobile plan' },
      ],
      approvalSteps: [
        { id: '1', label: 'Submitted', approver: 'Wichit Wongta',  status: 'approved', timestamp: '2026-05-30T08:00:00Z' },
        { id: '2', label: 'Manager',   approver: 'Somchai Jaidee', status: 'current'  },
        { id: '3', label: 'Finance',   approver: 'Apinya Sukjai',  status: 'pending'  },
      ],
      restletUrl: '/app/site/hosting/restlet.nl?script=customscript_tbt_rl_expense&deploy=1',
    };

    ctx.response.write(tbtPage.render({
      title:  'Expense claim',
      active: 'expense',
      data,
      body,
    }));
  },

}));

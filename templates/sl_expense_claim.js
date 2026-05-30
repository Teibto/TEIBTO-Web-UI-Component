/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * sl_expense_claim.js — employee expense claim entry. Reads ?id= and loads the
 * real claim via expense_lib; writes go through rl_expense (RESTlet). Falls back
 * to demo data (data.demo=true → warning banner) when the custom record is not
 * deployed yet. Mirrors sl_bill_receipt_form.
 */
define(['N/file', 'N/url', './tbt_page', './expense_lib', './_mock_lookups'],
(file, url, tbtPage, lib, lookups) => ({

  onRequest(ctx) {
    const body = file.load({ id: './expense-claim.html' }).getContents();
    const id   = ctx.request.parameters.id || null;

    const restletUrl = url.resolveScript({
      scriptId: 'customscript_tbt_rl_expense',
      deploymentId: 'customdeploy_tbt_rl_expense',
    });

    const categories = [
      { value: 'FOOD',      label: 'Food & beverage' },
      { value: 'TRAVEL',    label: 'Travel & transport' },
      { value: 'HOTEL',     label: 'Accommodation' },
      { value: 'EQUIPMENT', label: 'Equipment & supplies' },
      { value: 'PARKING',   label: 'Parking & tolls' },
      { value: 'PHONE',     label: 'Phone & internet' },
      { value: 'OTHER',     label: 'Other' },
    ];
    const statuses = lookups.statuses.payment;
    const catLabel = (v) => (categories.find((c) => c.value === v) || {}).label || v;

    let data;
    try {
      const loaded = id
        ? lib.load(id)
        : { claim: { id: null, tranid: '', employee: '', employeeId: '', period: '', status: 'Draft' }, lines: [] };
      data = {
        claim: {
          id: loaded.claim.id, tranid: loaded.claim.tranid,
          employee: loaded.claim.employee, employeeId: loaded.claim.employeeId,
          period: loaded.claim.period, status: loaded.claim.status,
        },
        lines: loaded.lines.map((l) => ({ ...l, categoryLabel: catLabel(l.category) })),
        categories,
        employees: lib.employees(),
        statuses,
        approvalSteps: approvalFor(loaded.claim.status),
        restletUrl,
        demo: false,
      };
    } catch (e) {
      log.audit({ title: 'sl_expense_claim falling back to demo', details: e.message });
      data = mockData(id, restletUrl, categories, statuses, lookups);
    }

    ctx.response.write(tbtPage.render({
      title:  data.claim.tranid ? 'Expense claim · ' + data.claim.tranid : 'Expense claim',
      active: 'expense',
      data,
      body,
    }));
  },

}));

/* ── Helpers ─────────────────────────────────────────────────────────── */

function approvalFor(status) {
  const steps = [
    { id: '1', label: 'Submitted', approver: 'Submitter', status: 'pending' },
    { id: '2', label: 'Manager',   approver: 'Approver',  status: 'pending' },
    { id: '3', label: 'Finance',   approver: 'Payment',   status: 'pending' },
  ];
  if (status === 'Submitted') { steps[0].status = 'approved'; steps[1].status = 'current'; }
  else if (status === 'Approved') { steps[0].status = steps[1].status = 'approved'; steps[2].status = 'current'; }
  else if (status === 'Paid') { steps.forEach((s) => { s.status = 'approved'; }); }
  else if (status === 'Rejected') { steps[0].status = 'approved'; steps[1].status = 'rejected'; }
  else { steps[0].status = 'current'; }
  return steps;
}

/* ── Demo fallback (custom record not deployed) ───────────────────────── */

function mockData(id, restletUrl, categories, statuses, lookups) {
  const base = { categories, statuses, employees: lookups.employees, restletUrl, demo: true };
  if (!id) {
    return Object.assign({}, base, {
      claim: { id: null, tranid: '', employee: '', employeeId: '', period: '', status: 'Draft' },
      lines: [], approvalSteps: approvalFor('Draft'),
    });
  }
  return Object.assign({}, base, {
    claim: { id, tranid: 'EXP-2569-0007', employee: 'Wichit Wongta', employeeId: '2001', period: 'May 2026', status: 'Submitted' },
    lines: [
      { id: 'L1', date: '2026-05-04', category: 'TRAVEL', categoryLabel: 'Travel & transport',   merchant: 'Thai Airways',   amount: 12500, billable: true,  receipt: 'https://rcpt/1', memo: 'BKK-CNX flight' },
      { id: 'L2', date: '2026-05-09', category: 'FOOD',   categoryLabel: 'Food & beverage',      merchant: 'S&P Restaurant', amount: 1850,  billable: false, receipt: '',              memo: 'Client lunch' },
      { id: 'L3', date: '2026-05-14', category: 'HOTEL',  categoryLabel: 'Accommodation',        merchant: 'Dusit Thani',    amount: 4200,  billable: true,  receipt: 'https://rcpt/3', memo: '1 night' },
    ],
    approvalSteps: approvalFor('Submitted'),
  });
}

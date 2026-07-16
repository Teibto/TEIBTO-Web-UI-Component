/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 * @since 2026-07-16
 *
 * sl_expense_claim.js — employee expense claim (เบิกค่าใช้จ่าย) entry page.
 * Reads ?id= and loads the real claim via expense_lib; writes go through
 * rl_expense (RESTlet). Falls back to demo data (data.demo=true → warning
 * banner) when the custom record is not deployed yet. Mirrors
 * sl_bill_receipt_form.
 */
define(['N/file', 'N/url', './tbt_page', './tbt_nav', './expense_lib'],
(file, url, tbtPage, nav, lib) => ({

  onRequest(ctx) {
    const body = file.load({ id: './expense-claim.html' }).getContents();
    const id   = ctx.request.parameters.id || null;

    const restletUrl = url.resolveScript({
      scriptId: 'customscript_tbt_rl_expense',
      deploymentId: 'customdeploy_tbt_rl_expense',
    });
    // "กลับ" fallback when the form was opened as a direct link (no history) —
    // this module has no list page, so the blank claim form is its landing.
    const listUrl = url.resolveScript({
      scriptId: 'customscript_tbt_sl_expense_claim',
      deploymentId: 'customdeploy_tbt_sl_expense_claim',
    });

    const categories = [
      { value: 'FOOD',      label: 'อาหารและเครื่องดื่ม' },
      { value: 'TRAVEL',    label: 'เดินทาง' },
      { value: 'HOTEL',     label: 'ที่พัก' },
      { value: 'EQUIPMENT', label: 'อุปกรณ์และวัสดุ' },
      { value: 'PARKING',   label: 'ที่จอดรถ/ทางด่วน' },
      { value: 'PHONE',     label: 'โทรศัพท์/อินเทอร์เน็ต' },
      { value: 'OTHER',     label: 'อื่น ๆ' },
    ];
    const catLabel = (v) => (categories.find((c) => c.value === v) || {}).label || v;

    let data;
    try {
      const loaded = id ? lib.load(id) : { claim: blankClaim(), lines: [] };
      data = {
        claim: loaded.claim,
        lines: loaded.lines.map((l) => ({ ...l, categoryLabel: catLabel(l.category) })),
        categories,
        employees: lib.employees(),
        approvalSteps: approvalFor(loaded.claim.status),
        restletUrl,
        listUrl,
        demo: false,
      };
    } catch (e) {
      // Record type not deployed yet, or id not found → demo fallback.
      log.audit({ title: 'sl_expense_claim falling back to demo', details: e.message });
      data = mockData(id, restletUrl, categories, catLabel);
      data.listUrl = listUrl;
    }

    ctx.response.write(tbtPage.render({
      title:  data.claim.tranid ? 'ใบเบิกค่าใช้จ่าย · ' + data.claim.tranid : 'สร้างใบเบิกค่าใช้จ่าย',
      sidebar: nav.sidebar(),      // production nav — only deployed modules (#28)
      active: 'expense',
      data,
      body,
    }));
  },

}));

/* ── Helpers ─────────────────────────────────────────────────────────── */

function blankClaim() {
  return { id: null, tranid: '', employee: '', employeeId: '', period: '', status: 'Draft' };
}

// Static approval-chain visualization derived from status. (The actual approval
// authority is enforced server-side in the RESTlet; this is display only.)
function approvalFor(status) {
  const steps = [
    { label: 'ผู้เบิก',      approver: 'ผู้ทำรายการ', status: 'pending' },
    { label: 'ผู้อนุมัติ',    approver: 'หัวหน้างาน',  status: 'pending' },
    { label: 'การเงิน',     approver: 'จ่ายคืน',     status: 'pending' },
  ];
  if (status === 'Submitted') { steps[0].status = 'approved'; steps[1].status = 'current'; }
  else if (status === 'Approved') { steps[0].status = steps[1].status = 'approved'; steps[2].status = 'current'; }
  else if (status === 'Paid') { steps.forEach((s) => { s.status = 'approved'; }); }
  else if (status === 'Rejected') { steps[0].status = 'approved'; steps[1].status = 'rejected'; }
  else { steps[0].status = 'current'; }
  // Thai badge text (the component defaults are English).
  const TH = { approved: 'อนุมัติแล้ว', current: 'รอดำเนินการ', pending: 'ยังไม่ถึงขั้นนี้', rejected: 'ตีกลับ', skipped: 'ข้าม' };
  steps.forEach((s) => { s.statusLabel = TH[s.status] || s.status; });
  return steps;
}

/* ── Demo fallback (only used when the custom record is not deployed) ──── */

function mockData(id, restletUrl, categories, catLabel) {
  const employees = [
    { value: '2001', label: 'สมชาย ใจดี' },
    { value: '2002', label: 'สมหญิง รักงาน' },
  ];
  const base = { categories, employees, restletUrl, demo: true };
  if (!id) {
    return Object.assign({}, base, {
      claim: blankClaim(), lines: [], approvalSteps: approvalFor('Draft'),
    });
  }
  return Object.assign({}, base, {
    claim: { id, tranid: 'EXP-2569-0007', employee: 'สมชาย ใจดี', employeeId: '2001', period: 'พฤษภาคม 2569', status: 'Submitted' },
    lines: [
      { id: 'L1', date: '2026-05-04', category: 'TRAVEL', merchant: 'สายการบินไทย',   amount: 12500, billable: true,  receipt: 'https://rcpt/1', memo: 'ตั๋วเครื่องบิน กทม.-เชียงใหม่' },
      { id: 'L2', date: '2026-05-09', category: 'FOOD',   merchant: 'ร้านอาหาร S&P', amount: 1850,  billable: false, receipt: '',               memo: 'เลี้ยงรับรองลูกค้า' },
      { id: 'L3', date: '2026-05-14', category: 'HOTEL',  merchant: 'ดุสิตธานี',      amount: 4200,  billable: true,  receipt: 'https://rcpt/3', memo: 'ที่พัก 1 คืน' },
    ].map((l) => ({ ...l, categoryLabel: catLabel(l.category) })),
    approvalSteps: approvalFor('Submitted'),
  });
}

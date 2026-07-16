/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * sl_bill_receipt_form.js — vendor bill receipt (รับวางบิล) document page.
 * Reads ?id=, loads the real voucher via bill_receipt_lib, renders the page.
 * Writes go through rl_bill_receipt (RESTlet), not here.
 *
 * Resilient bootstrap: if the custom record is not deployed yet (fresh
 * account / first install), load() throws — we fall back to mock data and set
 * data.demo=true so the page can show a "demo data" banner instead of erroring.
 */
define(['N/file', 'N/url', './tbt_page', './tbt_nav', './bill_receipt_lib', './bill_receipt_meta'],
(file, url, tbtPage, nav, lib, meta) => ({

  onRequest(ctx) {
    const body = file.load({ id: './bill-receipt-form.html' }).getContents();
    const id   = ctx.request.parameters.id || null;

    const restletUrl = url.resolveScript({
      scriptId: 'customscript_tbt_rl_bill_receipt',
      deploymentId: 'customdeploy_tbt_rl_bill_receipt',
    });
    // "กลับ" fallback when the form was opened as a direct link (no history).
    const listUrl = url.resolveScript({
      scriptId: 'customscript_tbt_sl_bill_receipt_list',
      deploymentId: 'customdeploy_tbt_sl_bill_receipt_list',
    });

    let data;
    try {
      const loaded = id ? lib.load(id) : { voucher: blankVoucher(), lines: [] };
      data = {
        voucher: loaded.voucher,
        lines: loaded.lines,
        vendors: lib.vendors(),
        vatRate: 0.07,
        approvalSteps: approvalFor(loaded.voucher.status),
        auditEntries: [],   // wire to a system-note search per record if needed
        restletUrl,
        listUrl,
        demo: false,
      };
    } catch (e) {
      // Record type not deployed yet, or id not found → demo fallback.
      log.audit({ title: 'sl_bill_receipt_form falling back to demo', details: e.message });
      data = mockData(id, restletUrl);
      data.listUrl = listUrl;
    }

    ctx.response.write(tbtPage.render({
      title:  data.voucher.tranid ? 'ใบวางบิล · ' + data.voucher.tranid : 'สร้างใบวางบิล',
      sidebar: nav.sidebar(),      // production nav — only deployed modules (#28)
      active: 'bill-receipt',
      data,
      body,
    }));
  },

}));

/* ── Helpers ─────────────────────────────────────────────────────────── */

function blankVoucher() {
  return { id: null, tranid: '', vendor: '', vendorId: '', receiveDate: '', dueDate: '', contact: '', reference: '', status: 'Draft' };
}

// Static approval-chain visualization derived from status. (The actual approval
// authority is enforced server-side in the RESTlet; this is display only.)
function approvalFor(status) {
  const steps = [
    { label: 'ผู้รับวางบิล', approver: 'ผู้ทำรายการ', status: 'pending' },
    { label: 'หัวหน้าบัญชี',  approver: 'ผู้อนุมัติ',   status: 'pending' },
  ];
  if (status === 'Submitted') { steps[0].status = 'approved'; steps[1].status = 'current'; }
  else if (status === 'Approved' || status === 'Paid') { steps[0].status = 'approved'; steps[1].status = 'approved'; }
  else if (status === 'Rejected') { steps[0].status = 'approved'; steps[1].status = 'rejected'; }
  else { steps[0].status = 'current'; }
  // Thai badge text (the component defaults are English).
  const TH = { approved: 'อนุมัติแล้ว', current: 'รอดำเนินการ', pending: 'ยังไม่ถึงขั้นนี้', rejected: 'ตีกลับ', skipped: 'ข้าม' };
  steps.forEach((s) => { s.statusLabel = TH[s.status] || s.status; });
  return steps;
}

/* ── Demo fallback (only used when the custom record is not deployed) ──── */

function mockData(id, restletUrl) {
  const vendors = [
    { value: '101', label: 'บจก. เอบีซี ซัพพลาย' },
    { value: '102', label: 'บจก. เอ็กซ์วายแซด เทรดดิ้ง' },
    { value: '103', label: 'หจก. ดีอีเอฟ เซอร์วิส' },
  ];
  if (!id) {
    return { voucher: blankVoucher(), lines: [], vendors, vatRate: 0.07,
      approvalSteps: approvalFor('Draft'), auditEntries: [], restletUrl, demo: true };
  }
  return {
    voucher: { id, tranid: 'BR-2569-0001', vendor: 'บจก. เอบีซี ซัพพลาย', vendorId: '101',
      receiveDate: '2026-05-20', dueDate: '2026-06-19', contact: 'คุณสมหญิง (ฝ่ายขาย)',
      reference: 'DEL-2569-1180', status: 'Submitted' },
    lines: [
      { id: 'IV-1', invoiceNo: 'ABC-25-0455', invoiceDate: '2026-05-12', poNo: 'PO-2569-0210', amount: 120000, vat: 8400, memo: 'งวดที่ 1' },
      { id: 'IV-2', invoiceNo: 'ABC-25-0461', invoiceDate: '2026-05-15', poNo: 'PO-2569-0210', amount: 150000, vat: 10500, memo: 'งวดที่ 2' },
      { id: 'IV-3', invoiceNo: 'ABC-25-0470', invoiceDate: '2026-05-18', poNo: 'PO-2569-0225', amount: 30000, vat: 2100, memo: 'ค่าขนส่ง' },
    ],
    vendors, vatRate: 0.07, approvalSteps: approvalFor('Submitted'), auditEntries: [],
    restletUrl, demo: true,
  };
}

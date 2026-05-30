/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * sl_bill_receipt_form.js — thin entry for the vendor bill receipt (รับวางบิล) document.
 * Reads ?id= from the request, loads mock data, calls tbt_page.render().
 *
 * In production: replace MOCK with record.load of the billing-voucher custom
 * record + its vendor invoice sublist, resolve vendors via search, and POST the
 * action payload to a RESTlet that updates the record + approval status.
 */
define([ 'N/file', './tbt_page' ], (file, tbtPage) => ({

  onRequest(ctx) {
    const body = file.load({ id: './bill-receipt-form.html' }).getContents();
    const id   = ctx.request.parameters.id || null;

    const data = id ? existingVoucher(id) : blankVoucher();

    ctx.response.write(tbtPage.render({
      title:  id ? 'ใบวางบิล · ' + data.voucher.tranid : 'สร้างใบวางบิล',
      active: 'invoice',
      data,
      body,
    }));
  },

}));

/* ── Mock builders (swap for record.load in production) ──────────────── */

function vendors() {
  return [
    { value: '101', label: 'บจก. เอบีซี ซัพพลาย' },
    { value: '102', label: 'บจก. เอ็กซ์วายแซด เทรดดิ้ง' },
    { value: '103', label: 'หจก. ดีอีเอฟ เซอร์วิส' },
  ];
}

function blankVoucher() {
  return {
    voucher: {
      id: null, tranid: '', vendor: '', vendorId: '',
      receiveDate: '', dueDate: '', contact: '', reference: '', status: 'Draft',
    },
    lines: [],
    vendors: vendors(),
    vatRate: 0.07,
    approvalSteps: [
      { label: 'ผู้รับวางบิล', approver: 'Wichit Wongta', status: 'current' },
      { label: 'หัวหน้าบัญชี',  approver: 'มานี ใจดี',     status: 'pending' },
      { label: 'ผู้อนุมัติ',    approver: 'สมชาย รักงาน',  status: 'pending' },
    ],
    auditEntries: [],
    restletUrl: '/app/site/hosting/restlet.nl?script=customscript_rl_bill_receipt&deploy=1',
  };
}

function existingVoucher(id) {
  return {
    voucher: {
      id: id,
      tranid: 'BR-2569-0001',
      vendor: 'บจก. เอบีซี ซัพพลาย',
      vendorId: '101',
      receiveDate: '2026-05-20',
      dueDate: '2026-06-19',
      contact: 'คุณสมหญิง (ฝ่ายขาย)',
      reference: 'DEL-2569-1180',
      status: 'Submitted',
    },
    lines: [
      { id: 'IV-1', invoiceNo: 'ABC-25-0455', invoiceDate: '2026-05-12', poNo: 'PO-2569-0210', amount: 120000, vat: 8400, memo: 'งวดที่ 1' },
      { id: 'IV-2', invoiceNo: 'ABC-25-0461', invoiceDate: '2026-05-15', poNo: 'PO-2569-0210', amount: 150000, vat: 10500, memo: 'งวดที่ 2' },
      { id: 'IV-3', invoiceNo: 'ABC-25-0470', invoiceDate: '2026-05-18', poNo: 'PO-2569-0225', amount: 30000, vat: 2100, memo: 'ค่าขนส่ง' },
    ],
    vendors: vendors(),
    vatRate: 0.07,
    approvalSteps: [
      { label: 'ผู้รับวางบิล', approver: 'Wichit Wongta', status: 'approved', timestamp: '2026-05-20 14:10', comment: 'ตรวจครบ' },
      { label: 'หัวหน้าบัญชี',  approver: 'มานี ใจดี',     status: 'current' },
      { label: 'ผู้อนุมัติ',    approver: 'สมชาย รักงาน',  status: 'pending' },
    ],
    auditEntries: [
      { action: 'created',   user: 'Wichit Wongta', timestamp: '2026-05-20T13:40:00' },
      { action: 'submitted', user: 'Wichit Wongta', timestamp: '2026-05-20T14:10:00',
        changes: [{ field: 'Status', from: 'Draft', to: 'Submitted' }] },
    ],
    restletUrl: '/app/site/hosting/restlet.nl?script=customscript_rl_bill_receipt&deploy=1',
  };
}

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * sl_bill_receipt_list.js — vendor bill receipt (รับวางบิล) list page.
 * Reads real rows via bill_receipt_lib.list (SuiteQL); resolves the form
 * Suitelet URL via N/url. Falls back to demo data (data.demo=true) when the
 * custom record is not deployed yet, so a fresh account still renders.
 */
define(['N/file', 'N/url', './tbt_page', './tbt_nav', './bill_receipt_lib'],
(file, url, tbtPage, nav, lib) => ({

  onRequest(ctx) {
    const body = file.load({ id: './bill-receipt-list.html' }).getContents();

    const formUrl = url.resolveScript({
      scriptId: 'customscript_tbt_sl_bill_receipt_form',
      deploymentId: 'customdeploy_tbt_sl_bill_receipt_form',
    });

    const statuses = [
      { value: 'Draft',     label: 'ร่าง' },
      { value: 'Submitted', label: 'รอตรวจรับ' },
      { value: 'Approved',  label: 'อนุมัติแล้ว' },
      { value: 'Rejected',  label: 'ตีกลับ' },
      { value: 'Paid',      label: 'ชำระแล้ว' },
    ];

    let data;
    try {
      data = {
        rows: lib.list({}),
        statuses,
        formUrl: formUrl + (formUrl.indexOf('?') === -1 ? '?' : '&') + 'id=',
        newUrl:  formUrl,
        demo: false,
      };
    } catch (e) {
      log.audit({ title: 'sl_bill_receipt_list falling back to demo', details: e.message });
      data = { rows: mockRows(), statuses, formUrl: formUrl + '&id=', newUrl: formUrl, demo: true };
    }

    ctx.response.write(tbtPage.render({
      title: 'รับวางบิล',
      sidebar: nav.sidebar(),      // production nav — only deployed modules (#28)
      active: 'bill-receipt',
      data,
      body,
    }));
  },

}));

function mockRows() {
  return [
    { id: 1, tranid: 'BR-2569-0001', vendor: 'บจก. เอบีซี ซัพพลาย', receiveDate: '2026-05-20', dueDate: '2026-06-19', invoiceCount: 3, total: 321500, status: 'Submitted' },
    { id: 2, tranid: 'BR-2569-0002', vendor: 'บจก. เอ็กซ์วายแซด เทรดดิ้ง', receiveDate: '2026-05-21', dueDate: '2026-06-20', invoiceCount: 1, total: 48500, status: 'Approved' },
    { id: 3, tranid: 'BR-2569-0003', vendor: 'หจก. ดีอีเอฟ เซอร์วิส', receiveDate: '2026-05-22', dueDate: '2026-06-06', invoiceCount: 5, total: 214900, status: 'Draft' },
    { id: 4, tranid: 'BR-2569-0004', vendor: 'บจก. เอบีซี ซัพพลาย', receiveDate: '2026-05-18', dueDate: '2026-06-17', invoiceCount: 2, total: 132000, status: 'Paid' },
  ];
}

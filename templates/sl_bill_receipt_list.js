/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * sl_bill_receipt_list.js — thin entry for the vendor bill receipt (รับวางบิล) list.
 * Loads mock rows, calls tbt_page.render(), writes response.
 *
 * In production: replace MOCK rows with search.create / SuiteQL over vendorbill
 * grouped by the billing-voucher custom record, and derive formUrl/newUrl from
 * url.resolveScript().
 */
define([ 'N/file', './tbt_page' ], (file, tbtPage) => ({

  onRequest(ctx) {
    const body = file.load({ id: './bill-receipt-list.html' }).getContents();
    const data = {
      rows: [
        { id: 1, tranid: 'BR-2569-0001', vendor: 'บจก. เอบีซี ซัพพลาย', receiveDate: '2026-05-20', dueDate: '2026-06-19', invoiceCount: 3, total: 321500, status: 'Submitted' },
        { id: 2, tranid: 'BR-2569-0002', vendor: 'บจก. เอ็กซ์วายแซด เทรดดิ้ง', receiveDate: '2026-05-21', dueDate: '2026-06-20', invoiceCount: 1, total:  48500, status: 'Approved'  },
        { id: 3, tranid: 'BR-2569-0003', vendor: 'หจก. ดีอีเอฟ เซอร์วิส', receiveDate: '2026-05-22', dueDate: '2026-06-06', invoiceCount: 5, total: 214900, status: 'Draft'     },
        { id: 4, tranid: 'BR-2569-0004', vendor: 'บจก. เอบีซี ซัพพลาย', receiveDate: '2026-05-18', dueDate: '2026-06-17', invoiceCount: 2, total: 132000, status: 'Paid'      },
      ],
      statuses: [
        { value: 'Draft',     label: 'ร่าง' },
        { value: 'Submitted', label: 'รอตรวจรับ' },
        { value: 'Approved',  label: 'อนุมัติแล้ว' },
        { value: 'Rejected',  label: 'ตีกลับ' },
        { value: 'Paid',      label: 'ชำระแล้ว' },
      ],
      // In production resolve via N/url.resolveScript to the form Suitelet.
      formUrl: '/app/site/hosting/scriptlet.nl?script=customscript_sl_bill_receipt_form&deploy=1&id=',
      newUrl:  '/app/site/hosting/scriptlet.nl?script=customscript_sl_bill_receipt_form&deploy=1',
    };
    ctx.response.write(tbtPage.render({
      title:  'รับวางบิล',
      active: 'invoice',
      data,
      body,
    }));
  },

}));

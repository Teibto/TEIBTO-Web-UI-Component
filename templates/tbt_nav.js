/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 * @since 2026-07-16
 *
 * tbt_nav.js — production sidebar for Suitelet pages (issue #28).
 *
 * The menu lists ONLY modules actually deployed on the account — every href
 * resolves through N/url at request time, so nothing can 404. Add an entry
 * here when a module's Suitelet lands (and remove it if the module is pulled).
 * DEFAULT_SIDEBAR in tbt_page.js stays as-is for dev-server demo pages.
 *
 * Usage in a Suitelet:
 *   define([..., './tbt_nav'], (..., nav) => ...
 *   tbtPage.render({ ..., sidebar: nav.sidebar(), active: 'bill-receipt' })
 */
define(['N/url'], (url) => {

  // ลำดับในเมนู = ลำดับใน array นี้ · key ใช้กับ opts.active ของ tbt_page.render
  const MODULES = [
    {
      key: 'bill-receipt',
      icon: 'invoice',
      label: 'รับวางบิล',
      scriptId: 'customscript_tbt_sl_bill_receipt_list',
      deploymentId: 'customdeploy_tbt_sl_bill_receipt_list',
    },
    // expense-claim: เพิ่มเมื่อ record XMLs ผ่าน SDF validation และ deploy จริง
    // (ดู netsuite/DEPLOY.md — pattern เดียวกับ bill receipt)
  ];

  function sidebar() {
    return MODULES.map((m) => ({
      key: m.key,
      icon: m.icon,
      label: m.label,
      href: url.resolveScript({ scriptId: m.scriptId, deploymentId: m.deploymentId }),
    }));
  }

  return { sidebar };
});

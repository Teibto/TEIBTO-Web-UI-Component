/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * sl_starter_dashboard.js — thin entry for the KPI dashboard.
 * Loads mock stats, calls tbt_page.render(), writes response. ~15 lines.
 */
define([ 'N/file', './tbt_page' ], (file, tbtPage) => ({

  onRequest(ctx) {
    const body = file.load({ id: './dashboard.html' }).getContents();
    const data = {
      stats: {
        sales:   { value: '฿2,450,000', trend: '+12.4%', variant: 'primary' },
        orders:  { value: '128',        trend: '+8.1%',  variant: 'info' },
        pending: { value: '14',         trend: '+2',     variant: 'warning' },
        overdue: { value: '3',          trend: '-1',     variant: 'danger' },
      },
      salesByMonth: [
        { label: 'Jan', value: 1850000 }, { label: 'Feb', value: 2100000 },
        { label: 'Mar', value: 1720000 }, { label: 'Apr', value: 2380000 },
        { label: 'May', value: 2450000 },
      ],
      ordersByStatus: [
        { label: 'Approved', value: 86,  variant: 'success' },
        { label: 'Pending',  value: 28,  variant: 'warning' },
        { label: 'Draft',    value: 11,  variant: 'info' },
        { label: 'Rejected', value: 3,   variant: 'danger' },
      ],
      pending: [
        { tranid: 'PO-2569-0042', type: 'Purchase order', amount: '฿107,000', due: '2026-06-19' },
        { tranid: 'INV-0007',     type: 'AP Invoice',     amount: '฿ 48,500', due: '2026-06-05' },
      ],
      recent: [
        { id: '3', timestamp: '2026-05-30T10:00:00Z', user: 'Somchai', action: 'approved', label: 'PO-2569-0042 approved' },
        { id: '2', timestamp: '2026-05-30T09:00:00Z', user: 'Wichit',  action: 'created',  label: 'INV-0007 created' },
      ],
    };
    ctx.response.write(tbtPage.render({
      title:  'Dashboard',
      active: 'dashboard',
      data,
      body,
    }));
  },

}));

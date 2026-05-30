/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * sl_tt_report.js — Time tracking · Reporting / utilization dashboard.
 */
define([ 'N/file', './tbt_page', './_mock_lookups' ], (file, tbtPage, lookups) => ({

  onRequest(ctx) {
    const body = file.load({ id: './time-tracking-report.html' }).getContents();

    const data = {
      period: { from: '2026-05-01', to: '2026-05-31' },
      kpis: {
        headcount:        12,
        utilization:      79,
        utilizationTrend: '+3.2%',
        billable:         1264,
        billableTrend:    '+8.4%',
        capacity:         1600,
        overtime:         42,
        overtimeTrend:    '-12.0%',
      },
      departments: lookups.departments.concat([{ value: 'SALES', label: 'Sales' }]),
      employees:   lookups.employees,
      projects: [
        { projectLabel: 'Teibto ERP Implementation', lead: 'Wichit Wongta',  total: 412, billable: 380, billablePct: '92%' },
        { projectLabel: 'AP Automation',             lead: 'Apinya Sukjai',  total: 287, billable: 230, billablePct: '80%' },
        { projectLabel: 'Q1 Audit',                  lead: 'Apinya Sukjai',  total: 198, billable: 198, billablePct: '100%' },
        { projectLabel: 'Customer support — Q2',     lead: 'Wichit Wongta',  total: 154, billable: 142, billablePct: '92%' },
        { projectLabel: 'Design System v2',          lead: 'Wichit Wongta',  total: 138, billable:   0, billablePct: '0%' },
        { projectLabel: 'Internal admin',            lead: '—',              total: 122, billable:   0, billablePct: '0%' },
        { projectLabel: 'Warehouse cutover',         lead: 'Somchai Jaidee', total:  98, billable:  98, billablePct: '100%' },
      ],
      activity: [
        { id: '5', timestamp: '2026-05-30T11:00:00Z', user: 'Apinya Sukjai',  action: 'approved',  label: 'Approved Wichit Wongta · week 22' },
        { id: '4', timestamp: '2026-05-30T10:30:00Z', user: 'Apinya Sukjai',  action: 'submitted', label: 'Submitted week 22' },
        { id: '3', timestamp: '2026-05-30T09:15:00Z', user: 'Somchai Jaidee', action: 'submitted', label: 'Submitted week 22' },
        { id: '2', timestamp: '2026-05-30T08:00:00Z', user: 'Wichit Wongta',  action: 'submitted', label: 'Submitted week 22' },
        { id: '1', timestamp: '2026-05-29T17:30:00Z', user: 'Wichit Wongta',  action: 'updated',   label: 'Added 5.0h on Audit log component',
          changes: [{ field: 'Total hours', from: '29.5', to: '34.5' }] },
      ],
    };

    ctx.response.write(tbtPage.render({
      title:  'Time tracking · Reporting',
      active: 'time-tracking',
      data,
      body,
    }));
  },

}));

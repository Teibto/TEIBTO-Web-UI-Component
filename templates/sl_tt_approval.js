/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * sl_tt_approval.js — Time tracking · Manager approval queue.
 */
define([ 'N/file', './tbt_page', './_mock_lookups' ], (file, tbtPage, lookups) => ({

  onRequest(ctx) {
    const body = file.load({ id: './time-tracking-approval.html' }).getContents();

    const data = {
      summary: {
        pending:          3,
        approvedThisWeek: 12,
        rejectedThisWeek: 1,
        avgTurnaround:    '4 h',
      },
      teams: lookups.departments,
      statuses: [
        { value: 'pending',  label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
      ],
      pending: [
        {
          id: 'SUB-2001',
          employee: 'Wichit Wongta',
          teamKey:  'IT',
          team:     'IT — Engineering',
          period:   '25 - 31 May 2026',
          hours:    34.5,
          billable: 24.5,
          projects: 'ERP, DS, Support',
          submitted:'2026-05-30 08:00',
          entries: [
            { date: '2026-05-25', projectLabel: 'Teibto ERP Implementation', task: 'Vendor master rollout',   hours: 6.5, billable: true },
            { date: '2026-05-25', projectLabel: 'Design System v2',          task: 'tbt-stat component',      hours: 1.5, billable: false },
            { date: '2026-05-26', projectLabel: 'Teibto ERP Implementation', task: 'PO approval flow',        hours: 7.0, billable: true },
            { date: '2026-05-27', projectLabel: 'Customer support — Q2',     task: 'Production incident',     hours: 4.0, billable: true },
            { date: '2026-05-28', projectLabel: 'Teibto ERP Implementation', task: 'SuiteQL optimization',    hours: 7.5, billable: true },
            { date: '2026-05-29', projectLabel: 'Design System v2',          task: 'Audit log component',     hours: 5.0, billable: false },
            { date: '2026-05-29', projectLabel: 'Internal admin',            task: 'Code review backlog',     hours: 3.0, billable: false },
          ],
        },
        {
          id: 'SUB-2002',
          employee: 'Somchai Jaidee',
          teamKey:  'OPS',
          team:     'Operations',
          period:   '25 - 31 May 2026',
          hours:    40.0,
          billable: 36.0,
          projects: 'ERP rollout',
          submitted:'2026-05-30 09:15',
          entries: [
            { date: '2026-05-25', projectLabel: 'Teibto ERP Implementation', task: 'Warehouse training',  hours: 8.0, billable: true },
            { date: '2026-05-26', projectLabel: 'Teibto ERP Implementation', task: 'Inventory cutover',   hours: 8.0, billable: true },
            { date: '2026-05-27', projectLabel: 'Teibto ERP Implementation', task: 'Inventory cutover',   hours: 8.0, billable: true },
            { date: '2026-05-28', projectLabel: 'Teibto ERP Implementation', task: 'Receiving rework',    hours: 6.0, billable: true },
            { date: '2026-05-29', projectLabel: 'Teibto ERP Implementation', task: 'Hand-off meeting',    hours: 4.0, billable: true },
            { date: '2026-05-29', projectLabel: 'Internal admin',            task: 'Weekly sync',         hours: 2.0, billable: false },
            { date: '2026-05-29', projectLabel: 'Internal admin',            task: 'Documentation',       hours: 4.0, billable: false },
          ],
        },
        {
          id: 'SUB-2003',
          employee: 'Apinya Sukjai',
          teamKey:  'FIN',
          team:     'Finance',
          period:   '25 - 31 May 2026',
          hours:    38.0,
          billable: 30.0,
          projects: 'AP automation, Audit prep',
          submitted:'2026-05-30 10:30',
          entries: [
            { date: '2026-05-25', projectLabel: 'AP Automation',  task: 'Invoice OCR review',  hours: 7.5, billable: true },
            { date: '2026-05-26', projectLabel: 'AP Automation',  task: 'GL coding rules',     hours: 7.0, billable: true },
            { date: '2026-05-27', projectLabel: 'Q1 Audit',       task: 'Auditor prep',        hours: 8.0, billable: true },
            { date: '2026-05-28', projectLabel: 'Q1 Audit',       task: 'Reconciliation',      hours: 7.5, billable: true },
            { date: '2026-05-29', projectLabel: 'Internal admin', task: 'Month-end checklist', hours: 8.0, billable: false },
          ],
        },
      ],
      restletUrl: '/app/site/hosting/restlet.nl?script=customscript_tbt_rl_time_approval&deploy=1',
    };

    ctx.response.write(tbtPage.render({
      title:  'Time approval queue',
      active: 'time-tracking',
      data,
      body,
    }));
  },

}));

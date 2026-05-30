/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * sl_tt_entry.js — Time tracking · Employee weekly entry.
 * Thin entry: loads mock data + renders via tbt_page.render.
 *
 * In production: replace MOCK_* with N/search or N/query against
 * the timebill record, plus N/runtime for current user.
 */
define([ 'N/file', './tbt_page', './_mock_lookups' ], (file, tbtPage, lookups) => ({

  onRequest(ctx) {
    const body = file.load({ id: './time-tracking-entry.html' }).getContents();
    const employeeId = ctx.request.parameters?.employee || 'EMP_001';

    const data = {
      employee: 'Wichit Wongta',
      week:     { from: '2026-05-25', to: '2026-05-31' },
      status:   'Draft',
      employees: lookups.employees,
      projects: [
        { value: 'PRJ_ERP',     label: 'Teibto ERP Implementation' },
        { value: 'PRJ_DS',      label: 'Design System v2' },
        { value: 'PRJ_SUPPORT', label: 'Customer support — Q2' },
        { value: 'PRJ_INTERNAL',label: 'Internal admin' },
      ],
      statuses: lookups.statuses.workflow,
      entries: [
        { id: 'T-1001', date: '2026-05-25', project: 'PRJ_ERP', projectLabel: 'Teibto ERP Implementation', task: 'Vendor master rollout',   hours: 6.5, billable: true,  memo: 'Onboarded 12 vendors' },
        { id: 'T-1002', date: '2026-05-25', project: 'PRJ_DS',  projectLabel: 'Design System v2',          task: 'tbt-stat component',      hours: 1.5, billable: false, memo: 'Internal R&D' },
        { id: 'T-1003', date: '2026-05-26', project: 'PRJ_ERP', projectLabel: 'Teibto ERP Implementation', task: 'PO approval flow',        hours: 7.0, billable: true },
        { id: 'T-1004', date: '2026-05-27', project: 'PRJ_SUPPORT', projectLabel: 'Customer support — Q2', task: 'Production incident',     hours: 4.0, billable: true,  memo: 'Auth middleware fix' },
        { id: 'T-1005', date: '2026-05-27', project: 'PRJ_INTERNAL', projectLabel: 'Internal admin',       task: 'Weekly sync',             hours: 1.0, billable: false },
        { id: 'T-1006', date: '2026-05-28', project: 'PRJ_ERP', projectLabel: 'Teibto ERP Implementation', task: 'SuiteQL optimization',    hours: 7.5, billable: true },
        { id: 'T-1007', date: '2026-05-29', project: 'PRJ_DS',  projectLabel: 'Design System v2',          task: 'Audit log component',     hours: 5.0, billable: false, memo: 'Skill-creator review' },
        { id: 'T-1008', date: '2026-05-29', project: 'PRJ_INTERNAL', projectLabel: 'Internal admin',       task: 'Code review backlog',     hours: 2.0, billable: false },
      ],
      approvalSteps: [
        { id: '1', label: 'Submitted', approver: 'Wichit Wongta',  status: 'approved', timestamp: '2026-05-30T08:00:00Z', comment: 'Submitted for week 22' },
        { id: '2', label: 'Manager',   approver: 'Somchai Jaidee', status: 'current'  },
        { id: '3', label: 'Director',  approver: 'Apinya Sukjai',  status: 'pending'  },
      ],
      restletUrl: '/app/site/hosting/restlet.nl?script=customscript_tbt_rl_time&deploy=1',
    };

    ctx.response.write(tbtPage.render({
      title:  'Time tracking',
      active: 'time-tracking',
      data,
      body,
    }));
  },

}));

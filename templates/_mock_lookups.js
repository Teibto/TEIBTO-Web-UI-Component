/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * _mock_lookups.js — shared mock lookup lists for kit / starter Suitelets.
 *
 * Each top-level key is named to match the schema option keys used in
 * tbt-doc-schemas (kebab-case where the schema uses it, e.g. 'sales-reps').
 *
 * In production: replace each list with N/search or N/query lookup. The
 * exported shape is intentionally a plain object so a real lookup module
 * can be a drop-in replacement.
 */
define([], () => ({

  // Lookup option lists — `value` is the internal id (integer), `label` the display.
  // In production each list would come from a real N/search lookup; the integer
  // id matches NetSuite's native primary key.

  employees: [
    { value: 1001, label: 'Wichit Wongta' },
    { value: 1002, label: 'Somchai Jaidee' },
    { value: 1003, label: 'Apinya Sukjai' },
  ],

  currencies: [
    { value: 1, label: 'THB — Thai Baht' },
    { value: 2, label: 'USD — US Dollar' },
  ],

  subsidiaries: [
    { value: 1, label: 'Teibto HQ' },
    { value: 2, label: 'Teibto BKK Branch' },
  ],

  departments: [
    { value: 10, label: 'IT' },
    { value: 11, label: 'Finance' },
    { value: 12, label: 'Operations' },
  ],

  vendors: [
    { value: 500, label: 'บจก. ABC จำกัด' },
    { value: 501, label: 'บจก. XYZ จำกัด' },
  ],

  customers: [
    { value: 100, label: 'บจก. ABC จำกัด' },
    { value: 200, label: 'บจก. XYZ จำกัด' },
    { value: 300, label: 'บจก. DEF จำกัด' },
    { value: 400, label: 'บจก. GHI จำกัด' },
  ],

  'sales-reps': [
    { value: 2001, label: 'Wichit Wongta' },
    { value: 2002, label: 'Somchai Jaidee' },
  ],

  'payment-terms': [
    { value: 30, label: 'Net 15' },
    { value: 31, label: 'Net 30' },
    { value: 32, label: 'Cash on delivery' },
  ],

  'ship-via': [
    { value: 41, label: 'Kerry Express' },
    { value: 42, label: 'Flash Express' },
    { value: 43, label: 'Thailand Post' },
  ],

  'customer-categories': [
    { value: 51, label: 'Retail' },
    { value: 52, label: 'Wholesale' },
    { value: 53, label: 'VIP' },
  ],

  /* Domain status sets — shared shape across approval flows */
  statuses: {
    workflow: [
      { value: 'Draft',    label: 'Draft' },
      { value: 'Pending',  label: 'Pending approval' },
      { value: 'Approved', label: 'Approved' },
      { value: 'Rejected', label: 'Rejected' },
    ],
    payment: [
      { value: 'Draft',    label: 'Draft' },
      { value: 'Pending',  label: 'Pending approval' },
      { value: 'Approved', label: 'Approved' },
      { value: 'Rejected', label: 'Rejected' },
      { value: 'Paid',     label: 'Reimbursed' },
    ],
  },

}));

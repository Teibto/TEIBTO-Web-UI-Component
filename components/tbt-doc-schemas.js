/**
 * @module tbt-doc-schemas
 * @version 1.24.3
 * @author Wichit Wongta
 *
 * Pre-built schemas for tbt-doc-form. Drop one in and you have a working
 * ERP document page (lookup data goes through `optionLists`).
 *
 * Usage:
 *   import { PO_SCHEMA } from '/sc/SuiteScripts/Teibto/ds/v1.25.0/tbt-doc-schemas.js';
 *   <tbt-doc-form .schema=${PO_SCHEMA} .optionLists=${refData} ...></tbt-doc-form>
 *
 * Lookup keys consumers should provide in `optionLists`:
 *   vendors, customers, subsidiaries, departments, currencies,
 *   payment-terms, ship-via, sales-reps, terms.
 */

/* ── Purchase Order ────────────────────────────────────────────── */

export const PO_SCHEMA = {
  title: 'Purchase Order',
  sections: [
    {
      title: 'Document info',
      columns: 4,
      fields: [
        { name: 'tranid',     label: 'Document no.', type: 'text',     required: true },
        { name: 'vendor',     label: 'Vendor',       type: 'dropdown', required: true, searchable: true, options: 'vendors' },
        { name: 'date',       label: 'Date',         type: 'date',     required: true },
        { name: 'due',        label: 'Expected delivery', type: 'date' },
        { name: 'subsidiary', label: 'Subsidiary',   type: 'dropdown', options: 'subsidiaries' },
        { name: 'department', label: 'Department',   type: 'dropdown', options: 'departments' },
        { name: 'currency',   label: 'Currency',     type: 'dropdown', options: 'currencies' },
        { name: 'terms',      label: 'Payment terms', type: 'dropdown', options: 'payment-terms' },
        { name: 'memo',       label: 'Memo',         type: 'textarea', rows: 3, span: 2 },
      ],
    },
    {
      title: 'Line items',
      type: 'lines',
      currency: '฿',
      vatRate: 0.07,
      maxHeight: '320px',
    },
    {
      title: 'Approval flow',
      type: 'approval',
      orientation: 'horizontal',
    },
    {
      title: 'Audit log',
      type: 'audit',
      maxHeight: '280px',
    },
  ],
  actions: [
    { name: 'delete', label: 'Delete', variant: 'danger',    icon: 'trash' },
    { name: 'cancel', label: 'Cancel', variant: 'secondary' },
    { name: 'save',   label: 'Save',   variant: 'primary',   icon: 'device-floppy' },
    { name: 'submit', label: 'Submit', variant: 'primary',   icon: 'send', submit: true },
  ],
};

/* ── Customer ──────────────────────────────────────────────────── */

export const CUSTOMER_SCHEMA = {
  title: 'Customer',
  sections: [
    {
      title: 'Profile',
      columns: 4,
      fields: [
        { name: 'entityid',   label: 'Customer ID',   type: 'text',     required: true },
        { name: 'companyname',label: 'Company name',  type: 'text',     required: true, span: 2 },
        { name: 'taxid',      label: 'Tax ID',        type: 'text' },
        { name: 'category',   label: 'Category',      type: 'dropdown', options: 'customer-categories' },
        { name: 'subsidiary', label: 'Subsidiary',    type: 'dropdown', options: 'subsidiaries' },
        { name: 'salesrep',   label: 'Sales rep',     type: 'dropdown', searchable: true, options: 'sales-reps' },
        { name: 'currency',   label: 'Currency',      type: 'dropdown', options: 'currencies' },
      ],
    },
    {
      title: 'Contact',
      columns: 2,
      fields: [
        { name: 'email',     label: 'Email',     type: 'email' },
        { name: 'phone',     label: 'Phone',     type: 'text' },
        { name: 'contactname',label:'Primary contact', type: 'text' },
        { name: 'website',   label: 'Website',   type: 'text' },
      ],
    },
    {
      title: 'Billing address',
      columns: 1,
      fields: [
        { name: 'bill_to', type: 'address', required: true },
      ],
    },
    {
      title: 'Shipping address',
      columns: 1,
      fields: [
        { name: 'ship_to', type: 'address' },
      ],
    },
    {
      title: 'Terms & notes',
      columns: 2,
      fields: [
        { name: 'terms',      label: 'Payment terms', type: 'dropdown', options: 'payment-terms' },
        { name: 'creditlimit',label: 'Credit limit',  type: 'number', min: '0', step: '1000' },
        { name: 'tax_exempt', label: 'Tax-exempt',    type: 'toggle' },
        { name: 'notes',      label: 'Notes',         type: 'textarea', rows: 3, span: 2 },
      ],
    },
  ],
  actions: [
    { name: 'cancel', label: 'Cancel', variant: 'secondary' },
    { name: 'save',   label: 'Save',   variant: 'primary', icon: 'device-floppy', submit: true },
  ],
};

/* ── Sales Order ───────────────────────────────────────────────── */

export const SALES_ORDER_SCHEMA = {
  title: 'Sales Order',
  sections: [
    {
      title: 'Document info',
      columns: 4,
      fields: [
        { name: 'tranid',     label: 'Document no.', type: 'text',     required: true },
        { name: 'customer',   label: 'Customer',     type: 'dropdown', required: true, searchable: true, options: 'customers' },
        { name: 'date',       label: 'Date',         type: 'date',     required: true },
        { name: 'expected',   label: 'Expected ship', type: 'date' },
        { name: 'salesrep',   label: 'Sales rep',    type: 'dropdown', searchable: true, options: 'sales-reps' },
        { name: 'subsidiary', label: 'Subsidiary',   type: 'dropdown', options: 'subsidiaries' },
        { name: 'currency',   label: 'Currency',     type: 'dropdown', options: 'currencies' },
        { name: 'terms',      label: 'Payment terms', type: 'dropdown', options: 'payment-terms' },
        { name: 'po_number',  label: 'Customer PO',  type: 'text' },
      ],
    },
    {
      title: 'Shipping',
      columns: 2,
      fields: [
        { name: 'ship_to',   type: 'address', label: 'Ship to', required: true },
        { name: 'ship_via',  label: 'Ship via', type: 'dropdown', options: 'ship-via' },
        { name: 'memo',      label: 'Shipping memo', type: 'textarea', rows: 2 },
      ],
    },
    {
      title: 'Line items',
      type: 'lines',
      currency: '฿',
      vatRate: 0.07,
      maxHeight: '320px',
    },
    {
      title: 'Approval flow',
      type: 'approval',
      orientation: 'horizontal',
    },
  ],
  actions: [
    { name: 'cancel', label: 'Cancel', variant: 'secondary' },
    { name: 'save',   label: 'Save',   variant: 'primary',   icon: 'device-floppy' },
    { name: 'submit', label: 'Submit', variant: 'primary',   icon: 'send', submit: true },
  ],
};

/* ── Invoice (AR) ──────────────────────────────────────────────── */

export const INVOICE_SCHEMA = {
  title: 'Invoice',
  sections: [
    {
      title: 'Document info',
      columns: 4,
      fields: [
        { name: 'tranid',     label: 'Invoice no.',  type: 'text',     required: true },
        { name: 'customer',   label: 'Customer',     type: 'dropdown', required: true, searchable: true, options: 'customers' },
        { name: 'date',       label: 'Invoice date', type: 'date',     required: true },
        { name: 'duedate',    label: 'Due date',     type: 'date',     required: true },
        { name: 'po_number',  label: 'Customer PO',  type: 'text' },
        { name: 'salesrep',   label: 'Sales rep',    type: 'dropdown', searchable: true, options: 'sales-reps' },
        { name: 'subsidiary', label: 'Subsidiary',   type: 'dropdown', options: 'subsidiaries' },
        { name: 'currency',   label: 'Currency',     type: 'dropdown', options: 'currencies' },
        { name: 'terms',      label: 'Payment terms', type: 'dropdown', options: 'payment-terms' },
        { name: 'memo',       label: 'Memo',         type: 'textarea', rows: 3, span: 2 },
      ],
    },
    {
      title: 'Line items',
      type: 'lines',
      currency: '฿',
      vatRate: 0.07,
      maxHeight: '320px',
    },
    {
      title: 'Audit log',
      type: 'audit',
      maxHeight: '280px',
    },
  ],
  actions: [
    { name: 'cancel', label: 'Cancel', variant: 'secondary' },
    { name: 'print',  label: 'Print',  variant: 'secondary', icon: 'printer' },
    { name: 'email',  label: 'Email',  variant: 'secondary', icon: 'mail' },
    { name: 'save',   label: 'Save',   variant: 'primary',   icon: 'device-floppy', submit: true },
  ],
};

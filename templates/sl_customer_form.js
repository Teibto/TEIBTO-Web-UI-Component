/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * sl_customer_form.js — Customer form (new / view / edit) using shared erp-form.html.
 */
define([ 'N/file', './tbt_page', './_mock_lookups' ], (file, tbtPage, lookups) => ({

  onRequest(ctx) {
    const body    = file.load({ id: './erp-form.html' }).getContents();
    const idParam = ctx.request.parameters?.id   || '';
    const param   = ctx.request.parameters?.mode || '';
    const mode = !idParam || idParam === 'new' ? 'new' : (param === 'edit' ? 'edit' : 'view');
    const id = Number(idParam);

    const MOCK_CUST = {
      100: { id: 100, entityid: 'C001', companyname: 'บจก. ABC จำกัด', taxid: '0105563234567', category: 52, subsidiary: 1, salesrep: 2001, currency: 1, email: 'contact@abc.co.th', phone: '02-123-4567', contactname: 'คุณสมชาย', website: 'https://abc.co.th', bill_to: { street: '99/9 Sukhumvit Rd.', city: 'Bangkok', state: 'BKK', postcode: '10110', country: 'Thailand' }, ship_to: { street: '99/9 Sukhumvit Rd.', city: 'Bangkok', state: 'BKK', postcode: '10110', country: 'Thailand' }, terms: 31, creditlimit: 500000, tax_exempt: false, notes: 'Preferred wholesale customer.' },
      200: { id: 200, entityid: 'C002', companyname: 'บจก. XYZ จำกัด', taxid: '0105557891234', category: 53, subsidiary: 1, salesrep: 2002, currency: 1, email: 'sales@xyz.co.th',    phone: '02-555-7777', contactname: 'คุณสมหญิง', website: 'https://xyz.co.th', bill_to: { street: '88/2 Silom Rd.',      city: 'Bangkok', state: 'BKK', postcode: '10500', country: 'Thailand' }, ship_to: { street: '88/2 Silom Rd.',      city: 'Bangkok', state: 'BKK', postcode: '10500', country: 'Thailand' }, terms: 31, creditlimit: 1500000, tax_exempt: true,  notes: 'VIP customer — priority handling.' },
      300: { id: 300, entityid: 'C003', companyname: 'บจก. DEF จำกัด', taxid: '0105561112233', category: 51, subsidiary: 2, salesrep: 2001, currency: 1, email: 'info@def.co.th',     phone: '053-999-111', contactname: 'คุณสมพล',  website: '',                bill_to: { street: '15/4 Nimmanhaemin', city: 'Chiang Mai', state: 'CMI', postcode: '50200', country: 'Thailand' }, ship_to: { street: '15/4 Nimmanhaemin', city: 'Chiang Mai', state: 'CMI', postcode: '50200', country: 'Thailand' }, terms: 30, creditlimit: 200000, tax_exempt: false, notes: 'Retail account.' },
      400: { id: 400, entityid: 'C004', companyname: 'บจก. GHI จำกัด', taxid: '0105559998877', category: 52, subsidiary: 1, salesrep: 2002, currency: 1, email: 'office@ghi.co.th',   phone: '02-321-4567', contactname: 'คุณสมชัย',  website: 'https://ghi.co.th', bill_to: { street: '50 Rama 9 Rd.',     city: 'Bangkok', state: 'BKK', postcode: '10310', country: 'Thailand' }, ship_to: { street: '50 Rama 9 Rd.',     city: 'Bangkok', state: 'BKK', postcode: '10310', country: 'Thailand' }, terms: 31, creditlimit: 800000, tax_exempt: false, notes: 'Quarterly contract.' },
    };
    const record = mode === 'new' ? {} : (MOCK_CUST[id] || MOCK_CUST[100]);

    const data = {
      schemaName:  'CUSTOMER_SCHEMA',
      recordLabel: 'Customer',
      mode,
      record,
      optionLists: {
        'customer-categories': lookups['customer-categories'],
        subsidiaries:          lookups.subsidiaries,
        'sales-reps':          lookups['sales-reps'],
        currencies:            lookups.currencies,
        'payment-terms':       lookups['payment-terms'],
      },
      listUrl:    '/customer/list',
      selfUrl:    '/customer/form',
      restletUrl: '/app/site/hosting/restlet.nl?script=customscript_tbt_rl_customer&deploy=1',
    };

    ctx.response.write(tbtPage.render({
      title:  mode === 'new' ? 'New customer' : (mode === 'edit' ? 'Edit customer' : 'Customer'),
      active: 'customer',
      data,
      body,
    }));
  },

}));

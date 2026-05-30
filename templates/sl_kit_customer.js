/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @author Wichit Wongta
 *
 * sl_kit_customer.js — Customer create/edit form (schema-driven).
 * Uses CUSTOMER_SCHEMA from tbt-doc-schemas (no custom layout).
 *
 * URL: ?id=<entityid>   empty → new, value → edit
 *
 * In production: replace MOCK_* with record.load / search.create.
 */
define([ 'N/file', './tbt_page', './_mock_lookups' ], (file, tbtPage, lookups) => ({

  onRequest(ctx) {
    const body = file.load({ id: './kit-doc.html' }).getContents();
    const id   = ctx.request.parameters?.id || '';

    const record = id ? {
      entityid:    id,
      companyname: 'บจก. ABC จำกัด',
      taxid:       '0105563234567',
      category:    'CAT_WHOLESALE',
      subsidiary:  'S01',
      salesrep:    'REP_001',
      currency:    'THB',
      email:       'contact@abc.co.th',
      phone:       '02-123-4567',
      contactname: 'คุณสมชาย',
      website:     'https://abc.co.th',
      bill_to:  { street: '99/9 Sukhumvit Rd.', city: 'Bangkok', state: 'BKK', postcode: '10110', country: 'Thailand' },
      ship_to:  { street: '99/9 Sukhumvit Rd.', city: 'Bangkok', state: 'BKK', postcode: '10110', country: 'Thailand' },
      terms:       'NET30',
      creditlimit: 500000,
      tax_exempt:  false,
      notes:       'Preferred wholesale customer.',
    } : {};

    const data = {
      schemaName: 'CUSTOMER_SCHEMA',
      record,
      optionLists: {
        'customer-categories': lookups['customer-categories'],
        subsidiaries:          lookups.subsidiaries,
        'sales-reps':          lookups['sales-reps'],
        currencies:            lookups.currencies,
        'payment-terms':       lookups['payment-terms'],
      },
      restletUrl: '/app/site/hosting/restlet.nl?script=customscript_tbt_rl_customer&deploy=1',
    };

    ctx.response.write(tbtPage.render({
      title:  id ? 'Edit customer' : 'New customer',
      active: 'settings',  // sidebar key — customer master under settings/CRM
      data,
      body,
    }));
  },

}));

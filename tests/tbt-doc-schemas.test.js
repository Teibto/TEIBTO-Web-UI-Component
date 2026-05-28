import { expect } from '@open-wc/testing';
import {
  PO_SCHEMA,
  CUSTOMER_SCHEMA,
  SALES_ORDER_SCHEMA,
  INVOICE_SCHEMA,
  QUOTATION_SCHEMA,
  FULFILLMENT_SCHEMA,
  RECEIPT_SCHEMA,
} from '../components/tbt-doc-schemas.js';

const ALL_SCHEMAS = [
  PO_SCHEMA,
  CUSTOMER_SCHEMA,
  SALES_ORDER_SCHEMA,
  INVOICE_SCHEMA,
  QUOTATION_SCHEMA,
  FULFILLMENT_SCHEMA,
  RECEIPT_SCHEMA,
];

describe('tbt-doc-schemas', () => {
  it('exports 7 named schemas', () => {
    expect(ALL_SCHEMAS).to.have.length(7);
    for (const s of ALL_SCHEMAS) {
      expect(s).to.be.an('object');
    }
  });

  it('every schema has title (string), sections (array) and actions (array)', () => {
    for (const schema of ALL_SCHEMAS) {
      expect(schema.title).to.be.a('string').with.length.above(0);
      expect(schema.sections).to.be.an('array').with.length.above(0);
      expect(schema.actions).to.be.an('array').with.length.above(0);
    }
  });

  it('every action has name, label and variant', () => {
    for (const schema of ALL_SCHEMAS) {
      for (const action of schema.actions) {
        expect(action.name).to.be.a('string');
        expect(action.label).to.be.a('string');
        expect(action.variant).to.be.a('string');
      }
    }
  });

  it('PO_SCHEMA has lines, approval and audit sections', () => {
    const types = PO_SCHEMA.sections.map(s => s.type);
    expect(types).to.include('lines');
    expect(types).to.include('approval');
    expect(types).to.include('audit');
  });

  it('CUSTOMER_SCHEMA has a fields section with required fields', () => {
    const fieldsSection = CUSTOMER_SCHEMA.sections.find(s => Array.isArray(s.fields));
    expect(fieldsSection).to.exist;
    const required = fieldsSection.fields.filter(f => f.required);
    expect(required).to.have.length.above(0);
  });

  it('SALES_ORDER_SCHEMA has a lines section with vatRate', () => {
    const lines = SALES_ORDER_SCHEMA.sections.find(s => s.type === 'lines');
    expect(lines).to.exist;
    expect(lines.vatRate).to.be.a('number');
  });

  it('QUOTATION_SCHEMA has a submit action', () => {
    const submit = QUOTATION_SCHEMA.actions.find(a => a.submit === true);
    expect(submit).to.exist;
  });
});

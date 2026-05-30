import { fixture, html, expect } from '@open-wc/testing';
import '../components/tbt-tag-input.js';

const axe = window.axe;

describe('tbt-tag-input', () => {
  it('renders with input field', async () => {
    const el = await fixture(html`<tbt-tag-input label="Tags"></tbt-tag-input>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('input')).to.exist;
  });

  it('adds tag on Enter', async () => {
    const el = await fixture(html`<tbt-tag-input label="Tags"></tbt-tag-input>`);
    await el.updateComplete;
    const input = el.shadowRoot.querySelector('input');
    input.value = 'hello';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await el.updateComplete;
    expect(el.value).to.deep.equal(['hello']);
    expect(el.shadowRoot.querySelector('.tag-text').textContent).to.equal('hello');
  });

  it('removes tag via × button', async () => {
    const el = await fixture(html`<tbt-tag-input label="Tags"></tbt-tag-input>`);
    el.value = ['one', 'two'];
    await el.updateComplete;
    el.shadowRoot.querySelectorAll('.tag-remove')[0].click();
    await el.updateComplete;
    expect(el.value).to.deep.equal(['two']);
  });

  it('removes last tag on Backspace when input is empty', async () => {
    const el = await fixture(html`<tbt-tag-input label="Tags"></tbt-tag-input>`);
    el.value = ['a', 'b'];
    await el.updateComplete;
    const input = el.shadowRoot.querySelector('input');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    await el.updateComplete;
    expect(el.value).to.deep.equal(['a']);
  });

  it('does not add duplicate tags', async () => {
    const el = await fixture(html`<tbt-tag-input label="Tags"></tbt-tag-input>`);
    el.value = ['design'];
    await el.updateComplete;
    const input = el.shadowRoot.querySelector('input');
    input.value = 'design';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await el.updateComplete;
    expect(el.value).to.deep.equal(['design']);
  });

  it('respects max prop', async () => {
    const el = await fixture(html`<tbt-tag-input label="Tags" max="2"></tbt-tag-input>`);
    el.value = ['a', 'b'];
    await el.updateComplete;
    const input = el.shadowRoot.querySelector('input');
    input.value = 'c';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await el.updateComplete;
    expect(el.value).to.deep.equal(['a', 'b']);
  });

  it('clears input on Escape', async () => {
    const el = await fixture(html`<tbt-tag-input label="Tags"></tbt-tag-input>`);
    await el.updateComplete;
    const input = el.shadowRoot.querySelector('input');
    input.value = 'abc';
    input.dispatchEvent(new Event('input'));
    await el.updateComplete;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('input').value).to.equal('');
  });

  it('fires tbt-change on add with values array', async () => {
    const el = await fixture(html`<tbt-tag-input label="Tags"></tbt-tag-input>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-change', e => { detail = e.detail; });
    const input = el.shadowRoot.querySelector('input');
    input.value = 'new';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await el.updateComplete;
    expect(detail).to.not.be.null;
    expect(detail.values).to.deep.equal(['new']);
  });

  it('fires tbt-change on remove with updated values array', async () => {
    const el = await fixture(html`<tbt-tag-input label="Tags"></tbt-tag-input>`);
    el.value = ['a', 'b'];
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-change', e => { detail = e.detail; });
    el.shadowRoot.querySelectorAll('.tag-remove')[1].click();
    await el.updateComplete;
    expect(detail.values).to.deep.equal(['a']);
  });

  it('shows error text', async () => {
    const el = await fixture(html`<tbt-tag-input label="Tags" error="At least one tag is required"></tbt-tag-input>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.error-text').textContent.trim()).to.equal('At least one tag is required');
  });

  it('shows helper text when no error', async () => {
    const el = await fixture(html`<tbt-tag-input label="Tags" helper="Press Enter to add a tag"></tbt-tag-input>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.helper').textContent.trim()).to.equal('Press Enter to add a tag');
  });

  it('hides helper when error is set', async () => {
    const el = await fixture(html`<tbt-tag-input label="Tags" error="Err" helper="Help"></tbt-tag-input>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.helper')).to.be.null;
  });

  it('label for attribute matches input id', async () => {
    const el = await fixture(html`<tbt-tag-input label="Keywords"></tbt-tag-input>`);
    await el.updateComplete;
    const label = el.shadowRoot.querySelector('label');
    const input = el.shadowRoot.querySelector('input');
    expect(label.getAttribute('for')).to.equal(input.id);
  });

  it('passes axe', async () => {
    const el = await fixture(html`
      <tbt-tag-input label="Keywords" placeholder="Add keyword…"></tbt-tag-input>`);
    el.value = ['design', 'system'];
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

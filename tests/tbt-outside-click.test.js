import { html, fixture, expect } from '@open-wc/testing';
import { watchOutsideClick } from '../components/tbt-outside-click.js';
import '../components/tbt-dropdown.js';
import '../components/tbt-popover.js';
import '../components/tbt-menubar.js';
import '../components/tbt-multiselect.js';
import '../components/tbt-color-picker.js';
import '../components/tbt-split-button.js';

const OPTIONS = [
  { value: 'A', label: 'Apple' },
  { value: 'B', label: 'Banana' },
];

describe('watchOutsideClick helper', () => {
  it('calls close on a click outside the host, not on a click inside', () => {
    const host = document.createElement('div');
    host.innerHTML = '<button>inside</button>';
    document.body.appendChild(host);
    let closed = 0;
    const stop = watchOutsideClick(host, () => { closed += 1; });

    host.querySelector('button').click();
    expect(closed).to.equal(0);

    document.body.click();
    expect(closed).to.equal(1);

    stop();
    host.remove();
  });

  it('unwatch function removes the document listener', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    let closed = 0;
    const stop = watchOutsideClick(host, () => { closed += 1; });
    stop();

    document.body.click();
    expect(closed).to.equal(0);
    host.remove();
  });

  it('tbt-dropdown (searchable) closes its popover on outside click', async () => {
    const el = await fixture(html`<tbt-dropdown searchable .options=${OPTIONS}></tbt-dropdown>`);
    await el.updateComplete;
    el.shadowRoot.querySelector('.trigger').click();
    await el.updateComplete;
    expect(el._open).to.be.true;

    document.body.click();
    await el.updateComplete;
    expect(el._open).to.be.false;
  });

  for (const [tag, tpl] of [
    ['tbt-menu-group', html`<tbt-menu-group label="File"><span>item</span></tbt-menu-group>`],
    ['tbt-multiselect', html`<tbt-multiselect .options=${OPTIONS}></tbt-multiselect>`],
    ['tbt-color-picker', html`<tbt-color-picker label="Color"></tbt-color-picker>`],
    ['tbt-split-button', html`<tbt-split-button label="Save"><span>option</span></tbt-split-button>`],
  ]) {
    it(`${tag} closes its popup on outside click`, async () => {
      const el = await fixture(tpl);
      await el.updateComplete;
      el._open = true;
      await el.updateComplete;

      document.body.click();
      await el.updateComplete;
      expect(el._open).to.be.false;
    });
  }

  it('tbt-popover closes on outside click and stops listening once closed', async () => {
    const el = await fixture(html`
      <tbt-popover>
        <button slot="trigger">open</button>
        <p>content</p>
      </tbt-popover>
    `);
    el.open = true;
    await el.updateComplete;

    document.body.click();
    await el.updateComplete;
    expect(el.open).to.be.false;

    // Reopening must re-arm the outside-click watcher
    el.open = true;
    await el.updateComplete;
    document.body.click();
    await el.updateComplete;
    expect(el.open).to.be.false;
  });
});

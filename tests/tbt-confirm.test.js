import { expect, waitUntil } from '@open-wc/testing';
import { confirm } from '../components/tbt-confirm.js';
import '../components/tbt-modal.js';
import '../components/tbt-button.js';

// Always get the most recently appended tbt-modal (avoids leftover from prev test)
const lastModal = () => [...document.querySelectorAll('tbt-modal')].at(-1);

afterEach(async () => {
  document.querySelectorAll('tbt-modal').forEach(el => el.remove());
});

describe('confirm()', () => {
  it('resolves true when confirm button clicked', async () => {
    const promise = confirm({ title: 'Test', message: 'Proceed?', confirmLabel: 'OK' });
    await waitUntil(() => lastModal(), 'Modal not created', { timeout: 500 });
    lastModal().querySelector('[slot="footer"] tbt-button').click();
    expect(await promise).to.be.true;
  });

  it('resolves false when cancel button clicked', async () => {
    const promise = confirm({ title: 'Test', message: 'Proceed?' });
    await waitUntil(() => lastModal(), 'Modal not created', { timeout: 500 });
    lastModal().querySelectorAll('[slot="footer"] tbt-button')[1].click();
    expect(await promise).to.be.false;
  });

  it('removes modal from DOM after resolution', async () => {
    const promise = confirm({ title: 'Cleanup test' });
    await waitUntil(() => lastModal(), 'Modal not created', { timeout: 500 });
    const modal = lastModal();
    modal.querySelector('[slot="footer"] tbt-button').click();
    await promise;
    await waitUntil(() => !document.body.contains(modal), 'Modal not removed', { timeout: 700 });
    expect(document.body.contains(modal)).to.be.false;
  });
});

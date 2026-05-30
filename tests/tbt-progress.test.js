import { fixture, html, expect } from '@open-wc/testing';
import '../components/tbt-progress.js';

const axe = window.axe;

describe('tbt-progress', () => {
  it('renders progress bar with correct width', async () => {
    const el = await fixture(html`<tbt-progress value="60"></tbt-progress>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.bar').style.width).to.equal('60%');
  });

  it('clamps value above 100 to 100%', async () => {
    const el = await fixture(html`<tbt-progress value="150"></tbt-progress>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.bar').style.width).to.equal('100%');
  });

  it('clamps negative value to 0%', async () => {
    const el = await fixture(html`<tbt-progress value="-10"></tbt-progress>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.bar').style.width).to.equal('0%');
  });

  it('shows label when provided', async () => {
    const el = await fixture(html`<tbt-progress value="50" label="Uploading…"></tbt-progress>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.label-text').textContent.trim()).to.equal('Uploading…');
  });

  it('shows percentage when show-value is set', async () => {
    const el = await fixture(html`<tbt-progress value="75" show-value></tbt-progress>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.value-text').textContent.trim()).to.equal('75%');
  });

  it('hides percentage in indeterminate mode', async () => {
    const el = await fixture(html`<tbt-progress indeterminate show-value label="Loading"></tbt-progress>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.value-text')).to.be.null;
  });

  it('track has role="progressbar" with aria-valuenow', async () => {
    const el = await fixture(html`<tbt-progress value="40" label="Progress"></tbt-progress>`);
    await el.updateComplete;
    const track = el.shadowRoot.querySelector('.track');
    expect(track.getAttribute('role')).to.equal('progressbar');
    expect(track.getAttribute('aria-valuenow')).to.equal('40');
    expect(track.getAttribute('aria-valuemin')).to.equal('0');
    expect(track.getAttribute('aria-valuemax')).to.equal('100');
  });

  it('indeterminate omits aria-valuenow and sets aria-busy', async () => {
    const el = await fixture(html`<tbt-progress indeterminate label="Loading"></tbt-progress>`);
    await el.updateComplete;
    const track = el.shadowRoot.querySelector('.track');
    expect(track.getAttribute('aria-valuenow')).to.be.null;
    expect(track.getAttribute('aria-busy')).to.equal('true');
  });

  it('applies variant attribute', async () => {
    const el = await fixture(html`<tbt-progress value="80" variant="success"></tbt-progress>`);
    await el.updateComplete;
    expect(el.getAttribute('variant')).to.equal('success');
  });

  it('applies size attribute', async () => {
    const el = await fixture(html`<tbt-progress value="50" size="lg"></tbt-progress>`);
    await el.updateComplete;
    expect(el.getAttribute('size')).to.equal('lg');
  });

  it('no header when no label and no show-value', async () => {
    const el = await fixture(html`<tbt-progress value="50"></tbt-progress>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.header')).to.be.null;
  });

  it('passes axe — determinate', async () => {
    const el = await fixture(html`
      <tbt-progress value="65" label="Uploading file…" show-value></tbt-progress>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });

  it('passes axe — indeterminate', async () => {
    const el = await fixture(html`
      <tbt-progress indeterminate label="Processing…"></tbt-progress>`);
    await el.updateComplete;
    const results = await axe.run(el, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
    const violations = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(violations, violations.map(v => v.description).join('\n')).to.be.empty;
  });
});

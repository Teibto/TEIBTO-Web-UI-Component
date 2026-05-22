import { fixture, html, expect } from '@open-wc/testing';
import '../components/tbt-file-upload.js';

function makeFile(name, size = 1024, type = 'application/pdf') {
  return new File([new ArrayBuffer(size)], name, { type });
}

describe('tbt-file-upload', () => {
  it('renders drop zone with upload icon', async () => {
    const el = await fixture(html`<tbt-file-upload label="Attachments"></tbt-file-upload>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.zone')).to.exist;
    expect(el.shadowRoot.querySelector('.ti-cloud-upload')).to.exist;
  });

  it('shows label and required asterisk', async () => {
    const el = await fixture(html`<tbt-file-upload label="Docs" required></tbt-file-upload>`);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('label').textContent.trim()).to.equal('Docs');
    expect(el.shadowRoot.querySelector('.required')).to.exist;
  });

  it('adds files and renders file list items', async () => {
    const el = await fixture(html`<tbt-file-upload multiple></tbt-file-upload>`);
    await el.updateComplete;
    el._addFiles([makeFile('report.pdf'), makeFile('photo.jpg')]);
    await el.updateComplete;
    expect(el.shadowRoot.querySelectorAll('.file-item')).to.have.length(2);
    expect(el.files).to.have.length(2);
  });

  it('fires tbt-change when files are added', async () => {
    const el = await fixture(html`<tbt-file-upload></tbt-file-upload>`);
    await el.updateComplete;
    let detail = null;
    el.addEventListener('tbt-change', e => { detail = e.detail; });
    el._addFiles([makeFile('doc.pdf')]);
    expect(detail.files).to.have.length(1);
    expect(detail.files[0].name).to.equal('doc.pdf');
  });

  it('rejects files exceeding max-size and shows error', async () => {
    const el = await fixture(html`<tbt-file-upload max-size="500"></tbt-file-upload>`);
    await el.updateComplete;
    el._addFiles([makeFile('big.pdf', 2048)]);
    await el.updateComplete;
    expect(el.files).to.have.length(0);
    expect(el._sizeError).to.include('big.pdf');
  });

  it('submits one FormData entry per file under name when set', async () => {
    const wrap = await fixture(html`
      <div>
        <form>
          <tbt-file-upload name="receipts" multiple></tbt-file-upload>
        </form>
      </div>`);
    const form = wrap.querySelector('form');
    const el = form.querySelector('tbt-file-upload');
    await el.updateComplete;
    el._addFiles([makeFile('a.pdf'), makeFile('b.jpg')]);
    await el.updateComplete;
    const files = new FormData(form).getAll('receipts');
    expect(files).to.have.length(2);
    expect(files[0].name).to.equal('a.pdf');
    expect(files[1].name).to.equal('b.jpg');
  });

  it('reports invalid when required and no files, valid after a file is added', async () => {
    const wrap = await fixture(html`
      <div>
        <form>
          <tbt-file-upload name="docs" required></tbt-file-upload>
        </form>
      </div>`);
    const form = wrap.querySelector('form');
    const el = form.querySelector('tbt-file-upload');
    await el.updateComplete;
    expect(form.checkValidity()).to.be.false;
    el._addFiles([makeFile('doc.pdf')]);
    await el.updateComplete;
    expect(form.checkValidity()).to.be.true;
  });
});

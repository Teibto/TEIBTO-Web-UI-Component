import { expect } from '@open-wc/testing';
import '../dist/tbt-page-runtime.js';

const rt = window.tbtPageRuntime;

describe('tbt-page-runtime post()', () => {
  let realFetch;
  beforeEach(() => { realFetch = window.fetch; });
  afterEach(() => { window.fetch = realFetch; });

  const stubFetch = (status, body) => {
    window.fetch = async () => ({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    });
  };

  it('resolves with the parsed body when the RESTlet reports ok:true', async () => {
    stubFetch(200, { ok: true, id: 7 });
    const res = await rt.post('/restlet', { action: 'save' });
    expect(res.id).to.equal(7);
  });

  // Regression: RESTlets report failures as HTTP 200 + {ok:false} — post()
  // must reject, or pages show a false "success" (found by the SB2 smoke run).
  it('throws the server message on HTTP 200 + ok:false', async () => {
    stubFetch(200, { ok: false, message: 'Please enter value(s) for: Name' });
    let err;
    try { await rt.post('/restlet', { action: 'save' }); } catch (e) { err = e; }
    expect(err, 'post() must reject on ok:false').to.exist;
    expect(err.message).to.include('Name');
  });

  it('throws on an HTTP error status', async () => {
    stubFetch(500, { message: 'boom' });
    let err;
    try { await rt.post('/restlet', {}); } catch (e) { err = e; }
    expect(err).to.exist;
    expect(err.message).to.equal('boom');
  });

  it('throws a generic HTTP message when the error body is not JSON', async () => {
    window.fetch = async () => ({ ok: false, status: 502, json: async () => { throw new Error('bad json'); } });
    let err;
    try { await rt.post('/restlet', {}); } catch (e) { err = e; }
    expect(err).to.exist;
    expect(err.message).to.equal('HTTP 502');
  });
});

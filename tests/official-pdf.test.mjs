import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fetchOfficialPdf } from '../src/lib/official-pdf.ts';

const bytes = Buffer.from('%PDF-1.7\nfixture\n%%EOF');
const document = { url: 'https://documento.vunesp.com.br/documento/stream/example', sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length };
test('returns the exact verified PDF bytes', async () => {
  const value = await fetchOfficialPdf(document, async () => new Response(bytes));
  assert.deepEqual(Buffer.from(value), bytes);
});
test('rejects a same-length changed PDF', async () => {
  const changed = Buffer.from(bytes); changed[10] ^= 1;
  await assert.rejects(fetchOfficialPdf(document, async () => new Response(changed)), /integrity/);
});
test('rejects excessive body size even without Content-Length', async () => {
  await assert.rejects(fetchOfficialPdf(document, async () => new Response(Buffer.concat([bytes, bytes]))), /size/);
});
test('does not follow a redirect to an external host', async () => {
  let calls = 0;
  await assert.rejects(fetchOfficialPdf(document, async () => { calls++; return new Response(null, { status: 302, headers: { location: 'https://example.com/private.pdf' } }); }), /source/);
  assert.equal(calls, 1);
});
test('rejects a source with credentials before requesting it', async () => {
  let calls = 0;
  await assert.rejects(fetchOfficialPdf({ ...document, url: 'https://user:password@documento.vunesp.com.br/documento/stream/example' }, async () => { calls++; return new Response(bytes); }), /source/);
  assert.equal(calls, 0);
});

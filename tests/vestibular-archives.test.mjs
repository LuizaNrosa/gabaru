import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const hosts = new Set(['www.vunesp.com.br', 'documento.vunesp.com.br', 'vestibular.unesp.br', 'network.grupoabril.com.br', 'www.comvest.unicamp.br', 'comvest.unicamp.br']);
for (const institution of ['unesp', 'unicamp']) {
  const archive = JSON.parse(await readFile(new URL(`../src/data/${institution}-archive.json`, import.meta.url), 'utf8'));
  test(`${institution}: verified official PDFs have unique IDs and hashes`, () => {
    assert(archive.documents.length > 0);
    assert.equal(new Set(archive.documents.map(d => d.id)).size, archive.documents.length);
    assert.equal(new Set(archive.documents.map(d => d.sha256)).size, archive.documents.length);
    for (const d of archive.documents) {
      assert.equal(d.institution, institution);
      assert.equal(d.status, 'verified');
      assert.equal(new URL(d.url).protocol, 'https:');
      assert(hosts.has(new URL(d.url).hostname));
      assert(hosts.has(new URL(d.source).hostname));
      assert.match(d.sha256, /^[a-f0-9]{64}$/);
      assert(d.bytes > 100 && Number.isInteger(d.pages) && d.pages > 0);
      assert(d.startPage >= 1 && d.startPage <= d.pages);
      assert(d.year >= 1981 && d.year <= 2026);
      assert(!/absten[cç][aã]o/i.test(d.label));
      assert(!d.source.includes('base-de-dados-comvest'));
    }
  });
  test(`${institution}: every year in the declared collection has a question source`, () => {
    const from = institution === 'unesp' ? 2004 : 1987;
    for (let year = from; year <= 2026; year++) {
      assert(archive.documents.some(d => d.year === year && ['prova', 'relatorio-com-provas', 'relatorio-com-questoes'].includes(d.kind)), `Missing proof source for ${year}`);
    }
  });
}
test('copied 2024 links are not attributed to the 2025 selection', async () => {
  const a = JSON.parse(await readFile(new URL('../src/data/unicamp-archive.json', import.meta.url), 'utf8'));
  const key = a.documents.find(d => d.url.endsWith('/2023/10/Q_Y.pdf'));
  assert.equal(key?.year, 2024);
  assert.equal(key?.kind, 'gabarito');
  const expected = a.documents.find(d => d.url.endsWith('/bioresp-1.pdf'));
  assert.equal(expected?.kind, 'gabarito');
});
test('the 2008 UNESP report is identified as reproduced questions', async () => {
  const a = JSON.parse(await readFile(new URL('../src/data/unesp-archive.json', import.meta.url), 'utf8'));
  assert.equal(a.documents.find(d => d.year === 2008)?.kind, 'relatorio-com-questoes');
});

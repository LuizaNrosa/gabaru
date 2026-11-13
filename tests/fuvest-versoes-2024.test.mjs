import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read = async p => JSON.parse(await readFile(new URL(`../${p}`, import.meta.url), 'utf8'));

test('FUVEST 2024: as cinco versões têm cadernos e gabaritos identificados', async () => {
  const exams = await read('src/data/fuvest-2024-versoes.json');
  const docs = await read('src/data/fuvest-documentos.json');
  const doubles = { V: 48, K: 9, Q: 43, X: 82, Z: 57 };
  assert.deepEqual(exams.map(e => e.versao), ['V','K','Q','X','Z']);
  for (const exam of exams) {
    assert.equal(exam.gabarito.length, 90);
    assert(exam.gabarito.every(a => /^[A-E]{1,2}$/.test(a)));
    assert.equal(exam.gabarito[doubles[exam.versao] - 1], 'DE');
    assert.equal(exam.gabarito.filter(a => a.length > 1).length, 1);
    assert.equal(docs.filter(d => d.year === 2024 && d.url === exam.fonte_prova).length, 1);
    assert.match(exam.sha256_prova, /^[a-f0-9]{64}$/);
  }
});

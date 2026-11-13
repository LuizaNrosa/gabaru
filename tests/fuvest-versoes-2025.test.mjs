import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const read = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));

test('Cada versão oficial tem caderno único, 90 respostas e proveniência', async () => {
  const provas = await read('src/data/fuvest-2025-versoes.json');
  const docs = await read('src/data/fuvest-documentos.json');
  assert.deepEqual(provas.map(p => p.versao), ['V1', 'V2', 'V3', 'V4']);
  assert.equal(new Set(provas.map(p => p.fonte_prova)).size, 4);
  for (const prova of provas) {
    assert.equal(prova.gabarito.length, 90);
    assert(prova.gabarito.every(a => /^[A-E]$/.test(a)));
    assert.match(prova.sha256_prova, /^[a-f0-9]{64}$/);
    assert.match(prova.sha256_gabarito, /^[a-f0-9]{64}$/);
    assert.equal(docs.filter(d => d.url === prova.fonte_prova && d.year === 2025).length, 1);
  }
  const v1 = await read('src/data/fuvest-2025-v1.json');
  assert.deepEqual(provas[0].gabarito, v1.gabarito);
  assert.notDeepEqual(provas[0].gabarito, provas[1].gabarito);
});

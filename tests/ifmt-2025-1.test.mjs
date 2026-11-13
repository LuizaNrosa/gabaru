import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, access } from 'node:fs/promises';

test('IFMT 2025/1: caderno e gabarito oficial preservados', async () => {
  const registros = JSON.parse(await readFile('src/data/ifmt-2025-1.json', 'utf8'));
  assert.equal(registros.length, 1);
  const r = registros[0];
  assert.equal(r.id, 'ifmt-2025-1');
  assert.equal(r.paginas, 18);
  assert.equal(r.total, 40);
  assert.deepEqual(r.alternativas, ['A', 'B', 'C', 'D', 'E']);
  assert.equal(r.gabarito.join(''), 'DBEACDECBADABCEDEABAE DBBDACEACCABEDBCDDC'.replaceAll(' ', ''));
  for (const [nome, hash] of [['prova.pdf', r.sha256_prova], ['gabarito.pdf', r.sha256_gabarito]]) {
    const conteudo = await readFile(`public/acervo/${r.id}/${nome}`);
    assert.equal(createHash('sha256').update(conteudo).digest('hex'), hash);
  }
  for (let i = 1; i <= r.paginas; i++) await access(`public/acervo/${r.id}/${String(i).padStart(2, '0')}.webp`);
});

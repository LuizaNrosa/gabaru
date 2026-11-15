import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const data = JSON.parse(readFileSync('src/data/ifmt-2026-1.json', 'utf8'))[0];
test('IFMT 2026/1: caderno e gabarito definitivo completos', () => {
  assert.equal(data.total, 50);
  assert.deepEqual(data.alternativas, ['A', 'B', 'C', 'D', 'E']);
  assert.deepEqual(data.gabarito, 'A C B D E C D B A E E C D D A B E B C A D D B B E A E C A C B B D C A A D E * E C A D E B E C A B D'.split(' '));
  assert.equal(data.inicio, 2);
  for (let i = 1; i <= data.paginas; i++) assert.ok(existsSync(`public/acervo/${data.id}/${String(i).padStart(2, '0')}.webp`));
  for (const [filename, hash] of [['prova.pdf', data.sha256_prova], ['gabarito.pdf', data.sha256_gabarito]]) {
    assert.equal(createHash('sha256').update(readFileSync(`public/acervo/${data.id}/${filename}`)).digest('hex'), hash);
  }
});

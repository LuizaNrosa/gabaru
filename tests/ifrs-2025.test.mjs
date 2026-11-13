import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const [c] = JSON.parse(readFileSync(new URL('../src/data/ifrs-2025-1.json', import.meta.url), 'utf8'));
const pasta = new URL('../public/acervo/ifrs-2025-1/', import.meta.url);
const sha = arquivo => createHash('sha256').update(readFileSync(new URL(arquivo, pasta))).digest('hex');
test('IFRS 2025/1 preserva o caderno e o gabarito definitivo publicado', () => {
  assert.equal(c.id, 'ifrs-2025-1');
  assert.equal(c.paginas, 20);
  assert.equal(c.total, 40);
  assert.deepEqual(c.alternativas, ['A','B','C','D','E']);
  assert.equal(c.gabarito.join(''), 'DCAE DABBCEE CDBECCADBB CEDACE*EBEC DACDBACB'.replaceAll(' ',''));
  assert.equal(c.gabarito[27], '*');
  assert.equal(sha('prova.pdf'), '3c54091520a178e2bfcdf619b2b4114c502c19d6fd3dd24a9ea0cdf66f3b75e1');
  assert.equal(sha('gabarito.pdf'), '1be8d89767652aa68357f5f70c11fef956d17c1f30081a6eb69ad9cfa7192882');
  assert.equal(c.sha256_prova, sha('prova.pdf'));
  assert.equal(c.sha256_gabarito, sha('gabarito.pdf'));
  for (let i = 1; i <= c.paginas; i++) assert.ok(existsSync(new URL(`${String(i).padStart(2, '0')}.webp`, pasta)));
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const caderno = JSON.parse(await readFile(new URL('../src/data/ifrs-2026-1.json', import.meta.url), 'utf8'))[0];
test('IFRS 2026/1: caderno íntegro e gabarito definitivo com questão anulada', async () => {
  assert.equal(caderno.total, 40);
  assert.deepEqual(caderno.alternativas, ['A', 'B', 'C', 'D', 'E']);
  assert.equal(caderno.gabarito.length, 40);
  assert.deepEqual(caderno.gabarito.flatMap((valor, i) => valor === '*' ? [i + 1] : []), [35]);
  assert.equal(caderno.gabarito[0], 'E');
  assert.equal(caderno.gabarito[39], 'E');
  for (let i = 1; i <= caderno.paginas; i++) {
    const caminho = new URL(`../public/acervo/${caderno.id}/${String(i).padStart(2, '0')}.webp`, import.meta.url);
    assert.ok((await stat(caminho)).size > 0);
  }
  for (const [arquivo, hash] of [['prova.pdf', caderno.sha256_prova], ['gabarito.pdf', caderno.sha256_gabarito]]) {
    const conteudo = await readFile(new URL(`../public/acervo/${caderno.id}/${arquivo}`, import.meta.url));
    assert.equal(createHash('sha256').update(conteudo).digest('hex'), hash);
  }
});

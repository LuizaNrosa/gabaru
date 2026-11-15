import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const dados = JSON.parse(await readFile(new URL('../src/data/ifrn-2026-cortes.json', import.meta.url), 'utf8'));
test('IFRN 2026: agregados preservam modalidade e vagas sem informações pessoais', () => {
 assert.equal(dados.listas.length, 643);
 assert.equal(new Set(dados.listas.map((l) => l.campus)).size, 19);
 assert.equal(dados.listas.filter((l) => l.referencia_disponivel).length, 602);
 const apodi = dados.listas.find((l) => l.oferta === 1 && l.modalidade === 'AC');
 assert.deepEqual([apodi.curso, apodi.campus, apodi.turno, apodi.vagas, apodi.aprovados, apodi.ultimo_aprovado_escore_final], ['Agropecuária', 'Apodi', 'Matutino', 16, 16, 627]);
 const apodiPpi = dados.listas.find((l) => l.oferta === 1 && l.modalidade === 'LI_PPI');
 assert.deepEqual([apodiPpi.ultimo_aprovado_escore_final, apodiPpi.ultimo_aprovado_escore_final_bonificado], [559, 559]);
 for (const l of dados.listas) {
  assert.ok(!('nome' in l) && !('inscricao' in l) && !('cpf' in l));
  assert.ok(l.aprovados <= l.vagas);
  if(l.referencia_disponivel) assert.ok(l.ultimo_aprovado_escore_final !== null && l.aprovados === l.vagas);
 }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const dados = JSON.parse(await readFile(new URL('../src/data/cotuca-2027-ofertas.json', import.meta.url), 'utf8'));

test('COTUCA 2027 preserva ofertas distintas por modalidade e turno', () => {
  assert.equal(dados.ofertas.length, 19);
  assert.equal(new Set(dados.ofertas.map((o) => o.codigo)).size, 19);
  assert.equal(dados.ofertas.filter((o) => o.tipo === 'integrado').length, 7);
  assert.equal(dados.ofertas.filter((o) => o.tipo === 'tecnico').length, 12);
  assert.deepEqual(dados.ofertas.find((o) => o.codigo === 49), { codigo: 49, tipo: 'tecnico', curso: 'Enfermagem', turno: 'Vespertino', vagas: 35 });
  assert.equal(dados.ofertas.find((o) => o.codigo === 19).vagas, 40);
  assert.equal(dados.ofertas.some((o) => 'corte' in o), false);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('IFCE Fortaleza: referências agregadas da ampla concorrência de 2026.2', async () => {
  const d=JSON.parse(await readFile(new URL('../src/data/ifce-fortaleza-2026-cortes.json', import.meta.url)));
  assert.equal(d.edicao,'2026.2'); assert.equal(d.ofertas.length,6);
  assert.equal(new Set(d.ofertas.map(o=>o.curso)).size,6);
  assert.ok(d.ofertas.every(o=>o.posicao===16 && o.vagas_ac===16 && o.vagas_totais===35));
  assert.equal(d.ofertas.find(o=>o.curso==='Informática').nota,8.39);
  assert.equal(d.ofertas.find(o=>o.curso==='Edificações').nota,7.61);
  assert.ok(!JSON.stringify(d).match(/matr[ií]cula|nascimento|candidato|inscri[cç][aã]o/i));
});

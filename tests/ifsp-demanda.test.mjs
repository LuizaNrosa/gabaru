import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("IFSP 2027: demanda oficial por campus, curso e turno não é corte", async () => {
  const dados = JSON.parse(await readFile(new URL("../src/data/ifsp-2027-demanda.json", import.meta.url)));
  assert.equal(dados.ofertas.length, 103);
  assert.equal(new Set(dados.ofertas.map(o => o.campus)).size, 40);
  assert.equal(dados.ofertas.reduce((s, o) => s + o.vagas, 0), 4504);
  assert.equal(dados.ofertas.reduce((s, o) => s + o.inscritos, 0), 25080);
  assert.equal(new Set(dados.ofertas.map(o => `${o.campus}|${o.curso}|${o.turno}`)).size, 103);
  const capivari = dados.ofertas.find(o => o.campus === "CAPIVARI" && o.curso === "Técnico em Química" && o.turno === "Vespertino");
  assert.deepEqual([capivari.vagas, capivari.inscritos, capivari.candidatos_por_vaga, capivari.dispensada_prova], [40, 30, .75, true]);
  assert.equal(dados.ofertas.filter(o => o.dispensada_prova).length, 1);
  assert.ok(dados.ofertas.some(o => o.campus === "SÃO CARLOS" && o.curso === "Técnico em Manutenção Aeronáutica em Aviônicos" && o.inscritos === 284));
  assert.ok(dados.ofertas.some(o => o.campus === "SÃO PAULO" && o.curso === "Técnico em Desenvolvimento de Sistemas" && o.turno === "Vespertino" && o.inscritos === 301));
  assert.ok(dados.ofertas.every(o => o.curso.startsWith("Técnico em ")));
  assert.ok(dados.ofertas.every(o => !("corte" in o) && Math.abs(o.candidatos_por_vaga - o.inscritos / o.vagas) <= .0050001));
});

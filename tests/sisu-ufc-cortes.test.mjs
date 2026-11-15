import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const dados = JSON.parse(await readFile(new URL("../src/data/sisu-ufc-2026-cortes.json", import.meta.url), "utf8"));
test("UFC: referência da chamada regular de 2026 distingue unidade, curso, turno e modalidade", () => {
 assert.equal(dados.ano, 2026); assert.equal(dados.chamada, "regular"); assert.equal(dados.registros.length, 834);
 assert.equal(new Set(dados.registros.map(r => r.codigo)).size, 110);
 assert.equal(new Set(dados.registros.map(r => `${r.codigo}|${r.turno}|${r.modalidade}`)).size, 834);
 const corte=(codigo, modalidade)=>dados.registros.find(r=>r.codigo===codigo && r.modalidade===modalidade)?.nota;
 assert.equal(corte("13996", "AC"), 815.34); assert.equal(corte("54490", "AC"), 808.10);
 assert.equal(corte("13996", "LB_EP"), 783.74);
 assert.equal(corte("13996", "LI_Q"), undefined);
 assert.ok(dados.registros.every(r=>Number.isFinite(r.nota)&&r.nota>=0&&r.nota<=1000));
});

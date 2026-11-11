import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// Dados gerados por scripts/prepare-coluni-demanda-cortes.mjs a partir da
// base ~/workspace/gabaru-dados-coluni/ (demanda.json + cortes.csv, só
// fontes oficiais da UFV). Expectativas contadas dessa base em 2026-11-03:
// 147 linhas de cortes (146 derivadas + 1 não derivável), 130 linhas de
// chamadas numéricas + 17 de lista de espera, 39 modalidades em 2022–2026,
// demanda documental em 8 das 11 edições.
const dados = JSON.parse(
  await readFile(
    new URL("../src/data/coluni-demanda-cortes.json", import.meta.url),
    "utf8",
  ),
);

const acDe = (e) =>
  e.modalidades.find((m) => m.codigo === "AC" || m.codigo === "9");

test("COLUNI cortes: meta confere com a base oficial compilada", () => {
  assert.equal(dados.meta.totalLinhasCortes, 147);
  assert.equal(dados.meta.linhasCortesDerivadas, 146);
  assert.equal(dados.meta.totalModalidades, 39);
  assert.equal(dados.meta.edicoesComDemanda, 8);
  assert.equal(dados.meta.vagasTotal, 150);
});

test("COLUNI cortes: edições de modalidades 2022–2026, escala 73, 150 vagas", () => {
  assert.deepEqual(
    dados.edicoes.map((e) => e.edicao),
    [2026, 2025, 2024, 2023, 2022],
  );
  assert.deepEqual(
    dados.edicoes.map((e) => e.modalidades.length),
    [7, 5, 9, 9, 9],
  );
  for (const e of dados.edicoes) {
    assert.equal(e.escala, 73);
    assert.equal(e.vagasTotal, 150);
    assert.ok(e.demanda, `edição ${e.edicao} tem demanda documental`);
  }
  assert.deepEqual(
    dados.edicoes.map((e) => e.era),
    ["siglas", "siglas", "grupos", "grupos", "grupos"],
  );
});

test("COLUNI cortes: série da ampla concorrência (1ª chamada) é a das listas oficiais", () => {
  const esperado = { 2026: 60.4, 2025: 54, 2024: 48.6, 2023: 57.4, 2022: 57.4 };
  for (const e of dados.edicoes) {
    const ac = acDe(e);
    assert.ok(ac, `AC presente em ${e.edicao}`);
    assert.equal(ac.corte1aChamada, esperado[e.edicao]);
    assert.ok(ac.fonteUrlCorte?.startsWith("https://"));
  }
});

test("COLUNI cortes: 2026 AC — exemplo completo conferido à mão", () => {
  const e2026 = dados.edicoes[0];
  assert.equal(e2026.demanda.inscritos, 2361);
  assert.equal(e2026.demanda.candidatosPorVaga, 15.74);
  const ac = acDe(e2026);
  assert.equal(ac.vagas, 75);
  assert.equal(ac.corte1aChamada, 60.4);
  assert.equal(ac.notaMaior1aChamada, 67.8);
  assert.equal(ac.nConvocados1aChamada, 75);
  assert.deepEqual(ac.piso, { nota: 60, chamada: 2 });
  assert.equal(ac.fronteiraEspera, 60);
  assert.equal(ac.nEmEspera, 354);
  assert.equal(ac.demandaGrupo.inscritos, 1608);
  assert.equal(ac.demandaGrupo.candidatosPorVaga, 21.44);
});

test("COLUNI cortes: demanda documental por edição (inscritos dos relatórios oficiais)", () => {
  const esperado = { 2026: 2361, 2025: 2016, 2024: 2172, 2023: 2071, 2022: 1862 };
  for (const e of dados.edicoes) {
    assert.equal(e.demanda.inscritos, esperado[e.edicao]);
    // candidatos/vaga = inscritos / 150, sem arredondamento escondido
    assert.ok(
      Math.abs(e.demanda.candidatosPorVaga - esperado[e.edicao] / 150) < 0.001,
    );
  }
});

test("COLUNI cortes: toda a modalidade tem corte de 1ª chamada com fonte; 130 chamadas no total", () => {
  let totalChamadas = 0;
  for (const e of dados.edicoes) {
    for (const m of e.modalidades) {
      assert.notEqual(m.corte1aChamada, null, `${e.edicao}/${m.codigo}`);
      assert.ok(m.fonteUrlCorte?.startsWith("https://"));
      assert.ok(m.piso && m.piso.nota <= m.corte1aChamada + 1e-9);
      for (const c of m.chamadas) assert.notEqual(c.notaCorte, null);
      totalChamadas += m.chamadas.length;
    }
  }
  for (const h of dados.historicoBonus) totalChamadas += h.chamadas.length;
  assert.equal(totalChamadas, 130);
});

test("COLUNI cortes: histórico da era do bônus fica separado, com escalas e lacunas honestas", () => {
  const hist = dados.historicoBonus;
  assert.deepEqual(
    hist.map((h) => h.edicao),
    [2021, 2020, 2019, 2018, 2017, 2016],
  );
  const por = Object.fromEntries(hist.map((h) => [h.edicao, h]));
  assert.equal(por[2016].escala, 100);
  assert.equal(por[2017].escala, 100);
  assert.equal(por[2018].escala, 73);
  assert.equal(por[2016].bonusPercentual, 15);
  assert.equal(por[2021].bonusPercentual, 20);
  // Demanda documental só existe para 2016, 2019 e 2021 nesta era.
  assert.equal(por[2016].demanda.inscritos, 2270);
  assert.equal(por[2019].demanda.inscritos, 2222);
  assert.equal(por[2021].demanda.inscritos, 1698);
  assert.equal(por[2017].demanda, null);
  assert.equal(por[2018].demanda, null);
  assert.equal(por[2020].demanda, null);
  // 2016: lista de espera não localizada — fronteira ausente, não inventada.
  assert.equal(por[2016].corte1aChamada, 72.95);
  assert.equal(por[2016].fronteiraEspera, null);
  assert.equal(por[2016].esperaDerivavel, false);
  assert.equal(por[2017].fronteiraEspera, 75.15);
  // 2018: os dois documentos oficiais intitulados “2ª chamada” são
  // preservados como duas linhas distintas (56,16 e 56,00).
  assert.equal(por[2018].corte1aChamada, 56.4);
  assert.deepEqual(
    por[2018].chamadas.filter((c) => c.chamada === 2).map((c) => c.notaCorte),
    [56.16, 56],
  );
  assert.equal(por[2021].corte1aChamada, 57.12);
  assert.equal(por[2021].piso.nota, 56.8);
});

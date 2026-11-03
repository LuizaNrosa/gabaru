import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// Dados gerados por scripts/prepare-ifsc-demanda-cortes.mjs a partir da
// base ~/workspace/gabaru-dados-ifsc/ (demanda.json + cortes.csv, só
// fontes oficiais do IFSC). Expectativas contadas dessa base em
// 2026-11-03: 406 cursos em 17 edições; 975 linhas de corte (742 do
// agregado oficial publicado + 233 derivadas de 2026.1); 284 cursos com
// alguma referência; 12 cursos dispensados de prova.
const dados = JSON.parse(
  await readFile(
    new URL("../src/data/ifsc-demanda-cortes.json", import.meta.url),
    "utf8",
  ),
);

const todas = dados.edicoes.flatMap((e) =>
  e.cursos.map((c) => ({ edicao: e.edicao, questoes: e.questoes, ...c })),
);
const achar = (edicao, campus, curso, turno) =>
  todas.find(
    (c) =>
      c.edicao === edicao &&
      c.campus === campus &&
      c.curso === curso &&
      c.turno === turno,
  );

test("IFSC cortes: meta confere com a base oficial compilada", () => {
  assert.equal(dados.meta.totalEdicoes, 17);
  assert.equal(dados.meta.edicoesComCortes, 11);
  assert.equal(dados.meta.totalCursos, 406);
  assert.equal(dados.meta.cursosComCorte, 284);
  assert.equal(dados.meta.cursosDispensados, 12);
  assert.equal(dados.meta.totalLinhasCortes, 975);
  assert.equal(dados.meta.linhasAgregadoOficial, 742);
  assert.equal(dados.meta.linhasDerivadas, 233);
});

test("IFSC cortes: edições semestrais 2026.2→2017.1 e questões por era", () => {
  assert.deepEqual(
    dados.edicoes.map((e) => e.edicao),
    [
      "2026.2", "2026.1", "2025.2", "2025.1", "2024.2", "2024.1",
      "2023.2", "2023.1", "2022.2", "2022.1", "2020.1", "2019.2",
      "2019.1", "2018.2", "2018.1", "2017.2", "2017.1",
    ],
  );
  for (const e of dados.edicoes) {
    const esperado =
      e.edicao === "2024.1" ? 24 : e.edicao >= "2024.2" ? 28 : 20;
    assert.equal(e.questoes, esperado, `questões de ${e.edicao}`);
  }
  // Totais de edição conferidos com a relação candidato/vaga oficial.
  const t = Object.fromEntries(dados.edicoes.map((e) => [e.edicao, e]));
  assert.equal(t["2026.1"].vagasTotais, 1602);
  assert.equal(t["2026.1"].inscritosTotais, 7294);
  assert.equal(t["2026.1"].candidatosPorVagaEdicao, 4.55);
  assert.equal(t["2017.1"].vagasTotais, 917);
  assert.equal(t["2017.1"].inscritosTotais, 4833);
});

test("IFSC cortes: 975 referências — 742 oficiais, 233 derivadas só em 2026.1", () => {
  let refs = 0;
  let oficiais = 0;
  let derivadas = 0;
  for (const c of todas) {
    for (const r of c.referencias) {
      refs++;
      if (r.oficial) oficiais++;
      if (r.derivado1a) {
        derivadas++;
        assert.equal(
          c.edicao,
          "2026.1",
          "corte derivado fora de 2026.1 não existe na base",
        );
        assert.ok(r.derivado1a.nConvocados > 0);
      }
      // Uma referência tem um método ou outro por modalidade — exceto a
      // GERAL de 2026.1, que é só oficial; nunca os dois na mesma linha
      // de origem, e os valores são acertos inteiros dentro da escala.
      for (const v of [r.oficial, r.derivado1a]) {
        if (!v) continue;
        assert.ok(Number.isInteger(v.notaMinima));
        assert.ok(Number.isInteger(v.notaMaxima));
        assert.ok(v.notaMinima >= 0 && v.notaMaxima <= c.questoes);
        assert.ok(v.notaMinima <= v.notaMaxima);
        assert.ok(v.fonteUrl?.startsWith("https://"));
      }
    }
    assert.ok(c.demanda.fonteUrl?.startsWith("https://"));
  }
  assert.equal(refs, 975);
  assert.equal(oficiais, 742);
  assert.equal(derivadas, 233);
});

test("IFSC cortes: seis edições sem lista oficial ficam sem nenhuma referência", () => {
  const semLista = ["2019.2", "2020.1", "2022.1", "2022.2", "2023.1", "2023.2"];
  for (const edicao of semLista) {
    const cursos = todas.filter((c) => c.edicao === edicao);
    assert.ok(cursos.length > 0, `${edicao} tem demanda`);
    assert.ok(
      cursos.every((c) => c.referencias.length === 0),
      `${edicao} sem inventar cortes`,
    );
  }
  const comLista = dados.edicoes
    .filter((e) => !semLista.includes(e.edicao))
    .map((e) => e.edicao);
  assert.equal(comLista.length, 11);
});

test("IFSC cortes: 2017.1 só tem as três modalidades de cota localizadas (sem AC)", () => {
  const mods = new Set(
    todas
      .filter((c) => c.edicao === "2017.1")
      .flatMap((c) => c.referencias.map((r) => r.modalidade)),
  );
  assert.deepEqual([...mods].sort(), ["RINPPI", "RIPPI", "RSPPI"]);
});

test("IFSC cortes: exemplo completo 2026.1 — Florianópolis - Centro, Química, matutino", () => {
  const q = achar(
    "2026.1",
    "Florianópolis - Centro",
    "Técnico Integrado em Química",
    "matutino",
  );
  assert.ok(q);
  assert.equal(q.demanda.vagas, 32);
  assert.equal(q.demanda.inscritos, 382);
  assert.equal(q.demanda.candidatosPorVaga, 11.94);
  const ac = q.referencias.find((r) => r.modalidade === "AC");
  assert.equal(ac.oficial, null);
  assert.deepEqual(
    {
      min: ac.derivado1a.notaMinima,
      max: ac.derivado1a.notaMaxima,
      n: ac.derivado1a.nConvocados,
    },
    { min: 25, max: 27, n: 16 },
  );
  const geral = q.referencias.find((r) => r.modalidade === "GERAL");
  assert.deepEqual(
    { min: geral.oficial.notaMinima, max: geral.oficial.notaMaxima },
    { min: 14, max: 27 },
  );
  assert.equal(geral.derivado1a, null);
  const lbEp = q.referencias.find((r) => r.modalidade === "LB_EP");
  assert.deepEqual(
    {
      min: lbEp.derivado1a.notaMinima,
      max: lbEp.derivado1a.notaMaxima,
      n: lbEp.derivado1a.nConvocados,
    },
    { min: 23, max: 24, n: 4 },
  );
});

test("IFSC cortes: registo padrão da ferramenta (2026.2, Chapecó, DS, vespertino)", () => {
  const c0 = dados.edicoes[0].cursos[0];
  assert.equal(dados.edicoes[0].edicao, "2026.2");
  assert.equal(c0.campus, "Chapecó");
  assert.equal(c0.curso, "Técnico Integrado em Desenvolvimento de Sistemas");
  assert.equal(c0.turno, "vespertino");
  assert.equal(c0.demanda.vagas, 35);
  assert.equal(c0.demanda.inscritos, 70);
  assert.equal(c0.demanda.candidatosPorVaga, 2);
  assert.equal(c0.referencias.length, 1);
  assert.equal(c0.referencias[0].modalidade, "GERAL");
  assert.deepEqual(
    {
      min: c0.referencias[0].oficial.notaMinima,
      max: c0.referencias[0].oficial.notaMaxima,
    },
    { min: 7, max: 27 },
  );
});

test("IFSC cortes: dispensa de prova — 12 cursos, com a exceção documentada de 2018.1", () => {
  const dispensados = todas.filter((c) => c.demanda.provaDispensada);
  assert.equal(dispensados.length, 12);
  assert.equal(
    dispensados.filter((c) => c.demanda.provaDispensada === "fonte").length,
    9,
  );
  assert.equal(
    dispensados.filter((c) => c.demanda.provaDispensada === "regra").length,
    3,
  );
  // 11 dos 12 não geram nenhuma linha de corte.
  const comRefs = dispensados.filter((c) => c.referencias.length > 0);
  assert.equal(comRefs.length, 1);
  // Exceção: 2018.1 Araranguá Eletromecânica (vespertino) — dispensado
  // pela regra, com 3 linhas publicadas de mínimo = máximo = 1 acerto.
  const exc = comRefs[0];
  assert.equal(exc.edicao, "2018.1");
  assert.equal(exc.campus, "Araranguá");
  assert.equal(exc.curso, "Técnico Integrado em Eletromecânica");
  assert.equal(exc.turno, "vespertino");
  assert.equal(exc.referencias.length, 3);
  for (const r of exc.referencias) {
    assert.equal(r.oficial.notaMinima, 1);
    assert.equal(r.oficial.notaMaxima, 1);
  }
  // Caso canónico de dispensa marcada na fonte.
  const garopaba = achar(
    "2026.1",
    "Garopaba",
    "Técnico Integrado em Lazer",
    "integral",
  );
  assert.equal(garopaba.demanda.provaDispensada, "fonte");
  assert.equal(garopaba.demanda.vagas, 36);
  assert.equal(garopaba.demanda.inscritos, 32);
  assert.equal(garopaba.referencias.length, 0);
});

test("IFSC cortes: o único erro real de C/V da fonte fica visível (Jaraguá 2026.2)", () => {
  const divergentes = todas.filter(
    (c) =>
      c.demanda.candidatosPorVagaPublicado != null &&
      Math.abs(
        c.demanda.candidatosPorVagaPublicado - c.demanda.candidatosPorVaga,
      ) > 0.05,
  );
  assert.equal(divergentes.length, 1);
  const j = divergentes[0];
  assert.equal(j.edicao, "2026.2");
  assert.equal(j.campus, "Jaraguá do Sul - Centro");
  assert.equal(j.curso, "Técnico Integrado em Modelagem do Vestuário");
  assert.equal(j.demanda.vagas, 35);
  assert.equal(j.demanda.inscritos, 37);
  assert.equal(j.demanda.candidatosPorVagaPublicado, 0.94);
  assert.equal(j.demanda.candidatosPorVaga, 1.06);
});

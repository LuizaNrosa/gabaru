/**
 * Gera src/data/ifsc-demanda-cortes.json a partir da base compilada em
 * ~/workspace/gabaru-dados-ifsc/ (demanda.json + cortes.csv).
 *
 * Uso manual (NÃO faz parte do prebuild — a pasta de dados fica fora do repo):
 *   node scripts/prepare-ifsc-demanda-cortes.mjs
 *   GABARU_DADOS_IFSC_DIR=/caminho node scripts/prepare-ifsc-demanda-cortes.mjs
 *
 * Regras de honestidade aplicadas aqui (as mesmas das bases ETEC/COLUNI):
 * - O IFSC não publica "nota de corte" nominal. Coexistem DOIS métodos,
 *   rotulados de forma distinta e nunca misturados:
 *   1) AGREGADO OFICIAL PUBLICADO — a "Lista de pontuação máxima e mínima
 *      por curso (aprovados)" do próprio IFSC (chamada final, todas as
 *      chamadas): 2024.1–2026.2 em linha GERAL por curso; 2017.1–2019.1
 *      por modalidade (AC, R1–R8; siglas RIPPI/RINPPI/RSPPI/RSNPPI em 2017).
 *   2) CORTE DERIVADO — só 2026.1, 1ª chamada, por modalidade: agregados
 *      calculados por nós da Classificação Geral do Certame oficial
 *      (menor nota entre os aprovados APV da 1ª chamada), apenas para os
 *      34/44 cursos que passaram os dois portões de validação da base.
 * - A nota é o N.º DE ACERTOS (classificação sem pesos, fórmula do edital).
 * - Demanda: relação candidato/vaga oficial por curso (coluna GERAL).
 *   Mostramos vagas e inscritos oficiais e o C/V calculado deles; o C/V
 *   tal como impresso na fonte vai ao lado (há 1 erro conhecido da fonte:
 *   2026.2, Jaraguá do Sul — Modelagem do Vestuário, 0,94 impresso para
 *   37/35 = 1,06 — ver RELATORIO.md da base).
 * - Dispensa de prova: curso com C/V ≤ 1 não realizou prova (regra do
 *   edital, item 7.2). Os 12 cursos assinalados na base mantêm o aviso;
 *   11 não geram linha de corte. Exceção registada: 2018.1, Araranguá
 *   Eletromecânica vespertino (dispensado pela regra) tem 3 linhas
 *   publicadas com mínimo = máximo = 1 acerto — coerente com a aprovação
 *   de todos os inscritos; as linhas são mantidas e a ferramenta mostra
 *   a dispensa como facto principal.
 * - Edições sem lista oficial de pontuações (2019.2, 2020.1, 2022.1,
 *   2022.2, 2023.1, 2023.2) entram com a demanda e SEM referências de
 *   corte — ausência honesta, nunca estimativa nem empréstimo de outro
 *   curso/turno/edição.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dadosDir =
  process.env.GABARU_DADOS_IFSC_DIR ?? resolve(repo, "../../gabaru-dados-ifsc");

/** Parser CSV mínimo: aspas, vírgulas dentro de aspas, "" escapado, CRLF. */
function parseCsv(texto) {
  const linhas = [];
  let linha = [];
  let campo = "";
  let emAspas = false;
  const textoLimpo = texto.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < textoLimpo.length; i++) {
    const c = textoLimpo[i];
    if (emAspas) {
      if (c === '"') {
        if (textoLimpo[i + 1] === '"') {
          campo += '"';
          i++;
        } else emAspas = false;
      } else campo += c;
    } else if (c === '"') emAspas = true;
    else if (c === ",") {
      linha.push(campo);
      campo = "";
    } else if (c === "\n") {
      linha.push(campo);
      campo = "";
      linhas.push(linha);
      linha = [];
    } else campo += c;
  }
  if (campo !== "" || linha.length) {
    linha.push(campo);
    linhas.push(linha);
  }
  const [cabecalho, ...resto] = linhas.filter((l) => l.length > 1);
  return resto.map((l) =>
    Object.fromEntries(cabecalho.map((h, i) => [h.trim(), (l[i] ?? "").trim()])),
  );
}

const num = (v) => {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
};
const inteiro = (v, ctx) => {
  const n = num(v);
  if (n === null || !Number.isInteger(n))
    throw new Error(`Nota não inteira em ${ctx}: ${v}`);
  return n;
};

const demanda = JSON.parse(
  readFileSync(resolve(dadosDir, "demanda.json"), "utf8"),
);
const cortes = parseCsv(readFileSync(resolve(dadosDir, "cortes.csv"), "utf8"));

const chave = (r) => `${r.edicao}|${r.campus}|${r.curso}|${r.turno}`;

// ---------- Cortes agrupados por curso × modalidade ----------
const ORDEM_SIGLAS_2017 = ["RIPPI", "RINPPI", "RSPPI", "RSNPPI"];
const ordemModalidade = (codigo) => {
  if (codigo === "AC") return 0;
  if (codigo.startsWith("LB_")) return 10 + codigo.length + codigo.charCodeAt(3);
  if (codigo.startsWith("LI_")) return 20 + codigo.length + codigo.charCodeAt(3);
  const r = codigo.match(/^R(\d+)$/);
  if (r) return 30 + Number(r[1]);
  const s = ORDEM_SIGLAS_2017.indexOf(codigo);
  if (s >= 0) return 40 + s;
  if (codigo === "GERAL") return 99;
  return 50;
};

const porCurso = new Map(); // chave -> Map(modalidade -> referência)
let linhasOficiais = 0;
let linhasDerivadas = 0;
for (const l of cortes) {
  const k = chave(l);
  if (!porCurso.has(k)) porCurso.set(k, new Map());
  const refs = porCurso.get(k);
  if (!refs.has(l.modalidade)) {
    refs.set(l.modalidade, {
      modalidade: l.modalidade,
      rotulo: l.modalidade_rotulo || l.modalidade,
      oficial: null,
      derivado1a: null,
    });
  }
  const ref = refs.get(l.modalidade);
  const ctx = `${k}|${l.modalidade}|${l.chamada}`;
  const valores = {
    notaMinima: inteiro(l.nota_minima_corte, ctx),
    notaMaxima: inteiro(l.nota_maxima, ctx),
    fonteUrl: l.fonte_url || null,
  };
  if (valores.notaMinima > valores.notaMaxima)
    throw new Error(`Mínima maior que máxima em ${ctx}`);
  if (l.chamada === "final (todas as chamadas)") {
    if (!l.metodo.startsWith("agregado oficial"))
      throw new Error(`Método inesperado em ${ctx}: ${l.metodo}`);
    if (ref.oficial) throw new Error(`Agregado oficial duplicado em ${ctx}`);
    ref.oficial = valores;
    linhasOficiais++;
  } else if (l.chamada === "1ª chamada") {
    if (!l.metodo.startsWith("derivado"))
      throw new Error(`Método inesperado em ${ctx}: ${l.metodo}`);
    if (ref.derivado1a) throw new Error(`Derivado duplicado em ${ctx}`);
    ref.derivado1a = { ...valores, nConvocados: num(l.n_convocados) };
    linhasDerivadas++;
  } else {
    throw new Error(`Chamada inesperada em ${ctx}`);
  }
}

// ---------- Demanda + junção ----------
const ORDEM_TURNO = ["integral", "matutino", "vespertino", "noturno"];
const ordemTurno = (t) => {
  const i = ORDEM_TURNO.indexOf(t);
  return i >= 0 ? i : 99;
};
const cmpTexto = (a, b) => a.localeCompare(b, "pt-BR");

const DISPENSA = {
  sim_marcado_na_fonte: "fonte",
  "sim_regra_edital_inscritos<=vagas": "regra",
};

const porEdicao = new Map();
let cursosComCorte = 0;
let cursosDispensados = 0;
const chavesDemanda = new Set();
for (const d of demanda) {
  const k = chave(d);
  chavesDemanda.add(k);
  if (!porEdicao.has(d.edicao)) {
    porEdicao.set(d.edicao, {
      edicao: d.edicao,
      editais: new Set(),
      questoes: 0,
      vagasTotais: num(d.vagas_totais_edicao),
      inscritosTotais: num(d.inscritos_totais_edicao),
      candidatosPorVagaEdicao: num(d.candidatos_por_vaga_edicao),
      cursos: [],
    });
  }
  const ed = porEdicao.get(d.edicao);
  ed.editais.add(d.edital);
  const q = num(d.questoes_prova) ?? 0;
  if (q > 0) {
    if (ed.questoes !== 0 && ed.questoes !== q)
      throw new Error(`Questões divergentes na edição ${d.edicao}`);
    ed.questoes = q;
  }
  const dispensada = d.prova_dispensada
    ? (DISPENSA[d.prova_dispensada] ?? null)
    : null;
  if (d.prova_dispensada && !dispensada)
    throw new Error(`prova_dispensada inesperado: ${d.prova_dispensada}`);
  if (dispensada) cursosDispensados++;
  const referencias = [...(porCurso.get(k)?.values() ?? [])].sort(
    (a, b) => ordemModalidade(a.modalidade) - ordemModalidade(b.modalidade),
  );
  if (referencias.length) cursosComCorte++;
  ed.cursos.push({
    campus: d.campus,
    curso: d.curso,
    turno: d.turno,
    edital: d.edital,
    demanda: {
      vagas: num(d.vagas),
      inscritos: num(d.inscritos),
      candidatosPorVaga: num(d.candidatos_por_vaga_calculado),
      candidatosPorVagaPublicado: num(d.candidatos_por_vaga_publicado),
      provaDispensada: dispensada,
      fonteUrl: d.fonte_url || null,
    },
    referencias,
  });
}

// Nenhuma linha de corte pode ficar órfã (sem curso na demanda).
let orfas = 0;
for (const k of porCurso.keys()) if (!chavesDemanda.has(k)) orfas++;
if (orfas) throw new Error(`${orfas} cursos de cortes.csv sem demanda`);

// Notas dentro da escala da edição (acertos ≤ n.º de questões).
for (const ed of porEdicao.values()) {
  for (const c of ed.cursos) {
    for (const r of c.referencias) {
      for (const v of [r.oficial, r.derivado1a]) {
        if (v && (v.notaMinima < 0 || v.notaMaxima > ed.questoes))
          throw new Error(
            `Nota fora da escala em ${ed.edicao}|${c.curso}|${r.modalidade}`,
          );
      }
    }
  }
}

const edicoes = [...porEdicao.values()]
  .sort((a, b) => cmpTexto(b.edicao, a.edicao))
  .map((ed) => ({
    edicao: ed.edicao,
    editais: [...ed.editais],
    questoes: ed.questoes,
    vagasTotais: ed.vagasTotais,
    inscritosTotais: ed.inscritosTotais,
    candidatosPorVagaEdicao: ed.candidatosPorVagaEdicao,
    cursos: ed.cursos.sort(
      (a, b) =>
        cmpTexto(a.campus, b.campus) ||
        cmpTexto(a.curso, b.curso) ||
        ordemTurno(a.turno) - ordemTurno(b.turno),
    ),
  }));

const saida = {
  meta: {
    geradoEm: new Date().toISOString().slice(0, 10),
    origem:
      "Base Gabaru de demanda e cortes do IFSC (Exame de Classificação, cursos técnicos integrados), compilada de documentos oficiais do IFSC (relações candidato/vaga, listas de pontuação máxima e mínima por curso, Classificação Geral do Certame 2026.1, editais) arquivados em ~/workspace/gabaru-dados-ifsc/ (ver RELATORIO.md e fonteUrl por registo).",
    nota: "O IFSC não publica 'nota de corte' nominal. Coexistem dois métodos rotulados: (1) agregado oficial publicado — mínimo/máximo da lista oficial de pontuação por curso (final, todas as chamadas); (2) corte derivado — só 2026.1, 1ª chamada por modalidade, calculado dos agregados da Classificação Geral oficial. A nota é o número de acertos (sem pesos). Cursos com candidatos/vaga ≤ 1 foram dispensados de prova (regra do edital). Edições sem lista oficial de pontuações (2019.2, 2020.1, 2022.1, 2022.2, 2023.1, 2023.2) têm demanda e nenhuma referência de corte — lacuna da fonte pública, nunca estimativa.",
    totalEdicoes: edicoes.length,
    edicoesComCortes: edicoes.filter((e) =>
      e.cursos.some((c) => c.referencias.length),
    ).length,
    totalCursos: demanda.length,
    cursosComCorte,
    cursosDispensados,
    totalLinhasCortes: cortes.length,
    linhasAgregadoOficial: linhasOficiais,
    linhasDerivadas: linhasDerivadas,
  },
  edicoes,
};

const destino = resolve(repo, "src/data/ifsc-demanda-cortes.json");
writeFileSync(destino, JSON.stringify(saida, null, 2) + "\n");
console.log(
  `OK: ${saida.meta.totalEdicoes} edições, ${saida.meta.totalCursos} cursos (${saida.meta.cursosComCorte} com corte, ${saida.meta.cursosDispensados} dispensados), ${saida.meta.totalLinhasCortes} linhas de corte (${linhasOficiais} oficiais + ${linhasDerivadas} derivadas) -> ${destino}`,
);
for (const e of edicoes) {
  const com = e.cursos.filter((c) => c.referencias.length).length;
  console.log(
    `  ${e.edicao} (${e.questoes} questões): ${e.cursos.length} cursos, ${com} com corte · demanda da edição ${e.candidatosPorVagaEdicao} c/v (${e.inscritosTotais} inscritos)`,
  );
}
const ex = edicoes
  .find((e) => e.edicao === "2026.1")
  ?.cursos.find(
    (c) =>
      c.campus === "Florianópolis - Centro" &&
      c.curso === "Técnico Integrado em Química" &&
      c.turno === "matutino",
  );
const exAc = ex?.referencias.find((r) => r.modalidade === "AC");
const exGeral = ex?.referencias.find((r) => r.modalidade === "GERAL");
console.log(
  `  exemplo 2026.1 Florianópolis - Centro · Química (matutino): demanda ${ex?.demanda.candidatosPorVaga} c/v (${ex?.demanda.inscritos} inscritos, ${ex?.demanda.vagas} vagas) · AC derivado 1ª = ${exAc?.derivado1a?.notaMinima} (máx ${exAc?.derivado1a?.notaMaxima}, ${exAc?.derivado1a?.nConvocados} convocados) · GERAL oficial final = ${exGeral?.oficial?.notaMinima} (máx ${exGeral?.oficial?.notaMaxima})`,
);

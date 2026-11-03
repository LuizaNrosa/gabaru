/**
 * Gera src/data/etec-demanda-cortes.json a partir da base compilada em
 * ~/workspace/gabaru-dados-etec/ (demanda.json + cortes.csv).
 *
 * Uso manual (NÃO faz parte do prebuild — a pasta de dados fica fora do repo):
 *   node scripts/prepare-demanda-cortes.mjs
 *   GABARU_DADOS_ETEC_DIR=/caminho node scripts/prepare-demanda-cortes.mjs
 *
 * Regras de honestidade aplicadas aqui:
 * - Só entram registos de demanda presenciais de fontes oficiais
 *   (ficam de fora: EaD estadual, sem unidade; e a compilação secundária
 *   de 2019, com nomenclatura antiga e fonte não oficial).
 * - Nota de corte só é transportada quando cortes.csv a traz preenchida a
 *   partir de uma lista de classificação oficial (hoje: 2 combinações).
 *   Campos vazios na fonte continuam vazios — nunca estimados.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dadosDir =
  process.env.GABARU_DADOS_ETEC_DIR ?? resolve(repo, "../../gabaru-dados-etec");

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
const urlWayback = (texto) => {
  const m = String(texto ?? "").match(/https:\/\/web\.archive\.org\/[^\s"]+/);
  return m ? m[0] : null;
};

const demanda = JSON.parse(
  readFileSync(resolve(dadosDir, "demanda.json"), "utf8"),
);
const cortes = parseCsv(readFileSync(resolve(dadosDir, "cortes.csv"), "utf8"));

const chave = (unidade, curso, turno) => `${unidade}||${curso}||${turno}`;
const combinacoes = new Map();
const obter = (unidade, municipio, curso, turno, modalidade) => {
  const k = chave(unidade, curso, turno);
  if (!combinacoes.has(k)) {
    combinacoes.set(k, {
      unidade,
      municipio: municipio || null,
      curso,
      turno,
      modalidade: modalidade || null,
      demanda: [],
      corte: null,
      listaRecuperada: null,
    });
  }
  return combinacoes.get(k);
};

for (const r of demanda.registos) {
  if (r.modalidade === "ead") continue;
  if (r.tipo_registro === "compilacao_secundaria") continue;
  const c = obter(
    r.unidade_nome,
    r.municipio,
    r.curso,
    r.turno ?? "",
    r.modalidade,
  );
  c.demanda.push({
    edicao: r.edicao,
    vagas: num(r.vagas),
    inscritos: num(r.inscritos),
    demandaCv: num(r.demanda_cv),
    fonteTipo: r.fonte_tipo,
    fonteUrl: r.fonte_url || null,
  });
}

for (const l of cortes) {
  const vagas = num(l.vagas);
  if (l.nota_corte_1a_chamada) {
    const c = obter(l.unidade_nome, l.municipio, l.curso, l.turno, null);
    c.corte = {
      edicao: l.edicao,
      vagas,
      notaCorte: num(l.nota_corte_1a_chamada),
      notaMaior: num(l.nota_maior),
      nClassificados: num(l.n_classificados),
      fonteUrl: urlWayback(l.observacoes),
    };
  } else if ((l.status ?? "").startsWith("lista_recuperada")) {
    const c = obter(l.unidade_nome, l.municipio, l.curso, l.turno, null);
    const m = String(l.observacoes).match(
      /última nota de classificado ([\d.,]+)/i,
    );
    c.listaRecuperada = {
      edicao: l.edicao,
      notaMaior: num(l.nota_maior),
      nClassificados: num(l.n_classificados),
      ultimaNota: m ? num(m[1]) : null,
      fonteUrl: urlWayback(l.observacoes),
    };
  }
}

const lista = [...combinacoes.values()]
  .map((c) => ({
    ...c,
    demanda: c.demanda.sort((a, b) => (a.edicao < b.edicao ? 1 : -1)),
  }))
  .sort((a, b) => {
    if (a.corte && !b.corte) return -1;
    if (!a.corte && b.corte) return 1;
    const da = a.demanda[0]?.demandaCv ?? -1;
    const db = b.demanda[0]?.demandaCv ?? -1;
    return db - da;
  });

const saida = {
  meta: {
    geradoEm: new Date().toISOString().slice(0, 10),
    origem:
      "Base Gabaru de demanda e cortes do Vestibulinho ETEC (fontes oficiais do Centro Paula Souza/FAT e listas de classificação oficiais; ver fonteUrl por registo).",
    totalCombinacoes: lista.length,
    combinacoesComCorte: lista.filter((c) => c.corte).length,
    nota: "Campos ausentes são lacunas da fonte pública, nunca estimativas. A nota de corte é a NOTA final (já com pontuação acrescida) do classificado na posição igual ao nº de vagas, na lista geral de 1ª opção.",
  },
  combinacoes: lista,
};

const destino = resolve(repo, "src/data/etec-demanda-cortes.json");
writeFileSync(destino, JSON.stringify(saida, null, 2) + "\n");
console.log(
  `OK: ${lista.length} combinações, ${saida.meta.combinacoesComCorte} com corte real -> ${destino}`,
);
for (const c of lista.filter((c) => c.corte)) {
  console.log(
    `  CORTE ${c.corte.edicao}: ${c.unidade} · ${c.curso} · ${c.turno} = ${c.corte.notaCorte}`,
  );
}

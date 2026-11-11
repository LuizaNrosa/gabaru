/**
 * Gera src/data/coluni-demanda-cortes.json a partir da base compilada em
 * ~/workspace/gabaru-dados-coluni/ (demanda.json + cortes.csv).
 *
 * Uso manual (NÃO faz parte do prebuild — a pasta de dados fica fora do repo):
 *   node scripts/prepare-coluni-demanda-cortes.mjs
 *   GABARU_DADOS_COLUNI_DIR=/caminho node scripts/prepare-coluni-demanda-cortes.mjs
 *
 * Regras de honestidade aplicadas aqui (as mesmas da base ETEC):
 * - A UFV NÃO publica "nota de corte": o que existe é a menor pontuação
 *   entre os convocados de cada lista oficial. Tudo o que sai daqui é
 *   "corte derivado da lista oficial", rotulado como tal, com fonteUrl
 *   por registo.
 * - Demanda da edição só entra do documento oficial candidato/vaga
 *   (relatório GPS ou relação candidato/vaga). Contagens de homologados
 *   e o valor aproximado de notícia oficial ficam de fora.
 * - Campos vazios na fonte continuam vazios — nunca estimados nem
 *   interpolados. Edições/modalidades sem linha na fonte não aparecem.
 * - Descrições das modalidades: as transcrições da coluna
 *   modalidade_descricao de cortes.csv têm lapsos conhecidos do portal
 *   (ver RELATORIO.md, limitação 9). Por isso a descrição usada é a do
 *   relatório candidato/vaga oficial (demanda.json), ligada:
 *   - 2022–2024: modalidade N = grupo N do relatório da própria edição;
 *   - 2025–2026: pela correspondência "corresponde ao grupo N" registada
 *     nas observações de cortes.csv (AC = grupo da Ampla Concorrência).
 *   Os rótulos curtos das siglas são a expansão definicional das siglas
 *   da Lei 14.723/2023, conferida contra essas descrições oficiais
 *   (LB = escola pública e renda ≤ 1 SM; LI = escola pública, qualquer
 *   renda; EP/PPI/Q/PCD = recorte da modalidade).
 * - Eras separadas: 2022+ (modalidades, escala de 73 pontos) alimenta a
 *   ferramenta; 2016–2021 (lista geral com bônus de 15%/20% já incluído
 *   nas notas publicadas; 2016–2017 em escala de 100) vai para o
 *   histórico, sem mistura de escalas.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dadosDir =
  process.env.GABARU_DADOS_COLUNI_DIR ??
  resolve(repo, "../../gabaru-dados-coluni");

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

const demanda = JSON.parse(
  readFileSync(resolve(dadosDir, "demanda.json"), "utf8"),
);
const cortes = parseCsv(readFileSync(resolve(dadosDir, "cortes.csv"), "utf8"));

// ---------- Demanda ----------
// Documento oficial da edição (nunca contagem de homologados nem notícia).
const TIPOS_DOCUMENTO = new Set([
  "relatorio_candidato_vaga_gps",
  "relacao_candidato_vaga",
]);
const demandaEdicao = new Map(); // edicao -> registo
const demandaGrupo = new Map(); // `${edicao}|${grupo}` -> registo
for (const r of demanda) {
  if (r.valor_aproximado === "sim") continue;
  if (r.granularidade === "edicao") {
    if (!TIPOS_DOCUMENTO.has(r.tipo_registro)) continue;
    demandaEdicao.set(r.edicao, {
      vagas: num(r.vagas),
      inscritos: num(r.inscritos),
      candidatosPorVaga: num(r.candidatos_por_vaga_calculado),
      fonteTipo: r.fonte_tipo,
      fonteUrl: r.fonte_url || null,
    });
  } else if (r.granularidade === "grupo") {
    demandaGrupo.set(`${r.edicao}|${r.grupo_codigo}`, {
      grupo: num(r.grupo_codigo),
      descricao: r.grupo_descricao || null,
      vagas: num(r.vagas),
      inscritos: num(r.inscritos),
      candidatosPorVaga: num(r.candidatos_por_vaga_calculado),
      fonteUrl: r.fonte_url || null,
    });
  }
}

// ---------- Cortes ----------
// Agrupa por edição × modalidade: chamadas numéricas + linha de espera.
const porEdicaoModalidade = new Map();
for (const l of cortes) {
  const chave = `${l.edicao}|${l.modalidade_codigo}`;
  if (!porEdicaoModalidade.has(chave)) {
    porEdicaoModalidade.set(chave, {
      edicao: Number(l.edicao),
      codigo: l.modalidade_codigo,
      chamadas: [],
      fronteiraEspera: null,
      nEmEspera: null,
      esperaDerivavel: false,
      grupoDemanda: null,
    });
  }
  const m = porEdicaoModalidade.get(chave);
  const grupo = String(l.observacoes ?? "").match(/corresponde ao grupo (\d+)/);
  if (grupo) m.grupoDemanda = Number(grupo[1]);
  if (l.chamada === "lista_de_espera") {
    if (l.status === "derivado_lista_oficial") {
      m.esperaDerivavel = true;
      m.fronteiraEspera = num(l.maior_nota_espera);
      m.nEmEspera = num(l.n_em_espera);
    }
  } else {
    m.chamadas.push({
      chamada: Number(l.chamada),
      notaCorte: num(l.nota_corte_derivada),
      notaMaior: num(l.nota_maior),
      nConvocados: num(l.n_convocados),
      vagas: num(l.vagas),
      fonteUrl: l.fonte_url || null,
    });
  }
}

// Rótulos curtos das siglas (Lei 14.723/2023), conferidos contra as
// descrições oficiais dos grupos correspondentes do relatório GPS.
const ROTULOS_SIGLA = {
  AC: "Ampla concorrência",
  LB_EP: "Escola pública · renda ≤ 1 salário mínimo",
  LB_PPI:
    "Escola pública · renda ≤ 1 salário mínimo · pretos, pardos ou indígenas",
  LB_Q: "Escola pública · renda ≤ 1 salário mínimo · quilombolas",
  LB_PCD:
    "Escola pública · renda ≤ 1 salário mínimo · pessoas com deficiência",
  LI_EP: "Escola pública · qualquer renda",
  LI_PPI: "Escola pública · qualquer renda · pretos, pardos ou indígenas",
  LI_Q: "Escola pública · qualquer renda · quilombolas",
  LI_PCD: "Escola pública · qualquer renda · pessoas com deficiência",
};

const montarModalidade = (m, era) => {
  const chamadas = [...m.chamadas].sort((a, b) => a.chamada - b.chamada);
  const primeira = chamadas.find((c) => c.chamada === 1) ?? null;
  let piso = null;
  for (const c of chamadas) {
    if (c.notaCorte != null && (piso === null || c.notaCorte < piso.nota)) {
      piso = { nota: c.notaCorte, chamada: c.chamada };
    }
  }
  // 2022–2024: o código da modalidade É o número do grupo do relatório.
  const grupo = m.grupoDemanda ?? (era === "grupos" ? Number(m.codigo) : null);
  const dg = grupo != null ? demandaGrupo.get(`${m.edicao}|${grupo}`) : null;
  const vagas =
    primeira?.vagas ??
    chamadas.find((c) => c.vagas != null)?.vagas ??
    dg?.vagas ??
    null;
  return {
    codigo: m.codigo,
    rotulo:
      era === "siglas"
        ? (ROTULOS_SIGLA[m.codigo] ?? m.codigo)
        : m.codigo === "9"
          ? "Ampla concorrência"
          : `Grupo ${m.codigo}`,
    descricao: dg?.descricao ?? null,
    grupoDemanda: grupo,
    vagas,
    demandaGrupo: dg
      ? {
          vagas: dg.vagas,
          inscritos: dg.inscritos,
          candidatosPorVaga: dg.candidatosPorVaga,
          fonteUrl: dg.fonteUrl,
        }
      : null,
    corte1aChamada: primeira?.notaCorte ?? null,
    notaMaior1aChamada: primeira?.notaMaior ?? null,
    nConvocados1aChamada: primeira?.nConvocados ?? null,
    fonteUrlCorte: primeira?.fonteUrl ?? null,
    piso,
    fronteiraEspera: m.fronteiraEspera,
    nEmEspera: m.nEmEspera,
    chamadas: chamadas.map(({ vagas: _v, ...resto }) => resto),
  };
};

// Ordem dos seletores: ampla concorrência primeiro, depois as reservas.
const ordemModalidade = (era, codigo) => {
  if (era === "grupos") return codigo === "9" ? 0 : Number(codigo);
  if (codigo === "AC") return 0;
  return 1 + Object.keys(ROTULOS_SIGLA).indexOf(codigo);
};

const edicoesModalidades = [2026, 2025, 2024, 2023, 2022].map((edicao) => {
  const era = edicao >= 2025 ? "siglas" : "grupos";
  const modalidades = [...porEdicaoModalidade.values()]
    .filter((m) => m.edicao === edicao)
    .map((m) => montarModalidade(m, era))
    .sort(
      (a, b) =>
        ordemModalidade(era, a.codigo) - ordemModalidade(era, b.codigo),
    );
  return {
    edicao,
    era,
    escala: 73,
    vagasTotal: 150,
    demanda: demandaEdicao.get(edicao) ?? null,
    modalidades,
  };
});

// Era do bônus (2016–2021): lista geral única; a nota publicada já inclui
// o bônus. Escala de 100 pontos em 2016–2017 (prova de 2 dias) e de 73
// em 2018–2021. Sem seletor de modalidade — histórico separado.
const historicoBonus = [2021, 2020, 2019, 2018, 2017, 2016].map((edicao) => {
  const m = porEdicaoModalidade.get(`${edicao}|GERAL`);
  const chamadas = [...(m?.chamadas ?? [])].sort(
    (a, b) => a.chamada - b.chamada,
  );
  const primeira = chamadas.find((c) => c.chamada === 1) ?? null;
  let piso = null;
  for (const c of chamadas) {
    if (c.notaCorte != null && (piso === null || c.notaCorte < piso.nota)) {
      piso = { nota: c.notaCorte, chamada: c.chamada };
    }
  }
  return {
    edicao,
    escala: edicao <= 2017 ? 100 : 73,
    bonusPercentual: edicao <= 2017 ? 15 : 20,
    diasProva: edicao <= 2017 ? 2 : 1,
    vagasTotal: 150,
    demanda: demandaEdicao.get(edicao) ?? null,
    corte1aChamada: primeira?.notaCorte ?? null,
    notaMaior1aChamada: primeira?.notaMaior ?? null,
    fonteUrlCorte: primeira?.fonteUrl ?? null,
    piso,
    fronteiraEspera: m?.fronteiraEspera ?? null,
    nEmEspera: m?.nEmEspera ?? null,
    esperaDerivavel: m?.esperaDerivavel ?? false,
    chamadas: chamadas.map(({ vagas: _v, ...resto }) => resto),
  };
});

const saida = {
  meta: {
    geradoEm: new Date().toISOString().slice(0, 10),
    origem:
      "Base Gabaru de demanda e cortes derivados do COLUNI/UFV, compilada de documentos oficiais da UFV/COLUNI (relatórios candidato/vaga, listas de convocados e de espera, editais) arquivados em ~/workspace/gabaru-dados-coluni/ (ver RELATORIO.md e fonteUrl por registo).",
    nota: "A UFV não publica nota de corte. Cada corte aqui é DERIVADO da lista oficial de convocados da chamada: a menor pontuação entre os convocados (agregado; nenhum dado individual). A fronteira de espera é a maior pontuação entre os candidatos que permaneceram em espera. Campos ausentes são lacunas da fonte pública, nunca estimativas.",
    vagasTotal: 150,
    totalLinhasCortes: cortes.length,
    linhasCortesDerivadas: cortes.filter(
      (l) => l.status === "derivado_lista_oficial",
    ).length,
    totalModalidades: edicoesModalidades.reduce(
      (n, e) => n + e.modalidades.length,
      0,
    ),
    edicoesComDemanda: demandaEdicao.size,
  },
  edicoes: edicoesModalidades,
  historicoBonus,
};

const destino = resolve(repo, "src/data/coluni-demanda-cortes.json");
writeFileSync(destino, JSON.stringify(saida, null, 2) + "\n");
console.log(
  `OK: ${edicoesModalidades.length} edições de modalidades (${saida.meta.totalModalidades} modalidades), ${historicoBonus.length} edições históricas -> ${destino}`,
);
for (const e of edicoesModalidades) {
  const ac = e.modalidades.find(
    (m) => m.codigo === "AC" || m.codigo === "9",
  );
  console.log(
    `  ${e.edicao} (${e.era}): AC 1ª chamada = ${ac?.corte1aChamada} · demanda = ${e.demanda?.candidatosPorVaga} c/v (${e.demanda?.inscritos} inscritos)`,
  );
}

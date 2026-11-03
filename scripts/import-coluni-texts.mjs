#!/usr/bin/env node
/**
 * Importa para `src/data/coluni-exams.json` o texto (enunciado + alternativas)
 * das questões COLUNI, segmentado a partir do texto por página já extraído
 * dos cadernos oficiais (`pages[].text`). É o equivalente COLUNI de
 * `scripts/import-etec-texts.mjs`, com a mesma regra de publicação adaptada
 * às 4 alternativas (a–d) do COLUNI. Idempotente: apaga statement/options
 * existentes e reaplica a regra do zero. Com DRY_RUN=1, só relata.
 *
 * SEGMENTAÇÃO — o caderno é lido como um fluxo contínuo (páginas em ordem,
 * sem o cabeçalho/rodapé de cada página); cada questão começa no marcador
 * "NN." em início de linha e os marcadores são aceites estritamente na
 * sequência 01→N, em que N é o n.º de questões da edição (38 nas edições
 * 2018–2026; 48 nas edições de dois dias 2016–2017 — generalizado na
 * integração das edições antigas, 2026-11-03, sem alterar os resultados
 * das edições da Fase 1). Dentro do segmento da questão, as alternativas são os
 * marcadores "a)"–"d)" em início de linha (com recurso a marcadores em
 * qualquer posição, na mesma ordem, se a cadeia em início de linha falhar).
 * O segmento de cada questão é cortado num eventual cabeçalho de disciplina
 * seguinte ("LÍNGUA INGLESA – QUESTÕES …") ou na secção "Produção Textual".
 * Na alternativa d), um "Leia o texto/trecho a seguir" ou uma linha de
 * atribuição "(Disponível em: …)" colados ao fim são removidos — pertencem
 * ao texto partilhado seguinte, nunca à alternativa.
 *
 * REGRA DE PUBLICAÇÃO — uma questão só ganha texto se:
 *  1. for segmentada (marcador encontrado na sequência);
 *  2. as 4 alternativas forem segmentadas por ordem (a, b, c, d);
 *  3. as 4 alternativas tiverem texto real não vazio;
 *  4. a alternativa mais longa tiver ≤ 600 caracteres — acima disso é texto
 *     fundido (alternativas + texto partilhado), não uma alternativa;
 *  5. enunciado com ≥ 40 caracteres (o limiar do pipeline da ETEC);
 *  6. o enunciado não contiver tabela/grelha embutida (heurística: linhas
 *     com separadores de coluna, ou linhas curtas de dados com ≥ 70% de
 *     tokens numéricos/simbólicos — prosa com estatísticas não conta);
 *  7. a questão não depender de figura — o enunciado não pode ter como
 *     objeto de análise um conteúdo que vive só na imagem/PDF: géneros
 *     visuais (tirinha, charge, cartum, quadrinhos, fotografia, cartaz,
 *     anúncio, ilustração) ou referências dêiticas a figura/imagem/gráfico/
 *     mapa ("figura abaixo", "observe a imagem", "no gráfico", "conforme o
 *     mapa"…). Usos figurados ("a imagem da morte", "figura de linguagem",
 *     "criar uma imagem positiva") NÃO excluem. Textos partilhados em prosa
 *     (crónica, conto, poema…) também não: o leitor mostra o caderno ao
 *     lado e orienta a consultar as páginas anteriores — é o modelo da ETEC;
 *  8. o gabarito registado for uma letra válida (A–D) ou ANULADA. O gabarito
 *     NÃO é derivado da segmentação: a validação cruzada foi feita na
 *     importação de cada edição, contra o PDF oficial do gabarito
 *     pós-recursos (o analisador reproduziu exatamente os gabaritos já
 *     registados de 2024–2026 antes de produzir o de 2023).
 *
 * Uso:
 *   node scripts/import-coluni-texts.mjs
 *   DRY_RUN=1 node scripts/import-coluni-texts.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const dataPath = join(repoRoot, "src", "data", "coluni-exams.json");
const DRY_RUN = process.env.DRY_RUN === "1";

const LETTERS = ["A", "B", "C", "D"];
const OPTION_MARKERS = ["a", "b", "c", "d"];
const MAX_OPTION_CHARS = 600;
const MIN_STATEMENT_CHARS = 40;
const VISUAL_NOUN = "(?:figura|figuras|imagem|imagens|gráfico|gráficos|grafico|graficos|mapa|mapas)";
// Tabela/esquema/diagrama/quadro só contam como dependência visual com
// qualificador posicional ou imperativo de observação — "Tabela Periódica"
// e "quadro de medalhas" são referências em prosa, não objetos impressos.
const VISUAL_NOUN_EXT = "(?:figura|figuras|imagem|imagens|gráfico|gráficos|grafico|graficos|mapa|mapas|tabela|tabelas|esquema|esquemas|diagrama|diagramas|quadro|quadros|foto|fotos)";
const VISUAL_PATTERNS = [
  // Géneros/objetos intrinsecamente visuais.
  /\b(tirinha|charge|cartum|quadrinhos?|fotografia|cartaz|anúncio|ilustração|ilustracao)\b/i,
  // Referência dêitica: substantivo + qualificador posicional/apresentação.
  new RegExp(
    `\\b${VISUAL_NOUN_EXT}\\s+(abaixo|a seguir|ao lado|acima|seguinte|anterior|ilustrad\\w*|apresentad\\w*|mostrad\\w*|representad\\w*)\\b`,
    "i",
  ),
  // Imperativo de observação + substantivo.
  new RegExp(
    `\\b(observe|analise|considere|veja|interprete|leia)\\s+(a|o|as|os)\\s+${VISUAL_NOUN_EXT}\\b`,
    "i",
  ),
  // Locativo/preposicional: "na figura", "no gráfico", "conforme o mapa".
  new RegExp(
    `\\b(na|no|nas|nos|pela|pelo|conforme|segundo|de acordo com)\\s+(a\\s+|o\\s+|as\\s+|os\\s+)?${VISUAL_NOUN}\\b`,
    "i",
  ),
];

/** Normaliza o texto extraído: desescapa entidades HTML e colapsa espaços. */
function clean(text) {
  return String(text ?? "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** Fluxo contínuo do caderno, sem cabeçalho/rodapé de cada página. */
function pageStream(exam) {
  const parts = [];
  for (const page of exam.pages) {
    const lines = page.text.split("\n");
    while (lines.length && lines[0].trim() === "") lines.shift();
    while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
    const kept = lines.filter((line) => {
      const t = line.trim();
      if (/EXAME DE SELEÇÃO/.test(t)) return false;
      if (/^GABARITO \d$/.test(t)) return false;
      // Mobília das edições antigas (2016–2019): dia da prova e cabeçalho
      // curto "COLUNI/<ano> ─ UFV" / "CAP-COLUNI/<ano>─ UFV".
      if (/^1o DIA$/.test(t)) return false;
      if (/^(CAP-)?COLUNI\/\d{4}\s*─\s*UFV$/.test(t)) return false;
      return true;
    });
    // Número da própria página, isolado, só junto às margens já sem mobília.
    const body = kept.filter((line, idx) => {
      const t = line.trim();
      if (t === String(page.number) && (idx <= 2 || idx >= kept.length - 2))
        return false;
      return true;
    });
    parts.push(body.join("\n"));
  }
  return parts.join("\n");
}

/** Posições dos marcadores "NN." aceites estritamente na sequência 01→total. */
function questionMarkers(stream, total) {
  const re = /^\s*(\d{2})\.\s+/gm;
  const marks = new Map();
  let expected = 1;
  let m;
  while ((m = re.exec(stream)) !== null) {
    const n = Number(m[1]);
    if (n === expected) {
      marks.set(n, { start: m.index, contentStart: m.index + m[0].length });
      expected++;
      if (expected > total) break;
    }
  }
  return marks;
}

/** Cadeia de marcadores de alternativas (a→b→c→d) dentro do segmento. */
function optionChain(segment) {
  const anchored = /^\s*([a-d])\)\s+/gm;
  const loose = /\s([a-d])\)\s+/g;
  for (const re of [anchored, loose]) {
    const marks = [];
    let expected = 0;
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(segment)) !== null) {
      if (m[1] === OPTION_MARKERS[expected]) {
        marks.push({
          letter: m[1],
          start: m.index,
          contentStart: m.index + m[0].length,
        });
        expected++;
        if (expected === 4) return marks;
      }
    }
  }
  return null;
}

/** Heurística de tabela/grelha embutida sobre o enunciado bruto. */
function hasEmbeddedTable(rawStatement) {
  for (const line of rawStatement.split("\n")) {
    if (/[│┃┆|]/.test(line)) return true;
    const trimmed = line.trim();
    const tokens = trimmed.split(/\s+/).filter(Boolean);
    if (tokens.length >= 6 && trimmed.length <= 140) {
      const numeric = tokens.filter((t) => /^[\d.,:%()\-–—+]+$/.test(t)).length;
      if (numeric / tokens.length >= 0.7) return true;
    }
  }
  return false;
}

const SEGMENT_CUTS = [
  /\n\s*(LÍNGUA PORTUGUESA|LÍNGUA INGLESA|MATEMÁTICA|CIÊNCIAS|GEOGRAFIA|HISTÓRIA)\s*[–—-]\s*QUEST/i,
  /\n\s*Produ[çc][aã]o Textual\b/i,
];
const D_TAIL_CUTS = [
  ...SEGMENT_CUTS,
  /\n\s*Leia\s+(o|a|os|as)\s+(texto|trecho|fragmento)\b[^.\n]{0,30}a seguir/i,
];

/** Segmenta uma questão; devolve {statement, options} brutos ou {reason}. */
function segmentQuestion(stream, marks, number) {
  const mark = marks.get(number);
  if (!mark) return { reason: "naoSegmentada" };
  const next = marks.get(number + 1);
  let end = next ? next.start : stream.length;
  const rest = stream.slice(mark.start, end);
  for (const cutRe of SEGMENT_CUTS) {
    const cut = rest.search(cutRe);
    if (cut >= 0) end = mark.start + cut;
  }
  const segment = stream.slice(mark.contentStart, end);
  const chain = optionChain(segment);
  if (!chain) return { reason: "alternativasIncompletas" };
  const statementRaw = segment.slice(0, chain[0].start);
  const optionsRaw = {};
  for (let i = 0; i < 4; i++) {
    const from = chain[i].contentStart;
    const to = i < 3 ? chain[i + 1].start : segment.length;
    let text = segment.slice(from, to);
    if (i === 3) {
      // Conteúdo do texto partilhado seguinte, colado ao fim da d).
      for (const cutRe of D_TAIL_CUTS) {
        const cut = text.search(cutRe);
        if (cut >= 0) text = text.slice(0, cut);
      }
      text = text.replace(
        /\n\s*(Texto\s+(I{1,3}|IV|V)\b[\s\S]*)?\(?Disponível em:[\s\S]*$/i,
        "",
      );
    }
    optionsRaw[LETTERS[i]] = text;
  }
  return { statementRaw, optionsRaw };
}

/** Devolve null se a questão publica, ou o motivo da exclusão. */
function exclusionReason(seg, repoQuestion) {
  if (seg.reason) return seg.reason;
  const options = LETTERS.map((letter) => clean(seg.optionsRaw[letter]));
  if (options.some((option) => option.length === 0)) return "alternativaVazia";
  if (Math.max(...options.map((option) => option.length)) > MAX_OPTION_CHARS)
    return "alternativaFundida";
  if (clean(seg.statementRaw).length < MIN_STATEMENT_CHARS)
    return "enunciadoCurto";
  if (hasEmbeddedTable(seg.statementRaw)) return "tabelaEmbutida";
  if (VISUAL_PATTERNS.some((re) => re.test(clean(seg.statementRaw))))
    return "dependeDeFigura";
  if (!["A", "B", "C", "D", "ANULADA"].includes(repoQuestion.answer))
    return "gabaritoDivergente";
  return null;
}

const exams = JSON.parse(readFileSync(dataPath, "utf8"));
const reasons = {};
let published = 0;
const perEdition = [];

for (const exam of exams) {
  const stream = pageStream(exam);
  const marks = questionMarkers(stream, exam.questions.length);
  let editionPublished = 0;
  for (const question of exam.questions) {
    delete question.statement;
    delete question.options;
    const seg = segmentQuestion(stream, marks, question.number);
    const reason = exclusionReason(seg, question);
    if (reason) {
      reasons[reason] = (reasons[reason] ?? 0) + 1;
      continue;
    }
    question.statement = clean(seg.statementRaw);
    question.options = Object.fromEntries(
      LETTERS.map((letter) => [letter, clean(seg.optionsRaw[letter])]),
    );
    editionPublished++;
  }
  perEdition.push([exam.id, editionPublished, exam.questions.length]);
  published += editionPublished;
}

if (!DRY_RUN) writeFileSync(dataPath, JSON.stringify(exams));
console.log(
  `${DRY_RUN ? "[dry-run] " : ""}Publicadas ${published} questões com texto em ${perEdition.length} edições.`,
);
for (const [id, n, total] of perEdition) console.log(`  ${id}: ${n}/${total}`);
console.log("Exclusões:", reasons);

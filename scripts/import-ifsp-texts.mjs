#!/usr/bin/env node
/**
 * Importa para `src/data/ifsp-exams.json` o texto (enunciado +
 * alternativas) das questões do IFSP, segmentado a partir do texto por
 * página já extraído dos cadernos oficiais (`pages[].text`). É o
 * equivalente IFSP de `scripts/import-ifsc-texts.mjs`, com a mesma
 * regra de publicação adaptada às eras tipográficas do exame:
 *
 *  - era "questao" (2022.1): marcadores "QUESTÃO N" e alternativas
 *    inline "a) … b) …" (4 alternativas);
 *  - era "numero" (2023.1–2025.1): a questão é ancorada pela sua cadeia
 *    de alternativas "( A ) … ( D )" (4 alternativas; 30 cadeias por
 *    caderno, verificadas). O enunciado é o texto entre o fim da
 *    questão anterior e a primeira alternativa — inclui os textos-base
 *    partilhados, tal como impressos — sem o marcador numérico
 *    inicial. A página da questão é refinada para a página do
 *    marcador numérico quando ele é encontrado no início do
 *    enunciado;
 *  - era "cefetminas" (2026.1): marcadores "QUESTÃO NN" e alternativas
 *    inline "a) … e)" (5 alternativas); o caderno é de duas colunas e
 *    a ordem de extração mistura blocos — qualquer segmento que
 *    contenha outro marcador "QUESTÃO" é rejeitado.
 *
 * Nas eras "questao"/"cefetminas" os segmentos são delimitados pelas
 * ocorrências dos marcadores na ordem do fluxo extraído (cada n.º
 * ocorre uma única vez no caderno — verificado na construção); um
 * segmento contaminado por texto de outra questão falha os portões.
 *
 * REGRA DE PUBLICAÇÃO — a mesma do COLUNI/IFSC, por era:
 *  1. questão segmentada;
 *  2. as alternativas segmentadas por ordem (A–D ou A–E);
 *  3. as alternativas com texto real não vazio;
 *  4. a alternativa mais longa com ≤ 600 caracteres;
 *  5. enunciado com ≥ 40 e ≤ 6000 caracteres;
 *  6. enunciado sem tabela/grelha embutida (mesma heurística);
 *  7. sem dependência de figura (mesmos padrões; textos partilhados
 *     em prosa não excluem — o leitor mostra o caderno ao lado);
 *  8. enunciado sem outro marcador de questão embutido;
 *  9. gabarito registado é letra válida da era ou ANULADA. O gabarito
 *     NÃO é derivado da segmentação: vem do PDF oficial definitivo.
 *
 * Idempotente: apaga statement/options existentes e reaplica a regra
 * do zero. Com DRY_RUN=1, só relata.
 *
 * Uso:
 *   node scripts/import-ifsp-texts.mjs
 *   DRY_RUN=1 node scripts/import-ifsp-texts.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const dataPath = join(repoRoot, "src", "data", "ifsp-exams.json");
const DRY_RUN = process.env.DRY_RUN === "1";

const MAX_OPTION_CHARS = 600;
const MIN_STATEMENT_CHARS = 40;
const MAX_STATEMENT_CHARS = 6000;
const VISUAL_NOUN = "(?:figura|figuras|imagem|imagens|gráfico|gráficos|grafico|graficos|mapa|mapas)";
const VISUAL_NOUN_EXT = "(?:figura|figuras|imagem|imagens|gráfico|gráficos|grafico|graficos|mapa|mapas|tabela|tabelas|esquema|esquemas|diagrama|diagramas|quadro|quadros|foto|fotos)";
const VISUAL_PATTERNS = [
  /\b(tirinha|charge|cartum|quadrinhos?|fotografia|cartaz|anúncio|ilustração|ilustracao)\b/i,
  new RegExp(
    `\\b${VISUAL_NOUN_EXT}\\s+(abaixo|a seguir|ao lado|acima|seguinte|anterior|ilustrad\\w*|apresentad\\w*|mostrad\\w*|representad\\w*)\\b`,
    "i",
  ),
  new RegExp(
    `\\b(observe|analise|considere|veja|interprete|leia)\\s+(a|o|as|os)\\s+${VISUAL_NOUN_EXT}\\b`,
    "i",
  ),
  new RegExp(
    `\\b(na|no|nas|nos|pela|pelo|conforme|segundo|de acordo com)\\s+(a\\s+|o\\s+|as\\s+|os\\s+)?${VISUAL_NOUN}\\b`,
    "i",
  ),
];

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

const FOOTER_PATTERNS = [
  /^Cursos técnicos concomitantes\/subsequentes e integrados ao Ensino Médio/i,
  /^Cursos técnicos integrados ao Ensino Médio/i,
  /^Processo Seletivo IFSP\b.*$/i,
  /^PROCESSO SELETIVO IFSP\s*\d*\s*$/,
  /^Processo Seletivo 0?1[°º]?\/?2022.*$/i,
];

/**
 * Fluxo contínuo do caderno + mapa offset→página. Remove a mobília
 * (cabeçalhos/rodapés) e, na era "numero", o n.º de página impresso
 * isolado no início de cada página (colidiria com os marcadores).
 */
function pageStream(exam) {
  const parts = [];
  const pageStart = [];
  let offset = 0;
  for (const page of exam.pages) {
    let lines = page.text.split("\n");
    while (lines.length && lines[0].trim() === "") lines.shift();
    while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
    lines = lines.filter((line) => {
      const t = line.trim();
      return !FOOTER_PATTERNS.some((re) => re.test(t));
    });
    if (exam.era === "numero") {
      if (
        lines.length &&
        /^\d{1,2}$/.test(lines[0].trim()) &&
        [page.number, page.number - 1].includes(Number(lines[0].trim()))
      )
        lines.shift();
    }
    pageStart.push({ page: page.number, offset });
    const body = lines.join("\n");
    parts.push(body);
    offset += body.length + 1;
  }
  const stream = parts.join("\n");
  const pageOf = (pos) => {
    let current = pageStart[0]?.page ?? 1;
    for (const ps of pageStart) {
      if (ps.offset <= pos) current = ps.page;
      else break;
    }
    return current;
  };
  const startOfPage = (page) => pageStart.find((ps) => ps.page === page)?.offset ?? 0;
  return { stream, pageOf, startOfPage };
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

/** Cadeia inline "a) … b) …" (eras questao/cefetminas). */
function inlineChain(segment, letters) {
  const marks = [];
  let expected = 0;
  const re = /(?:^|\s)([a-e])\)\s+/g;
  let m;
  while ((m = re.exec(segment)) !== null) {
    if (m[1] === letters[expected].toLowerCase()) {
      marks.push({ letter: letters[expected], start: m.index, contentStart: m.index + m[0].length });
      expected++;
      if (expected === letters.length) break;
    }
  }
  if (expected < letters.length) return null;
  const optionsRaw = {};
  for (let i = 0; i < letters.length; i++) {
    const from = marks[i].contentStart;
    const to = i < letters.length - 1 ? marks[i + 1].start : segment.length;
    optionsRaw[letters[i]] = segment.slice(from, to);
  }
  return { statementRaw: segment.slice(0, marks[0].start), optionsRaw };
}

/** Segmentos das eras com marcador "QUESTÃO N" (ocorrências no fluxo). */
function markerSegments(stream) {
  const occ = [];
  for (const m of stream.matchAll(/QUEST[ÃA]O\s+(\d{1,2})\b/g))
    occ.push({ number: Number(m[1]), start: m.index, contentStart: m.index + m[0].length });
  const segments = new Map();
  occ.forEach((o, i) => {
    const end = i + 1 < occ.length ? occ[i + 1].start : stream.length;
    if (!segments.has(o.number))
      segments.set(o.number, { text: stream.slice(o.contentStart, end), start: o.start });
  });
  return segments;
}

/**
 * Era "numero": lê as 30 cadeias "( A )"–"( D )" e devolve, por
 * questão, enunciado bruto (entre o fim da questão anterior e a sua
 * primeira alternativa) e alternativas brutas. A cauda da alternativa
 * D é cortada no marcador numérico da questão seguinte.
 */
function numeroSegments(stream, pageOf, startOfPage) {
  const chainStarts = [...stream.matchAll(/\(\s*A\s*\)/g)].map((m) => m.index);
  const out = new Map();
  if (chainStarts.length !== 30) return out;
  let prevEnd = null;
  for (let i = 0; i < 30; i++) {
    const number = i + 1;
    const from = chainStarts[i];
    const to = i < 29 ? chainStarts[i + 1] : stream.length;
    const region = stream.slice(from, to);
    const marks = [];
    let expected = 0;
    const re = /\(\s*([A-D])\s*\)\s*/g;
    let m;
    while ((m = re.exec(region)) !== null) {
      if (m[1] === "ABCD"[expected]) {
        marks.push({ letter: m[1], start: m.index, contentStart: m.index + m[0].length });
        expected++;
        if (expected === 4) break;
      }
    }
    if (expected < 4) continue;
    const optionsRaw = {};
    let dEnd = region.length;
    for (let k = 0; k < 4; k++) {
      const a = marks[k].contentStart;
      let b = k < 3 ? marks[k + 1].start : region.length;
      let text = region.slice(a, b);
      if (k === 3 && number < 30) {
        const cut = text.search(new RegExp(`\\n\\s*${number + 1}(?=\\s)`));
        if (cut >= 0) {
          text = text.slice(0, cut);
          b = a + cut;
        }
        dEnd = b;
      }
      optionsRaw["ABCD"[k]] = text;
    }
    const stmtFrom = prevEnd ?? startOfPage(pageOf(from));
    out.set(number, {
      statementRaw: stream.slice(stmtFrom, from),
      optionsRaw,
      chainStart: from,
      stmtFrom,
    });
    prevEnd = from + dEnd;
  }
  return out;
}

/** Localiza o marcador numérico no início do enunciado bruto. */
function findNumberMarker(statementRaw, number) {
  const lines = statementRaw.split("\n");
  let seen = 0;
  let offset = 0;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t) {
      seen++;
      if (seen > 3) break;
      const m = t.match(new RegExp(`^${number}(?=\\s|$)`));
      if (m) {
        const lead = lines[i].indexOf(t);
        return { line: i, rest: t.slice(m[0].length).trim(), offset: offset + lead };
      }
    }
    offset += lines[i].length + 1;
  }
  return null;
}

function exclusionReason(seg, question, letters) {
  if (seg.reason) return seg.reason;
  const options = letters.map((letter) => clean(seg.optionsRaw[letter]));
  if (options.some((option) => option.length === 0)) return "alternativaVazia";
  // Alternativa que engoliu o marcador de outra (desta ou da questão
  // seguinte, nos formatos compactos "(A)" sem espaços) = segmentação
  // insegura: rejeita.
  if (options.some((option) => /\(\s*[A-E]\s*\)/.test(option) || /\b[a-e]\)\s/.test(option)))
    return "alternativaFundida";
  if (Math.max(...options.map((option) => option.length)) > MAX_OPTION_CHARS)
    return "alternativaFundida";
  const statement = clean(seg.statementRaw);
  if (statement.length < MIN_STATEMENT_CHARS) return "enunciadoCurto";
  if (statement.length > MAX_STATEMENT_CHARS) return "enunciadoLongo";
  if (/QUEST[ÃA]O\s+\d/.test(seg.statementRaw)) return "segmentoContaminado";
  if (hasEmbeddedTable(seg.statementRaw)) return "tabelaEmbutida";
  if (VISUAL_PATTERNS.some((re) => re.test(statement))) return "dependeDeFigura";
  if (![...letters, "ANULADA"].includes(question.answer)) return "gabaritoDivergente";
  return null;
}

const exams = JSON.parse(readFileSync(dataPath, "utf8"));
const reasons = {};
let published = 0;
const perEdition = [];

for (const exam of exams) {
  const letters = ["A", "B", "C", "D", "E"].slice(0, exam.format.alternatives);
  const era =
    exam.id.startsWith("2022-1") ? "questao" : exam.id.startsWith("2026-1") ? "cefetminas" : "numero";
  const { stream, pageOf, startOfPage } = pageStream({ ...exam, era });
  const segments =
    era === "numero" ? numeroSegments(stream, pageOf, startOfPage) : markerSegments(stream);
  let editionPublished = 0;
  for (const question of exam.questions) {
    delete question.statement;
    delete question.options;
    let seg;
    if (era === "numero") {
      const raw = segments.get(question.number);
      if (!raw) seg = { reason: "naoSegmentada" };
      else {
        seg = { statementRaw: raw.statementRaw, optionsRaw: raw.optionsRaw };
        // Refina a página pelo marcador numérico e retira-o do texto.
        const marker = findNumberMarker(raw.statementRaw, question.number);
        if (marker) {
          question.page = pageOf(raw.stmtFrom + marker.offset);
          question.pageMapped = true;
          const lines = seg.statementRaw.split("\n");
          const t = lines[marker.line];
          const lead = t.indexOf(t.trim());
          lines[marker.line] = t.slice(0, lead) + marker.rest;
          seg.statementRaw = lines.join("\n");
        }
      }
    } else {
      const raw = segments.get(question.number);
      if (!raw) seg = { reason: "naoSegmentada" };
      else {
        const chain = inlineChain(raw.text, letters);
        seg = chain ?? { reason: "alternativasIncompletas" };
      }
    }
    const reason = exclusionReason(seg, question, letters);
    if (reason) {
      reasons[reason] = (reasons[reason] ?? 0) + 1;
      continue;
    }
    question.statement = clean(seg.statementRaw);
    question.options = Object.fromEntries(
      letters.map((letter) => [letter, clean(seg.optionsRaw[letter])]),
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

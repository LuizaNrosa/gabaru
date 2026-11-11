#!/usr/bin/env node
/**
 * Importa para `src/data/ifsc-exams.json` o texto (enunciado + alternativas)
 * das questões do IFSC, segmentado a partir do texto por página já extraído
 * dos cadernos oficiais (`pages[].text`). É o equivalente IFSC de
 * `scripts/import-coluni-texts.mjs`, com a mesma regra de publicação
 * adaptada às 5 alternativas (A–E) do IFSC. Idempotente: apaga
 * statement/options existentes e reaplica a regra do zero. Com DRY_RUN=1,
 * só relata.
 *
 * SEGMENTAÇÃO — o caderno é lido como um fluxo contínuo (páginas em ordem,
 * sem o cabeçalho/rodapé de cada página); cada questão começa no marcador
 * "QUESTÃO NN" em linha própria e os marcadores são aceites estritamente
 * na sequência 01→N. As alternativas aparecem nos cadernos em DOIS
 * formatos, detetados por questão:
 *  1. inline (edições até 2022.2 e 2023.1): "(A) texto", "(B) texto", … —
 *     cadeia de marcadores como no COLUNI, com parênteses;
 *  2. em bloco (2023.2 em diante): os cinco marcadores sozinhos, um por
 *     linha — "(A)\n(B)\n(C)\n(D)\n(E)" — seguidos dos cinco textos por
 *     ordem, como parágrafos separados por linha em branco ou, nas
 *     alternativas curtas, como cinco linhas consecutivas. Depois das
 *     cinco alternativas só é aceite, no resto do segmento, o início de
 *     um texto partilhado seguinte ("Leia…", "TEXTO …"); qualquer outro
 *     resto rejeita a questão, por risco de desalinhamento.
 * Na alternativa E) do formato inline, um texto partilhado seguinte, uma
 * linha "Fonte:"/"(Disponível em: …)" ou um cabeçalho de área colados ao
 * fim são removidos — pertencem ao bloco seguinte, nunca à alternativa.
 *
 * REGRA DE PUBLICAÇÃO — a mesma do COLUNI, com 5 alternativas:
 *  1. questão segmentada (marcador na sequência);
 *  2. as 5 alternativas segmentadas por ordem (A–E);
 *  3. as 5 alternativas com texto real não vazio;
 *  4. a alternativa mais longa com ≤ 600 caracteres;
 *  5. enunciado com ≥ 40 caracteres;
 *  6. enunciado sem tabela/grelha embutida (mesma heurística);
 *  7. sem dependência de figura (mesmos padrões do COLUNI; textos
 *     partilhados em prosa não excluem — o leitor mostra o caderno ao
 *     lado, como na ETEC e no COLUNI);
 *  8. gabarito registado é letra válida (A–E) ou ANULADA. O gabarito NÃO
 *     é derivado da segmentação: vem do PDF oficial do gabarito
 *     definitivo (2022.1: leitura visual dupla dos gabaritos em imagem).
 *
 * Edições com caderno sem camada de texto utilizável (2019.2 e 2024.2,
 * digitalizados; 2025.2, camada corrompida na fonte) publicam 0 textos —
 * as questões ficam só no PDF, como manda a regra.
 *
 * Uso:
 *   node scripts/import-ifsc-texts.mjs
 *   DRY_RUN=1 node scripts/import-ifsc-texts.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const dataPath = join(repoRoot, "src", "data", "ifsc-exams.json");
const DRY_RUN = process.env.DRY_RUN === "1";

const LETTERS = ["A", "B", "C", "D", "E"];
const OPTION_MARKERS = ["A", "B", "C", "D", "E"];
const MAX_OPTION_CHARS = 600;
const MIN_STATEMENT_CHARS = 40;
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
      if (t === "MINISTÉRIO DA EDUCAÇÃO") return false;
      if (t === "INSTITUTO FEDERAL DE SANTA CATARINA") return false;
      if (t === "PRÓ-REITORIA DE ENSINO") return false;
      if (t === "DEPARTAMENTO DE INGRESSO") return false;
      if (/^Exame de Classificação .*Cursos Técnicos Integrados/.test(t)) return false;
      if (t === "z") return false;
      return true;
    });
    // Número de página impresso, isolado, junto às margens já sem mobília.
    // Nos cadernos do IFSC a numeração impressa nem sempre coincide com a
    // página física do PDF (há páginas de capa/fragmentos), por isso a
    // regra aceita qualquer inteiro curto isolado na margem — não só o
    // número físico da página, como no pipeline do COLUNI.
    const body = kept.filter((line, idx) => {
      const t = line.trim();
      if (/^\d{1,2}$/.test(t) && (idx <= 2 || idx >= kept.length - 2))
        return false;
      return true;
    });
    parts.push(body.join("\n"));
  }
  return parts.join("\n");
}

/** Posições dos marcadores "QUESTÃO NN" aceites estritamente na sequência. */
function questionMarkers(stream, total) {
  const re = /^\s*QUEST[ÃA]O\s+(\d{1,2})\s*$/gm;
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

/** Formato em bloco: "(A)"–"(E)" sozinhos, um por linha, por ordem. */
function blockChain(segment) {
  const lines = segment.split("\n");
  const offsets = [];
  let pos = 0;
  for (const line of lines) {
    offsets.push(pos);
    pos += line.length + 1;
  }
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() !== "(A)") continue;
    const idx = [i];
    let j = i;
    for (let k = 1; k < 5; k++) {
      j++;
      while (j < lines.length && lines[j].trim() === "") j++;
      if (j >= lines.length || lines[j].trim() !== `(${LETTERS[k]})`) break;
      idx.push(j);
    }
    if (idx.length < 5) continue;
    const statementRaw = segment.slice(0, offsets[i]);
    const rest = segment.slice(offsets[idx[4]] + lines[idx[4]].length);
    const paragraphs = rest
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    // Depois das cinco alternativas, o resto do segmento só pode ser o
    // início de um texto partilhado seguinte (ou nada).
    const tailOk = (tail) =>
      !tail.length || /^(Leia\b|TEXTO\s|Texto\s)/.test(tail[0]);
    // Candidata L: alternativas curtas como cinco linhas consecutivas num
    // só parágrafo (o bloco seguinte inflaciona a contagem de parágrafos,
    // por isso esta candidata é tentada antes da leitura por parágrafos).
    const firstLines = (paragraphs[0] ?? "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (firstLines.length === 5 && tailOk(paragraphs.slice(1))) {
      return {
        statementRaw,
        optionsRaw: Object.fromEntries(
          LETTERS.map((letter, k) => [letter, firstLines[k]]),
        ),
      };
    }
    // Candidata P: alternativas como cinco parágrafos.
    if (paragraphs.length >= 5 && tailOk(paragraphs.slice(5))) {
      return {
        statementRaw,
        optionsRaw: Object.fromEntries(
          LETTERS.map((letter, k) => [letter, paragraphs[k]]),
        ),
      };
    }
    return null;
  }
  return null;
}

/** Formato inline: cadeia "(A)"–"(E)" com o texto a seguir a cada marcador. */
function inlineChain(segment) {
  const anchored = /^\s*\(([A-Ea-e])\)\s+/gm;
  const loose = /\s\(([A-Ea-e])\)\s+/g;
  for (const re of [anchored, loose]) {
    const marks = [];
    let expected = 0;
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(segment)) !== null) {
      if (m[1].toUpperCase() === OPTION_MARKERS[expected]) {
        marks.push({
          letter: m[1],
          start: m.index,
          contentStart: m.index + m[0].length,
        });
        expected++;
        if (expected === 5) {
          const optionsRaw = {};
          let ok = true;
          for (let i = 0; i < 5; i++) {
            const from = marks[i].contentStart;
            const to = i < 4 ? marks[i + 1].start : segment.length;
            let text = segment.slice(from, to);
            if (i === 4) text = cutOptionTail(text);
            // Marcador seguinte colado = cadeia falsa (formato em bloco).
            if (/^\s*\([A-E]\)/.test(text) || clean(text) === "") ok = false;
            optionsRaw[LETTERS[i]] = text;
          }
          if (!ok) return null;
          return { statementRaw: segment.slice(0, marks[0].start), optionsRaw };
        }
      }
    }
  }
  return null;
}

const AREA_HEADERS =
  "(?:LÍNGUA PORTUGUESA|MATEMÁTICA|GEOGRAFIA E HISTÓRIA|CIÊNCIAS|LINGUAGENS|CIÊNCIAS HUMANAS|PORTUGUÊS)";
const TAIL_CUTS = [
  new RegExp(`\\n\\s*${AREA_HEADERS}\\s*\\n`),
  /\n\s*(Leia|TEXTO|Texto)\s+(o|a|os|as|este|esta|I{1,3}\b|IV\b|V\b|VI{0,3}\b|\d+\b)/,
  /\n\s*Fonte:\s/,
  /\n\s*\(?Disponível em:/,
];
/** Remove do fim da última alternativa o bloco seguinte colado. */
function cutOptionTail(text) {
  let out = text;
  for (const cutRe of TAIL_CUTS) {
    const cut = out.search(cutRe);
    if (cut >= 0) out = out.slice(0, cut);
  }
  return out;
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

/** Segmenta uma questão; devolve {statementRaw, optionsRaw} ou {reason}. */
function segmentQuestion(stream, marks, number) {
  const mark = marks.get(number);
  if (!mark) return { reason: "naoSegmentada" };
  const next = marks.get(number + 1);
  const end = next ? next.start : stream.length;
  const segment = stream.slice(mark.contentStart, end);
  const seg = blockChain(segment) ?? inlineChain(segment);
  if (!seg) return { reason: "alternativasIncompletas" };
  return seg;
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
  if (![...LETTERS, "ANULADA"].includes(repoQuestion.answer))
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

#!/usr/bin/env node
/**
 * Importa para `src/data/etec-exams.json` o texto (enunciado + alternativas)
 * das questões ETEC já extraído dos PDFs oficiais e validado contra os
 * gabaritos — saída do pipeline em ~/workspace/gabaru-etec-extracao
 * (ver RELATORIO.md desse diretório). Não espera a extração estar completa:
 * publica já o subconjunto que passa na regra abaixo e pode ser corrido de
 * novo quando a extração avançar (é idempotente: apaga statement/options
 * existentes e reaplica a regra do zero).
 *
 * REGRA DE PUBLICAÇÃO — uma questão (edição, número) só ganha texto se:
 *  1. existir no acervo (etec-exams.json) e na saída da extração;
 *  2. flags.alternativasCompletas === true (marcadores A–E segmentados);
 *  3. as 5 alternativas tiverem texto real não vazio — a flag (2) só prova
 *     que os marcadores existem; há edições em que o texto das alternativas
 *     ficou vazio ou fundido numa só (ex.: 2025-1 Q1), e isso não é uma
 *     questão completa;
 *  4. a alternativa mais longa tiver ≤ 600 caracteres — acima disso é texto
 *     fundido de várias alternativas/texto-base, não uma alternativa;
 *  5. enunciado com ≥ 40 caracteres (o limiar do próprio pipeline);
 *  6. flags.possivelTabelaEmbutida === false (enunciado com grelha/tabela
 *     achatada não é texto fiável);
 *  7. flags.dependeDeFigura === false — questões que dependem de figura,
 *     charge, mapa ou tabela NÃO entram como texto; continuam a ser
 *     servidas pela imagem da página/PDF no leitor;
 *  8. o gabarito da extração for idêntico ao gabarito oficial já registado
 *     no acervo (validação cruzada; a letra fica assim garantida entre as
 *     alternativas publicadas).
 * Flags informativas (quebraDePagina, hifenizacoesDesfeitas,
 * possivelTextoBaseAbsorvido) não bloqueiam: o texto-base absorvido faz
 * parte da leitura da questão e as restantes são cosméticas.
 *
 * O gabarito NÃO é copiado da extração: o campo `answer` do acervo continua
 * a ser a única fonte, como já acontecia. Este script só acrescenta os
 * campos opcionais `statement` e `options` às questões aprovadas.
 *
 * Uso:
 *   node scripts/import-etec-texts.mjs [diretório-da-extração]
 *   ETEC_EXTRACTION_DIR=~/workspace/gabaru-etec-extracao node scripts/import-etec-texts.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const extractionDir =
  process.argv[2] ||
  process.env.ETEC_EXTRACTION_DIR ||
  join(homedir(), "workspace", "gabaru-etec-extracao");
const dataPath = join(repoRoot, "src", "data", "etec-exams.json");

const LETTERS = ["A", "B", "C", "D", "E"];
const MAX_OPTION_CHARS = 600;
const MIN_STATEMENT_CHARS = 40;

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

/** Devolve null se a questão publica, ou o motivo da exclusão. */
function exclusionReason(extracted, repoQuestion) {
  const flags = extracted.flags ?? {};
  if (flags.alternativasCompletas !== true) return "alternativasIncompletas";
  const options = LETTERS.map((letter) => clean(extracted.alternativas?.[letter]));
  if (options.some((option) => option.length === 0)) return "alternativaVazia";
  if (Math.max(...options.map((option) => option.length)) > MAX_OPTION_CHARS)
    return "alternativaFundida";
  if (clean(extracted.enunciado).length < MIN_STATEMENT_CHARS) return "enunciadoCurto";
  if (flags.possivelTabelaEmbutida) return "tabelaEmbutida";
  if (flags.dependeDeFigura) return "dependeDeFigura";
  if (extracted.gabarito !== repoQuestion.answer) return "gabaritoDivergente";
  return null;
}

const exams = JSON.parse(readFileSync(dataPath, "utf8"));
const reasons = {};
let published = 0;
const perEdition = [];

for (const exam of exams) {
  const extracted = JSON.parse(
    readFileSync(join(extractionDir, `etec-${exam.id}-questoes-extraidas.json`), "utf8"),
  );
  if (extracted.edicao !== exam.id)
    throw new Error(`Edição divergente: extração=${extracted.edicao} acervo=${exam.id}`);
  const byNumber = new Map(extracted.questoes.map((q) => [q.numero, q]));
  let editionPublished = 0;
  for (const question of exam.questions) {
    delete question.statement;
    delete question.options;
    const candidate = byNumber.get(question.number);
    if (!candidate) {
      reasons.naoSegmentada = (reasons.naoSegmentada ?? 0) + 1;
      continue;
    }
    const reason = exclusionReason(candidate, question);
    if (reason) {
      reasons[reason] = (reasons[reason] ?? 0) + 1;
      continue;
    }
    question.statement = clean(candidate.enunciado);
    question.options = Object.fromEntries(
      LETTERS.map((letter) => [letter, clean(candidate.alternativas[letter])]),
    );
    editionPublished++;
  }
  perEdition.push([exam.id, editionPublished, exam.questions.length]);
  published += editionPublished;
}

writeFileSync(dataPath, JSON.stringify(exams));
console.log(`Publicadas ${published} questões com texto em ${perEdition.length} edições.`);
for (const [id, n, total] of perEdition) console.log(`  ${id}: ${n}/${total}`);
console.log("Exclusões:", reasons);

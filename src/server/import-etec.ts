import { createHash } from "node:crypto";
import type { Db } from "./db";

/**
 * Importação idempotente do acervo ETEC (src/data/etec-exams.json) para
 * exam_sources / questions / question_answers.
 *
 * Pode correr quantas vezes for preciso: tudo é UPSERT por id estável
 * (`etec-<edição>` e `etec-<edição>-q<NNN>`), sem duplicar registos.
 *
 * Mapeamento a partir do JSON atual — e as suas limitações honestas:
 * - O JSON traz, por questão, apenas número, página e gabarito. Enunciado e
 *   alternativas vivem no PDF oficial (o site serve a página como imagem) e
 *   a classificação editorial (disciplina/assunto) é uma etapa posterior da
 *   esteira (docs/BANCO-QUESTOES.md). Por isso: `statement = null`,
 *   `options = []` e subject/topic = 'nao-classificado' até à classificação.
 * - `content_sha256`: hash do registo canónico de proveniência
 *   (instituição|edição|sha256 do PDF da prova|número|página), que amarra
 *   cada questão ao PDF oficial já verificado por hash no acervo.
 * - Gabarito 'ANULADA' vira status 'annulled' com answer_key NULL — anulação
 *   é um estado, não uma letra.
 * - As questões entram como 'published' porque este acervo já é público no
 *   site hoje (servido do JSON); os gabaritos entram como 'final'.
 */
export interface EtecQuestionData {
  number: number;
  page: number;
  answer: string;
}

export interface EtecExamData {
  id: string;
  institution?: string;
  kind?: string;
  examUrl: string;
  answerUrl?: string | null;
  examSha256: string;
  answerSha256?: string | null;
  questions: EtecQuestionData[];
}

export interface ImportEtecResult {
  sources: number;
  questions: number;
  answers: number;
  annulled: number;
}

export const UNCLASSIFIED = "nao-classificado";

export function etecSourceId(exam: EtecExamData): string {
  return `etec-${exam.id}`;
}

export function etecQuestionId(exam: EtecExamData, number: number): string {
  return `${etecSourceId(exam)}-q${String(number).padStart(3, "0")}`;
}

export function etecContentSha256(exam: EtecExamData, q: EtecQuestionData): string {
  const canonical = ["etec", exam.id, exam.examSha256, q.number, q.page].join("|");
  return createHash("sha256").update(canonical).digest("hex");
}

const CHUNK = 100;

async function insertChunked(
  db: Db,
  columns: string[],
  rows: unknown[][],
  buildSql: (valuesSql: string) => string,
): Promise<void> {
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const placeholders = chunk
      .map((row, r) => `(${row.map((_, c) => `$${r * columns.length + c + 1}`).join(",")})`)
      .join(",");
    await db.query(buildSql(placeholders), chunk.flat());
  }
}

export async function importEtecExam(db: Db, exam: EtecExamData): Promise<ImportEtecResult> {
  const sourceId = etecSourceId(exam);
  const institution = (exam.institution ?? "ETEC").toUpperCase();

  await db.query(
    `INSERT INTO exam_sources (id, institution, edition, booklet, exam_url,
        answer_url, exam_sha256, answer_sha256, rights_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
     ON CONFLICT (id) DO UPDATE SET
        exam_url = EXCLUDED.exam_url, answer_url = EXCLUDED.answer_url,
        exam_sha256 = EXCLUDED.exam_sha256, answer_sha256 = EXCLUDED.answer_sha256`,
    [
      sourceId,
      institution,
      exam.id,
      exam.kind ?? "regular",
      exam.examUrl,
      exam.answerUrl ?? null,
      exam.examSha256,
      exam.answerSha256 ?? null,
    ],
  );

  const questionRows = exam.questions.map((q) => [
    etecQuestionId(exam, q.number),
    sourceId,
    q.number,
    q.page,
    UNCLASSIFIED,
    UNCLASSIFIED,
    null, // statement: não republicado; vive no PDF oficial
    "[]", // options: alternativas estão no PDF/imagem da página
    etecContentSha256(exam, q),
    "published",
  ]);
  await insertChunked(
    db,
    ["id", "source_id", "original_number", "source_page", "subject", "topic", "statement", "options", "content_sha256", "status"],
    questionRows,
    (values) => `INSERT INTO questions (id, source_id, original_number, source_page,
        subject, topic, statement, options, content_sha256, status)
      VALUES ${values}
      ON CONFLICT (id) DO UPDATE SET
        source_page = EXCLUDED.source_page,
        revision = questions.revision + CASE
          WHEN questions.content_sha256 <> EXCLUDED.content_sha256 THEN 1 ELSE 0 END,
        content_sha256 = EXCLUDED.content_sha256,
        updated_at = now()`,
  );

  const answerRows = exam.questions.map((q) => {
    const annulled = q.answer === "ANULADA";
    return [
      etecQuestionId(exam, q.number),
      annulled ? null : q.answer,
      annulled ? "annulled" : "final",
    ];
  });
  await insertChunked(
    db,
    ["question_id", "answer_key", "status"],
    answerRows,
    (values) => `INSERT INTO question_answers (question_id, answer_key, status)
      VALUES ${values}
      ON CONFLICT (question_id) DO UPDATE SET
        answer_key = EXCLUDED.answer_key, status = EXCLUDED.status`,
  );

  return {
    sources: 1,
    questions: exam.questions.length,
    answers: exam.questions.length,
    annulled: exam.questions.filter((q) => q.answer === "ANULADA").length,
  };
}

export async function importEtecArchive(
  db: Db,
  exams: EtecExamData[],
): Promise<ImportEtecResult> {
  const total: ImportEtecResult = { sources: 0, questions: 0, answers: 0, annulled: 0 };
  for (const exam of exams) {
    const r = await importEtecExam(db, exam);
    total.sources += r.sources;
    total.questions += r.questions;
    total.answers += r.answers;
    total.annulled += r.annulled;
  }
  return total;
}

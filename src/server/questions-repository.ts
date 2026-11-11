import type { Db } from "./db";

/**
 * Repositório de questões — seleção PÚBLICA.
 *
 * Regra de segurança estrutural: este módulo só lê a tabela `questions`
 * (e o cabeçalho de `exam_sources`). Ele NUNCA consulta `question_answers`,
 * portanto é impossível um gabarito vazar pela seleção pública — não é uma
 * questão de filtrar campos no fim, a resposta nem sequer é lida.
 * Gabaritos vivem apenas no serviço de correção (correction-service.ts),
 * executado no servidor depois de a tentativa ser registada.
 */
export interface PublicQuestion {
  id: string;
  sourceId: string;
  number: number;
  page: number;
  subject: string;
  topic: string;
  skill: string | null;
  statement: string | null;
  imageKey: string | null;
  options: unknown;
  contentSha256: string;
  revision: number;
}

interface QuestionRow {
  id: string;
  source_id: string;
  original_number: number;
  source_page: number;
  subject: string;
  topic: string;
  skill: string | null;
  statement: string | null;
  image_key: string | null;
  options: unknown;
  content_sha256: string;
  revision: number;
}

const PUBLIC_COLUMNS = `id, source_id, original_number, source_page, subject,
  topic, skill, statement, image_key, options, content_sha256, revision`;

function toPublicQuestion(row: QuestionRow): PublicQuestion {
  return {
    id: row.id,
    sourceId: row.source_id,
    number: row.original_number,
    page: row.source_page,
    subject: row.subject,
    topic: row.topic,
    skill: row.skill,
    statement: row.statement,
    imageKey: row.image_key,
    options: row.options,
    contentSha256: row.content_sha256,
    revision: row.revision,
  };
}

export interface ListPublicQuestionsFilters {
  sourceId?: string;
  subject?: string;
  topic?: string;
  limit?: number;
  offset?: number;
}

/** Lista questões publicadas, sem qualquer campo de gabarito. */
export async function listPublicQuestions(
  db: Db,
  filters: ListPublicQuestionsFilters = {},
): Promise<PublicQuestion[]> {
  // Sanitização defensiva: NaN ou valores fracionários chegavam ao Postgres
  // como texto inválido para LIMIT/OFFSET (erro 22P02). Não finitos caem
  // para os padrões; fracionários são truncados antes do clamp.
  const limit = Math.min(
    Math.max(Number.isFinite(filters.limit) ? Math.floor(filters.limit!) : 30, 1),
    90,
  );
  const offset = Math.max(
    Number.isFinite(filters.offset) ? Math.floor(filters.offset!) : 0,
    0,
  );
  const { rows } = await db.query<QuestionRow>(
    `SELECT ${PUBLIC_COLUMNS} FROM questions
      WHERE status = 'published'
        AND ($1::text IS NULL OR source_id = $1)
        AND ($2::text IS NULL OR subject = $2)
        AND ($3::text IS NULL OR topic = $3)
      ORDER BY source_id, original_number
      LIMIT $4 OFFSET $5`,
    [filters.sourceId ?? null, filters.subject ?? null, filters.topic ?? null, limit, offset],
  );
  return rows.map(toPublicQuestion);
}

/** Uma questão publicada pelo id — também sem gabarito. */
export async function getPublicQuestion(
  db: Db,
  id: string,
): Promise<PublicQuestion | null> {
  const { rows } = await db.query<QuestionRow>(
    `SELECT ${PUBLIC_COLUMNS} FROM questions WHERE id = $1 AND status = 'published'`,
    [id],
  );
  return rows.length ? toPublicQuestion(rows[0]) : null;
}

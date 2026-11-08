import type { Db } from "./db";
import { evaluateAnswer } from "./correction-service.ts";

/**
 * Serviço de tentativas.
 *
 * Regista cada resposta do aluno na tabela `attempts`, com o `correct`
 * SEMPRE calculado no servidor (correction-service) a partir de
 * `question_answers` — o cliente nunca afirma se acertou.
 *
 * Idempotência: o cliente gera o `id` (UUID) da tentativa; a restrição
 * UNIQUE(student_uid, id) faz com que uma sincronização repetida (ex.:
 * app offline a reenviar) devolva o registo já gravado em vez de duplicar.
 */
export interface RecordAttemptInput {
  id: string;
  studentUid: string;
  questionId: string;
  selectedKey: string;
  elapsedMs: number;
}

/**
 * Erro de validação da entrada — distinto de uma falha do banco.
 * A rota traduz isto para 400; qualquer outra exceção é 500.
 */
export class AttemptValidationError extends Error {}

/** Teto de `attempts.elapsed_ms`, que é `integer` (int4) no Postgres. */
export const MAX_ELAPSED_MS = 2_147_483_647;

export interface RecordedAttempt {
  id: string;
  studentUid: string;
  questionId: string;
  questionRevision: number;
  selectedKey: string;
  correct: boolean | null;
  elapsedMs: number;
  createdAt: string;
  /** true quando o id já existia e nada novo foi gravado (reenvio). */
  replayed: boolean;
}

interface AttemptRow {
  id: string;
  student_uid: string;
  question_id: string;
  question_revision: number;
  selected_key: string;
  correct: boolean | null;
  elapsed_ms: number;
  created_at: string | Date;
}

function toRecordedAttempt(row: AttemptRow, replayed: boolean): RecordedAttempt {
  return {
    id: row.id,
    studentUid: row.student_uid,
    questionId: row.question_id,
    questionRevision: row.question_revision,
    selectedKey: row.selected_key,
    correct: row.correct,
    elapsedMs: row.elapsed_ms,
    createdAt:
      row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    replayed,
  };
}

const COLUMNS = `id, student_uid, question_id, question_revision, selected_key,
  correct, elapsed_ms, created_at`;

/* ── Histórico do aluno (GET /api/v1/attempts) ─────────────────────────── */

export interface AttemptHistoryItem {
  id: string;
  questionId: string;
  /** Disciplina e assunto vindos de questions (JOIN no servidor). */
  subject: string;
  topic: string;
  selectedKey: string;
  correct: boolean | null;
  elapsedMs: number;
  createdAt: string;
}

export interface AttemptHistoryPage {
  items: AttemptHistoryItem[];
  total: number;
  limit: number;
  offset: number;
  /** offset da página seguinte, ou null quando acabou. */
  nextOffset: number | null;
}

interface HistoryRow {
  id: string;
  question_id: string;
  subject: string;
  topic: string;
  selected_key: string;
  correct: boolean | null;
  elapsed_ms: number;
  created_at: string | Date;
}

/**
 * Página do histórico de respostas do PRÓPRIO aluno, mais recentes primeiro.
 * O uid vem do token (nunca de parâmetro): a consulta é sempre filtrada por
 * `student_uid`. Índice usado: attempts_student(student_uid, created_at DESC).
 */
export async function listAttempts(
  db: Db,
  studentUid: string,
  limit: number,
  offset: number,
): Promise<AttemptHistoryPage> {
  const { rows } = await db.query<HistoryRow>(
    `SELECT a.id, a.question_id, q.subject, q.topic,
            a.selected_key, a.correct, a.elapsed_ms, a.created_at
       FROM attempts a
       JOIN questions q ON q.id = a.question_id
      WHERE a.student_uid = $1
      ORDER BY a.created_at DESC
      LIMIT $2 OFFSET $3`,
    [studentUid, limit, offset],
  );

  const totalRow = await db.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM attempts WHERE student_uid = $1`,
    [studentUid],
  );
  const total = Number(totalRow.rows[0]?.n ?? 0);

  return {
    items: rows.map((r) => ({
      id: r.id,
      questionId: r.question_id,
      subject: r.subject,
      topic: r.topic,
      selectedKey: r.selected_key,
      correct: r.correct,
      elapsedMs: r.elapsed_ms,
      createdAt:
        r.created_at instanceof Date
          ? r.created_at.toISOString()
          : String(r.created_at),
    })),
    total,
    limit,
    offset,
    nextOffset: offset + limit < total ? offset + limit : null,
  };
}

export async function recordAttempt(
  db: Db,
  input: RecordAttemptInput,
): Promise<RecordedAttempt | null> {
  // Defesa em profundidade na fronteira do serviço (a rota também valida):
  // um elapsedMs acima do int4 estourava no Postgres com um erro cru (500).
  if (
    !Number.isInteger(input.elapsedMs) ||
    input.elapsedMs < 0 ||
    input.elapsedMs > MAX_ELAPSED_MS
  ) {
    throw new AttemptValidationError(
      `elapsedMs fora do intervalo aceite (0 a ${MAX_ELAPSED_MS}).`,
    );
  }

  const correction = await evaluateAnswer(db, input.questionId, input.selectedKey);
  if (!correction) return null; // questão inexistente

  const inserted = await db.query<AttemptRow>(
    `INSERT INTO attempts (id, student_uid, question_id, question_revision,
        selected_key, correct, elapsed_ms)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT DO NOTHING
     RETURNING ${COLUMNS}`,
    [
      input.id,
      input.studentUid,
      input.questionId,
      correction.revision,
      input.selectedKey,
      correction.correct,
      input.elapsedMs,
    ],
  );
  if (inserted.rows.length) return toRecordedAttempt(inserted.rows[0], false);

  // ON CONFLICT DO NOTHING (sem alvo) cobre também a PK `id`: se o UUID já
  // pertencer a OUTRO aluno, nada é gravado e a consulta abaixo — sempre
  // filtrada pelo próprio aluno — devolve null (a rota responde 404), sem
  // derrubar o pedido com um 500 nem revelar o registo alheio.
  // Reenvio idempotente do mesmo aluno: devolve o que já estava gravado.
  const existing = await db.query<AttemptRow>(
    `SELECT ${COLUMNS} FROM attempts WHERE student_uid = $1 AND id = $2`,
    [input.studentUid, input.id],
  );
  return existing.rows.length ? toRecordedAttempt(existing.rows[0], true) : null;
}

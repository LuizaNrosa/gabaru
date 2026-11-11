import type { Db } from "./db";

/**
 * Serviço de progresso — agregados das tentativas de um aluno.
 *
 * É a base de dados do futuro Índice de Prontidão (aluno) e do Painel do
 * Cursinho (turma): totais, taxa de acerto e cortes por disciplina/assunto,
 * sempre derivados de `attempts` × `questions` no servidor.
 *
 * Tentativas em questões anuladas/sem gabarito têm `correct = null`: contam
 * no total de respostas, mas NÃO entram no denominador da taxa de acerto.
 */
export interface ProgressSlice {
  key: string;
  attempts: number;
  correct: number;
  /** correct / tentativas corrigíveis; null quando não há nenhuma. */
  accuracy: number | null;
}

export interface StudentProgress {
  studentUid: string;
  totalAttempts: number;
  /** Tentativas com correcção possível (correct não nulo). */
  gradedAttempts: number;
  correctCount: number;
  accuracy: number | null;
  bySubject: ProgressSlice[];
  byTopic: ProgressSlice[];
}

interface TotalsRow {
  total: number;
  graded: number;
  correct: number;
}

interface SliceRow {
  key: string;
  attempts: number;
  graded: number;
  correct: number;
}

function toSlice(row: SliceRow): ProgressSlice {
  return {
    key: row.key,
    attempts: Number(row.attempts),
    correct: Number(row.correct),
    accuracy: Number(row.graded) > 0 ? Number(row.correct) / Number(row.graded) : null,
  };
}

export async function getStudentProgress(
  db: Db,
  studentUid: string,
): Promise<StudentProgress> {
  const totals = await db.query<TotalsRow>(
    `SELECT count(*)::int AS total,
            count(correct)::int AS graded,
            count(*) FILTER (WHERE correct)::int AS correct
       FROM attempts WHERE student_uid = $1`,
    [studentUid],
  );
  const by = async (column: "subject" | "topic") => {
    const { rows } = await db.query<SliceRow>(
      `SELECT q.${column} AS key,
              count(*)::int AS attempts,
              count(a.correct)::int AS graded,
              count(*) FILTER (WHERE a.correct)::int AS correct
         FROM attempts a
         JOIN questions q ON q.id = a.question_id
        WHERE a.student_uid = $1
        GROUP BY q.${column}
        ORDER BY attempts DESC, key`,
      [studentUid],
    );
    return rows.map(toSlice);
  };

  const t = totals.rows[0] ?? { total: 0, graded: 0, correct: 0 };
  const total = Number(t.total);
  const graded = Number(t.graded);
  const correct = Number(t.correct);

  return {
    studentUid,
    totalAttempts: total,
    gradedAttempts: graded,
    correctCount: correct,
    accuracy: graded > 0 ? correct / graded : null,
    bySubject: await by("subject"),
    byTopic: await by("topic"),
  };
}

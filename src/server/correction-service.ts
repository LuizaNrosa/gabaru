import type { Db } from "./db";

/**
 * Serviço de correção — o ÚNICO lugar do servidor que lê `question_answers`.
 *
 * A correção acontece sempre no servidor, a partir do gabarito guardado na
 * tabela separada. O cliente nunca recebe o gabarito antes de responder:
 * envia apenas a alternativa escolhida e recebe o veredito já calculado.
 *
 * Só questões PUBLICADAS são corrigíveis: uma questão em draft/review ou
 * retirada (withdrawn) é tratada como inexistente — não se corrige nem se
 * registam tentativas contra conteúdo que o público não pode ver.
 *
 * Estados do gabarito (tabela question_answers.status):
 * - 'final' / 'preliminary': há uma letra oficial → compara com a escolhida.
 * - 'annulled': questão anulada → `correct` é `null` (nem certo nem errado).
 * - 'pending' ou sem registo: ainda não há gabarito → `correct` é `null`.
 */
export interface CorrectionResult {
  questionId: string;
  /** Revisão da questão usada na correção (gravada na tentativa). */
  revision: number;
  /** true/false quando há gabarito válido; null quando não é corrigível. */
  correct: boolean | null;
  answerStatus: "final" | "preliminary" | "annulled" | "pending" | "missing";
}

interface CorrectionRow {
  revision: number;
  answer_key: string | null;
  answer_status: string | null;
}

export async function evaluateAnswer(
  db: Db,
  questionId: string,
  selectedKey: string,
): Promise<CorrectionResult | null> {
  const { rows } = await db.query<CorrectionRow>(
    `SELECT q.revision AS revision, a.answer_key AS answer_key, a.status AS answer_status
       FROM questions q
       LEFT JOIN question_answers a ON a.question_id = q.id
      WHERE q.id = $1 AND q.status = 'published'`,
    [questionId],
  );
  if (!rows.length) return null; // questão inexistente

  const row = rows[0];
  const status = (row.answer_status ?? "missing") as CorrectionResult["answerStatus"];
  const corrigivel =
    (status === "final" || status === "preliminary") && row.answer_key != null;

  return {
    questionId,
    revision: row.revision,
    correct: corrigivel ? selectedKey === row.answer_key : null,
    answerStatus: status,
  };
}

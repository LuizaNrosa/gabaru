/**
 * Forma PÚBLICA de uma edição do acervo (resposta de /api/v1/etec e
 * /api/v1/coluni quando `?edition=` é indicado).
 *
 * A seleção pública nunca devolve o gabarito (`answer`) de cada questão —
 * a mesma regra estrutural do repositório Postgres e da seleção do ENEM.
 * Em troca, cada questão expõe `annulled` (derivado no servidor de
 * `answer === "ANULADA"`): saber que uma questão foi anulada é informação
 * pública da prova; a letra do gabarito, não.
 *
 * Também remove o `text` das páginas (transcrição interna de trabalho);
 * o resto da proveniência (URLs e hashes oficiais) é público por desenho —
 * é a base do Selo de Questão Oficial Verificada.
 */
interface ExamQuestionLike {
  answer?: string;
  [key: string]: unknown;
}

interface ExamPageLike {
  text?: string;
  [key: string]: unknown;
}

export interface ExamLike {
  questions: ExamQuestionLike[];
  pages: ExamPageLike[];
  [key: string]: unknown;
}

export function toPublicExamDetail<T extends ExamLike>(exam: T) {
  return {
    ...exam,
    pages: exam.pages.map(({ text: _text, ...page }) => page),
    questions: exam.questions.map(({ answer, ...question }) => ({
      ...question,
      annulled: answer === "ANULADA",
    })),
  };
}

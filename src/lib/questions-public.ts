import type { Question } from "./questions";

/**
 * Forma PÚBLICA de uma questão do ENEM (resposta de /api/v1/questions).
 *
 * Regra estrutural, igual à do repositório Postgres
 * (src/server/questions-repository.ts): a seleção pública NUNCA inclui o
 * gabarito. A correção é calculada no servidor; o cliente recebe a questão
 * sem a resposta, mesmo nas edições já casadas com o gabarito oficial.
 *
 * A lista de campos é uma ALLOWLIST explícita (não um "apagar o gabarito"):
 * se um dia o tipo `Question` ganhar um campo interno novo, ele não vaza
 * por esta via sem alguém o acrescentar aqui de propósito.
 */
export type PublicQuestion = Pick<
  Question,
  | "id"
  | "ano"
  | "dia"
  | "numero"
  | "disciplina"
  | "subtopico"
  | "habilidade"
  | "tema"
  | "img"
  | "w"
  | "h"
>;

export function toPublicQuestion(question: Question): PublicQuestion {
  return {
    id: question.id,
    ano: question.ano,
    dia: question.dia,
    numero: question.numero,
    disciplina: question.disciplina,
    subtopico: question.subtopico,
    habilidade: question.habilidade,
    tema: question.tema,
    img: question.img,
    w: question.w,
    h: question.h,
  };
}

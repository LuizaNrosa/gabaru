import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { toPublicQuestion } from "./questions-public";
export type Question = {
  id: string;
  ano: number;
  dia: number | null;
  numero: number;
  disciplina: string;
  subtopico: string;
  habilidade: string;
  tema: string;
  img: string;
  w: number;
  h: number;
  // Gabarito oficial (INEP) casado por caderno/número; null enquanto a
  // edição não tiver casamento provado (ex.: 2000–2008). "ANULADA" quando
  // o gabarito oficial marca a questão como anulada.
  gabarito: "A" | "B" | "C" | "D" | "E" | "ANULADA" | null;
};
export type AnswerStatus = "available" | "partial" | "pending";
function statusFor(qs: Question[]): AnswerStatus {
  if (qs.length > 0 && qs.every((q) => q.gabarito)) return "available";
  if (qs.some((q) => q.gabarito)) return "partial";
  return "pending";
}
// O banco vive FORA de public/ de propósito: contém os gabaritos oficiais
// e nunca pode ser servido como ficheiro estático. Só o servidor o lê;
// a API pública filtra o gabarito via questions-public.ts.
const bank = JSON.parse(
  readFileSync(join(process.cwd(), "src/data/treino-banco.json"), "utf8"),
) as Question[];
export const questionCatalog = {
  total: bank.length,
  institutions: ["enem"],
  years: [...new Set(bank.map((q) => q.ano))].sort((a, b) => b - a),
  disciplines: [...new Set(bank.map((q) => q.disciplina))]
    .sort()
    .map((slug) => ({
      slug,
      count: bank.filter((q) => q.disciplina === slug).length,
    })),
  answerStatus: statusFor(bank),
  difficultyStatus: "not-calibrated" as const,
};
export function selectQuestions(params: URLSearchParams) {
  const discipline = params.get("disciplina"),
    year = params.get("ano"),
    institution = params.get("instituicao");
  const limit = Number(params.get("limit") ?? 30),
    offset = Number(params.get("offset") ?? 0);
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 90 ||
    !Number.isInteger(offset) ||
    offset < 0 ||
    (year && !/^\d{4}$/.test(year))
  )
    throw new Error(
      "Filtros inválidos. Use limit de 1 a 90, offset não negativo e ano com quatro dígitos.",
    );
  let pool = bank.filter(
    (q) =>
      (!discipline || discipline === "todas" || q.disciplina === discipline) &&
      (!year || q.ano === Number(year)) &&
      (!institution || institution === "enem"),
  );
  if (params.has("dificuldade")) pool = []; // no inferred difficulty presented as measured
  if (params.get("random") === "1") {
    pool = [...pool];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
  }
  return {
    version: 1,
    total: pool.length,
    offset,
    limit,
    nextOffset: offset + limit < pool.length ? offset + limit : null,
    answerStatus: statusFor(pool),
    // Seleção pública: o gabarito NUNCA sai nos itens (ver questions-public.ts).
    // O `answerStatus` agregado continua público — diz SE há gabarito, não QUAL.
    items: pool.slice(offset, offset + limit).map(toPublicQuestion),
  };
}

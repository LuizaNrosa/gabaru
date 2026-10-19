import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
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
};
const bank = JSON.parse(
  readFileSync(join(process.cwd(), "public/treino/banco.json"), "utf8"),
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
  answerStatus: "pending" as const,
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
    answerStatus: "pending",
    items: pool.slice(offset, offset + limit),
  };
}

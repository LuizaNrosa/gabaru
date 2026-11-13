import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import exams from "@/data/enem-exams.json";

export const ENEM_SOURCE = "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos";
export const ENEM_YEARS = Array.from({ length: 28 }, (_, i) => 2025 - i);
export const enemExams = exams;
type Item = { numero: number; texto: string; disciplina: string; habilidade: string; tema: string; obs?: string; figuras?: { url: string; descricao: string }[] };
export function readEnemExam(id: string) {
  const exam = exams.find(e => e.id === id);
  if (!exam) return null;
  const data = JSON.parse(readFileSync(join(process.cwd(), "content", "enem", id, "dados.json"), "utf8")) as { questoes: Item[] };
  return { ...exam, questions: data.questoes };
}
export function enemTitle(exam: (typeof exams)[number]) {
  const application = exam.id === "enem-2024-d2" ? "Regular · caderno 11 laranja (acessível)" : exam.id === "enem-2025-d2" ? "Aplicação Belém / Ananindeua / Marituba" : exam.id.includes("-ppl-") ? "Reaplicação / PPL" : exam.id === "enem-2020-d2" ? "Digital" : "Regular";
  return `ENEM ${exam.year} · ${application} · ${exam.day ? exam.day + "º dia" : "Prova única"}`;
}

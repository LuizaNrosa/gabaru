import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import exams from "@/data/enem-exams.json";
import paginatedExams from "@/data/enem-cadernos-paginados.json";

export const ENEM_SOURCE = "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos";
export const ENEM_YEARS = Array.from({ length: 28 }, (_, i) => 2025 - i);
export const enemExams = [...exams, ...paginatedExams.map(({id, year, day, total, description, disciplines}) => ({
  id, year, day, total, description, disciplines,
}))].sort((left, right) => right.year - left.year);
type Item = { numero: number; texto: string; disciplina: string; habilidade: string; tema: string; obs?: string; pagina?: number };
export function readEnemExam(id: string) {
  const paginated = paginatedExams.find(entry => entry.id === id);
  if (paginated) {
    const questions: Item[] = paginated.questions.map(({numero,pagina}) => ({
      numero, pagina, texto:"", disciplina:numero < 136 ? "Ciências da Natureza" : "Matemática", habilidade:"", tema:"",
    }));
    return { id, year:paginated.year, day:paginated.day, total:paginated.total,
      description:paginated.description, disciplines:paginated.disciplines, pageCount:paginated.pageCount, questions };
  }
  const exam = exams.find(e => e.id === id);
  if (!exam) return null;
  const data = JSON.parse(readFileSync(join(process.cwd(), "content", "enem", id, "dados.json"), "utf8")) as { questoes: Item[] };
  return { ...exam, pageCount: undefined, questions: data.questoes };
}
export function enemTitle(exam: (typeof exams)[number]) {
  const application = exam.id === "enem-2025-d2" ? "Aplicação Belém / Ananindeua / Marituba" : exam.id.includes("-ppl-") ? "Reaplicação / PPL" : exam.id === "enem-2020-d2" ? "Digital" : "Regular";
  const paginated = paginatedExams.find(entry => entry.id === exam.id);
  if (paginated) return `ENEM ${exam.year} · ${exam.day}º dia · ${paginated.description}`;
  return `ENEM ${exam.year} · ${application} · ${exam.day ? exam.day + "º dia" : "Prova única"}`;
}

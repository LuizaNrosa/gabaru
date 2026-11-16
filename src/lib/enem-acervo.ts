import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import bank from "@/data/treino-banco.json";
import verifiedExams from "@/data/enem-gabaritos-conferidos.json";
import exams from "@/data/enem-exams.json";
import paginatedExams from "@/data/enem-cadernos-paginados.json";

export const ENEM_SOURCE = "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos";
export const ENEM_YEARS = Array.from({ length: 28 }, (_, i) => 2025 - i);
function applicationOrder(id: string) {
  if (id === "enem-2025-d2") return 1;
  if (["enem-2021-d2", "enem-2022-d2"].includes(id)) return 1;
  if (id === "enem-2020-d2") return 2;
  if (id.includes("-ppl-") || id.includes("-reaplicacao-")) return 3;
  return 0;
}

export const enemExams = [...exams.filter(exam => !paginatedExams.some(entry => entry.id === exam.id)), ...paginatedExams.map(({id, year, day, total, description, disciplines}) => ({
  id, year, day, total, description, disciplines,
}))].sort((left, right) => right.year - left.year || applicationOrder(left.id) - applicationOrder(right.id) || (left.day ?? 0) - (right.day ?? 0));
type Item = { numero: number; texto: string; disciplina: string; habilidade: string; tema: string; obs?: string; pagina?: number; annulled?: boolean };
export function readEnemExam(id: string) {
  const paginated = paginatedExams.find(entry => entry.id === id);
  if (paginated) {
    const questions: Item[] = paginated.questions.map(({numero,pagina,gabarito}) => ({
      numero, pagina, annulled:gabarito === "ANULADA", texto:"", disciplina:numero < 136 ? "Ciências da Natureza" : "Matemática", habilidade:"", tema:"",
    }));
    return { id, year:paginated.year, day:paginated.day, total:paginated.total,
      description:paginated.description, disciplines:paginated.disciplines, pageCount:paginated.pageCount, questions };
  }
  const exam = exams.find(e => e.id === id);
  if (!exam) return null;
  const data = JSON.parse(readFileSync(join(process.cwd(), "content", "enem", id, "dados.json"), "utf8")) as { questoes: Item[] };
  const annulled = new Set(verifiedExams.some(entry => entry.id === id)
    ? bank.filter(q => q.id.startsWith(id + "-q") && q.gabarito === "ANULADA").map(q => q.numero)
    : []);
  return { ...exam, pageCount: undefined, questions: data.questoes.map(q => ({ ...q, annulled: annulled.has(q.numero) })) };
}
export function enemTitle(exam: (typeof exams)[number]) {
  const application = exam.id === "enem-2025-d2" ? "Aplicação Belém / Ananindeua / Marituba" : exam.id.includes("-ppl-") ? "Reaplicação / PPL" : exam.id === "enem-2020-d2" ? "Digital" : "Regular";
  const paginated = paginatedExams.find(entry => entry.id === exam.id);
  if (paginated) return `ENEM ${exam.year} · ${exam.day}º dia · ${paginated.description}`;
  if (exam.id === "enem-2021-d2") return "ENEM 2021 · 2º dia · Caderno 5 Amarelo (superampliado)";
  if (exam.id === "enem-2022-d2") return "ENEM 2022 · 2º dia · Caderno 6 Cinza (ampliado)";
  return `ENEM ${exam.year} · ${application} · ${exam.day ? exam.day + "º dia" : "Prova única"}`;
}

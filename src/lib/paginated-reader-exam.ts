import "server-only";

import readerPages from "@/data/reader-pages-manifest.json";
const availablePages = new Set(readerPages);
import { toReaderExam, type EtecExam, type ReaderInstitution } from "./etec-types";

export function toPaginatedReaderExam(exam: EtecExam, institution: ReaderInstitution) {
  const reader = toReaderExam(exam);
  const pages = new Map(reader.pages.map(page => [page.number, page]));
  for (let number = 1; number <= exam.pageCount; number++) {
    const page = pages.get(number);
    if (page?.image) continue;
    const image = `/acervo/${institution}/${exam.id}/pagina-${String(number).padStart(2, "0")}.webp`;
    if (availablePages.has(image)) {
      pages.set(number, { number, image, text: page?.text ?? "" });
    }
  }
  return { ...reader, pages: Array.from(pages.values()).sort((a, b) => a.number - b.number) };
}

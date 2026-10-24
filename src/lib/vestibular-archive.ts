import unesp from "@/data/unesp-archive.json";
import unicamp from "@/data/unicamp-archive.json";
import type { ArchiveDocument } from "./vestibular-documents";
export { applicationName, documentUrl, type ArchiveDocument } from "./vestibular-documents";
export type Archive = { checkedAt: string; documents: ArchiveDocument[]; unavailable: unknown[]; discoveryErrors: unknown[] };
export type Institution = "unesp" | "unicamp";
export const ARCHIVES: Record<Institution, Archive> = { unesp, unicamp };
export const ARCHIVE_INFO = {
  unesp: { name: "UNESP / Vunesp", source: "https://www.vunesp.com.br/Institucional/EstatisticaVestibular" },
  unicamp: { name: "Unicamp / Comvest", source: "https://www.comvest.unicamp.br/vestibulares-anteriores/" },
};
export const archiveYears = (institution: Institution) => [...new Set(ARCHIVES[institution].documents.map(d => d.year))].sort((a, b) => b - a);

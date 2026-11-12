import Link from "next/link";
import { notFound } from "next/navigation";
import { ARCHIVES, ARCHIVE_INFO, type Institution } from "@/lib/vestibular-archive";
import unespNovas from "@/data/unesp-2015-2016-2021.json";
import unespHistoricas from "@/data/unesp-2011-2014.json";
import { VestibularDocumentReader } from "@/components/vestibular-document-reader";

export function VestibularYearPage({ institution, year }: { institution: Institution; year: string }) {
  if (!/^\d{4}$/.test(year)) notFound();
  const documents = ARCHIVES[institution].documents.filter(d => d.year === Number(year));
  if (institution === "unesp" && (year === "2021" || (Number(year) >= 2011 && Number(year) <= 2014))) {
    const cadernos = [...unespNovas.filter(p => p.ano === 2021), ...unespHistoricas].filter(p => p.ano === Number(year)).map(p => ({ id: p.id, institution: "unesp", year: p.ano, application: "regular", label: p.titulo, kind: "prova", url: p.fonte_prova, source: p.fonte_prova, phase: "1ª fase", sha256: p.sha256_prova, bytes: p.bytes, pages: p.pages, startPage: 1 }));
    documents.unshift(...cadernos);
  }
  if (!documents.length) notFound();
  return <main className="gb-container py-10">
    <Link href={`/provas/${institution}#ano-${year}`} className="gb-text-link">← Acervo {ARCHIVE_INFO[institution].name}</Link>
    <p className="gb-eyebrow mt-8">VESTIBULARES · PROVAS OFICIAIS</p>
    <h1 className="gb-page-title">{ARCHIVE_INFO[institution].name} {year}</h1>
    <p className="mt-5 text-lg">Selecione o documento para consultar a prova, os anexos e os arquivos de respostas disponíveis.</p>
    <VestibularDocumentReader documents={documents} />
  </main>;
}

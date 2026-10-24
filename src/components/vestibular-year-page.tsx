import Link from "next/link";
import { notFound } from "next/navigation";
import { ARCHIVES, ARCHIVE_INFO, type Institution } from "@/lib/vestibular-archive";
import { VestibularDocumentReader } from "@/components/vestibular-document-reader";

export function VestibularYearPage({ institution, year }: { institution: Institution; year: string }) {
  if (!/^\d{4}$/.test(year)) notFound();
  const documents = ARCHIVES[institution].documents.filter(d => d.year === Number(year));
  if (!documents.length) notFound();
  return <main className="gb-container py-10">
    <Link href={`/provas/${institution}#ano-${year}`} className="gb-text-link">← Acervo {ARCHIVE_INFO[institution].name}</Link>
    <p className="gb-eyebrow mt-8">VESTIBULARES · PROVAS OFICIAIS</p>
    <h1 className="gb-page-title">{ARCHIVE_INFO[institution].name} {year}</h1>
    <p className="mt-5 text-lg">Selecione o documento para consultar a prova, os anexos e os arquivos de respostas disponíveis.</p>
    <VestibularDocumentReader documents={documents} />
  </main>;
}

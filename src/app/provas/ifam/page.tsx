import Link from "next/link";
import { IfOfficialDocuments } from "@/components/if-official-documents";
import { metaPagina } from "@/lib/seo";

export const metadata = metaPagina({
  titulo: "IFAM: provas anteriores e gabaritos",
  descricao: "Cadernos e gabaritos oficiais do Instituto Federal do Amazonas para cursos técnicos integrados.",
  caminho: "/provas/ifam",
});

export default function Page() {
  return (
    <main id="conteudo-principal" tabIndex={-1} className="gb-container py-10">
      <Link href="/materiais-gratuitos#provas-ifs" className="gb-text-link">← Materiais gratuitos</Link>
      <h1 className="gb-page-title mt-6">Provas do IFAM</h1>
      <p className="mt-4 text-lg">Instituto Federal do Amazonas · cursos técnicos integrados ao ensino médio.</p>
      <IfOfficialDocuments slug="ifam" />
    </main>
  );
}

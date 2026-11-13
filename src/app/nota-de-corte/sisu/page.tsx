import Link from "next/link";
import { NotaCorteSisuUfcTool } from "@/components/nota-corte-sisu-ufc-tool";
import { metaPagina } from "@/lib/seo";
export const metadata = metaPagina({ titulo: "Nota de corte Sisu UFC 2026 por curso e modalidade", descricao: "Consulte as notas de corte da chamada regular do Sisu 2026 na UFC por unidade, curso, turno e modalidade, com dados oficiais.", caminho: "/nota-de-corte/sisu" });
export default function Page() {
 return <main className="gb-container py-10">
  <Link href="/nota-de-corte" className="gb-text-link">← Todas as notas de corte</Link>
  <p className="gb-eyebrow mt-8">FERRAMENTA GRATUITA · ENEM E SISU</p>
  <h1 className="gb-page-title">Qual foi a nota de corte <mark>do seu curso?</mark></h1>
  <p className="mt-5 max-w-2xl text-lg leading-relaxed text-n5">Começamos pela Universidade Federal do Ceará: selecione unidade, curso e modalidade para consultar a nota publicada para a chamada regular do Sisu 2026. As demais instituições estão em coleta.</p>
  <div className="mt-8"><NotaCorteSisuUfcTool /></div>
 </main>;
}

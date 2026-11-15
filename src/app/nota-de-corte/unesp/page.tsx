import type { Metadata } from "next";
import Link from "next/link";
import { NotaCorteUnespTool } from "@/components/nota-corte-unesp-tool";
import { metaPagina } from "@/lib/seo";

export const metadata: Metadata = metaPagina({
  titulo: "Nota de corte Unesp 2026: segunda fase por curso e cidade",
  descricao: "Consulte os acertos mínimos para a segunda fase da Unesp 2026 por curso, cidade e modalidade e compare com sua pontuação.",
  caminho: "/nota-de-corte/unesp",
});

export default function NotaDeCorteUnesp() {
  return <main className="gb-container py-10">
    <p className="gb-eyebrow">NOTA DE CORTE · UNESP 2026</p>
    <h1 className="gb-page-title">Quantos acertos para a <mark>segunda fase da Unesp?</mark></h1>
    <p className="mt-5 max-w-2xl text-lg leading-relaxed text-n5">Escolha seu curso, cidade e modalidade. Compare seus acertos com os números mínimos publicados pela Unesp para a convocação da segunda fase de 2026.</p>
    <p className="mt-3 max-w-2xl text-n5">Esta referência é da primeira etapa do vestibular. A nota necessária para matrícula segue outros critérios e pode mudar a cada edição.</p>
    <div className="mt-8"><NotaCorteUnespTool /></div>
    <p className="mt-8"><Link href="/nota-de-corte" className="gb-text-link">← Consultar outras provas</Link></p>
  </main>;
}

import type { Metadata } from "next";
import { NotaCorteIfrnTool } from "@/components/nota-corte-ifrn-tool";
import { metaPagina } from "@/lib/seo";
export const metadata: Metadata = metaPagina({ titulo: "IFRN 2026: classificação por campus, curso e modalidade", descricao: "Consulte a referência de escore do resultado final do Exame de Seleção IFRN 2026 por campus, curso, turno e modalidade.", caminho: "/nota-de-corte/ifrn" });
export default function NotaCorteIfrnPage() {
 return <main className="gb-container py-10"><p className="gb-eyebrow">VESTIBULINHO · IFRN</p><h1 className="gb-page-title">IFRN: encontre a referência <mark>para o seu curso</mark></h1><p className="mt-5 max-w-2xl text-lg leading-relaxed text-n5">Consulte o escore final do último classificado como aprovado na lista oficial de 2026. Escolha campus, curso, turno e modalidade para ver a combinação correta.</p><div className="mt-8"><NotaCorteIfrnTool /></div><p className="mt-6 max-w-2xl text-n5">A referência mostra a classificação inicial publicada; não representa aprovação final após matrículas e não é uma previsão da próxima edição. Para opções sem dados suficientes, a ferramenta informa que a referência está indisponível.</p></main>;
}

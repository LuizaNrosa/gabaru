import Link from "next/link";
import { notFound } from "next/navigation";
import docs from "@/data/fuvest-documentos.json";
import { CONTAINER, PageHero } from "@/components/ui";
import { FuvestDocReader } from "@/components/fuvest-doc-reader";
import { metaPagina } from "@/lib/seo";

const years = Array.from({ length: 50 }, (_, i) => 2026 - i);
type Props = { params: Promise<{ year: string }> };

export function generateStaticParams() {
  return years.map(year => ({ year: String(year) }));
}
export async function generateMetadata({ params }: Props) {
  const { year } = await params;
  return metaPagina({ titulo: `FUVEST ${year}: provas e respostas oficiais`, descricao: `Documentos da edição ${year} listados pela FUVEST.`, caminho: `/provas/fuvest/${year}` });
}
export default async function FuvestAno({ params }: Props) {
  const { year } = await params;
  if (!/^\d{4}$/.test(year) || !years.includes(Number(year))) notFound();
  const list = docs.map((d, globalIndex) => ({...d, globalIndex})).filter(d => d.year === Number(year));
  const source = `https://www.fuvest.br/acervo-vestibular-${year}/`;
  return <main>
    <PageHero eyebrow="Vestibulares · FUVEST" titulo={<>FUVEST {year}.<br /><mark>Documentos oficiais.</mark></>}>
      <p>Escolha um documento disponibilizado na página oficial desta edição.</p>
    </PageHero>
    <section className={`${CONTAINER} py-10`}>
      <Link href="/provas/fuvest" className="gb-text-link">← Voltar às edições da FUVEST</Link>
      <p className="gb-notice mt-6">Leia os documentos no Gabaru e confira a edição, fase e versão antes de comparar respostas. A correção automática ainda não está disponível.</p>
      {list.length > 0 ? <FuvestDocReader documentos={list} /> : <p className="mt-6 text-n5">Nenhum PDF desta edição foi confirmado nesta etapa.</p>}
      {year === "2025" && <section className="mt-12" aria-labelledby="corte-2025"><h2 id="corte-2025" className="gb-section-title">Nota de corte FUVEST 2025: primeira fase</h2><p className="mt-3 text-n5">Consulte no Gabaru a relação oficial de pontos mínimos para convocação à segunda fase, por carreira e modalidade. Os valores são históricos e não garantem aprovação em outra edição.</p><iframe src="/acervo/fuvest/2025/notas-de-corte.pdf" title="Notas de corte oficiais FUVEST 2025 para a segunda fase" className="mt-5 h-[70vh] min-h-[400px] w-full rounded-lg border border-n2 bg-white" loading="lazy" /><a href="/acervo/fuvest/2025/notas-de-corte.pdf" className="gb-text-link mt-4 inline-block" target="_blank" rel="noopener noreferrer">Abrir nota de corte em outra aba →</a></section>}
      <a href={source} target="_blank" rel="noopener noreferrer" className="gb-text-link mt-8 inline-block">Fonte oficial ↗</a>
    </section>
  </main>;
}

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
      <a href={source} target="_blank" rel="noopener noreferrer" className="gb-text-link mt-8 inline-block">Fonte oficial ↗</a>
    </section>
  </main>;
}

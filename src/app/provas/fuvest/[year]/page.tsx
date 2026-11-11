import Link from "next/link";
import { notFound } from "next/navigation";
import docs from "@/data/fuvest-documentos.json";
import { CONTAINER, PageHero } from "@/components/ui";
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
  const list = docs.filter(d => d.year === Number(year));
  const source = `https://www.fuvest.br/acervo-vestibular-${year}/`;
  return <main>
    <PageHero eyebrow="Vestibulares · FUVEST" titulo={<>FUVEST {year}.<br /><mark>Documentos oficiais.</mark></>}>
      <p>Escolha um documento disponibilizado na página oficial desta edição.</p>
    </PageHero>
    <section className={`${CONTAINER} py-10`}>
      <Link href="/provas/fuvest" className="gb-text-link">← Voltar às edições da FUVEST</Link>
      <p className="gb-notice mt-6">Os documentos abaixo foram identificados na página oficial do ano e abrem no site da FUVEST. Confira a fase, a versão e o ano no próprio caderno antes de usar o gabarito. Questões e correção automática ainda não estão disponíveis no Gabaru. A seleção não garante que todos os arquivos da edição estejam listados.</p>
      {list.length > 0 ? <div className="gb-content-grid mt-6">
        {list.map((doc, i) => <a key={`${doc.url}-${i}`} href={doc.url} target="_blank" rel="noopener noreferrer" className="gb-content-card">
          <h2>{doc.label}</h2><p>{doc.pages} {doc.pages === 1 ? "página" : "páginas"} · PDF oficial</p>
          <span className="gb-text-link">Abrir PDF ↗<span className="sr-only"> em nova aba</span></span>
        </a>)}
      </div> : <p className="mt-6 text-n5">Nenhum PDF desta edição pôde ser confirmado nesta etapa. Consulte a página oficial abaixo.</p>}
      <a href={source} target="_blank" rel="noopener noreferrer" className="gb-button mt-8">Ver todos os documentos na FUVEST ↗<span className="sr-only"> em nova aba</span></a>
    </section>
  </main>;
}

import Image from "next/image";
import Link from "next/link";
import { PageHero, CONTAINER } from "@/components/ui";
import { preparacoes } from "@/data/preparacoes";
import { metaPagina } from "@/lib/seo";

export const metadata = metaPagina({
  titulo: "Apostilas, cadernos e cursos",
  descricao: "Conheça as apostilas, cadernos de exercícios e videoaulas em preparação no Gabaru.",
  caminho: "/planos",
});

export default function Page() {
  return (
    <main>
      <PageHero eyebrow="Materiais Gabaru" titulo={<>Prepare-se para<br /><mark>a sua próxima prova.</mark></>}>
        <p>Apostilas, cadernos com resolução passo a passo e cursos em videoaulas estão em produção. Enquanto isso, estude com os acervos gratuitos.</p>
        <Link href="/materiais-gratuitos" className="gb-button mt-5">Acessar materiais gratuitos ↗</Link>
      </PageHero>
      <section className={`${CONTAINER} py-10`} aria-labelledby="apostilas">
        <div className="flex items-center gap-3">
          <Image src="/marca/gabaru-carimbo.webp" width={48} height={48} alt="" />
          <h2 id="apostilas" className="gb-section-title">Apostilas em produção</h2>
        </div>
        <div className="gb-content-grid mt-6">
          {preparacoes.map(({ titulo, detalhe, acervo }) => (
            <article key={titulo} className="gb-content-card">
              <h3>{titulo}</h3>
              <p>{detalhe}</p>
              <Link href={acervo} aria-label={`Ver provas de ${titulo}`}>Ver provas disponíveis ↗</Link>
            </article>
          ))}
        </div>
      </section>
      <section className={`${CONTAINER} pb-12`} aria-labelledby="em-preparacao">
        <h2 id="em-preparacao" className="gb-section-title">Cadernos, aulas e suporte</h2>
        <div className="gb-content-grid mt-6">
          <article className="gb-content-card">
            <h3>Cadernos de exercícios</h3>
            <p>Resoluções passo a passo das provas. A lista de edições revisadas acompanhará cada caderno.</p>
          </article>
          <article className="gb-content-card">
            <h3>Cursos em videoaulas</h3>
            <p>Aulas por assunto para ETEC, Institutos Federais, ENEM e vestibulares paulistas.</p>
          </article>
          <article className="gb-content-card">
            <h3>Suporte a dúvidas</h3>
            <p>Canal de dúvidas sobre questões, resoluções e aulas, em preparação.</p>
          </article>
        </div>
        <p className="mt-7 text-n5">As compras serão abertas quando os materiais e a entrega estiverem disponíveis. O pagamento será pelo Mercado Pago.</p>
      </section>
    </main>
  );
}

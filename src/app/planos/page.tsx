import Link from "next/link";
import { PageHero, CONTAINER } from "@/components/ui";
import { preparacoes, type ObjetivoPreparacao } from "@/data/preparacoes";
import { metaPagina } from "@/lib/seo";

export const metadata = metaPagina({
  titulo: "Preparação para ETEC, Institutos Federais e ENEM",
  descricao: "Veja o plano de apostilas, videoaulas e exercícios resolvidos do Gabaru para ETEC, Institutos Federais, ENEM e vestibulares paulistas.",
  caminho: "/planos",
});

function Preparacao({ objetivo }: { objetivo: ObjetivoPreparacao }) {
  const { titulo, detalhe, acervo, linkAcervo } = preparacoes[objetivo];
  return (
    <article id={objetivo} className="gb-content-card scroll-mt-28">
      <h3>{titulo}</h3>
      <p>{detalhe}</p>
      <dl className="mt-3 grid gap-3 text-sm">
        <div>
          <dt className="font-semibold">Material de estudo</dt>
          <dd className="mt-1 text-n5">Teoria por matéria e caderno de exercícios comentados.</dd>
        </div>
        <div>
          <dt className="font-semibold">Videoaulas</dt>
          <dd className="mt-1 text-n5">Aulas por assunto e exercícios resolvidos passo a passo.</dd>
        </div>
      </dl>
      <Link href={acervo} className="inline-flex min-h-11 items-center">{linkAcervo}</Link>
    </article>
  );
}

export default function Page() {
  return (
    <main id="conteudo-principal" tabIndex={-1}>
      <PageHero eyebrow="Preparação Gabaru" titulo={<>Estude para <mark>a sua próxima prova.</mark></>}>
        <p>Estamos preparando materiais, videoaulas e exercícios resolvidos. Enquanto isso, você já pode praticar com as provas disponíveis no Gabaru.</p>
        <nav className="gb-actions" aria-label="Objetivos de preparação">
          <Link href="#vestibulinhos" className="gb-text-link inline-flex min-h-11 items-center">Vestibulinhos</Link>
          <Link href="#enem" className="gb-text-link inline-flex min-h-11 items-center">ENEM</Link>
          <Link href="#paulistas" className="gb-text-link inline-flex min-h-11 items-center">Vestibulares paulistas</Link>
        </nav>
      </PageHero>
      <section className={`${CONTAINER} py-10`} aria-labelledby="vestibulinhos">
        <h2 id="vestibulinhos" className="gb-section-title scroll-mt-28">Material completo para vestibulinhos</h2>
        <p className="mt-3 max-w-2xl text-n5">Escolha o seu. A trilha em produção prevê videoaulas de todas as matérias do programa e centenas de exercícios resolvidos passo a passo.</p>
        <div className="gb-content-grid mt-6">
          <Preparacao objetivo="etec" />
          <Preparacao objetivo="ifs" />
        </div>
      </section>
      <section className={`${CONTAINER} pb-12`} aria-labelledby="outras-provas">
        <h2 id="outras-provas" className="gb-section-title">Materiais e videoaulas para ENEM e vestibulares</h2>
        <div className="gb-content-grid mt-6">
          <Preparacao objetivo="enem" />
          <Preparacao objetivo="paulistas" />
        </div>
        <p className="mt-6 text-sm text-n5">Materiais e cursos em produção. <Link href="/materiais-gratuitos" className="gb-text-link">Ver materiais gratuitos disponíveis</Link>.</p>
      </section>
    </main>
  );
}

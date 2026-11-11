import Link from "next/link";
import { PageHero, CONTAINER } from "@/components/ui";
import { OFFICIAL_SOURCES } from "@/data/official-sources";
import { metaPagina } from "@/lib/seo";
export const metadata = metaPagina({
  titulo: "Materiais gratuitos e fontes oficiais",
  descricao:
    "Treino aberto do Gabaru e os acervos oficiais das instituições responsáveis pelos exames: ETEC, INEP, Comvest, Vunesp e UFV.",
  caminho: "/materiais-gratuitos",
});
export default function Page() {
  return (
    <main>
      <PageHero
        eyebrow="Materiais gratuitos"
        titulo={
          <>
            Conhecimento começa
            <br />
            <mark>com uma boa fonte.</mark>
          </>
        }
      >
        <p>
          Acesse o treino aberto do Gabaru e os acervos das instituições
          responsáveis pelos exames.
        </p>
      </PageHero>
      <section className={`${CONTAINER} pt-10`} aria-labelledby="simulados-enem">
        <div className="gb-content-card">
          <p className="gb-eyebrow">GRÁTIS · SEM CADASTRO</p>
          <h2 id="simulados-enem">Simulados do ENEM</h2>
          <p>Escolha um caderno oficial, responda às questões e acompanhe suas marcações. Correção automática ainda em preparação.</p>
          <Link href="/provas/enem" className="gb-button">Escolher prova do ENEM ↗</Link>
        </div>
      </section>
      <section className={`${CONTAINER} py-10`}>
        <div className="gb-notice mb-8">
          Os links abaixo levam às instituições. Eles não significam que todas
          essas provas já foram importadas ao Gabaru.
        </div>
        <div className="gb-content-grid">
          {OFFICIAL_SOURCES.map((s) => (
            <article className="gb-content-card" key={s.name}>
              <h2>{s.name}</h2>
              <p>{s.scope}</p>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                Abrir fonte oficial ↗{" "}
                <span className="sr-only">em nova aba</span>
              </a>
            </article>
          ))}
        </div>
        <Link href="/treino" className="gb-button mt-8">
          Abrir treino gratuito ↗
        </Link>
        <p className="mt-6 text-sm text-n5">
          Resumos, videoaulas e simulados corrigidos ainda estão em preparação.
        </p>
      </section>
    </main>
  );
}

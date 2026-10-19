import { PageHero, CONTAINER } from "@/components/ui";
import { PathCards } from "@/components/path-cards";
import { provasDa } from "@/data/provas";
import Link from "next/link";
export const metadata = {
  title: "Vestibulinhos: seu próximo passo",
  description: "Conheça as trilhas de vestibulinho em construção no Gabaru.",
};
export default function Page() {
  return (
    <main>
      <PageHero
        eyebrow="Vestibulinhos"
        titulo={
          <>
            Uma boa base abre <mark>novos caminhos.</mark>
          </>
        }
      >
        <p>
          ETEC, colégios universitários, Colégio Embraer e Institutos Federais
          fazem parte do foco do Gabaru. Cada processo seletivo exige preparação
          própria.
        </p>
      </PageHero><section className={`${CONTAINER} py-8`}><div className="gb-notice"><h2 className="gb-section-title">ETEC · acervo de provas oficiais</h2><p className="mt-3">Explore 41 provas de 2006 a 2026, com 1.990 questões, cadernos integrais e gabaritos oficiais.</p><Link href="/provas/etec" className="gb-button mt-5">Escolher prova e começar ↗</Link></div></section>
      <section className={`${CONTAINER} py-10`}>
        <p className="gb-notice mb-8">
          As trilhas específicas estão em construção. O treino disponível hoje
          utiliza questões do ENEM, que não substituem uma preparação alinhada
          ao edital do seu vestibulinho.
        </p>
        <PathCards items={provasDa("vestibulinho")} />
      </section>
      <section className={`${CONTAINER} py-8`}>
        <h2 className="gb-section-title">Começamos pela fonte.</h2>
        <p className="mt-4 max-w-2xl text-n5">
          Estamos organizando provas, gabaritos e habilidades por instituição e
          edição. Você poderá identificar a origem de cada questão e saber o que
          já foi revisado.
        </p>
        <div className="gb-actions">
          <Link className="gb-button" href="/materiais-gratuitos">
            Consultar fontes oficiais ↗
          </Link>
          <Link href="/treino" className="gb-text-link">
            Experimentar treino ENEM ↗
          </Link>
        </div>
      </section>
    </main>
  );
}

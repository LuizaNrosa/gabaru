import { PageHero, CONTAINER } from "@/components/ui";
import { PathCards } from "@/components/path-cards";
import { provasDa } from "@/data/provas";
import Link from "next/link";
import coluni from "@/data/coluni-exams.json";
export const metadata = {
  title: "Vestibulinhos: seu próximo passo",
  description: "Provas oficiais ETEC e COLUNI/UFV, cadernos completos e gabaritos para praticar vestibulinhos.",
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
      </PageHero><section className={`${CONTAINER} py-8`}><div className="gb-notice"><h2 className="gb-section-title">ETEC · acervo de provas oficiais</h2><p className="mt-3">Explore 41 provas de 2006 a 2026, com 1.990 questões, cadernos integrais e gabaritos oficiais.</p><Link href="/provas/etec" className="gb-button mt-5">Escolher prova e começar ↗</Link></div><div className="gb-notice mt-6"><h2 className="gb-section-title">COLUNI/UFV · acervo de provas oficiais</h2><p className="mt-3">{coluni.length} provas de {coluni.at(-1)?.id} a {coluni[0]?.id}, com {coluni.reduce((n,e)=>n+e.questions.length,0)} questões objetivas, cadernos integrais e gabaritos oficiais.</p><Link href="/provas/coluni" className="gb-button mt-5">Escolher prova COLUNI e começar ↗</Link></div></section>
      <section className={`${CONTAINER} py-10`}>
        <p className="gb-notice mb-8">
          Os acervos oficiais de ETEC e COLUNI estão disponíveis acima. A organização por disciplina está em preparação. O treino ENEM permanece em sua trilha própria.
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

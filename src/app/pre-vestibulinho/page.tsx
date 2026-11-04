import { PageHero, CONTAINER } from "@/components/ui";
import { PathCards } from "@/components/path-cards";
import { provasDa } from "@/data/provas";
import Link from "next/link";
import { VestibulinhoCollection } from "@/components/exam-collection";
import { metaPagina } from "@/lib/seo";
export const metadata = metaPagina({
  titulo: "Vestibulinhos: seu próximo passo",
  descricao: "Provas oficiais de ETEC e COLUNI por instituição e edição, com cadernos e gabaritos.",
  caminho: "/pre-vestibulinho",
});
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
      </PageHero>
      <section id="provas" className={`${CONTAINER} py-10`}><h2 className="gb-section-title mb-6">Provas por instituição</h2><VestibulinhoCollection /></section>
      <section className={`${CONTAINER} py-10`}>
        <p className="gb-notice mb-8">
          Os acervos de ETEC, COLUNI, IFSC e IFSP estão disponíveis nas respectivas seções, com cadernos e gabaritos oficiais. Embraer e os demais Institutos Federais ainda estão em organização.
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


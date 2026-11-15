import Link from "next/link";
import { InstitutoCollection } from "@/components/instituto-collection";
import { CONTAINER, PageHero } from "@/components/ui";
import { metaPagina } from "@/lib/seo";

export const metadata = metaPagina({
  titulo: "Institutos Federais | Provas anteriores por estado",
  descricao: "Encontre provas anteriores e gabaritos dos Institutos Federais por instituto e estado.",
  caminho: "/institutos-federais",
});

export default function InstitutosFederaisPage() {
  return (
    <main>
      <PageHero eyebrow="Institutos Federais" titulo={<>Encontre seu IF. <mark>Pratique com provas anteriores.</mark></>}>
        <p>Escolha o instituto em que você quer estudar. Cada acervo informa quais edições têm caderno, gabarito e resolução no site.</p>
      </PageHero>
      <section className={`${CONTAINER} py-10`} aria-labelledby="institutos">
        <h2 id="institutos" className="gb-section-title mb-6">Institutos por estado</h2>
        <InstitutoCollection />
      </section>
      <div className={`${CONTAINER} pb-10`}>
        <Link href="/materiais-gratuitos" className="gb-text-link">Consultar materiais gratuitos</Link>
      </div>
    </main>
  );
}

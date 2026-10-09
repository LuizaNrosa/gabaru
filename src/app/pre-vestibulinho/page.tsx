import type { Metadata } from "next";
import Link from "next/link";
import { CONTAINER, PageHero } from "@/components/ui";
import { provasDa } from "@/data/provas";

export const metadata: Metadata = {
  title: "Pré-vestibulinho: ETEC, Coluni, Embraer e Institutos Federais",
  description: "Prepare-se para os vestibulinhos de ensino técnico e médio técnico com plano de estudo e banco de questões.",
};

export default function PreVestibulinho() {
  return (
    <main>
      <PageHero eyebrow="Pré-vestibulinho" titulo={<>O primeiro degrau, <mark>bem feito</mark>.</>}>
        <p>Português e Matemática são a base dos vestibulinhos. Começamos pela Matemática, com questões e plano de estudo pensados para quem está terminando o ensino fundamental.</p>
      </PageHero>
      <section className={`${CONTAINER} pt-12`}>
        <ul className="grid gap-4 md:grid-cols-2" role="list">
          {provasDa("vestibulinho").map((p) => (
            <li key={p.slug}>
              <Link href={`/provas/${p.slug}`} className="flex h-full flex-col rounded-lg border border-n2 bg-white/60 p-6 hover:border-ink">
                <span className="text-2xl font-bold">{p.nome}</span>
                <span className="mt-1 text-sm text-n4">{p.completo}</span>
                <span className="mt-3 text-n5">{p.resumo}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

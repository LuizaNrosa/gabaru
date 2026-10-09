import type { Metadata } from "next";
import Link from "next/link";
import { Badge, CONTAINER, PageHero } from "@/components/ui";
import { provasDa } from "@/data/provas";
import { DISCIPLINAS } from "@/data/disciplinas";

export const metadata: Metadata = {
  title: "Pré-vestibular: FUVEST, UNICAMP, UNESP, ITA, IME e militares",
  description: "Disciplinas e provas do pré-vestibular, com Matemática e Física abertas e as demais em breve.",
};

function Grade({ lista }: { lista: ReturnType<typeof provasDa> }) {
  return (
    <ul className="mt-6 grid gap-4 md:grid-cols-3" role="list">
      {lista.map((p) => (
        <li key={p.slug}>
          <Link href={`/provas/${p.slug}`} className="flex h-full flex-col rounded-lg border border-n2 bg-white/60 p-5 hover:border-ink">
            <span className="text-xl font-bold">{p.nome}</span>
            <span className="mt-1 text-sm text-n4">{p.completo}</span>
            <span className="mt-3 text-sm text-n5">{p.resumo}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function PreVestibular() {
  return (
    <main>
      <PageHero eyebrow="Pré-vestibular" titulo={<>Da escola ao <mark>vestibular</mark>, na ordem certa.</>}>
        <p>As provas paulistas cobram quase tudo. O seu plano de estudo parte da prova que você escolheu e do que você já domina.</p>
      </PageHero>

      <section id="disciplinas" className={`${CONTAINER} pt-12`}>
        <h2 className="text-2xl font-bold">Disciplinas</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {DISCIPLINAS.filter((d) => !["ciencias", "raciocinio-logico"].includes(d.slug)).map((d) => (
            <li key={d.slug}>
              <Link href={`/disciplinas/${d.slug}`} className="flex h-full min-h-24 flex-col justify-between rounded-lg border border-n2 bg-white/60 p-4 hover:border-ink">
                <span className="font-bold">{d.nome}</span>
                <span className="mt-3"><Badge status={d.status} /></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="paulistas" className={`${CONTAINER} scroll-mt-28 pt-16`}>
        <h2 className="text-2xl font-bold">Vestibulares paulistas</h2>
        <Grade lista={provasDa("vestibular-paulista")} />
      </section>

      <section id="militares" className={`${CONTAINER} scroll-mt-28 pt-16`}>
        <h2 className="text-2xl font-bold">ITA, IME e militares</h2>
        <Grade lista={provasDa("militar")} />
      </section>
    </main>
  );
}

import Link from "next/link";
import { questionCatalog } from "@/lib/questions";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CONTAINER, PageHero } from "@/components/ui";
import { DISCIPLINAS, disciplinaPorSlug } from "@/data/disciplinas";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return DISCIPLINAS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = disciplinaPorSlug((await params).slug);
  return d ? { title: d.nome, description: d.resumo } : {};
}

export default async function DisciplinaPage({ params }: Props) {
  const d = disciplinaPorSlug((await params).slug);
  if (!d) notFound();
  return (
    <main>
      <PageHero eyebrow="Disciplina" titulo={d.nome}>
        <p>{d.resumo}</p>
        <p className="mt-4 text-sm">
          {questionCatalog.disciplines.find((x) => x.slug === d.slug)?.count ??
            0}{" "}
          questões ENEM no treino atual. Aulas e materiais em preparação.
        </p>
      </PageHero>
      <section className={`${CONTAINER} pt-10`}>
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold">O que vamos cobrir</h2>
          <ul className="mt-4 grid gap-2" role="list">
            {d.topicos.map((t) => (
              <li key={t} className="border-l-2 border-ink pl-4 text-n5">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className={`${CONTAINER} pt-12`}>
        {d.status === "em-breve" && (
          <p className="mb-6 max-w-2xl text-n5">
            Esta disciplina já tem lugar na plataforma e abre depois de
            Matemática e Física. Os materiais serão apresentados nesta página
            quando disponíveis.
          </p>
        )}
        <Link href={`/treino?disciplina=${d.slug}`} className="gb-button">
          Ver questões desta disciplina ↗
        </Link>
      </section>
    </main>
  );
}

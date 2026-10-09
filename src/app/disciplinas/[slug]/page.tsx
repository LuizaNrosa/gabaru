import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, CONTAINER, CtaCadastro, PageHero } from "@/components/ui";
import { DISCIPLINAS, disciplinaPorSlug } from "@/data/disciplinas";
import { PROVAS } from "@/data/provas";

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
  const provas = PROVAS.filter((p) => p.disciplinas.includes(d.slug));
  return (
    <main>
      <PageHero eyebrow="Disciplina" titulo={d.nome}>
        <p>{d.resumo}</p>
        <p className="mt-4"><Badge status={d.status} /></p>
      </PageHero>
      <section className={`${CONTAINER} grid gap-12 pt-10 lg:grid-cols-2`}>
        <div>
          <h2 className="text-2xl font-bold">O que vamos cobrir</h2>
          <ul className="mt-4 grid gap-2" role="list">
            {d.topicos.map((t) => <li key={t} className="border-l-2 border-ink pl-4 text-n5">{t}</li>)}
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Provas que cobram {d.nome}</h2>
          <ul className="mt-4 flex flex-wrap gap-2" role="list">
            {provas.map((p) => (
              <li key={p.slug}>
                <Link href={`/provas/${p.slug}`} className="inline-flex min-h-11 items-center rounded-full border border-ink px-4 font-mono text-sm font-semibold hover:bg-ink hover:text-paper">{p.nome}</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className={`${CONTAINER} pt-12`}>
        {d.status === "em-breve" && <p className="mb-6 max-w-2xl text-n5">Esta disciplina já tem lugar na plataforma e abre depois de Matemática e Física. Crie a conta para ser avisado.</p>}
        <CtaCadastro />
      </section>
    </main>
  );
}

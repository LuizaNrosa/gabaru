import type { Metadata } from "next";
import Link from "next/link";
import { Badge, CONTAINER, CtaCadastro, PageHero } from "@/components/ui";
import { DISCIPLINAS } from "@/data/disciplinas";

export const metadata: Metadata = {
  title: "Concursos",
  description: "Preparação para concursos públicos, começando por Raciocínio lógico e Matemática.",
};

const COMUNS = [
  ...DISCIPLINAS.filter((d) => ["raciocinio-logico", "matematica", "portugues"].includes(d.slug)),
];

export default function Concursos() {
  return (
    <main>
      <PageHero eyebrow="Concursos" titulo={<>Concurso também é <mark>mapa</mark> e plano.</>}>
        <p>A mesma lógica do ENEM vale para concursos: descobrir o que falta e estudar nessa ordem. Abrimos com Raciocínio lógico e Matemática.</p>
        <p className="mt-4"><Badge status="em-breve" /></p>
      </PageHero>
      <section className={`${CONTAINER} pt-12`}>
        <h2 className="text-2xl font-bold">Disciplinas que mais se repetem</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3" role="list">
          {COMUNS.map((d) => (
            <li key={d.slug}>
              <Link href={`/disciplinas/${d.slug}`} className="flex min-h-24 flex-col justify-between rounded-lg border border-n2 bg-white/60 p-4 hover:border-ink">
                <span className="font-bold">{d.nome}</span>
                <span className="mt-3"><Badge status={d.status} /></span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-2xl text-sm text-n4">Cada concurso tem o seu edital e a sua banca. Vamos organizar o estudo por concurso e por banca à medida que cada um abrir.</p>
        <div className="mt-8"><CtaCadastro texto="Criar conta e ser avisado" /></div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { CONTAINER, CartaoLogo, Eyebrow, FotoUniversidade } from "@/components/ui";
import { provasDa } from "@/data/provas";
import { UNIVERSIDADES } from "@/data/universidades";

export const metadata: Metadata = {
  title: "Pré-vestibulinho: ETEC, Coluni, Embraer e Institutos Federais",
  description: "Prepare-se para os vestibulinhos de ensino técnico e médio técnico com questões oficiais e cronograma individualizado.",
};

export default function PreVestibulinho() {
  const vestibulares = UNIVERSIDADES.filter((u) => u.slug !== "federal");

  return (
    <main>
      <section className={`${CONTAINER} pt-6 sm:pt-10`}>
        <div className="grid grid-cols-1 gap-10 rounded-2xl bg-ink p-6 text-paper sm:p-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
          <div>
            <Eyebrow claro>Pré-vestibulinho</Eyebrow>
            <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
              O primeiro degrau, <span className="text-gold">bem feito</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg opacity-85">
              Português e Matemática são a base dos vestibulinhos. Começamos pela Matemática, com questões oficiais e um cronograma pensado para quem está terminando o ensino fundamental.
            </p>
          </div>
          <CartaoLogo src="/universidades/cps.png" alt="Logo do Centro Paula Souza" legenda="Centro Paula Souza · Etecs e Fatecs" />
        </div>
      </section>

      <section className={`${CONTAINER} pt-16`} aria-labelledby="provas">
        <Eyebrow>Escolha a sua prova</Eyebrow>
        <h2 id="provas" className="mt-3 text-3xl font-bold sm:text-4xl">Vestibulinhos</h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-2" role="list">
          {provasDa("vestibulinho").map((p) => (
            <li key={p.slug}>
              <Link href={`/provas/${p.slug}`} className="group flex h-full flex-col rounded-xl border border-n2 bg-white/60 p-6 transition hover:border-ink hover:shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-2xl font-bold">{p.nome}</span>
                  {p.confirmar && (
                    <span className="shrink-0 rounded border border-n3 px-2 py-0.5 font-mono text-[11px] font-bold uppercase text-n4">Edital em mapeamento</span>
                  )}
                </div>
                <span className="mt-1 text-sm text-n4">{p.completo}</span>
                <span className="mt-3 text-n5">{p.resumo}</span>
                <span className="mt-auto pt-5 text-sm font-semibold text-ink group-hover:underline">Ver a prova →</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${CONTAINER} pt-20`} aria-labelledby="depois">
        <Eyebrow>Depois do vestibulinho</Eyebrow>
        <h2 id="depois" className="mt-3 max-w-2xl text-3xl font-bold sm:text-4xl">Das Etecs às universidades paulistas.</h2>
        <p className="mt-3 max-w-2xl text-n5">Quem começa pelo vestibulinho pode seguir para o vestibular. O banco de questões é o mesmo, com a estrutura de cada prova.</p>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
          {vestibulares.map((u) => <FotoUniversidade key={u.slug} {...u} />)}
        </div>
      </section>
    </main>
  );
}

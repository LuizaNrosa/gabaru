import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { QuestaoDemo } from "@/components/questao-demo";

const PROVAS = [
  "ETEC", "Embraer", "Coluni", "IF", "ENEM", "FUVEST", "UNICAMP",
  "UNESP", "ITA", "IME", "EsPCEx", "EEAR", "Concursos",
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <section className="pt-16 sm:pt-24">
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
            A gente estuda junto até você <mark>gabaritar</mark>.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-n5">
            Matemática e física para vestibulinhos, vestibulares, militares e concursos.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#questao"
              className="inline-flex min-h-12 items-center rounded-md bg-rosa px-6 font-semibold text-white hover:opacity-90"
            >
              Fazer a primeira questão
            </a>
            <span className="text-sm text-n4">Sem cadastro para começar.</span>
          </div>
        </section>

        <section id="questao" className="scroll-mt-8 pt-16">
          <QuestaoDemo />
        </section>

        <section className="pt-20">
          <h2 className="text-2xl font-bold sm:text-3xl">Qual é a sua prova?</h2>
          <ul className="mt-6 flex flex-wrap gap-2" role="list">
            {PROVAS.map((p) => (
              <li
                key={p}
                className="min-h-10 rounded-full border border-ink px-4 py-2 font-mono text-sm font-semibold"
              >
                {p}
              </li>
            ))}
          </ul>
        </section>

        <section className="pt-20">
          <h2 className="text-2xl font-bold sm:text-3xl">Como ler a bolinha</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3" role="list">
            <li className="flex items-center gap-3">
              <span className="size-8 rounded-full border-2 border-ink" aria-hidden="true" />
              Ainda não respondida.
            </li>
            <li className="flex items-center gap-3">
              <span className="size-8 rounded-full bg-ink" aria-hidden="true" />
              Alternativa certa, preenchida: gabaritou.
            </li>
            <li className="flex items-center gap-3">
              <span className="relative size-8 rounded-full ring-2 ring-anil" aria-hidden="true">
                <span className="absolute left-1 right-1 top-1/2 h-0.5 -rotate-45 bg-anil" />
              </span>
              Errou: riscada, e a gente explica o porquê.
            </li>
          </ul>
        </section>

        <section className="pt-20">
          <div className="rounded-lg bg-ink p-8 text-paper sm:p-12">
            <h2 className="max-w-xl text-3xl font-bold">Crie sua conta e guarde seu progresso.</h2>
            <Link
              href="/cadastro"
              className="mt-6 inline-flex min-h-12 items-center rounded-md bg-rosa px-6 font-semibold text-white hover:opacity-90"
            >
              Criar conta
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

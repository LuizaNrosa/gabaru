import type { Metadata } from "next";
import { CONTAINER, CtaCadastro, Eyebrow, PageHero } from "@/components/ui";
import { PLANOS } from "@/data/banco";
import { EM_CONSTRUCAO } from "@/lib/construcao";

export const metadata: Metadata = {
  title: "Planos",
  description: "Plano Básico e Elite do Gabaru, com banco de questões oficiais e cronograma de estudo individualizado.",
};

export default function Planos() {
  return (
    <main>
      <PageHero eyebrow="Planos" titulo={<>Escolha o caminho até a <mark>aprovação</mark>.</>}>
        <p>Os dois planos têm o banco de questões oficiais e o cronograma feito para você. O Elite soma aulas e a resolução passo a passo.</p>
      </PageHero>

      <section className={`${CONTAINER} pt-12`}>
        <ul className="grid gap-6 md:grid-cols-2" role="list">
          {PLANOS.map((p) => (
            <li
              key={p.slug}
              className={`flex flex-col rounded-2xl p-7 sm:p-9 ${p.destaque ? "bg-ink text-paper" : "border border-n2 bg-white/60"}`}
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold">{p.nome}</h2>
                {p.destaque && (
                  <span className="rounded bg-gold px-2.5 py-1 font-mono text-[11px] font-bold uppercase text-ink">Mais completo</span>
                )}
              </div>

              <p className="mt-6 font-mono text-5xl font-bold tracking-tight">
                <span className={p.destaque ? "text-gold" : ""}>{p.parcelas}x</span> de {p.valorParcela}
              </p>
              <p className={`mt-2 text-sm ${p.destaque ? "opacity-80" : "text-n4"}`}>
                Em {p.parcelas} parcelas mensais.
              </p>

              {p.aulas && (
                <p className={`mt-6 text-sm font-semibold ${p.destaque ? "text-gold" : ""}`}>{p.aulas} aulas incluídas</p>
              )}

              <ul className="mt-6 grid gap-3" role="list">
                {p.itens.map((i) => (
                  <li key={i} className="flex gap-3">
                    <span aria-hidden="true" className={p.destaque ? "text-gold" : "text-anil"}>✓</span>
                    <span className={p.destaque ? "opacity-90" : "text-n5"}>{i}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <CtaCadastro texto={EM_CONSTRUCAO ? "Quero ser avisado do lançamento" : "Criar conta e escolher o plano"} />
          <p className="text-sm text-n4">{EM_CONSTRUCAO ? "Valores previstos para o lançamento. Ainda não há vendas." : "Confira os valores antes de contratar."}</p>
        </div>
      </section>

      <section className={`${CONTAINER} pt-20`}>
        <Eyebrow>Dúvidas</Eyebrow>
        <h2 className="mt-3 text-3xl font-bold">Qual plano é o meu?</h2>
        <p className="mt-3 max-w-2xl text-n5">
          Se você já sabe o que estudar e quer treinar com questões oficiais, o Básico resolve. Se quer aulas e o passo a passo de cada questão difícil, escolha o Elite.
        </p>
      </section>
    </main>
  );
}

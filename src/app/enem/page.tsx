import Link from "next/link";
import type { Metadata } from "next";
import { CONTAINER, CtaCadastro, PageHero } from "@/components/ui";
import { MATRIZ_ENEM, type AreaEnem } from "@/data/enem-matriz";
import { metaPagina } from "@/lib/seo";

export const metadata: Metadata = metaPagina({
  titulo: "ENEM: Matriz de Referência por habilidade",
  descricao:
    "As 120 habilidades da Matriz de Referência do ENEM, organizadas para você estudar só o que precisa.",
  caminho: "/enem",
});

export default function EnemPage() {
  const areas = Object.entries(MATRIZ_ENEM) as [
    AreaEnem,
    (typeof MATRIZ_ENEM)[AreaEnem],
  ][];
  return (
    <main>
      <PageHero
        eyebrow="ENEM"
        titulo={
          <>
            Todas as <mark>120 habilidades</mark> do ENEM, no seu mapa.
          </>
        }
      >
        <p>
          A Matriz de Referência do INEP organiza a prova em quatro áreas e 30
          habilidades por área. No Gabaru, cada questão é marcada com a sua
          habilidade como organização de estudo. O acompanhamento de domínio
          ainda está em desenvolvimento.
        </p>
      </PageHero>

      <section className={`${CONTAINER} pt-12`}>
        <h2 className="gb-section-title">Provas do ENEM por ano</h2>
        <p className="mt-4 text-n5">Cadernos incorporados e acesso às edições oficiais do Inep, de 1998 a 2025.</p>
        <Link href="/provas/enem" className="gb-button mt-5">Abrir acervo de provas ↗</Link>
      </section>
      <section className={`${CONTAINER} pt-12`}>
        <ol className="grid gap-4 md:grid-cols-3" role="list">
          <li className="rounded-lg border border-n2 bg-white/60 p-5">
            <h2 className="font-bold">Questão marcada</h2>
            <p className="mt-2 text-sm text-n5">
              Cada questão do banco aponta para uma habilidade (H1 a H30) e para
              a sua área.
            </p>
          </li>
          <li className="rounded-lg border border-n2 bg-white/60 p-5">
            <h2 className="font-bold">Domínio · planejado</h2>
            <p className="mt-2 text-sm text-n5">
              Recurso planejado: um indicador por habilidade baseado nas
              respostas verificadas.
            </p>
          </li>
          <li className="rounded-lg border border-n2 bg-white/60 p-5">
            <h2 className="font-bold">Plano · planejado</h2>
            <p className="mt-2 text-sm text-n5">
              Recurso planejado: priorização das habilidades que precisam de
              atenção.
            </p>
          </li>
        </ol>
        <p className="mt-4 text-sm text-n4">
          O banco de questões e a área do aluno estão em construção. Matemática
          é a primeira área a abrir.
        </p>
      </section>

      <section className={`${CONTAINER} pt-14`}>
        <div className="grid gap-6">
          {areas.map(([slug, a]) => (
            <article
              key={slug}
              id={slug}
              className="scroll-mt-28 rounded-lg border border-n2 bg-white/60 p-5 sm:p-8"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-2xl font-bold">{a.nome}</h2>
                <p className="font-mono text-sm text-n4">
                  {a.sigla} · {a.habilidades.length} habilidades ·{" "}
                  {a.competencias.length} competências
                </p>
              </div>
              <div className="mt-6 grid gap-3">
                {a.competencias.map((c) => (
                  <details
                    key={c.n}
                    className="group rounded-md border border-n2 bg-paper p-4"
                  >
                    <summary className="flex min-h-11 cursor-pointer items-start justify-between gap-4 font-semibold">
                      <span>
                        <span className="mr-2 font-mono text-n4">C{c.n}</span>
                        {c.texto}
                      </span>
                      <span
                        className="font-mono group-open:rotate-45"
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </summary>
                    <ul
                      className="mt-3 grid gap-2 border-t border-n2 pt-3"
                      role="list"
                    >
                      {a.habilidades
                        .filter((h) => h.competencia === c.n)
                        .map((h) => (
                          <li key={h.n} className="flex gap-3 text-sm">
                            <span className="mt-0.5 grid h-7 min-w-9 shrink-0 place-items-center rounded-full border-2 border-ink px-1 font-mono text-[11px] font-bold">
                              H{h.n}
                            </span>
                            <span className="text-n5">{h.texto}</span>
                          </li>
                        ))}
                    </ul>
                  </details>
                ))}
              </div>
            </article>
          ))}
        </div>
        <p className="mt-6 text-sm text-n4">
          Fonte: Matriz de Referência do ENEM, INEP/MEC.
        </p>
        <div className="mt-8">
          <CtaCadastro texto="Criar conta" />
        </div>
      </section>
    </main>
  );
}


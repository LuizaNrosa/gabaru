import Link from "next/link";
import type { Metadata } from "next";
import { CONTAINER, CtaCadastro, PageHero } from "@/components/ui";
import { MATRIZ_ENEM, type AreaEnem } from "@/data/enem-matriz";
import { metaPagina } from "@/lib/seo";

export const metadata: Metadata = metaPagina({
  titulo: "Estude para o ENEM: provas, treino e habilidades",
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
            Prepare-se para o ENEM. <mark>Pratique no seu ritmo.</mark>
          </>
        }
      >
        <p>
          Resolva questões por disciplina, consulte cadernos anteriores e explore as 120 habilidades da matriz do Inep.
        </p>
        <div className="gb-actions">
          <Link href="/treino" className="gb-button">Treinar por disciplina</Link>
          <Link href="/provas/enem" className="gb-text-link">Escolher uma prova do ENEM</Link>
        </div>
      </PageHero>

      <section className={`${CONTAINER} pt-14`} aria-labelledby="matriz-enem">
        <h2 id="matriz-enem" className="gb-section-title mb-6">Matriz de Referência do ENEM</h2>
        <div className="grid gap-6">
          {areas.map(([slug, a]) => (
            <article
              key={slug}
              id={slug}
              className="scroll-mt-28 rounded-lg border border-n2 bg-white/60 p-5 sm:p-8"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-2xl font-bold">{a.nome}</h3>
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


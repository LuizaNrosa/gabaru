import type { Metadata } from "next";
import { CONTAINER, CtaCadastro, Eyebrow, PageHero } from "@/components/ui";
import { QUESTOES_GRATIS } from "@/data/questoes-gratis";

export const metadata: Metadata = {
  title: "Questões grátis",
  description:
    "Questões oficiais do ENEM para treinar de graça, com a habilidade da Matriz de cada uma.",
};

export default function QuestoesGratis() {
  return (
    <main>
      <PageHero
        eyebrow="Questões grátis"
        titulo={
          <>
            Treine com questões <mark>oficiais</mark>, sem pagar.
          </>
        }
      >
        <p>
          Estas são questões reais do ENEM, de 2020 a 2025. A integração dos
          gabaritos oficiais está pendente; estas questões ainda não têm
          correção automática no Gabaru.
        </p>
      </PageHero>

      <section className={`${CONTAINER} pt-12`} aria-label="Lista de questões">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {QUESTOES_GRATIS.map((q) => (
            <li
              key={q.id}
              className="flex flex-col overflow-hidden rounded-xl border border-n2 bg-white/70"
            >
              <div className="flex items-center justify-between gap-3 border-b border-n2 px-5 py-3">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-n4">
                  ENEM {q.ano} · dia {q.dia}
                </span>
                <span className="font-mono text-xs font-bold text-n4">
                  Questão {q.numero}
                </span>
              </div>
              <div className="flex flex-1 items-center justify-center bg-paper p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={q.img}
                  width={q.w}
                  height={q.h}
                  alt={`Questão ${q.numero} do ENEM ${q.ano}, dia ${q.dia}`}
                  loading="lazy"
                  className="h-auto max-h-72 w-auto max-w-full"
                />
              </div>
              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <p className="text-sm text-n5">{q.tema}</p>
                <span className="shrink-0 rounded border border-n3 px-2.5 py-1 font-mono text-[11px] font-bold uppercase text-n4">
                  Gabarito em breve
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${CONTAINER} pt-16 pb-4`}>
        <div className="rounded-2xl bg-ink p-8 text-paper sm:p-12">
          <Eyebrow claro>Próximo passo</Eyebrow>
          <h2 className="mt-3 max-w-xl text-3xl font-bold">
            Continue com uma sessão de treino.
          </h2>
          <p className="mt-3 max-w-xl opacity-85">
            Escolha uma disciplina no treino gratuito. Histórico e cronograma
            individual ainda estão em desenvolvimento.
          </p>
          <div className="mt-6">
            <a href="/treino" className="gb-button gb-button-light">
              Abrir treino ↗
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

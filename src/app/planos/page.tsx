import type { Metadata } from "next";
import { Badge, CONTAINER, CtaCadastro, PageHero } from "@/components/ui";

export const metadata: Metadata = { title: "Planos" };

const PLANOS = [
  {
    nome: "Gratuito",
    itens: ["Primeira questão e questões abertas", "Materiais gratuitos", "Guia das provas"],
  },
  {
    nome: "Aluno",
    itens: ["Banco de questões completo", "Mapa de habilidades do ENEM", "Plano de estudo personalizado", "Revisão dos erros", "Simulados"],
  },
];

export default function Planos() {
  return (
    <main>
      <PageHero eyebrow="Planos" titulo={<>Um plano que cabe no <mark>bolso</mark>.</>}>
        <p>Os valores de lançamento serão divulgados quando a área do aluno abrir. Crie a conta para ser avisado.</p>
      </PageHero>
      <section className={`${CONTAINER} pt-12`}>
        <ul className="grid max-w-4xl gap-4 md:grid-cols-2" role="list">
          {PLANOS.map((p) => (
            <li key={p.nome} className="rounded-lg border border-n2 bg-white/60 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{p.nome}</h2>
                {p.nome === "Aluno" && <Badge status="em-breve" />}
              </div>
              <ul className="mt-4 grid gap-2" role="list">
                {p.itens.map((i) => (
                  <li key={i} className="flex gap-2 text-n5"><span aria-hidden="true">✓</span>{i}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <div className="mt-8"><CtaCadastro /></div>
      </section>
    </main>
  );
}

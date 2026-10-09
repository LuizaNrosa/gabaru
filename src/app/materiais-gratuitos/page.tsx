import type { Metadata } from "next";
import { Badge, CONTAINER, PageHero } from "@/components/ui";

export const metadata: Metadata = { title: "Materiais gratuitos" };

const ITENS = [
  ["Questões resolvidas", "Questões com resolução passo a passo e a habilidade do ENEM de cada uma."],
  ["Resumos por tema", "Uma página por assunto, com o que cai e como cai."],
  ["Simulado de diagnóstico", "Descubra por onde começar o seu plano de estudo."],
  ["Guia das provas", "A estrutura de cada vestibular e vestibulinho, em linguagem simples."],
];

export default function Materiais() {
  return (
    <main>
      <PageHero eyebrow="Materiais gratuitos" titulo={<>Comece a estudar sem <mark>pagar</mark>.</>}>
        <p>Estamos preparando o conteúdo aberto, começando por Matemática e Física. Enquanto isso, a primeira questão da página inicial já funciona sem cadastro.</p>
      </PageHero>
      <section className={`${CONTAINER} pt-12`}>
        <ul className="grid gap-4 md:grid-cols-2" role="list">
          {ITENS.map(([t, d]) => (
            <li key={t} className="rounded-lg border border-n2 bg-white/60 p-6">
              <Badge status="em-breve" />
              <h2 className="mt-3 text-xl font-bold">{t}</h2>
              <p className="mt-2 text-n5">{d}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

import Link from "next/link";
import { PageHero, CONTAINER } from "@/components/ui";
export const metadata = { title: "Planos e lançamento" };
export default function Page() {
  return (
    <main>
      <PageHero
        eyebrow="Planos"
        titulo={
          <>
            Primeiro, uma experiência
            <br />
            <mark>que faça diferença.</mark>
          </>
        }
      >
        <p>
          Estamos construindo o Gabaru. Ainda não há planos à venda, preços
          definitivos ou cobranças disponíveis.
        </p>
      </PageHero>
      <section className={`${CONTAINER} py-10`}>
        <div className="gb-content-grid">
          <article className="gb-content-card">
            <p className="gb-eyebrow">DISPONÍVEL AGORA</p>
            <h2>Treino gratuito</h2>
            <p>
              Questões ENEM por disciplina e sessões de 30, 60 ou 90 questões,
              sem cadastro. Gabaritos e resoluções em preparação.
            </p>
            <Link href="/treino" className="gb-button">
              Experimentar ↗
            </Link>
          </article>
          <article className="gb-content-card">
            <p className="gb-eyebrow">EM DESENVOLVIMENTO</p>
            <h2>Preparação com direção</h2>
            <p>
              Diagnóstico, plano individual, revisão e histórico são recursos
              planejados. Condições comerciais serão apresentadas quando
              estiverem prontos.
            </p>
            <Link href="/sobre">Conhecer o projeto ↗</Link>
          </article>
        </div>
      </section>
    </main>
  );
}

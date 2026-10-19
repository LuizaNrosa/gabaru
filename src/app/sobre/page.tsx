import type { Metadata } from "next";
import { CONTAINER, CtaCadastro, PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "Sobre nós",
  description:
    "Por que o Gabaru existe e como pensamos o estudo para vestibulinhos, vestibulares, ENEM e concursos.",
};

export default function Sobre() {
  return (
    <main>
      <PageHero
        eyebrow="Sobre nós"
        titulo={
          <>
            A gente estuda junto até você <mark>gabaritar</mark>.
          </>
        }
      >
        <p>
          O Gabaru nasce de uma ideia simples: ninguém precisa estudar o que já
          sabe. Preparar-se para uma prova é descobrir o que falta e dedicar o
          tempo a isso.
        </p>
      </PageHero>

      <section className={`${CONTAINER} grid gap-12 pt-14 lg:grid-cols-2`}>
        <div>
          <h2 className="text-2xl font-bold">Por que o Gabaru existe</h2>
          <p className="mt-4 text-n5">
            Estudar exige tempo e direção. Queremos ajudar cada estudante a
            reconhecer suas dificuldades e organizar a prática em torno do
            objetivo que escolheu.
          </p>
          <p className="mt-4 text-n5">
            Nós partimos da Matriz de Referência do ENEM, com 120 habilidades, e
            do banco de questões marcado por habilidade. Esse é o ponto de
            partida para o diagnóstico e o plano individual que estamos
            desenvolvendo.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Como pensamos o estudo</h2>
          <ul className="mt-4 grid gap-4" role="list">
            <li>
              <h3 className="font-bold">Diagnóstico antes de conteúdo</h3>
              <p className="mt-1 text-n5">
                Queremos identificar dificuldades antes de sugerir uma sequência
                de estudo.
              </p>
            </li>
            <li>
              <h3 className="font-bold">O erro ensina</h3>
              <p className="mt-1 text-n5">
                Resoluções próprias revisadas e revisão dos erros fazem parte do
                projeto.
              </p>
            </li>
            <li>
              <h3 className="font-bold">Transparência</h3>
              <p className="mt-1 text-n5">
                Diferenciamos recursos disponíveis de funcionalidades
                planejadas.
              </p>
            </li>
            <li>
              <h3 className="font-bold">Acessível</h3>
              <p className="mt-1 text-n5">
                Queremos que o preparo de qualidade caiba no bolso de quem
                estuda.
              </p>
            </li>
          </ul>
        </div>
      </section>

      <section className={`${CONTAINER} pt-16`}>
        <h2 className="text-2xl font-bold">Por onde começamos</h2>
        <p className="mt-4 max-w-2xl text-n5">
          O treino público atual reúne questões do ENEM. As trilhas específicas
          e a correção estão em construção. Português, Redação, Química,
          Biologia, História, Geografia e Inglês entram em seguida, e concursos
          logo depois.
        </p>
        <div className="mt-8">
          <CtaCadastro />
        </div>
      </section>
    </main>
  );
}

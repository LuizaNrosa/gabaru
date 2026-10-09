import type { Metadata } from "next";
import { CONTAINER, CtaCadastro, PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "Sobre nós",
  description: "Por que o Gabaru existe e como pensamos o estudo para vestibulinhos, vestibulares, ENEM e concursos.",
};

export default function Sobre() {
  return (
    <main>
      <PageHero eyebrow="Sobre nós" titulo={<>A gente estuda junto até você <mark>gabaritar</mark>.</>}>
        <p>O Gabaru nasce de uma ideia simples: ninguém precisa estudar o que já sabe. Preparar-se para uma prova é descobrir o que falta e dedicar o tempo a isso.</p>
      </PageHero>

      <section className={`${CONTAINER} grid gap-12 pt-14 lg:grid-cols-2`}>
        <div>
          <h2 className="text-2xl font-bold">Por que o Gabaru existe</h2>
          <p className="mt-4 text-n5">Os cursos preparatórios costumam entregar a mesma grade para todos os alunos. Quem já domina um assunto gasta tempo nele, e quem tem uma lacuna segue adiante sem resolvê-la.</p>
          <p className="mt-4 text-n5">Nós partimos da Matriz de Referência do ENEM, com 120 habilidades, e do banco de questões marcado por habilidade. Com isso, o seu mapa mostra o que está firme e o que precisa de treino.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Como pensamos o estudo</h2>
          <ul className="mt-4 grid gap-4" role="list">
            <li><h3 className="font-bold">Diagnóstico antes de conteúdo</h3><p className="mt-1 text-n5">Primeiro medimos, depois montamos o plano.</p></li>
            <li><h3 className="font-bold">O erro ensina</h3><p className="mt-1 text-n5">Toda alternativa errada traz a explicação do porquê. O erro vira revisão.</p></li>
            <li><h3 className="font-bold">Transparência</h3><p className="mt-1 text-n5">Mostramos os seus números reais. Sem promessas que não conseguimos comprovar.</p></li>
            <li><h3 className="font-bold">Acessível</h3><p className="mt-1 text-n5">Queremos que o preparo de qualidade caiba no bolso de quem estuda.</p></li>
          </ul>
        </div>
      </section>

      <section className={`${CONTAINER} pt-16`}>
        <h2 className="text-2xl font-bold">Por onde começamos</h2>
        <p className="mt-4 max-w-2xl text-n5">Abrimos com Matemática e Física, para vestibulinhos, ENEM, vestibulares e provas militares. Português, Redação, Química, Biologia, História, Geografia e Inglês entram em seguida, e concursos logo depois.</p>
        <div className="mt-8"><CtaCadastro /></div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { CONTAINER, PageHero } from "@/components/ui";
import { metaPagina } from "@/lib/seo";

export const metadata: Metadata = metaPagina({
  titulo: "Sobre o Gabaru e seus criadores",
  descricao: "Conheça Luiza e Felipe Nascimento Rosa e a proposta do Gabaru: estudar com provas reais, acesso gratuito e informação clara, do vestibulinho ao vestibular.",
  caminho: "/sobre",
});

export default function Sobre() {
  return (
    <main>
      <PageHero eyebrow="Sobre o Gabaru" titulo={<>Estudo de verdade. <mark>Direto ao ponto.</mark></>}>
        <p>O Gabaru existe para aproximar o estudante da prova que ele quer conquistar. Do vestibulinho ao ENEM e aos vestibulares, acreditamos em prática, informação clara e oportunidades para aprender.</p>
      </PageHero>

      <section className={`${CONTAINER} grid gap-12 pt-14 lg:grid-cols-2`}>
        <div>
          <h2 className="text-2xl font-bold">Por que criamos o Gabaru</h2>
          <p className="mt-4 text-n5">Estudar exige tempo, esforço e direção. Queremos que cada pessoa encontre provas anteriores, pratique no próprio site e entenda melhor o caminho até o seu objetivo.</p>
          <p className="mt-4 text-n5">Estamos construindo uma plataforma brasileira para quem se prepara para vestibulinhos, Institutos Federais, ENEM e vestibulares — com acesso gratuito ao treino disponível e materiais próprios em desenvolvimento.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Como pensamos o estudo</h2>
          <ul className="mt-4 grid gap-4" role="list">
            <li><h3 className="font-bold">Praticar com propósito</h3><p className="mt-1 text-n5">Provas anteriores ajudam a reconhecer o estilo das questões e a transformar conteúdo em prática.</p></li>
            <li><h3 className="font-bold">Aprender com os erros</h3><p className="mt-1 text-n5">Revisar as respostas é parte do estudo. Estamos desenvolvendo recursos para tornar esse processo cada vez mais útil.</p></li>
            <li><h3 className="font-bold">Informação que merece confiança</h3><p className="mt-1 text-n5">Dados de provas e notas de corte precisam de fonte e contexto. Onde ainda não há conferência suficiente, dizemos isso com clareza.</p></li>
            <li><h3 className="font-bold">Acesso para todos</h3><p className="mt-1 text-n5">Queremos que estudantes de diferentes lugares encontrem preparação acessível e possam começar a treinar gratuitamente.</p></li>
          </ul>
        </div>
      </section>

      <section className={`${CONTAINER} pt-16`} aria-labelledby="criadores">
        <p className="gb-eyebrow">QUEM ESTÁ POR TRÁS</p>
        <h2 id="criadores" className="gb-section-title mt-3">Conheça os criadores</h2>
        <p className="mt-4 max-w-3xl text-n5">Luiza e Felipe Nascimento Rosa são um casal unido pela educação e pela vontade de construir uma ferramenta que faça diferença na vida de quem estuda.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <article className="gb-content-card"><h3 className="text-xl font-bold">Luiza Nascimento Rosa</h3><p>Formada em Matemática, Luiza atua como professora em diferentes ambientes e é entusiasta de design e programação. No Gabaru, reúne educação e tecnologia para criar uma experiência clara e acolhedora para o estudante.</p></article>
          <article className="gb-content-card"><h3 className="text-xl font-bold">Felipe Nascimento Rosa</h3><p>Matemático de formação e professor, Felipe é entusiasta de Filosofia e Linguística. Seu interesse pelo conhecimento e pela linguagem contribui para uma abordagem de estudo que valoriza compreensão e clareza.</p></article>
        </div>
        <p className="mt-6 max-w-3xl text-n5">Juntos, Luiza e Felipe trabalham para fazer do Gabaru a melhor plataforma de vestibulinhos e vestibulares do país: sem complicação desnecessária, com compromisso de entregar o que prometem e melhorar a cada etapa.</p>
      </section>

      <section className={`${CONTAINER} py-16`}>
        <h2 className="text-2xl font-bold">Comece pelo seu objetivo</h2>
        <p className="mt-4 max-w-2xl text-n5">Escolha uma prova no acervo, resolva questões e acompanhe as ferramentas disponíveis. O Gabaru está no início, e seu desenvolvimento continua.</p>
        <div className="gb-actions"><Link href="/provas" className="gb-button">Escolher uma prova →</Link><Link href="/nota-de-corte" className="gb-text-link">Consultar nota de corte →</Link></div>
      </section>
    </main>
  );
}

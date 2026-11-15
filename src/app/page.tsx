import Link from "next/link";
import type { Metadata } from "next";
import { metaHome } from "@/lib/seo";

export const metadata: Metadata = metaHome();

const caminhos = [
  { titulo: "ETEC", texto: "Resolva provas anteriores do Vestibulinho e consulte nota de corte e demanda.", href: "/etec" },
  { titulo: "Institutos Federais", texto: "Encontre provas e gabaritos do seu IF por estado.", href: "/institutos-federais" },
  { titulo: "ENEM", texto: "Pratique por disciplina e explore as provas por ano.", href: "/enem" },
  { titulo: "Vestibulares paulistas", texto: "Estude para a FUVEST, Unesp (Vunesp) e Unicamp.", href: "/vestibulares-paulistas" },
];

export default function Home() {
  return (
    <main className="gb-home">
      <section className="gb-hero gb-container" aria-labelledby="gb-title">
        <div className="gb-hero-copy">
          <p className="gb-eyebrow"><span className="gb-live-dot" /> SEU PRÓXIMO PASSO COMEÇA AQUI</p>
          <h1 id="gb-title">ENEM, vestibulinhos e vestibulares. <em>É com Gabaru.</em></h1>
          <p className="gb-lead">Estude com provas oficiais e questões de edições anteriores. Escolha seu objetivo e comece a praticar de graça.</p>
          <div className="gb-actions">
            <Link className="gb-button" href="/provas">Escolher minha prova <span aria-hidden="true">→</span></Link>
            <Link className="gb-text-link" href="/treino">Treinar questões do ENEM <span aria-hidden="true">→</span></Link>
          </div>
          <p className="gb-footnote">Grátis para começar, sem cadastro.</p>
        </div>
        <div className="gb-hero-choice" aria-label="Escolha seu objetivo">
          <p className="gb-eyebrow">ESCOLHA SEU CAMINHO</p>
          <h2>Qual é a sua próxima prova?</h2>
          <div className="gb-choice-list">
            {caminhos.map((item) => <Link key={item.href} href={item.href} className="gb-choice">
              <span className="gb-choice-number" aria-hidden="true">·</span><span><strong>{item.titulo}</strong><small>{item.texto}</small></span><span className="gb-choice-arrow" aria-hidden="true">→</span>
            </Link>)}
          </div>
        </div>
      </section>
      <section className="gb-home-proof" aria-label="O que você encontra no Gabaru">
        <div className="gb-container gb-proof-grid">
          <div><strong>Provas anteriores</strong><span>Escolha por instituição e edição.</span></div>
          <div><strong>Questões do ENEM</strong><span>Treine por disciplina no seu ritmo.</span></div>
          <div><strong>Grátis para começar</strong><span>Acesse os treinos disponíveis sem cadastro.</span></div>
        </div>
      </section>
      <section className="gb-home-next"><div className="gb-container gb-home-next-inner"><div><p className="gb-eyebrow">ESTUDO GRATUITO</p><h2>Pratique hoje.<br /><em>Continue amanhã.</em></h2><p>Explore o acervo e encontre o treino disponível para a sua prova. Os recursos e a correção variam conforme a edição.</p></div><Link href="/provas" className="gb-button gb-button-light">Ver acervo de provas <span aria-hidden="true">→</span></Link></div></section>
      <section className="gb-section gb-container gb-home-materials"><div><p className="gb-eyebrow">PARA SEGUIR ESTUDANDO</p><h2>Mais caminhos para aprender.</h2><p>Conheça os materiais gratuitos e as ferramentas disponíveis no Gabaru.</p></div><Link href="/materiais-gratuitos" className="gb-button">Ver materiais gratuitos <span aria-hidden="true">→</span></Link></section>
    </main>
  );
}

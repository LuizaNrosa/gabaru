// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import Link from "next/link";
import { CONTAINER, PageHero } from "@/components/ui";
import { metaPagina } from "@/lib/seo";

export const metadata = metaPagina({
  titulo: "Acervo de provas oficiais",
  descricao: "Encontre provas da ETEC, COLUNI, IFSC, IFSP, ENEM, FUVEST, Unesp e Unicamp, organizadas por instituição e edição.",
  caminho: "/provas",
});

const grupos = [
  {
    titulo: "Vestibulinhos",
    descricao: "Provas para o ensino médio e técnico.",
    exames: [
      { nome: "ETEC", detalhe: "Vestibulinho do Centro Paula Souza", href: "/provas/etec" },
      { nome: "COLUNI", detalhe: "Colégio de Aplicação da UFV", href: "/provas/coluni" },
      { nome: "IFSC", detalhe: "Instituto Federal de Santa Catarina", href: "/provas/ifsc" },
      { nome: "IFSP", detalhe: "Instituto Federal de São Paulo", href: "/provas/ifsp" },
    ],
  },
  {
    titulo: "ENEM e vestibulares",
    descricao: "Cadernos e documentos oficiais para o ingresso no ensino superior.",
    exames: [
      { nome: "ENEM", detalhe: "Exame Nacional do Ensino Médio", href: "/provas/enem" },
      { nome: "FUVEST", detalhe: "Vestibular da Universidade de São Paulo", href: "/provas/fuvest" },
      { nome: "Unesp", detalhe: "Universidade Estadual Paulista", href: "/provas/unesp" },
      { nome: "Unicamp", detalhe: "Universidade Estadual de Campinas", href: "/provas/unicamp" },
    ],
  },
];

export default function AcervoDeProvas() {
  return (
    <main>
      <PageHero eyebrow="Acervo de provas" titulo={<>Escolha a prova.<br /><mark>Comece a estudar.</mark></>}>
        <p>Encontre provas por instituição e edição. A disponibilidade de cadernos, gabaritos e correção varia conforme o exame.</p>
      </PageHero>
      {grupos.map((grupo) => (
        <section key={grupo.titulo} className={`${CONTAINER} py-10`} aria-label={grupo.titulo}>
          <h2 className="gb-section-title">{grupo.titulo}</h2>
          <p className="mt-3 mb-6 text-n5">{grupo.descricao}</p>
          <div className="gb-content-grid">
            {grupo.exames.map((exame) => (
              <Link key={exame.href} href={exame.href} className="gb-content-card">
                <h3>{exame.nome}</h3>
                <p>{exame.detalhe}</p>
                <span className="gb-text-link">Ver provas e disponibilidade ↗</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}

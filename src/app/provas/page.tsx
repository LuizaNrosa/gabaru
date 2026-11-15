// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import { PageHero } from "@/components/ui";
import { AcervoBusca } from "@/components/acervo-busca";
import { metaPagina } from "@/lib/seo";

export const metadata = metaPagina({
  titulo: "Provas anteriores: ENEM, vestibulares e vestibulinhos",
  descricao: "Encontre provas do ENEM, FUVEST, Unesp/Vunesp, Unicamp, ETEC e Institutos Federais por instituição e edição. Treine gratuitamente no Gabaru.",
  caminho: "/provas",
});

export default function AcervoDeProvas() {
  return <main>
    <PageHero eyebrow="Acervo de provas" titulo={<>Encontre sua prova.<br /><mark>Comece a estudar.</mark></>}>
      <p>Busque por instituição, exame ou estado. A disponibilidade de cadernos, gabaritos e correção varia conforme a edição.</p>
    </PageHero>
    <AcervoBusca />
  </main>;
}

import Link from "next/link";
import { PreparacaoLink } from "@/components/preparacao-link";
import { CONTAINER, PageHero } from "@/components/ui";
import { metaPagina } from "@/lib/seo";
import exams from "@/data/etec-exams.json";

export const metadata = metaPagina({
  titulo: "Vestibulinho ETEC | Prepare-se com o Gabaru",
  descricao: "Resolva provas anteriores da ETEC, confira o gabarito oficial e consulte nota de corte e demanda por curso.",
  caminho: "/etec",
});

export default function EtecPage() {
  return (
    <main>
      <PageHero eyebrow="Vestibulinho ETEC" titulo={<>Faça a prova da ETEC. <mark>Prepare-se para a próxima.</mark></>}>
        <p>O acesso de estudo da ETEC reúne provas anteriores no leitor do Gabaru, com marcação de respostas e correção pelo gabarito oficial.</p>
        <div className="gb-actions">
          <Link href="/provas/etec" className="gb-button">Consultar o catálogo de provas</Link>
          <Link href="/nota-de-corte" className="gb-text-link">Consultar nota de corte e demanda</Link>
        </div>
        <p className="gb-footnote">{exams.length} cadernos no catálogo do Gabaru.</p>
      </PageHero>
      <PreparacaoLink objetivo="etec" />
      <section className={`${CONTAINER} py-10`} aria-labelledby="etec-acompanhamento">
        <div className="rounded-lg border border-n2 bg-gold-soft p-6 sm:p-8">
          <p className="gb-eyebrow">Em preparação</p>
          <h2 id="etec-acompanhamento" className="gb-section-title mt-3">Saiba o que revisar depois da prova.</h2>
          <p className="mt-4 max-w-2xl text-n5">
            Estamos preparando o relatório de acertos e erros por matéria e um espaço para enviar dúvidas a um professor na própria questão.
          </p>
        </div>
      </section>
    </main>
  );
}

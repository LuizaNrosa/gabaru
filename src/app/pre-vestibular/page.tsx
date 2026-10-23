import Link from "next/link";
import { PageHero, CONTAINER } from "@/components/ui";
import { PathCards } from "@/components/path-cards";
import { provasDa } from "@/data/provas";
import { DISCIPLINAS } from "@/data/disciplinas";
export const metadata = {
  title: "ENEM e vestibulares",
  description:
    "Explore disciplinas e conheça os caminhos de preparação do Gabaru.",
};
export default function Page() {
  return (
    <main>
      <PageHero
        eyebrow="ENEM e vestibulares"
        titulo={
          <>
            Construa sua base.
            <br />
            <mark>Amplie suas possibilidades.</mark>
          </>
        }
      >
        <p>
          O treino ENEM está aberto. As trilhas de outras instituições, os
          diagnósticos e os planos de estudo estão em desenvolvimento.
        </p>
      </PageHero>
      <section id="enem" className={`${CONTAINER} py-10`}>
        <h2 className="gb-section-title mb-6">ENEM · provas anteriores</h2>
        <p className="mb-5 text-n5">Escolha o ano, o dia e a aplicação. Consulte os cadernos incorporados e acesse as provas e gabaritos oficiais do Inep de 1998 a 2025.</p>
        <Link href="/provas/enem" className="gb-button">Escolher prova do ENEM ↗</Link>
      </section>
      <section id="disciplinas" className={`${CONTAINER} py-10`}>
        <h2 className="gb-section-title mb-6">Explore as disciplinas</h2>
        <div className="gb-content-grid">
          {DISCIPLINAS.map((d) => (
            <Link
              href={`/disciplinas/${d.slug}`}
              className="gb-content-card"
              key={d.slug}
            >
              <h3>{d.nome}</h3>
              <p>{d.resumo}</p>
              <span className="text-xs text-n4">
                Ver temas e disponibilidade ↗
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section id="paulistas" className={`${CONTAINER} py-10`}>
        <h2 className="gb-section-title mb-6">Vestibulares paulistas</h2>
        <PathCards items={provasDa("vestibular-paulista")} />
      </section>
      <section id="militares" className={`${CONTAINER} py-10`}>
        <h2 className="gb-section-title mb-6">ITA, IME e militares</h2>
        <PathCards items={provasDa("militar")} />
      </section>
    </main>
  );
}


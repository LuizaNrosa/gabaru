import Link from "next/link";
import { CONTAINER, PageHero } from "@/components/ui";
import { metaPagina } from "@/lib/seo";

export const metadata = metaPagina({
  titulo: "Vestibulares paulistas | FUVEST, Unesp e Unicamp",
  descricao: "Acesse provas anteriores e notas de corte da FUVEST, da Unesp (Vunesp) e da Unicamp (Comvest).",
  caminho: "/vestibulares-paulistas",
});

const vestibulares = [
  { slug: "fuvest", nome: "FUVEST", descricao: "Vestibular para ingresso na USP." },
  { slug: "unesp", nome: "Unesp (Vunesp)", descricao: "Vestibular para ingresso na Universidade Estadual Paulista." },
  { slug: "unicamp", nome: "Unicamp (Comvest)", descricao: "Vestibular para ingresso na Universidade Estadual de Campinas." },
];

export default function VestibularesPaulistasPage() {
  return (
    <main>
      <PageHero eyebrow="Vestibulares paulistas" titulo={<>FUVEST, Unesp e Unicamp. <mark>Escolha sua prova.</mark></>}>
        <p>Encontre os cadernos e gabaritos disponíveis por edição e consulte as notas de corte de cada vestibular.</p>
      </PageHero>
      <section className={`${CONTAINER} py-10`} aria-label="Vestibulares">
        <ul className="grid gap-4 md:grid-cols-3">
          {vestibulares.map(({ slug, nome, descricao }) => (
            <li key={slug}>
              <article className="gb-content-card flex h-full flex-col gap-3">
                <h2 className="text-xl font-bold">{nome}</h2>
                <p className="text-n5">{descricao}</p>
                <div className="mt-auto flex flex-wrap gap-4 pt-3">
                  <Link href={`/provas/${slug}`} className="gb-text-link">Provas anteriores<span className="sr-only"> · {nome}</span></Link>
                  <Link href={`/nota-de-corte/${slug}`} className="gb-text-link">Nota de corte<span className="sr-only"> · {nome}</span></Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

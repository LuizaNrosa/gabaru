import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, CONTAINER, CtaCadastro, PageHero } from "@/components/ui";
import { CATEGORIAS, PROVAS, provaPorSlug } from "@/data/provas";
import { disciplinaPorSlug } from "@/data/disciplinas";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PROVAS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = provaPorSlug((await params).slug);
  return p
    ? {
        title: `${p.nome}: disciplinas e estrutura da prova`,
        description: p.resumo,
      }
    : {};
}

export default async function ProvaPage({ params }: Props) {
  const prova = provaPorSlug((await params).slug);
  if (!prova) notFound();
  const disc = prova.disciplinas
    .map((s) => disciplinaPorSlug(s))
    .filter((d) => !!d);
  const categoria = CATEGORIAS[prova.categoria];

  return (
    <main>
      <PageHero eyebrow={categoria.nome} titulo={prova.nome}>
        <p>
          {prova.completo}. {prova.resumo}
        </p>
      </PageHero>

      <section className={`${CONTAINER} pt-10`}>
        {prova.confirmar && (
          <p
            role="note"
            className="mb-8 max-w-3xl rounded-md border-l-4 border-anil bg-white p-4 text-sm"
          >
            Estamos mapeando o edital desta prova. A lista de disciplinas abaixo
            é de referência. Confira sempre o edital oficial.
          </p>
        )}
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">Como é a prova</h2>
            <ul className="mt-4 grid gap-3" role="list">
              {prova.estrutura.map((e) => (
                <li key={e} className="border-l-2 border-ink pl-4 text-n5">
                  {e}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-n4">
              Confira o edital ou manual do candidato vigente. Datas e regras
              mudam a cada ano.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Disciplinas cobradas</h2>
            <ul className="mt-4 grid gap-2" role="list">
              {disc.map((d) => (
                <li key={d!.slug}>
                  <Link
                    href={`/disciplinas/${d!.slug}`}
                    className="flex min-h-12 items-center justify-between rounded-md border border-n2 bg-white/60 px-4 hover:border-ink"
                  >
                    <span className="font-semibold">{d!.nome}</span>
                    <span className="text-xs text-n4">Explorar temas ↗</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="gb-notice mt-8">
          A trilha desta instituição está em construção. As disciplinas abaixo
          indicam o escopo de referência, não a disponibilidade de um curso
          completo. Consulte sempre o edital vigente.
        </p>
        <div className="mt-12">
          <CtaCadastro texto={`Criar conta no Gabaru`} />
        </div>
      </section>
    </main>
  );
}

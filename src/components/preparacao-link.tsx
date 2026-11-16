import Link from "next/link";
import { CONTAINER } from "@/components/ui";
import { preparacoes } from "@/data/preparacoes";

const titulos = { etec: "a ETEC", ifs: "Institutos Federais", enem: "o ENEM" };

export function PreparacaoLink({ objetivo }: { objetivo: keyof typeof titulos }) {
  const { titulo } = preparacoes[objetivo];
  return (
    <section className={`${CONTAINER} pt-8`} aria-labelledby="preparacao-gabaru">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-lg border border-n2 bg-white/60 px-5 py-4">
        <div>
          <h2 id="preparacao-gabaru" className="text-lg font-bold">Preparação para {titulos[objetivo]}</h2>
          <p className="mt-1 text-sm text-n5">Material de estudo, videoaulas e exercícios resolvidos em produção.</p>
        </div>
        <Link href={`/planos#${objetivo}`} className="gb-text-link inline-flex min-h-11 items-center">
          Ver preparação · {titulo}
        </Link>
      </div>
    </section>
  );
}

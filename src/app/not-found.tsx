import Link from "next/link";
import { CONTAINER } from "@/components/ui";

export default function NotFound() {
  return (
    <main
      className={`${CONTAINER} grid min-h-[60vh] place-items-center py-24 text-center`}
    >
      <div>
        <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-n4">
          Erro 404
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Essa página não existe.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-n5">
          Talvez o endereço tenha mudado. Você pode voltar ao início ou ver as
          provas.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center rounded-md bg-gold-text px-6 font-semibold text-white"
          >
            Ir para o início
          </Link>
          <Link
            href="/pre-vestibular"
            className="inline-flex min-h-12 items-center rounded-md border border-ink px-6 font-semibold text-ink"
          >
            Ver as provas
          </Link>
        </div>
      </div>
    </main>
  );
}

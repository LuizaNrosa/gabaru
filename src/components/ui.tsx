import Link from "next/link";
import type { ReactNode } from "react";

export const CONTAINER = "mx-auto w-full max-w-6xl px-5 sm:px-8";

export function Badge({ status }: { status: "ativo" | "em-breve" }) {
  return status === "ativo" ? (
    <span className="inline-flex items-center rounded bg-lima px-2 py-0.5 font-mono text-[11px] font-bold uppercase text-ink">Disponível</span>
  ) : (
    <span className="inline-flex items-center rounded border border-n3 px-2 py-0.5 font-mono text-[11px] font-bold uppercase text-n4">Em breve</span>
  );
}

export function PageHero({ eyebrow, titulo, children }: { eyebrow: string; titulo: ReactNode; children?: ReactNode }) {
  return (
    <section className={`${CONTAINER} pt-14 sm:pt-20`}>
      <p className="font-mono text-xs font-bold uppercase tracking-wider text-n4">{eyebrow}</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">{titulo}</h1>
      {children && <div className="mt-5 max-w-2xl text-lg text-n5">{children}</div>}
    </section>
  );
}

export function CtaCadastro({ texto = "Criar conta" }: { texto?: string }) {
  return (
    <Link href="/cadastro" className="inline-flex min-h-12 items-center rounded-md bg-rosa px-6 font-semibold text-white hover:opacity-90">
      {texto}
    </Link>
  );
}

export function FotoUniversidade({ arquivo, nome, cidade }: { arquivo: string; nome: string; cidade: string }) {
  return (
    <figure
      className="relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-lg bg-ink p-4 text-paper"
      style={{ backgroundImage: `linear-gradient(to top, rgba(22,22,29,.85), rgba(22,22,29,.05) 60%), url(${arquivo})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <figcaption>
        <p className="text-lg font-bold">{nome}</p>
        <p className="font-mono text-xs opacity-80">{cidade}</p>
      </figcaption>
    </figure>
  );
}

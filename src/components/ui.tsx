import Link from "next/link";
import type { ReactNode } from "react";

export const CONTAINER = "mx-auto w-full max-w-6xl px-5 sm:px-8";

export function Badge({ status }: { status: "ativo" | "em-breve" }) {
  return status === "ativo" ? (
    <span className="inline-flex items-center rounded bg-gold-soft px-2 py-0.5 font-mono text-[11px] font-bold uppercase text-ink">Disponível</span>
  ) : (
    <span className="inline-flex items-center rounded border border-n3 px-2 py-0.5 font-mono text-[11px] font-bold uppercase text-n4">Em breve</span>
  );
}

export function Eyebrow({ children, claro = false }: { children: ReactNode; claro?: boolean }) {
  return (
    <p className={`font-mono text-xs font-bold uppercase tracking-[0.14em] ${claro ? "text-gold" : "text-n4"}`}>{children}</p>
  );
}

export function PageHero({ eyebrow, titulo, children }: { eyebrow: string; titulo: ReactNode; children?: ReactNode }) {
  return (
    <section className={`${CONTAINER} pt-14 sm:pt-20`}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">{titulo}</h1>
      {children && <div className="mt-5 max-w-2xl text-lg text-n5">{children}</div>}
    </section>
  );
}

export function CtaCadastro({ texto = "Criar conta" }: { texto?: string }) {
  return (
    <Link
      href="/cadastro"
      className="inline-flex min-h-12 items-center rounded-md bg-gold px-6 font-semibold text-ink shadow-[0_1px_0_rgba(0,0,0,.08)] transition hover:brightness-95"
    >
      {texto}
    </Link>
  );
}

export function CtaSecundario({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex min-h-12 items-center rounded-md border border-paper/40 px-6 font-semibold text-paper hover:bg-paper/10">
      {children}
    </Link>
  );
}

export function FotoUniversidade({ arquivo, nome, cidade, href }: { arquivo: string; nome: string; cidade: string; href?: string }) {
  const card = (
    <figure
      className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-xl bg-ink p-4 text-paper"
      style={{
        backgroundImage: `linear-gradient(to top, rgba(14,26,43,.9), rgba(14,26,43,.05) 62%), url(${arquivo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <figcaption>
        <p className="text-lg font-bold">{nome}</p>
        <p className="font-mono text-xs opacity-80">{cidade}</p>
      </figcaption>
    </figure>
  );
  return href ? <Link href={href} className="block transition hover:-translate-y-0.5">{card}</Link> : card;
}

/** Logo institucional em cartão branco, sem recorte: a marca nunca é cortada. */
export function CartaoLogo({ src, alt, legenda }: { src: string; alt: string; legenda: string }) {
  return (
    <figure className="flex flex-col items-center gap-4 rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-n2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-40 w-40 object-contain" />
      <figcaption className="font-mono text-xs font-bold uppercase tracking-wider text-n4">{legenda}</figcaption>
    </figure>
  );
}

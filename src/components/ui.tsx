import Link from "next/link";
import type { ReactNode } from "react";

export const CONTAINER = "gb-container w-full";

export function Badge({ status }: { status: "ativo" | "em-breve" }) {
  return status === "ativo" ? (
    <span className="inline-flex items-center rounded bg-gold-soft px-2 py-0.5 font-mono text-[11px] font-bold uppercase text-ink">
      Disponível
    </span>
  ) : (
    <span className="inline-flex items-center rounded border border-n3 px-2 py-0.5 font-mono text-[11px] font-bold uppercase text-n4">
      Em breve
    </span>
  );
}

export function Eyebrow({
  children,
  claro = false,
}: {
  children: ReactNode;
  claro?: boolean;
}) {
  return (
    <p
      className={`font-mono text-xs font-bold uppercase tracking-[0.14em] ${claro ? "text-gold-soft" : "text-n4"}`}
    >
      {children}
    </p>
  );
}

export function PageHero({
  eyebrow,
  titulo,
  children,
}: {
  eyebrow: string;
  titulo: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className={`${CONTAINER} gb-page-hero`}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="gb-page-title">{titulo}</h1>
      {children && (
        <div className="mt-5 max-w-2xl text-lg text-n5">{children}</div>
      )}
    </section>
  );
}

export function CtaCadastro({ texto = "Criar conta" }: { texto?: string }) {
  return (
    <Link
      href="/cadastro"
      className="inline-flex min-h-12 items-center rounded-md bg-gold-text px-6 font-semibold text-white shadow-[0_1px_0_rgba(0,0,0,.08)] transition hover:-translate-y-0.5 hover:bg-[#a63f14] hover:shadow-md"
    >
      {texto}
    </Link>
  );
}

export function CtaSecundario({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-12 items-center rounded-md border border-paper/40 px-6 font-semibold text-paper hover:bg-paper/10"
    >
      {children}
    </Link>
  );
}

/** Garantia de 7 dias. Texto de referência: confirmar com o jurídico antes da venda. */
export function GarantiaSeteDias() {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-n2 bg-white/70 p-5 sm:p-6">
      <span
        aria-hidden="true"
        className="grid size-11 shrink-0 place-items-center rounded-full bg-gold-soft font-mono text-lg font-bold text-ink"
      >
        7
      </span>
      <div>
        <p className="font-bold">Garantia de 7 dias</p>
        <p className="mt-1 text-sm text-n5">
          Se você não gostar nos primeiros 7 dias, devolvemos o valor integral.
          Sem burocracia.
        </p>
      </div>
    </div>
  );
}

export function FotoUniversidade({
  arquivo,
  nome,
  cidade,
  href,
}: {
  arquivo: string;
  nome: string;
  cidade: string;
  href?: string;
}) {
  const card = (
    <figure
      className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-xl bg-ink p-4 text-paper"
      style={{
        backgroundImage: `linear-gradient(to top, rgba(35,35,35,.92), rgba(35,35,35,.05) 62%), url(${arquivo})`,
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
  return href ? (
    <Link href={href} className="block transition hover:-translate-y-0.5">
      {card}
    </Link>
  ) : (
    card
  );
}

/** Logo institucional em cartão branco, sem recorte: a marca nunca é cortada. */
export function CartaoLogo({
  src,
  alt,
  legenda,
}: {
  src: string;
  alt: string;
  legenda: string;
}) {
  return (
    <figure className="flex flex-col items-center gap-4 rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-n2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={160}
        height={160}
        className="h-40 w-40 object-contain"
      />
      <figcaption className="font-mono text-xs font-bold uppercase tracking-wider text-n4">
        {legenda}
      </figcaption>
    </figure>
  );
}

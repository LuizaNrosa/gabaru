"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Wordmark } from "@/components/logo";
import { NAV } from "@/data/nav";
import { EM_CONSTRUCAO } from "@/lib/construcao";

const chev = (
  <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 4l4 4 4-4" />
  </svg>
);

export function SiteHeader() {
  const [aberto, setAberto] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const barra = useRef<HTMLElement>(null);

  useEffect(() => {
    const fora = (e: MouseEvent) => {
      if (barra.current && !barra.current.contains(e.target as Node)) setAberto(null);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAberto(null);
        setMenu(false);
      }
    };
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, []);

  const fechar = () => {
    setAberto(null);
    setMenu(false);
  };

  return (
    <header ref={barra} className="sticky top-0 z-50 border-b border-n2 bg-paper/95 backdrop-blur">
      <div className="bg-ink text-paper">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-2 text-[13px] sm:px-8">
          <p className="flex items-center gap-2">
            <span className="rounded bg-gold-soft px-1.5 py-0.5 font-mono text-[11px] font-bold uppercase text-ink">Abertura</span>
            <span>{EM_CONSTRUCAO ? "Em construção: o lançamento é em breve. Crie a conta para ser avisado." : "Começamos por Matemática e Física. As demais disciplinas já têm lugar reservado."}</span>
          </p>
          <nav aria-label="Institucional" className="hidden items-center gap-5 sm:flex">
            <Link href="/sobre" className="hover:underline">Sobre nós</Link>
            <Link href="/planos" className="hover:underline">Planos</Link>
          </nav>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 sm:px-8">
        <Link href="/" onClick={fechar} aria-label="GABARU, página inicial" className="flex min-h-16 items-center">
          <Wordmark className="h-auto w-28 text-ink sm:w-32" />
        </Link>

        <nav aria-label="Principal" className="hidden flex-1 items-center gap-0.5 xl:flex">
          {NAV.map((item) =>
            item.filhos ? (
              <div key={item.label} className="relative">
                <button
                  type="button"
                  aria-expanded={aberto === item.label}
                  aria-haspopup="true"
                  onClick={() => setAberto(aberto === item.label ? null : item.label)}
                  className="flex min-h-16 items-center gap-1.5 whitespace-nowrap px-2 text-[15px] font-semibold hover:underline"
                >
                  {item.label}
                  {chev}
                </button>
                {aberto === item.label && (
                  <div className="absolute left-0 top-full w-72 rounded-b-lg border border-t-0 border-n2 bg-paper p-2 shadow-lg">
                    <Link href={item.href} onClick={fechar} className="flex min-h-11 items-center rounded px-3 text-sm font-bold hover:bg-n1">
                      Ver tudo em {item.label}
                    </Link>
                    <ul role="list" className="mt-1 border-t border-n2 pt-1">
                      {item.filhos.map((f) => (
                        <li key={f.href}>
                          <Link href={f.href} onClick={fechar} className="flex min-h-11 flex-col justify-center rounded px-3 py-1.5 hover:bg-n1">
                            <span className="text-sm font-semibold">{f.label}</span>
                            {f.nota && <span className="text-xs text-n4">{f.nota}</span>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <Link key={item.label} href={item.href} className="flex min-h-16 items-center whitespace-nowrap px-2 text-[15px] font-semibold hover:underline">
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/login"
            className="hidden min-h-11 items-center rounded-md whitespace-nowrap border-2 border-gold px-5 text-[15px] font-semibold text-ink hover:bg-gold-soft sm:inline-flex"
          >
            Área do aluno
          </Link>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-md border border-ink xl:hidden"
            aria-expanded={menu}
            aria-controls="menu-mobile"
            aria-label={menu ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMenu(!menu)}
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {menu ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menu && (
        <div id="menu-mobile" className="max-h-[75vh] overflow-y-auto border-t border-n2 bg-paper px-5 pb-6 xl:hidden">
          <Link
            href="/login"
            onClick={fechar}
            className="mt-4 flex min-h-12 items-center justify-center rounded-md whitespace-nowrap border-2 border-gold px-5 font-semibold text-ink"
          >
            Área do aluno
          </Link>
          {NAV.map((item) => (
            <div key={item.label} className="mt-5">
              <Link href={item.href} onClick={fechar} className="flex min-h-11 items-center text-base font-bold">
                {item.label}
              </Link>
              {item.filhos && (
                <ul role="list" className="ml-1 border-l-2 border-n2 pl-4">
                  {item.filhos.map((f) => (
                    <li key={f.href}>
                      <Link href={f.href} onClick={fechar} className="flex min-h-11 items-center text-[15px]">
                        {f.label}
                        {f.nota && <span className="ml-2 text-xs text-n4">{f.nota}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          <div className="mt-5 flex gap-6 border-t border-n2 pt-4 text-sm font-semibold">
            <Link href="/sobre" onClick={fechar}>Sobre nós</Link>
            <Link href="/planos" onClick={fechar}>Planos</Link>
          </div>
        </div>
      )}
    </header>
  );
}

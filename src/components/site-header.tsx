"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Wordmark } from "@/components/logo";
import { EM_CONSTRUCAO } from "@/lib/construcao";
const links = [
  ["Vestibulinhos", "/pre-vestibulinho"],
  ["Nota de corte", "/nota-de-corte"],
  ["ENEM e vestibulares", "/pre-vestibular"],
  ["Treino gratuito", "/treino"],
  ["Materiais", "/materiais-gratuitos"],
  ["Sobre", "/sobre"],
] as const;

/** A seção está ativa quando a rota atual é ela mesma ou um filho. */
function secaoAtiva(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <header
      className="gb-header"
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      {EM_CONSTRUCAO && (
        <div className="gb-announcement">
          Estamos construindo o Gabaru.{" "}
          <Link href="/provas">
            Encontre sua prova e comece a treinar <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}
      <div className="gb-nav">
        <Link
          href="/"
          aria-label="Gabaru, página inicial"
          onClick={() => setOpen(false)}
        >
          <Wordmark />
        </Link>
        <nav className="gb-desktop-nav" aria-label="Principal">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              aria-current={secaoAtiva(pathname, href) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/login" className="gb-login">
          Entrar <span aria-hidden="true">↗</span>
        </Link>
        <button
          className="gb-menu-toggle"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="gb-mobile-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? "Fechar −" : "Menu +"}
        </button>
      </div>
      {open && (
        <nav
          id="gb-mobile-nav"
          className="gb-mobile-nav"
          aria-label="Navegação móvel"
        >
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              aria-current={secaoAtiva(pathname, href) ? "page" : undefined}
            >
              {label}
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ABAS = [
  {
    href: "/",
    label: "Início",
    icone: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  },
  {
    href: "/pre-vestibular",
    label: "Provas",
    icone: "M4 5h7v14H4zM13 5h7v14h-7z",
  },
  {
    href: "/treino",
    label: "Treino",
    icone:
      "M12 3l2.6 5.6 6.1.6-4.6 4.1 1.4 6-5.5-3.2L6.5 19.3l1.4-6L3.3 9.2l6.1-.6z",
  },
  {
    href: "/login",
    label: "Entrar",
    icone: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0",
  },
];

/** Barra inferior do celular, com cara de app. Some a partir de 640 px. */
export function TabBar() {
  const atual = usePathname();
  return (
    <nav
      aria-label="Navegação rápida"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-n2 bg-paper/95 backdrop-blur sm:hidden"
    >
      <ul className="grid grid-cols-4" role="list">
        {ABAS.map((a) => {
          const ativa =
            a.href === "/" ? atual === "/" : atual?.startsWith(a.href);
          return (
            <li key={a.href}>
              <Link
                href={a.href}
                aria-current={ativa ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 border-t-2 text-xs font-semibold ${ativa ? "border-gold text-ink" : "border-transparent text-n4"}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-6"
                  aria-hidden="true"
                  fill={ativa ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                >
                  <path d={a.icone} />
                </svg>
                {a.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

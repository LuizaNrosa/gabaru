"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

/**
 * Providers exclusivos do painel do aluno.
 *
 * O TanStack Query fica confinado à área autenticada: o resto do site é
 * estático/RSC e não precisa do runtime de cache no cliente. retry: false
 * e staleTime curto no client global — as consultas do painel falham
 * fechado (401/503 têm estados próprios na UI) e dados velhos não servem
 * para progresso do aluno.
 */
export function PainelProviders({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

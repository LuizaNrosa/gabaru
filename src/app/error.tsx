"use client";

import { CONTAINER } from "@/components/ui";

export default function Erro({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      className={`${CONTAINER} grid min-h-[60vh] place-items-center py-24 text-center`}
    >
      <div>
        <h1 className="text-4xl font-bold tracking-tight">
          Não foi possível carregar esta página.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-n5">
          Tente de novo em instantes. Se o problema continuar, volte ao início.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex min-h-12 items-center rounded-md bg-gold-text px-6 font-semibold text-white hover:-translate-y-0.5 transition"
        >
          Tentar novamente
        </button>
      </div>
    </main>
  );
}

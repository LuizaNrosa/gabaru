const ESTADOS = [
  "dom",
  "dom",
  "treino",
  "dom",
  "rev",
  "dom",
  "treino",
  "treino",
  "dom",
  "rev",
  "dom",
  "dom",
  "treino",
  "vazio",
  "dom",
  "rev",
  "treino",
  "dom",
  "vazio",
  "treino",
  "dom",
  "dom",
  "rev",
  "vazio",
  "treino",
  "dom",
  "vazio",
  "vazio",
  "treino",
  "vazio",
] as const;

/** Exemplo ilustrativo de como o aluno enxerga as 30 habilidades de Matemática. */
export function MapaHabilidades() {
  return (
    <div
      className="rounded-lg border border-n2 bg-white/60 p-5 sm:p-6"
      role="img"
      aria-label="Exemplo ilustrativo do mapa de habilidades de Matemática, com trinta habilidades em estados diferentes"
    >
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-xs font-bold uppercase tracking-wider text-n4">
          Matemática · H1 a H30
        </p>
        <p className="text-xs text-n4">exemplo ilustrativo</p>
      </div>
      <div
        className="mt-4 grid grid-cols-[repeat(6,minmax(0,1fr))] gap-2"
        aria-hidden="true"
      >
        {ESTADOS.map((e, i) => (
          <span
            key={i}
            className={[
              "relative grid aspect-square place-items-center rounded-full font-mono text-[11px] font-bold",
              e === "dom" ? "bg-ink text-paper" : "",
              e === "treino" ? "bg-gold-soft text-ink" : "",
              e === "rev" ? "text-anil ring-2 ring-anil" : "",
              e === "vazio" ? "border-2 border-ink text-ink" : "",
            ].join(" ")}
          >
            {i + 1}
            {e === "rev" && (
              <span className="absolute left-1.5 right-1.5 top-1/2 h-0.5 -rotate-45 bg-anil" />
            )}
          </span>
        ))}
      </div>
      <ul className="mt-5 grid gap-2 text-sm sm:grid-cols-2" role="list">
        <li className="flex items-center gap-2">
          <span className="size-4 rounded-full bg-ink" /> Dominada
        </li>
        <li className="flex items-center gap-2">
          <span className="size-4 rounded-full bg-gold-soft" /> Em treino
        </li>
        <li className="flex items-center gap-2">
          <span className="relative size-4 rounded-full ring-2 ring-anil">
            <span className="absolute left-0.5 right-0.5 top-1/2 h-px -rotate-45 bg-anil" />
          </span>{" "}
          Precisa de revisão
        </li>
        <li className="flex items-center gap-2">
          <span className="size-4 rounded-full border-2 border-ink" /> Ainda não
          treinada
        </li>
      </ul>
    </div>
  );
}

"use client";

import { useState } from "react";

type Opcao = { letra: string; valor: string; porque: string };

const ENUNCIADO =
  "Ana sai de casa às 6h e caminha 2 km até a escola, a 3 km/h. A que horas ela chega?";

const OPCOES: Opcao[] = [
  { letra: "A", valor: "6h28", porque: "Houve erro na divisão: 2 ÷ 3 ≈ 0,67 h, e 0,67 h × 60 dá 40 min, não 28." },
  { letra: "B", valor: "6h20", porque: "Aqui a conta foi 2 ÷ 6. O divisor é a velocidade, 3 km/h." },
  { letra: "C", valor: "6h40", porque: "Tempo = distância ÷ velocidade = 2 ÷ 3 h = 40 min. Chega às 6h40." },
  { letra: "D", valor: "6h46", porque: "Horas decimais não são minutos: 0,67 h não vira 67 min nem 46. Multiplique por 60." },
  { letra: "E", valor: "7h00", porque: "Dividiu 3 por 2 (1,5 h) e arredondou para 1 hora. A divisão certa é 2 ÷ 3." },
];

const CERTA = "C";

export function QuestaoDemo() {
  const [erradas, setErradas] = useState<string[]>([]);
  const [ultima, setUltima] = useState<string | null>(null);
  const [acertou, setAcertou] = useState(false);

  function escolher(letra: string) {
    if (acertou || erradas.includes(letra)) return;
    setUltima(letra);
    if (letra === CERTA) setAcertou(true);
    else setErradas((e) => [...e, letra]);
  }

  function reiniciar() {
    setErradas([]);
    setUltima(null);
    setAcertou(false);
  }

  const explicacao = OPCOES.find((o) => o.letra === ultima);

  return (
    <div className="rounded-lg border border-n2 bg-white/60 p-5 sm:p-8">
      <p className="font-mono text-xs uppercase tracking-wider text-n4">Matemática · Velocidade</p>
      <p className="mt-3 max-w-2xl text-xl font-semibold leading-snug sm:text-2xl">{ENUNCIADO}</p>

      <ul className="mt-6 grid gap-2" role="list">
        {OPCOES.map((o) => {
          const errada = erradas.includes(o.letra);
          const certa = acertou && o.letra === CERTA;
          return (
            <li key={o.letra}>
              <button
                type="button"
                onClick={() => escolher(o.letra)}
                disabled={acertou || errada}
                aria-pressed={certa || errada}
                className={[
                  "flex min-h-14 w-full items-center gap-4 rounded-md border px-4 text-left transition-colors",
                  certa ? "border-ink bg-lima" : "border-n2 bg-paper hover:border-ink",
                  errada ? "text-n4" : "",
                ].join(" ")}
              >
                <span
                  className={[
                    "relative grid size-10 shrink-0 place-items-center rounded-full font-mono text-base font-bold",
                    certa ? "bg-ink text-paper" : "",
                    errada ? "ring-2 ring-anil text-anil" : "",
                    !certa && !errada ? "border-2 border-ink" : "",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  {o.letra}
                  {errada && (
                    <span className="absolute left-1 right-1 top-1/2 h-0.5 -rotate-45 bg-anil" />
                  )}
                </span>
                <span className="font-mono text-lg font-semibold">{o.valor}</span>
                {certa && (
                  <span className="ml-auto flex items-center gap-2 font-semibold">
                    <span className="size-2.5 rounded-full bg-rosa" aria-hidden="true" />
                    Gabaritou.
                  </span>
                )}
                {errada && <span className="ml-auto text-sm">alternativa errada</span>}
              </button>
            </li>
          );
        })}
      </ul>

      <div aria-live="polite" className="mt-5">
        {explicacao && !acertou && (
          <div className="rounded-md border-l-4 border-anil bg-paper p-4">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-anil">
              O erro também ensina
            </p>
            <p className="mt-1">{explicacao.porque}</p>
          </div>
        )}
        {acertou && explicacao && (
          <div className="rounded-md bg-paper p-4">
            <p className="font-semibold">{explicacao.porque}</p>
            <button
              type="button"
              onClick={reiniciar}
              className="mt-3 min-h-12 text-sm font-semibold underline"
            >
              Refazer a questão
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

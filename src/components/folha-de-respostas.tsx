// © 2026 Luiza Nascimento Rosa e Felipe Nascimento Rosa. Todos os direitos reservados.
"use client";

import { useEffect, useState } from "react";

/**
 * Folha de respostas para treino nos exames cujas questões ainda não têm
 * correção automática (FUVEST, Unesp e Unicamp hoje). O aluno marca as
 * alternativas enquanto lê o caderno no leitor integrado — no site — e,
 * no fim, confere com o gabarito oficial ao lado.
 *
 * As marcações ficam no localStorage, por exame e por documento, então
 * recarregar a página não perde a sessão de treino.
 */
const LETRAS = ["A", "B", "C", "D", "E"] as const;

export function FolhaDeRespostas({
  id,
  titulo,
  sugeridas = 90,
}: {
  /** Chave única da sessão (ex.: "fuvest-2026-fase1"). */
  id: string;
  titulo: string;
  /** Quantidade de questões sugerida pela prova deste documento. */
  sugeridas?: number;
}) {
  const opcoes = Array.from(new Set([sugeridas, 50, 90, 120, 180])).sort(
    (a, b) => a - b,
  );
  const [total, setTotal] = useState(sugeridas);
  const [respostas, setRespostas] = useState<Record<number, string>>({});
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    setCarregado(false);
    try {
      const salvo = localStorage.getItem(`gabaru:folha:${id}`);
      if (salvo) {
        const dados = JSON.parse(salvo) as {
          total?: number;
          respostas?: Record<number, string>;
        };
        if (dados.total) setTotal(dados.total);
        if (dados.respostas) setRespostas(dados.respostas);
      }
    } catch {
      /* sem localStorage: sessão temporária */
    }
    setCarregado(true);
  }, [id]);

  useEffect(() => {
    if (!carregado) return;
    try {
      localStorage.setItem(
        `gabaru:folha:${id}`,
        JSON.stringify({ total, respostas }),
      );
    } catch {
      /* modo privado: apenas não persistir */
    }
  }, [id, total, respostas, carregado]);

  const respondidas = Object.keys(respostas).length;
  const lista = Object.entries(respostas)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([n, l]) => `${n}-${l}`)
    .join(" ");

  return (
    <section
      className="mt-10 rounded-lg border-2 border-dashed border-n3 p-6 sm:p-8"
      aria-label="Folha de respostas do treino"
    >
      <p className="gb-eyebrow">TREINE AQUI · FOLHA DE RESPOSTAS</p>
      <h2 className="gb-section-title mt-3">
        Marque as suas respostas em {titulo}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-n5">
        Leia o caderno no leitor acima e marque as alternativas aqui — você
        não precisa sair do Gabaru. Conferência manual: compare suas marcações com o gabarito oficial da mesma prova e versão. As respostas ficam salvas neste
        navegador.
      </p>

      <label className="mt-5 flex flex-wrap items-center gap-3 text-sm font-semibold">
        Número de questões
        <select
          className="min-h-12 rounded border border-n2 bg-white px-3"
          value={total}
          onChange={(e) => setTotal(Number(e.currentTarget.value))}
        >
          {opcoes.map((n) => (
            <option key={n} value={n}>
              {n} questões
            </option>
          ))}
        </select>
      </label>

      <p className="mt-5" role="status">
        <strong>{respondidas}</strong> de {total} respondidas
      </p>

      <ol className="mt-4 grid gap-2 sm:grid-cols-2">
        {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
          <li
            key={n}
            className={`flex items-center justify-between gap-3 rounded border p-2 ${
              respostas[n] ? "border-n3 bg-[#f2cdb4]" : "border-n2 bg-white/70"
            }`}
          >
            <span className="w-14 shrink-0 text-center font-mono text-xs font-bold text-n5">
              {String(n).padStart(2, "0")}
            </span>
            <div className="flex gap-1.5" role="group" aria-label={`Questão ${n}`}>
              {LETRAS.map((l) => (
                <label key={l} className="cursor-pointer">
                  <input
                    type="radio"
                    name={`folha-${id}-q${n}`}
                    className="peer sr-only"
                    checked={respostas[n] === l}
                    onChange={() =>
                      setRespostas((atuais) => {
                        const prox = { ...atuais };
                        if (prox[n] === l) delete prox[n];
                        else prox[n] = l;
                        return prox;
                      })
                    }
                  />
                  <span
                    className={`grid size-10 place-items-center rounded-full border font-mono text-sm font-bold transition ${
                      respostas[n] === l
                        ? "border-ink bg-ink text-white"
                        : "border-n2 bg-paper text-ink hover:border-ink"
                    } peer-focus-visible:ring-2 peer-focus-visible:ring-anil`}
                  >
                    {l}
                  </span>
                  <span className="sr-only">Questão {n}, alternativa {l}</span>
                </label>
              ))}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          className="min-h-12 rounded border border-n2 bg-white px-4 font-semibold"
          onClick={() => {
            if (window.confirm("Apagar todas as marcações desta sessão?"))
              setRespostas({});
          }}
        >
          Limpar marcações
        </button>
        {respondidas > 0 && (
          <button
            type="button"
            className="min-h-12 rounded bg-ink px-4 font-semibold text-white"
            onClick={() => {
              void navigator.clipboard?.writeText(
                `Minhas respostas — ${titulo}: ${lista}`,
              );
            }}
          >
            Copiar respostas
          </button>
        )}
      </div>
    </section>
  );
}

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
const quantidade = (n: number, singular: string, plural: string) => `${n} ${n === 1 ? singular : plural}`;

export function FolhaDeRespostas({
  id,
  titulo,
  sugeridas = 90,
  gabarito,
  compacto = false,
}: {
  /** Chave única da sessão (ex.: "fuvest-2026-fase1"). */
  id: string;
  titulo: string;
  /** Quantidade de questões sugerida pela prova deste documento. */
  sugeridas?: number;
  gabarito?: string[];
  compacto?: boolean;
}) {
  const opcoes = Array.from(new Set([sugeridas, 50, 90, 120, 180])).sort(
    (a, b) => a - b,
  );
  const [total, setTotal] = useState(sugeridas);
  const [respostas, setRespostas] = useState<Record<number, string>>({});
  const [questaoAtual, setQuestaoAtual] = useState(1);
  const [finalizado, setFinalizado] = useState(false);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    setCarregado(false);
    try {
      const salvo = localStorage.getItem(`gabaru:folha:${id}`);
      if (salvo) {
        const dados = JSON.parse(salvo) as {
          total?: number;
          respostas?: Record<number, string>;
          finalizado?: boolean;
          questaoAtual?: number;
        };
        if (dados.total && !gabarito) setTotal(dados.total);
        if (dados.respostas) setRespostas(dados.respostas);
        if (dados.finalizado) setFinalizado(true);
        if (dados.questaoAtual && dados.questaoAtual >= 1 && dados.questaoAtual <= sugeridas) setQuestaoAtual(dados.questaoAtual);
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
        JSON.stringify({ total, respostas, finalizado, questaoAtual }),
      );
    } catch {
      /* modo privado: apenas não persistir */
    }
  }, [id, total, respostas, finalizado, questaoAtual, carregado]);

  const respondidas = Object.keys(respostas).length;
  const lista = Object.entries(respostas)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([n, l]) => `${n}-${l}`)
    .join(" ");

  return (
    <section
      className={compacto ? "rounded-lg border border-n2 bg-white p-4" : "mt-10 rounded-lg border-2 border-dashed border-n3 p-6 sm:p-8"}
      aria-label="Folha de respostas do treino"
    >
      <p className="gb-eyebrow">TREINE AQUI · FOLHA DE RESPOSTAS</p>
      <h2 className={compacto ? "mt-2 text-xl font-bold" : "gb-section-title mt-3"}>
        Marque as suas respostas em {titulo}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-n5">
        Leia o caderno no leitor acima e marque as alternativas aqui — você
        não precisa sair do Gabaru. {gabarito ? "Correção automática pelo gabarito oficial conferido." : "Conferência manual: compare suas marcações com o gabarito oficial da mesma prova e versão."} As respostas ficam salvas neste navegador.
      </p>

      <label className="mt-5 flex flex-wrap items-center gap-3 text-sm font-semibold">
        Número de questões
        <select disabled={!!gabarito}
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

      {compacto && <p className="mt-3 text-sm text-n5">Selecione o mesmo número da questão que está lendo no caderno.</p>}
      {compacto && <label className="mt-4 flex items-center gap-3 font-semibold">Questão
        <select className="min-h-12 rounded border border-n2 bg-white px-3" value={questaoAtual} onChange={e => setQuestaoAtual(Number(e.currentTarget.value))}>
          {Array.from({length: total}, (_,i) => <option value={i+1} key={i+1}>{i+1}{respostas[i+1] ? " · respondida" : ""}</option>)}
        </select> de {total}</label>}
      {compacto && gabarito?.[questaoAtual-1] === "*" && <p className="gb-notice mt-3" role="status">Questão anulada no gabarito oficial; não entra nos acertos, erros ou questões em branco.</p>}
      <ol className={compacto ? "mt-4 grid gap-2" : "mt-4 grid gap-2 sm:grid-cols-2"}>
        {(compacto ? [questaoAtual] : Array.from({ length: total }, (_, i) => i + 1)).map((n) => (
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
                    disabled={finalizado || gabarito?.[n-1] === "*"}
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

      {compacto && <div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={questaoAtual === 1} className="min-h-12 rounded border border-n2 px-3" onClick={()=>setQuestaoAtual(questaoAtual-1)}>← Anterior</button><button type="button" disabled={questaoAtual === total} className="min-h-12 rounded border border-n2 px-3" onClick={()=>setQuestaoAtual(questaoAtual+1)}>Próxima →</button></div>}
      {gabarito && !finalizado && <button type="button" className="gb-button mt-6" onClick={()=>setFinalizado(true)}>Corrigir prova →</button>}
      {gabarito && finalizado && <div className="gb-notice mt-6" role="status"><h3 className="font-bold">Resultado da prova</h3><p>{quantidade(gabarito.filter((g,i)=>g !== "*" && !!respostas[i+1] && g.includes(respostas[i+1])).length,"acerto","acertos")} · {quantidade(gabarito.filter((g,i)=>g !== "*" && respostas[i+1] && !g.includes(respostas[i+1])).length,"erro","erros")} · {gabarito.filter((g,i)=>g !== "*" && !respostas[i+1]).length} em branco · {quantidade(gabarito.filter(g=>g === "*").length,"anulada","anuladas")}.</p><details className="mt-3"><summary>Revisar respostas e gabarito</summary><ol className="mt-3 grid gap-2 sm:grid-cols-2">{gabarito.map((g,i)=><li key={i}>Questão {i+1}: sua resposta {respostas[i+1] ?? "—"} · gabarito <strong>{g === "*" ? "Anulada" : g.split("").join(" ou ")}</strong></li>)}</ol></details><button type="button" className="gb-text-link mt-4" onClick={()=>setFinalizado(false)}>Voltar às respostas</button></div>}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          className="min-h-12 rounded border border-n2 bg-white px-4 font-semibold"
          onClick={() => {
            if (window.confirm("Apagar todas as marcações desta sessão?"))
              { setRespostas({}); setFinalizado(false); setQuestaoAtual(1); }
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

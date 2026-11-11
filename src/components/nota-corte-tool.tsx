"use client";
import { useMemo, useState } from "react";
import dadosJson from "@/data/etec-demanda-cortes.json";

/**
 * Ferramenta "Minha nota dá para passar?" — Vestibulinho ETEC.
 *
 * Dados: src/data/etec-demanda-cortes.json (gerado por
 * scripts/prepare-demanda-cortes.mjs a partir das fontes oficiais do
 * Centro Paula Souza/FAT e das listas de classificação oficiais).
 *
 * REGRA DE HONESTIDADE: nota de corte só aparece onde foi lida de uma
 * lista de classificação oficial (campo `corte`). Nas restantes
 * combinações mostramos a demanda oficial e o estado "em coleta" —
 * nunca estimativas disfarçadas de corte.
 */

export type DemandaItem = {
  edicao: string;
  vagas: number | null;
  inscritos: number | null;
  demandaCv: number | null;
  fonteTipo: string;
  fonteUrl: string | null;
};
export type CorteReal = {
  edicao: string;
  vagas: number | null;
  notaCorte: number;
  notaMaior: number | null;
  nClassificados: number | null;
  fonteUrl: string | null;
};
export type ListaRecuperada = {
  edicao: string;
  notaMaior: number | null;
  nClassificados: number | null;
  ultimaNota: number | null;
  fonteUrl: string | null;
};
export type Combinacao = {
  unidade: string;
  municipio: string | null;
  curso: string;
  turno: string;
  modalidade: string | null;
  demanda: DemandaItem[];
  corte: CorteReal | null;
  listaRecuperada: ListaRecuperada | null;
};

const combinacoes = (
  dadosJson as unknown as { combinacoes: Combinacao[] }
).combinacoes;

const fmt = (n: number, casas = 2) =>
  n.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
const fmtCv = (n: number) =>
  n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
const edicaoLabel = (e: string) => e.replace(".", "/");

export function NotaCorteTool() {
  const primeira = combinacoes[0];
  const [unidade, setUnidade] = useState(primeira.unidade);
  const [curso, setCurso] = useState(primeira.curso);
  const [turno, setTurno] = useState(primeira.turno);
  const [acertos, setAcertos] = useState(40);
  const [bonusPublica, setBonusPublica] = useState(false);
  const [bonusAfro, setBonusAfro] = useState(false);

  const unidades = useMemo(
    () => [...new Set(combinacoes.map((c) => c.unidade))].sort(),
    [],
  );
  const cursos = useMemo(
    () =>
      [
        ...new Set(
          combinacoes.filter((c) => c.unidade === unidade).map((c) => c.curso),
        ),
      ].sort(),
    [unidade],
  );
  const doCurso = useMemo(
    () => combinacoes.filter((c) => c.unidade === unidade && c.curso === curso),
    [unidade, curso],
  );
  const combo = doCurso.find((c) => c.turno === turno) ?? doCurso[0];

  const fator = 1 + (bonusAfro ? 0.03 : 0) + (bonusPublica ? 0.1 : 0);
  const nf = acertos * fator;
  const corte = combo?.corte ?? null;
  const necessarios = corte ? Math.ceil(corte.notaCorte / fator - 1e-9) : null;
  const acima = corte ? nf >= corte.notaCorte : false;

  const aoMudarUnidade = (u: string) => {
    setUnidade(u);
    const primeiroCurso = combinacoes.find((c) => c.unidade === u);
    if (primeiroCurso) {
      setCurso(primeiroCurso.curso);
      setTurno(primeiroCurso.turno);
    }
  };
  const aoMudarCurso = (cu: string) => {
    setCurso(cu);
    const primeiroTurno = combinacoes.find(
      (c) => c.unidade === unidade && c.curso === cu,
    );
    if (primeiroTurno) setTurno(primeiroTurno.turno);
  };
  const aoMudarAcertos = (v: string) => {
    const n = Number(v);
    if (Number.isFinite(n)) setAcertos(Math.min(50, Math.max(0, Math.round(n))));
  };

  if (!combo) return null;
  const demandaRecente = combo.demanda[0];

  return (
    <div className="rounded-lg border border-n2 bg-[#fffdf7] p-6 shadow-[0_14px_36px_#23232312] sm:p-8">
      <fieldset>
        <legend className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-n4">
          1 · Seu curso-alvo
        </legend>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="nc-unidade" className="mb-2 block text-sm font-semibold">
              Unidade (ETEC)
            </label>
            <select
              id="nc-unidade"
              className="min-h-12 w-full rounded-md border border-n3 bg-paper px-3"
              value={unidade}
              onChange={(e) => aoMudarUnidade(e.target.value)}
            >
              {unidades.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="nc-curso" className="mb-2 block text-sm font-semibold">
              Curso
            </label>
            <select
              id="nc-curso"
              className="min-h-12 w-full rounded-md border border-n3 bg-paper px-3"
              value={curso}
              onChange={(e) => aoMudarCurso(e.target.value)}
            >
              {cursos.map((cu) => (
                <option key={cu} value={cu}>
                  {cu}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="nc-turno" className="mb-2 block text-sm font-semibold">
              Turno
            </label>
            <select
              id="nc-turno"
              className="min-h-12 w-full rounded-md border border-n3 bg-paper px-3"
              value={combo.turno}
              onChange={(e) => setTurno(e.target.value)}
            >
              {doCurso.map((c) => (
                <option key={c.turno || "sem-turno"} value={c.turno}>
                  {c.turno || "Turno não informado pela fonte"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      <div className="mt-6 rounded-md border border-dashed border-n3 bg-paper p-4" role="note">
        {demandaRecente ? (
          <>
            <p className="text-sm">
              <strong>Demanda oficial {edicaoLabel(demandaRecente.edicao)}:</strong>{" "}
              <span className="text-xl font-bold text-gold">
                {demandaRecente.demandaCv != null
                  ? `${fmtCv(demandaRecente.demandaCv)} candidatos por vaga`
                  : "não publicada"}
              </span>
              {demandaRecente.vagas != null &&
                ` · ${demandaRecente.vagas} vagas`}
              {demandaRecente.inscritos != null &&
                ` · ${demandaRecente.inscritos.toLocaleString("pt-BR")} inscritos`}
              {combo.demanda.length > 1 &&
                ` · edição anterior: ${combo.demanda
                  .slice(1)
                  .map(
                    (d) =>
                      `${edicaoLabel(d.edicao)} = ${d.demandaCv != null ? fmtCv(d.demandaCv) : "—"} c/v`,
                  )
                  .join("; ")}`}
            </p>
            {demandaRecente.fonteUrl && (
              <p className="mt-1 text-xs text-n4">
                Fonte:{" "}
                <a
                  className="underline"
                  href={demandaRecente.fonteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  publicação oficial do Centro Paula Souza ↗
                </a>
              </p>
            )}
          </>
        ) : (
          <p className="text-sm">
            Ainda não temos a demanda oficial publicada para esta combinação —
            ela entra na base quando o Centro Paula Souza a divulgar.
          </p>
        )}
      </div>

      <fieldset className="mt-8">
        <legend className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-n4">
          2 · Sua projeção na prova (50 questões)
        </legend>
        <div className="mt-4 grid gap-6 md:grid-cols-[1fr_220px] md:items-end">
          <div>
            <label htmlFor="nc-acertos" className="mb-2 block text-sm font-semibold">
              Quantas questões você acerta (ou quer acertar)?
            </label>
            <div className="flex items-center gap-4">
              <input
                id="nc-acertos"
                type="range"
                min={0}
                max={50}
                step={1}
                value={acertos}
                onChange={(e) => aoMudarAcertos(e.target.value)}
                className="w-full accent-[#c8501e]"
              />
              <input
                type="number"
                min={0}
                max={50}
                value={acertos}
                onChange={(e) => aoMudarAcertos(e.target.value)}
                aria-label="Acertos (número)"
                className="min-h-12 w-20 rounded-md border border-n3 bg-paper px-3 text-center text-lg font-bold"
              />
            </div>
            <div className="mt-4 grid gap-2 text-sm">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={bonusPublica}
                  onChange={(e) => setBonusPublica(e.target.checked)}
                  className="mt-1 size-4 accent-[#c8501e]"
                />
                <span>
                  Fiz todo o Ensino Fundamental II em escola pública{" "}
                  <strong>(+10%)</strong>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={bonusAfro}
                  onChange={(e) => setBonusAfro(e.target.checked)}
                  className="mt-1 size-4 accent-[#c8501e]"
                />
                <span>
                  Autodeclaração afrodescendente <strong>(+3%)</strong>
                </span>
              </label>
            </div>
          </div>
          <div className="rounded-md border-2 border-ink bg-paper p-4 text-center">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-n4">
              Sua nota final projetada
            </p>
            <p className="mt-1 text-4xl font-bold tracking-tight">{fmt(nf)}</p>
            <p className="mt-1 text-xs text-n5">
              NF = {acertos} acertos × {fmt(fator)}
              {bonusPublica || bonusAfro
                ? ` (com ${[
                    bonusPublica && "+10%",
                    bonusAfro && "+3%",
                  ]
                    .filter(Boolean)
                    .join(" e ")})`
                : " (sem pontuação acrescida)"}
            </p>
          </div>
        </div>
      </fieldset>

      <div className="mt-8" aria-live="polite">
        {corte ? (
          <div className="grid items-center gap-6 rounded-md border border-n2 bg-paper p-5 sm:grid-cols-[auto_1fr] sm:p-6">
            <span className={`gb-stamp ${acima ? "" : "gb-stamp-ink"}`}>
              {acima ? (
                <>
                  Dá para
                  <br />
                  passar ✓
                </>
              ) : (
                <>
                  Ainda
                  <br />
                  não
                </>
              )}
            </span>
            <div>
              <h2 className="text-xl font-bold">
                {acima
                  ? "Sua projeção fica acima do corte real deste curso."
                  : "Sua projeção fica abaixo do corte real deste curso."}
              </h2>
              <p className="mt-2 leading-relaxed text-n5">
                Na edição {edicaoLabel(corte.edicao)}, o corte de 1ª chamada de{" "}
                {combo.curso} ({combo.unidade}, {combo.turno.toLowerCase()}) foi{" "}
                <strong className="text-ink">{fmt(corte.notaCorte)}</strong> — a
                nota final do classificado na posição {corte.vagas} (= nº de
                vagas), já com a pontuação acrescida.
                {corte.notaMaior != null &&
                  ` A maior nota da lista foi ${fmt(corte.notaMaior)}`}
                {corte.nClassificados != null &&
                  `, com ${corte.nClassificados.toLocaleString("pt-BR")} classificados no total`}
                .{" "}
                {acima
                  ? `Sua nota projetada (${fmt(nf)}) supera esse corte em ${fmt(nf - corte.notaCorte)}.`
                  : necessarios != null &&
                    `Para alcançar ${fmt(corte.notaCorte)} com o seu bônus, você precisaria de ${necessarios} acertos — faltam ${necessarios - acertos}.`}
              </p>
              {corte.fonteUrl && (
                <p className="mt-2 text-xs text-n4">
                  Fonte:{" "}
                  <a
                    className="underline"
                    href={corte.fonteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    lista de classificação oficial (cópia arquivada) ↗
                  </a>{" "}
                  — o Centro Paula Souza retirou as listas do site; o Gabaru
                  passa a arquivar cada edição.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-n2 bg-paper p-5 sm:p-6">
            <span className="inline-flex items-center rounded border border-n3 px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-n4">
              Nota de corte em coleta
            </span>
            <h2 className="mt-3 text-xl font-bold">
              Para este curso, ainda não publicamos nota de corte — porque ainda
              não a lemos numa lista oficial.
            </h2>
            <p className="mt-2 leading-relaxed text-n5">
              O corte sai da lista de classificação de cada unidade, que o
              Centro Paula Souza divulga por edição e depois retira do site.
              Estamos a recuperar e a arquivar essas listas, edição a edição.
              Enquanto isso, use a demanda acima como termômetro da
              concorrência: quanto mais candidatos por vaga, mais acertos
              costumam ser necessários. Não publicamos "estimativas" de corte:
              número sem lista oficial seria chute com cara de dado.
            </p>
            {combo.listaRecuperada && (
              <p className="mt-3 leading-relaxed text-n5">
                <strong className="text-ink">Avanço da coleta:</strong> a lista
                oficial de {edicaoLabel(combo.listaRecuperada.edicao)} deste
                curso já foi recuperada
                {combo.listaRecuperada.notaMaior != null &&
                  ` — maior nota ${fmt(combo.listaRecuperada.notaMaior)}`}
                {combo.listaRecuperada.nClassificados != null &&
                  `, ${combo.listaRecuperada.nClassificados} classificados`}
                {combo.listaRecuperada.ultimaNota != null &&
                  `, última nota da lista ${fmt(combo.listaRecuperada.ultimaNota)}`}
                . Como o documento não informa o nº de vagas, ainda não
                derivamos o corte dele.
                {combo.listaRecuperada.fonteUrl && (
                  <>
                    {" "}
                    <a
                      className="underline"
                      href={combo.listaRecuperada.fonteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver a lista arquivada ↗
                    </a>
                  </>
                )}
              </p>
            )}
          </div>
        )}
        <p className="mt-4 text-xs leading-relaxed text-n4">
          Projeção de estudo, não resultado oficial: o Vestibulinho não tem
          nota mínima e classifica por ranking dentro de cada curso, unidade e
          turno. O corte muda a cada edição — trate o da última edição como
          meta, não como garantia.
        </p>
      </div>
    </div>
  );
}

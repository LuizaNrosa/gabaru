"use client";
import { useMemo, useState } from "react";
import dadosJson from "@/data/coluni-demanda-cortes.json";

/**
 * Ferramenta "Minha nota dá para passar?" — COLUNI/UFV.
 *
 * Dados: src/data/coluni-demanda-cortes.json (gerado por
 * scripts/prepare-coluni-demanda-cortes.mjs a partir da base compilada
 * em ~/workspace/gabaru-dados-coluni/, só documentos oficiais da UFV).
 *
 * REGRA DE HONESTIDADE: a UFV não publica "nota de corte". O que esta
 * ferramenta mostra é o CORTE DERIVADO da lista oficial de convocados
 * de cada chamada — a menor pontuação entre os convocados — rotulado
 * como derivado em todo o lado. Modalidades/edições sem lista oficial
 * não aparecem; nada é estimado nem interpolado.
 *
 * Eras: a ferramenta cobre 2022 em diante (modalidades da Lei de
 * Cotas, escala oficial de 73 pontos, sem bônus). As edições de
 * 2016–2021 (lista geral com bônus já incluído nas notas, e escala de
 * 100 pontos em 2016–2017) estão na tabela histórica da página —
 * misturar as escalas no mesmo comparador induziria o aluno em erro.
 */

export type DemandaEdicao = {
  vagas: number | null;
  inscritos: number | null;
  candidatosPorVaga: number | null;
  fonteTipo: string;
  fonteUrl: string | null;
};
export type DemandaGrupo = {
  vagas: number | null;
  inscritos: number | null;
  candidatosPorVaga: number | null;
  fonteUrl: string | null;
};
export type ChamadaCorte = {
  chamada: number;
  notaCorte: number | null;
  notaMaior: number | null;
  nConvocados: number | null;
  fonteUrl: string | null;
};
export type ModalidadeColuni = {
  codigo: string;
  rotulo: string;
  descricao: string | null;
  grupoDemanda: number | null;
  vagas: number | null;
  demandaGrupo: DemandaGrupo | null;
  corte1aChamada: number | null;
  notaMaior1aChamada: number | null;
  nConvocados1aChamada: number | null;
  fonteUrlCorte: string | null;
  piso: { nota: number; chamada: number } | null;
  fronteiraEspera: number | null;
  nEmEspera: number | null;
  chamadas: ChamadaCorte[];
};
export type EdicaoColuni = {
  edicao: number;
  era: "siglas" | "grupos";
  escala: number;
  vagasTotal: number;
  demanda: DemandaEdicao | null;
  modalidades: ModalidadeColuni[];
};

const edicoes = (dadosJson as unknown as { edicoes: EdicaoColuni[] }).edicoes;

const COMPONENTES = [
  { id: "lp", rotulo: "Língua Portuguesa", questoes: 10, peso: 2 },
  { id: "mat", rotulo: "Matemática", questoes: 10, peso: 2 },
  { id: "cie", rotulo: "Ciências", questoes: 8, peso: 1 },
  { id: "ing", rotulo: "Inglês", questoes: 2, peso: 1 },
  { id: "geo", rotulo: "Geografia", questoes: 4, peso: 1 },
  { id: "his", rotulo: "História", questoes: 4, peso: 1 },
] as const;

const fmt = (n: number, casas = 2) =>
  n.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
const fmtCv = (n: number) =>
  n.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function NotaCorteColuniTool() {
  const [edicaoSel, setEdicaoSel] = useState(edicoes[0].edicao);
  const edicao =
    edicoes.find((e) => e.edicao === edicaoSel) ?? edicoes[0];
  const [codigoSel, setCodigoSel] = useState(edicoes[0].modalidades[0].codigo);
  const modalidade =
    edicao.modalidades.find((m) => m.codigo === codigoSel) ??
    edicao.modalidades[0];

  const [acertos, setAcertos] = useState<Record<string, number>>({
    lp: 7,
    mat: 7,
    cie: 5,
    ing: 1,
    geo: 3,
    his: 3,
  });
  const [pt, setPt] = useState(11);

  const pontosObjetivas = useMemo(
    () =>
      COMPONENTES.reduce(
        (s, c) => s + (acertos[c.id] ?? 0) * c.peso,
        0,
      ),
    [acertos],
  );
  const nota = pontosObjetivas + pt;

  const corte = modalidade.corte1aChamada;
  const piso = modalidade.piso;
  const fronteira = modalidade.fronteiraEspera;

  const zona = useMemo(() => {
    if (corte == null) return null;
    if (nota >= corte) return "convocacao" as const;
    if (piso && nota >= piso.nota) return "chamadas" as const;
    if (fronteira != null && nota > fronteira) return "espera" as const;
    return "abaixo" as const;
  }, [nota, corte, piso, fronteira]);

  const aoMudarEdicao = (v: string) => {
    const nova = edicoes.find((e) => e.edicao === Number(v));
    if (!nova) return;
    setEdicaoSel(nova.edicao);
    if (!nova.modalidades.some((m) => m.codigo === codigoSel)) {
      setCodigoSel(nova.modalidades[0].codigo);
    }
  };
  const aoMudarAcertos = (id: string, max: number, v: string) => {
    const n = Number(v);
    if (Number.isFinite(n))
      setAcertos((a) => ({
        ...a,
        [id]: Math.min(max, Math.max(0, Math.round(n))),
      }));
  };
  const aoMudarPt = (v: string) => {
    const n = Number(v);
    if (Number.isFinite(n)) setPt(Math.min(15, Math.max(0, Math.round(n))));
  };

  const rotuloModalidade = (m: ModalidadeColuni) =>
    edicao.era === "siglas" ? `${m.codigo} — ${m.rotulo}` : m.rotulo;

  return (
    <div className="rounded-lg border border-n2 bg-[#fffdf7] p-6 shadow-[0_14px_36px_#23232312] sm:p-8">
      <fieldset>
        <legend className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-n4">
          1 · Edição e modalidade (150 vagas, escola única)
        </legend>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="ncc-edicao"
              className="mb-2 block text-sm font-semibold"
            >
              Edição do exame
            </label>
            <select
              id="ncc-edicao"
              className="min-h-12 w-full rounded-md border border-n3 bg-paper px-3"
              value={edicao.edicao}
              onChange={(e) => aoMudarEdicao(e.target.value)}
            >
              {edicoes.map((e) => (
                <option key={e.edicao} value={e.edicao}>
                  {e.edicao}
                  {e.era === "grupos" ? " (grupos 1–9)" : " (siglas)"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="ncc-modalidade"
              className="mb-2 block text-sm font-semibold"
            >
              Sua modalidade de concorrência
            </label>
            <select
              id="ncc-modalidade"
              className="min-h-12 w-full rounded-md border border-n3 bg-paper px-3"
              value={modalidade.codigo}
              onChange={(e) => setCodigoSel(e.target.value)}
            >
              {edicao.modalidades.map((m) => (
                <option key={m.codigo} value={m.codigo}>
                  {rotuloModalidade(m)}
                </option>
              ))}
            </select>
          </div>
        </div>
        {modalidade.descricao && (
          <p className="mt-3 text-sm leading-relaxed text-n5">
            <strong className="text-ink">{rotuloModalidade(modalidade)}:</strong>{" "}
            {modalidade.descricao}
            {modalidade.vagas != null &&
              ` · ${modalidade.vagas} vagas nesta modalidade (edição ${edicao.edicao})`}
          </p>
        )}
        {edicao.era === "grupos" && (
          <p className="mt-2 text-xs leading-relaxed text-n4">
            Nesta edição as modalidades eram os grupos numerados do relatório
            oficial candidato/vaga; a partir de 2025 passaram às siglas da Lei
            14.723/2023. Quem é de escola pública concorre ao mesmo tempo na
            ampla concorrência e nas modalidades para que é elegível — vale
            comparar mais do que uma.
          </p>
        )}
      </fieldset>

      <div
        className="mt-6 rounded-md border border-dashed border-n3 bg-paper p-4"
        role="note"
      >
        {edicao.demanda ? (
          <>
            <p className="text-sm">
              <strong>Demanda oficial {edicao.edicao}:</strong>{" "}
              <span className="text-xl font-bold text-gold">
                {edicao.demanda.candidatosPorVaga != null
                  ? `${fmtCv(edicao.demanda.candidatosPorVaga)} candidatos por vaga`
                  : "não publicada"}
              </span>
              {` · ${edicao.vagasTotal} vagas`}
              {edicao.demanda.inscritos != null &&
                ` · ${edicao.demanda.inscritos.toLocaleString("pt-BR")} inscritos`}
              {modalidade.demandaGrupo?.candidatosPorVaga != null &&
                ` · nesta modalidade: ${fmtCv(modalidade.demandaGrupo.candidatosPorVaga)} c/v (${modalidade.demandaGrupo.inscritos?.toLocaleString("pt-BR")} inscritos para ${modalidade.demandaGrupo.vagas} vagas)`}
            </p>
            {edicao.demanda.fonteUrl && (
              <p className="mt-1 text-xs text-n4">
                Fonte:{" "}
                <a
                  className="underline"
                  href={edicao.demanda.fonteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  relatório oficial candidato/vaga da UFV ↗
                </a>
              </p>
            )}
          </>
        ) : (
          <p className="text-sm">
            A demanda oficial desta edição não foi localizada no portal da
            UFV — ela entra na base se o documento oficial aparecer.
          </p>
        )}
      </div>

      <fieldset className="mt-8">
        <legend className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-n4">
          2 · Sua projeção na prova (fórmula oficial: 73 pontos)
        </legend>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_220px] lg:items-start">
          <div className="grid gap-4 sm:grid-cols-2">
            {COMPONENTES.map((c) => (
              <div key={c.id}>
                <label
                  htmlFor={`ncc-${c.id}`}
                  className="mb-2 block text-sm font-semibold"
                >
                  {c.rotulo}{" "}
                  <span className="font-normal text-n4">
                    ({c.questoes} questões × {c.peso} ={" "}
                    {c.questoes * c.peso} pts)
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id={`ncc-${c.id}`}
                    type="range"
                    min={0}
                    max={c.questoes}
                    step={1}
                    value={acertos[c.id] ?? 0}
                    onChange={(e) =>
                      aoMudarAcertos(c.id, c.questoes, e.target.value)
                    }
                    className="w-full accent-[#c8501e]"
                  />
                  <input
                    type="number"
                    min={0}
                    max={c.questoes}
                    value={acertos[c.id] ?? 0}
                    onChange={(e) =>
                      aoMudarAcertos(c.id, c.questoes, e.target.value)
                    }
                    aria-label={`Acertos em ${c.rotulo}`}
                    className="min-h-12 w-16 rounded-md border border-n3 bg-paper px-2 text-center text-lg font-bold"
                  />
                </div>
              </div>
            ))}
            <div>
              <label
                htmlFor="ncc-pt"
                className="mb-2 block text-sm font-semibold"
              >
                Produção textual{" "}
                <span className="font-normal text-n4">(0 a 15 pts)</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="ncc-pt"
                  type="range"
                  min={0}
                  max={15}
                  step={1}
                  value={pt}
                  onChange={(e) => aoMudarPt(e.target.value)}
                  className="w-full accent-[#c8501e]"
                />
                <input
                  type="number"
                  min={0}
                  max={15}
                  value={pt}
                  onChange={(e) => aoMudarPt(e.target.value)}
                  aria-label="Pontos estimados na produção textual"
                  className="min-h-12 w-16 rounded-md border border-n3 bg-paper px-2 text-center text-lg font-bold"
                />
              </div>
            </div>
          </div>
          <div className="rounded-md border-2 border-ink bg-paper p-4 text-center">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-n4">
              Sua nota final projetada
            </p>
            <p className="mt-1 text-4xl font-bold tracking-tight">
              {fmt(nota, 1)}
              <span className="text-lg font-semibold text-n4"> / 73</span>
            </p>
            <p className="mt-1 text-xs leading-relaxed text-n5">
              {COMPONENTES.map(
                (c) => `${(acertos[c.id] ?? 0) * c.peso}`,
              ).join(" + ")}{" "}
              + {pt} (redação) = {fmt(nota, 1)} pts
            </p>
          </div>
        </div>
      </fieldset>

      <div className="mt-8" aria-live="polite">
        {corte != null && zona ? (
          <div className="grid items-center gap-6 rounded-md border border-n2 bg-paper p-5 sm:grid-cols-[auto_1fr] sm:p-6">
            <span
              className={`gb-stamp ${zona === "abaixo" ? "gb-stamp-ink" : ""}`}
            >
              {zona === "convocacao" && (
                <>
                  Dá para
                  <br />
                  passar ✓
                </>
              )}
              {zona === "chamadas" && (
                <>
                  Zona de
                  <br />
                  chamadas
                </>
              )}
              {zona === "espera" && (
                <>
                  Zona de
                  <br />
                  espera
                </>
              )}
              {zona === "abaixo" && (
                <>
                  Ainda
                  <br />
                  não
                </>
              )}
            </span>
            <div>
              <h2 className="text-xl font-bold">
                {zona === "convocacao" &&
                  "Sua projeção fica acima do corte derivado de 1ª chamada desta edição."}
                {zona === "chamadas" &&
                  "Sua projeção fica abaixo da 1ª chamada, mas dentro da faixa em que esta edição continuou convocando."}
                {zona === "espera" &&
                  "Sua projeção fica na zona de espera: acima da maior nota de quem ficou esperando nesta edição."}
                {zona === "abaixo" &&
                  "Sua projeção fica abaixo das faixas históricas de convocação desta edição."}
              </h2>
              <p className="mt-2 leading-relaxed text-n5">
                Na edição {edicao.edicao}, na modalidade{" "}
                {rotuloModalidade(modalidade)}, o{" "}
                <strong className="text-ink">
                  corte derivado de 1ª chamada foi {fmt(corte)}
                </strong>{" "}
                — a menor nota entre os{" "}
                {modalidade.nConvocados1aChamada ?? "convocados"} convocados da
                lista oficial
                {modalidade.notaMaior1aChamada != null &&
                  ` (maior nota: ${fmt(modalidade.notaMaior1aChamada)})`}
                .{" "}
                {piso &&
                  `Nas chamadas seguintes, a convocação desceu até ${fmt(piso.nota)} (piso na ${piso.chamada}ª chamada). `}
                {fronteira != null &&
                  `Quem ficou em espera chegou até ${fmt(fronteira)}${modalidade.nEmEspera != null ? ` (${modalidade.nEmEspera.toLocaleString("pt-BR")} candidatos em espera nesta modalidade)` : ""}. `}
                {zona === "convocacao" &&
                  `Sua nota projetada (${fmt(nota, 1)}) supera o corte de 1ª chamada em ${fmt(nota - corte, 1)} pontos.`}
                {zona !== "convocacao" &&
                  `Faltam ${fmt(corte - nota, 1)} pontos para o corte de 1ª chamada desta edição.`}
              </p>
              {modalidade.chamadas.length > 1 && (
                <p className="mt-2 text-sm text-n5">
                  Corte derivado por chamada:{" "}
                  {modalidade.chamadas
                    .map(
                      (c) =>
                        `${c.chamada}ª = ${c.notaCorte != null ? fmt(c.notaCorte) : "—"}`,
                    )
                    .join(" · ")}
                </p>
              )}
              {modalidade.fonteUrlCorte && (
                <p className="mt-2 text-xs text-n4">
                  Fonte:{" "}
                  <a
                    className="underline"
                    href={modalidade.fonteUrlCorte}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    lista oficial de convocados da UFV ↗
                  </a>{" "}
                  — a UFV não publica “nota de corte”; derivamos o valor da
                  lista, sem nenhum dado individual.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-n2 bg-paper p-5 sm:p-6">
            <span className="inline-flex items-center rounded border border-n3 px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-n4">
              Corte em coleta
            </span>
            <h2 className="mt-3 text-xl font-bold">
              Para esta modalidade, ainda não há corte derivado — porque ainda
              não o lemos numa lista oficial de convocados.
            </h2>
            <p className="mt-2 leading-relaxed text-n5">
              Não publicamos estimativas: número sem lista oficial seria chute
              com cara de dado. Use a demanda acima como termômetro da
              concorrência enquanto a coleta continua.
            </p>
          </div>
        )}
        <p className="mt-4 text-xs leading-relaxed text-n4">
          Projeção de estudo, não resultado oficial: cortes derivados de
          edições passadas não garantem os da próxima. O COLUNI tem 150 vagas
          no total, para a 1ª série do Ensino Médio, numa única escola — a
          concorrência é por modalidade, e quem é elegível a modalidades de
          reserva concorre nelas e na ampla concorrência ao mesmo tempo.
        </p>
      </div>
    </div>
  );
}

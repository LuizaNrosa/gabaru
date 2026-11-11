"use client";
import { useMemo, useState } from "react";
import dadosJson from "@/data/ifsc-demanda-cortes.json";

/**
 * Ferramenta "Minha nota dá para passar?" — IFSC (Exame de Classificação).
 *
 * Dados: src/data/ifsc-demanda-cortes.json (gerado por
 * scripts/prepare-ifsc-demanda-cortes.mjs a partir da base compilada
 * em ~/workspace/gabaru-dados-ifsc/, só documentos oficiais do IFSC).
 *
 * REGRAS DE HONESTIDADE:
 * - O IFSC não publica "nota de corte" nominal. Coexistem dois métodos,
 *   sempre rotulados: o AGREGADO OFICIAL PUBLICADO (a lista oficial de
 *   pontuação máxima e mínima por curso — final, todas as chamadas) e o
 *   CORTE DERIVADO (só 2026.1: menor nota dos aprovados da 1ª chamada,
 *   por modalidade, calculada da Classificação Geral oficial).
 * - A nota é o NÚMERO DE ACERTOS (sem pesos nem bônus), com o formato
 *   da era da edição: 20 questões até 2023.2, 24 em 2024.1, 28 de
 *   2024.2 em diante.
 * - Edições sem lista oficial de pontuações (2019.2, 2020.1, 2022.1,
 *   2022.2, 2023.1, 2023.2) e cursos sem linha na lista aparecem como
 *   sem dado — nunca estimamos nem reutilizamos o corte de outro
 *   curso, turno ou edição.
 * - Curso com candidatos/vaga ≤ 1 foi DISPENSADO de prova (regra do
 *   edital): a ferramenta diz isso em vez de mostrar um "corte".
 */

export type ReferenciaIfsc = {
  modalidade: string;
  rotulo: string;
  oficial: {
    notaMinima: number;
    notaMaxima: number;
    fonteUrl: string | null;
  } | null;
  derivado1a: {
    notaMinima: number;
    notaMaxima: number;
    nConvocados: number | null;
    fonteUrl: string | null;
  } | null;
};
export type CursoIfsc = {
  campus: string;
  curso: string;
  turno: string;
  edital: string;
  demanda: {
    vagas: number | null;
    inscritos: number | null;
    candidatosPorVaga: number | null;
    candidatosPorVagaPublicado: number | null;
    provaDispensada: "fonte" | "regra" | null;
    fonteUrl: string | null;
  };
  referencias: ReferenciaIfsc[];
};
export type EdicaoIfsc = {
  edicao: string;
  editais: string[];
  questoes: number;
  vagasTotais: number | null;
  inscritosTotais: number | null;
  candidatosPorVagaEdicao: number | null;
  cursos: CursoIfsc[];
};

const edicoes = (dadosJson as unknown as { edicoes: EdicaoIfsc[] }).edicoes;

// Áreas da projeção por era (formatos verificados na Fase A — acervo):
// até 2023.2: Português 10 + Matemática 10; 2024.1: Linguagens 8 +
// Matemática 8 + Ciências Humanas 8; 2024.2+: 7 de cada área.
const AREAS: Record<number, { id: string; rotulo: string; questoes: number }[]> = {
  20: [
    { id: "lp", rotulo: "Língua Portuguesa", questoes: 10 },
    { id: "mat", rotulo: "Matemática", questoes: 10 },
  ],
  24: [
    { id: "ling", rotulo: "Linguagens", questoes: 8 },
    { id: "mat", rotulo: "Matemática", questoes: 8 },
    { id: "ch", rotulo: "Ciências Humanas", questoes: 8 },
  ],
  28: [
    { id: "lp", rotulo: "Língua Portuguesa", questoes: 7 },
    { id: "mat", rotulo: "Matemática", questoes: 7 },
    { id: "gh", rotulo: "Geografia e História", questoes: 7 },
    { id: "cie", rotulo: "Ciências", questoes: 7 },
  ],
};

const EDICOES_SEM_LISTA = [
  "2019.2",
  "2020.1",
  "2022.1",
  "2022.2",
  "2023.1",
  "2023.2",
];

const fmtCv = (n: number) =>
  n.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const fmtInt = (n: number) => n.toLocaleString("pt-BR");
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const acertosTxt = (n: number) => `${n} ${n === 1 ? "acerto" : "acertos"}`;

export function NotaCorteIfscTool() {
  const [edicaoSel, setEdicaoSel] = useState(edicoes[0].edicao);
  const edicao = edicoes.find((e) => e.edicao === edicaoSel) ?? edicoes[0];

  const campi = useMemo(
    () => [...new Set(edicao.cursos.map((c) => c.campus))],
    [edicao],
  );
  const [campusSel, setCampusSel] = useState(edicoes[0].cursos[0].campus);
  const campus = campi.includes(campusSel) ? campusSel : campi[0];
  const doCampus = edicao.cursos.filter((c) => c.campus === campus);

  const nomesCurso = useMemo(
    () => [...new Set(doCampus.map((c) => c.curso))],
    [doCampus],
  );
  const [cursoSel, setCursoSel] = useState(edicoes[0].cursos[0].curso);
  const nomeCurso = nomesCurso.includes(cursoSel) ? cursoSel : nomesCurso[0];
  const doCurso = doCampus.filter((c) => c.curso === nomeCurso);

  const [turnoSel, setTurnoSel] = useState(edicoes[0].cursos[0].turno);
  const turno = doCurso.some((c) => c.turno === turnoSel)
    ? turnoSel
    : doCurso[0].turno;
  const curso =
    doCurso.find((c) => c.turno === turno) ?? doCurso[0];

  const [modalidadeSel, setModalidadeSel] = useState<string | null>(null);
  const referencia =
    curso.referencias.find((r) => r.modalidade === modalidadeSel) ??
    curso.referencias[0] ??
    null;
  const geral =
    curso.referencias.find((r) => r.modalidade === "GERAL") ?? null;

  const [acertos, setAcertos] = useState<Record<string, number>>({
    lp: 5,
    mat: 4,
    gh: 5,
    cie: 5,
    ling: 5,
    ch: 5,
  });
  const areas = AREAS[edicao.questoes] ?? AREAS[28];
  const nota = areas.reduce(
    (s, a) => s + Math.min(a.questoes, Math.max(0, acertos[a.id] ?? 0)),
    0,
  );

  const dispensado = curso.demanda.provaDispensada != null;
  const oficial = referencia?.oficial ?? null;
  const derivado = referencia?.derivado1a ?? null;
  // Limiar alto: o corte de 1ª chamada quando existe; senão o agregado final.
  const alto = derivado?.notaMinima ?? oficial?.notaMinima ?? null;
  // Piso: com corte de 1ª chamada, a faixa final — o agregado da própria
  // modalidade ou, nas modalidades derivadas de 2026.1, o agregado GERAL
  // do curso (rotulado como tal onde é usado).
  const piso =
    derivado != null
      ? (oficial?.notaMinima ??
        (referencia?.modalidade !== "GERAL"
          ? (geral?.oficial?.notaMinima ?? null)
          : null))
      : null;
  const pisoEhGeral =
    derivado != null && oficial == null && referencia?.modalidade !== "GERAL";

  const zona = useMemo(() => {
    if (dispensado || alto == null) return null;
    if (nota >= alto) return "passar" as const;
    if (piso != null && nota >= piso) return "chamadas" as const;
    return "abaixo" as const;
  }, [dispensado, nota, alto, piso]);

  const aoMudarEdicao = (v: string) => {
    const nova = edicoes.find((e) => e.edicao === v);
    if (!nova) return;
    setEdicaoSel(nova.edicao);
    setCampusSel(nova.cursos[0].campus);
    setCursoSel(nova.cursos[0].curso);
    setTurnoSel(nova.cursos[0].turno);
    setModalidadeSel(null);
  };
  const aoMudarCampus = (v: string) => {
    setCampusSel(v);
    const primeiro = edicao.cursos.find((c) => c.campus === v);
    if (primeiro) {
      setCursoSel(primeiro.curso);
      setTurnoSel(primeiro.turno);
    }
    setModalidadeSel(null);
  };
  const aoMudarCurso = (v: string) => {
    setCursoSel(v);
    const primeiro = doCampus.find((c) => c.curso === v);
    if (primeiro) setTurnoSel(primeiro.turno);
    setModalidadeSel(null);
  };
  const aoMudarTurno = (v: string) => {
    setTurnoSel(v);
    setModalidadeSel(null);
  };
  const aoMudarAcertos = (id: string, max: number, v: string) => {
    const n = Number(v);
    if (Number.isFinite(n))
      setAcertos((a) => ({
        ...a,
        [id]: Math.min(max, Math.max(0, Math.round(n))),
      }));
  };

  const edicaoSemLista = EDICOES_SEM_LISTA.includes(edicao.edicao);
  const minDispensa = curso.referencias.length
    ? Math.min(
        ...curso.referencias.map(
          (r) => r.oficial?.notaMinima ?? r.derivado1a?.notaMinima ?? 0,
        ),
      )
    : null;
  const maxDispensa = curso.referencias.length
    ? Math.max(
        ...curso.referencias.map(
          (r) => r.oficial?.notaMaxima ?? r.derivado1a?.notaMaxima ?? 0,
        ),
      )
    : null;

  return (
    <div className="rounded-lg border border-n2 bg-[#fffdf7] p-6 shadow-[0_14px_36px_#23232312] sm:p-8">
      <fieldset>
        <legend className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-n4">
          1 · Edição, câmpus, curso e turno
        </legend>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="nci-edicao"
              className="mb-2 block text-sm font-semibold"
            >
              Edição do Exame de Classificação
            </label>
            <select
              id="nci-edicao"
              className="min-h-12 w-full rounded-md border border-n3 bg-paper px-3"
              value={edicao.edicao}
              onChange={(e) => aoMudarEdicao(e.target.value)}
            >
              {edicoes.map((e) => (
                <option key={e.edicao} value={e.edicao}>
                  {e.edicao} · {e.questoes} questões
                  {e.cursos.every((c) => c.referencias.length === 0)
                    ? " · sem lista de pontuações"
                    : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="nci-campus"
              className="mb-2 block text-sm font-semibold"
            >
              Câmpus
            </label>
            <select
              id="nci-campus"
              className="min-h-12 w-full rounded-md border border-n3 bg-paper px-3"
              value={campus}
              onChange={(e) => aoMudarCampus(e.target.value)}
            >
              {campi.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="nci-curso"
              className="mb-2 block text-sm font-semibold"
            >
              Curso técnico integrado
            </label>
            <select
              id="nci-curso"
              className="min-h-12 w-full rounded-md border border-n3 bg-paper px-3"
              value={nomeCurso}
              onChange={(e) => aoMudarCurso(e.target.value)}
            >
              {nomesCurso.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="nci-turno"
              className="mb-2 block text-sm font-semibold"
            >
              Turno
            </label>
            <select
              id="nci-turno"
              className="min-h-12 w-full rounded-md border border-n3 bg-paper px-3"
              value={turno}
              onChange={(e) => aoMudarTurno(e.target.value)}
            >
              {doCurso.map((c) => (
                <option key={c.turno} value={c.turno}>
                  {cap(c.turno)}
                </option>
              ))}
            </select>
          </div>
          {curso.referencias.length > 1 && (
            <div>
              <label
                htmlFor="nci-modalidade"
                className="mb-2 block text-sm font-semibold"
              >
                Modalidade de concorrência
              </label>
              <select
                id="nci-modalidade"
                className="min-h-12 w-full rounded-md border border-n3 bg-paper px-3"
                value={referencia?.modalidade ?? ""}
                onChange={(e) => setModalidadeSel(e.target.value)}
              >
                {curso.referencias.map((r) => (
                  <option key={r.modalidade} value={r.modalidade}>
                    {r.modalidade === "GERAL"
                      ? "Classificação geral — agregado oficial"
                      : `${r.modalidade} — ${r.rotulo}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        {curso.referencias.length === 1 && referencia && (
          <p className="mt-3 text-sm leading-relaxed text-n5">
            <strong className="text-ink">Referência publicada:</strong>{" "}
            {referencia.modalidade === "GERAL"
              ? "classificação geral (todas as modalidades)"
              : `${referencia.modalidade} — ${referencia.rotulo}`}
            {referencia.oficial &&
              " · agregado oficial publicado pelo IFSC"}
            {referencia.derivado1a &&
              " · com corte derivado de 1ª chamada"}
            .
          </p>
        )}
        {referencia && curso.referencias.length > 1 && (
          <p className="mt-3 text-sm leading-relaxed text-n5">
            <strong className="text-ink">{referencia.rotulo}:</strong>{" "}
            {referencia.derivado1a
              ? "esta modalidade tem corte derivado de 1ª chamada (2026.1)"
              : referencia.oficial
                ? "esta referência é o agregado oficial publicado pelo IFSC (final, todas as chamadas)"
                : ""}
            {referencia.modalidade === "GERAL" &&
              " — a linha GERAL é o agregado oficial do curso inteiro, sem separação por modalidade"}
            .
          </p>
        )}
        <p className="mt-2 text-xs leading-relaxed text-n4">
          Edital {curso.edital} · Exame de Classificação do IFSC. Em algumas
          edições, determinados câmpus ofertaram vagas por sorteio público —
          esta ferramenta cobre só os cursos com prova.
        </p>
      </fieldset>

      <div
        className="mt-6 rounded-md border border-dashed border-n3 bg-paper p-4"
        role="note"
      >
        <p className="text-sm">
          <strong>
            Demanda oficial {edicao.edicao} — {curso.curso} ({campus},{" "}
            {curso.turno}):
          </strong>{" "}
          <span className="text-xl font-bold text-gold">
            {curso.demanda.candidatosPorVaga != null
              ? `${fmtCv(curso.demanda.candidatosPorVaga)} candidatos por vaga`
              : "não publicada"}
          </span>
          {curso.demanda.vagas != null && ` · ${curso.demanda.vagas} vagas`}
          {curso.demanda.inscritos != null &&
            ` · ${fmtInt(curso.demanda.inscritos)} inscritos`}
          {edicao.inscritosTotais != null &&
            ` · na edição inteira: ${fmtInt(edicao.inscritosTotais)} inscritos para ${edicao.vagasTotais} vagas`}
        </p>
        {curso.demanda.candidatosPorVagaPublicado != null &&
          curso.demanda.candidatosPorVaga != null &&
          // Só o erro real da fonte (Jaraguá 2026.2: 0,94 impresso para
          // 37/35 = 1,06). Diferenças de ±0,01 são modo de arredondamento
          // do documento, não erro — não geram nota.
          Math.abs(
            curso.demanda.candidatosPorVagaPublicado -
              curso.demanda.candidatosPorVaga,
          ) > 0.05 && (
            <p className="mt-1 text-xs text-n4">
              O documento oficial imprime{" "}
              {fmtCv(curso.demanda.candidatosPorVagaPublicado)} c/v para este
              curso — valor que não bate com os próprios inscritos e vagas do
              documento ({fmtInt(curso.demanda.inscritos ?? 0)}/
              {curso.demanda.vagas}); mostramos o quociente calculado, como
              fazemos nas outras frentes.
            </p>
          )}
        {curso.demanda.fonteUrl && (
          <p className="mt-1 text-xs text-n4">
            Fonte:{" "}
            <a
              className="underline"
              href={curso.demanda.fonteUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              relação candidato/vaga oficial do IFSC ↗
            </a>
          </p>
        )}
      </div>

      {dispensado ? (
        <div className="mt-8" aria-live="polite">
          <div className="grid items-center gap-6 rounded-md border border-n2 bg-paper p-5 sm:grid-cols-[auto_1fr] sm:p-6">
            <span className="gb-stamp">
              Sem
              <br />
              prova ✓
            </span>
            <div>
              <h2 className="text-xl font-bold">
                Neste ano, este curso nem teve prova — todos os inscritos
                entraram.
              </h2>
              <p className="mt-2 leading-relaxed text-n5">
                Na edição {edicao.edicao}, {curso.curso} ({campus},{" "}
                {curso.turno}) teve {fmtInt(curso.demanda.inscritos ?? 0)}{" "}
                inscritos para {curso.demanda.vagas} vagas —{" "}
                {curso.demanda.candidatosPorVaga != null &&
                  `${fmtCv(curso.demanda.candidatosPorVaga)} candidatos por vaga, `}
                ou seja, inscritos em número menor ou igual ao de vagas. Pela
                regra do edital (item 7.2), nesses casos não se realiza o
                Exame de Classificação: os inscritos são aprovados
                automaticamente.{" "}
                {curso.demanda.provaDispensada === "fonte"
                  ? "O próprio documento oficial de candidato/vaga assinala este curso como dispensado."
                  : "A dispensa resulta de aplicarmos essa regra aos números oficiais de inscritos e vagas."}
              </p>
              {minDispensa != null && maxDispensa != null && (
                <p className="mt-2 text-sm text-n5">
                  A lista oficial de pontuação deste curso regista notas
                  entre {minDispensa} e {maxDispensa}{" "}
                  {maxDispensa === 1 ? "acerto" : "acertos"} — coerente com a
                  aprovação de todos os inscritos. Sem concorrência, esse
                  valor não funciona como corte, por isso não o usamos como
                  referência.
                </p>
              )}
              <p className="mt-2 text-sm text-n5">
                Para estudar a tua posição, escolhe outra edição deste mesmo
                curso acima — nas edições com prova, mostramos o agregado
                oficial e, em 2026.1, o corte derivado de 1ª chamada.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <fieldset className="mt-8">
            <legend className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-n4">
              2 · Sua projeção na prova (nota = número de acertos, sem
              pesos)
            </legend>
            <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_220px] lg:items-start">
              <div className="grid gap-4 sm:grid-cols-2">
                {areas.map((a) => (
                  <div key={a.id}>
                    <label
                      htmlFor={`nci-${a.id}`}
                      className="mb-2 block text-sm font-semibold"
                    >
                      {a.rotulo}{" "}
                      <span className="font-normal text-n4">
                        ({a.questoes} questões)
                      </span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        id={`nci-${a.id}`}
                        type="range"
                        min={0}
                        max={a.questoes}
                        step={1}
                        value={Math.min(
                          a.questoes,
                          Math.max(0, acertos[a.id] ?? 0),
                        )}
                        onChange={(e) =>
                          aoMudarAcertos(a.id, a.questoes, e.target.value)
                        }
                        className="w-full accent-[#c8501e]"
                      />
                      <input
                        type="number"
                        min={0}
                        max={a.questoes}
                        value={Math.min(
                          a.questoes,
                          Math.max(0, acertos[a.id] ?? 0),
                        )}
                        onChange={(e) =>
                          aoMudarAcertos(a.id, a.questoes, e.target.value)
                        }
                        aria-label={`Acertos em ${a.rotulo}`}
                        className="min-h-12 w-16 rounded-md border border-n3 bg-paper px-2 text-center text-lg font-bold"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-md border-2 border-ink bg-paper p-4 text-center">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-n4">
                  Seus acertos projetados
                </p>
                <p className="mt-1 text-4xl font-bold tracking-tight">
                  {nota}
                  <span className="text-lg font-semibold text-n4">
                    {" "}
                    / {edicao.questoes}
                  </span>
                </p>
                <p className="mt-1 text-xs leading-relaxed text-n5">
                  {areas
                    .map(
                      (a) =>
                        `${Math.min(a.questoes, Math.max(0, acertos[a.id] ?? 0))}`,
                    )
                    .join(" + ")}{" "}
                  = {nota} acertos (a classificação é por acertos, sem
                  pesos)
                </p>
              </div>
            </div>
          </fieldset>

          <div className="mt-8" aria-live="polite">
            {referencia && alto != null && zona ? (
              <div className="grid items-center gap-6 rounded-md border border-n2 bg-paper p-5 sm:grid-cols-[auto_1fr] sm:p-6">
                <span
                  className={`gb-stamp ${zona === "abaixo" ? "gb-stamp-ink" : ""}`}
                >
                  {zona === "passar" && (
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
                    {zona === "passar" &&
                      (derivado
                        ? "Sua projeção fica acima do corte derivado de 1ª chamada desta edição, nesta modalidade."
                        : "Sua projeção fica acima da menor nota de aprovado publicada pelo IFSC para este curso.")}
                    {zona === "chamadas" &&
                      "Sua projeção fica abaixo da 1ª chamada, mas dentro da faixa final histórica deste curso."}
                    {zona === "abaixo" &&
                      "Sua projeção fica abaixo das faixas históricas deste curso nesta edição."}
                  </h2>
                  <p className="mt-2 leading-relaxed text-n5">
                    Na edição {edicao.edicao}, em {curso.curso} ({campus},{" "}
                    {curso.turno})
                    {referencia.modalidade !== "GERAL" &&
                      `, na modalidade ${referencia.modalidade} (${referencia.rotulo})`}
                    :{" "}
                    {derivado && (
                      <>
                        o <strong className="text-ink">corte derivado de 1ª
                        chamada foi {acertosTxt(derivado.notaMinima)}</strong>{" "}
                        — a menor nota entre os{" "}
                        {derivado.nConvocados ?? "aprovados"} aprovados da
                        Classificação Geral oficial
                        {` (maior nota: ${acertosTxt(derivado.notaMaxima)})`}
                        .{" "}
                      </>
                    )}
                    {oficial && (
                      <>
                        no{" "}
                        <strong className="text-ink">
                          agregado oficial publicado
                        </strong>{" "}
                        (lista de pontuação do IFSC, final — todas as
                        chamadas), a menor nota de aprovado foi{" "}
                        {acertosTxt(oficial.notaMinima)} e a maior,{" "}
                        {acertosTxt(oficial.notaMaxima)}.{" "}
                      </>
                    )}
                    {!oficial && pisoEhGeral && geral?.oficial && (
                      <>
                        no curso como um todo (classificação geral), o{" "}
                        <strong className="text-ink">agregado oficial</strong>{" "}
                        final regista menor nota de aprovado de{" "}
                        {acertosTxt(geral.oficial.notaMinima)} e maior de{" "}
                        {acertosTxt(geral.oficial.notaMaxima)}.{" "}
                      </>
                    )}
                    {zona === "passar" &&
                      `Sua projeção (${acertosTxt(nota)}) supera a referência em ${acertosTxt(nota - alto)}.`}
                    {zona !== "passar" &&
                      `Faltam ${acertosTxt(alto - nota)} para a referência de ${derivado ? "1ª chamada" : "aprovação final"} desta edição.`}
                  </p>
                  {(derivado?.fonteUrl || oficial?.fonteUrl) && (
                    <p className="mt-2 text-xs text-n4">
                      Fontes:{" "}
                      {derivado?.fonteUrl && (
                        <a
                          className="underline"
                          href={derivado.fonteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Classificação Geral oficial do IFSC ↗
                        </a>
                      )}
                      {derivado?.fonteUrl && oficial?.fonteUrl && " · "}
                      {oficial?.fonteUrl && (
                        <a
                          className="underline"
                          href={oficial.fonteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          lista oficial de pontuação do IFSC ↗
                        </a>
                      )}{" "}
                      — o IFSC não publica “nota de corte”; os valores são o
                      agregado oficial do instituto e, onde assinalado, o
                      corte que derivamos dele, sem nenhum dado individual.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-n2 bg-paper p-5 sm:p-6">
                <span className="inline-flex items-center rounded border border-n3 px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-n4">
                  {edicaoSemLista
                    ? "Corte não publicado"
                    : "Sem linha publicada"}
                </span>
                <h2 className="mt-3 text-xl font-bold">
                  {edicaoSemLista
                    ? `O IFSC não publicou a lista de pontuações da edição ${edicao.edicao}.`
                    : `Este curso não tem linha na lista oficial de pontuações de ${edicao.edicao}.`}
                </h2>
                <p className="mt-2 leading-relaxed text-n5">
                  {edicaoSemLista ? (
                    <>
                      Sem a lista oficial de pontuação máxima e mínima (ou
                      uma classificação com notas), não há corte para
                      mostrar — e nós não estimamos. Estão nesta situação as
                      edições 2019.2, 2020.1, 2022.1, 2022.2, 2023.1 e
                      2023.2. Usa a demanda acima como termômetro da
                      concorrência e compara com as edições vizinhas deste
                      mesmo curso, que têm o agregado oficial.
                    </>
                  ) : (
                    <>
                      A lista desta edição existe, mas não traz este curso
                      neste turno/modalidade — acontece com cursos sem
                      aprovados registados numa modalidade e com cursos fora
                      do documento principal da edição. Não reutilizamos o
                      corte de outro curso, turno ou modalidade: escolhe
                      outra combinação acima ou compara com as edições
                      vizinhas deste curso.
                    </>
                  )}
                </p>
              </div>
            )}
            <p className="mt-4 text-xs leading-relaxed text-n4">
              Projeção de estudo, não resultado oficial: cortes de edições
              passadas não garantem os da próxima. A classificação do IFSC é
              pela ordem decrescente do número de acertos, por curso e
              modalidade; em caso de empate, o edital usa como critérios as
              questões que a maioria errou no curso e a maior idade.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

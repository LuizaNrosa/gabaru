"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import dynamic from "next/dynamic";
const NotaCorteFuvestTool = dynamic(() => import("@/components/nota-corte-fuvest-tool").then((m) => m.NotaCorteFuvestTool), { loading: () => <p>Carregando consulta…</p> });
const NotaCorteUnicampTool = dynamic(() => import("@/components/nota-corte-unicamp-tool").then((m) => m.NotaCorteUnicampTool), { loading: () => <p>Carregando consulta…</p> });
const NotaCorteIfscTool = dynamic(() => import("@/components/nota-corte-ifsc-tool").then((m) => m.NotaCorteIfscTool), { loading: () => <p>Carregando consulta…</p> });
const NotaCorteColuniTool = dynamic(() => import("@/components/nota-corte-coluni-tool").then((m) => m.NotaCorteColuniTool), { loading: () => <p>Carregando consulta…</p> });
const NotaCorteUnespTool = dynamic(() => import("@/components/nota-corte-unesp-tool").then((m) => m.NotaCorteUnespTool), { loading: () => <p>Carregando consulta…</p> });
const NotaCorteSisuUfcTool = dynamic(() => import("@/components/nota-corte-sisu-ufc-tool").then((m) => m.NotaCorteSisuUfcTool), { loading: () => <p>Carregando consulta…</p> });
const NotaCorteIfmgTool = dynamic(() => import("@/components/nota-corte-ifmg-tool").then((m) => m.NotaCorteIfmgTool), { loading: () => <p>Carregando consulta…</p> });
const NotaCorteCotucaTool = dynamic(() => import("@/components/nota-corte-cotuca-tool").then((m) => m.NotaCorteCotucaTool), { loading: () => <p>Carregando consulta…</p> });
const NotaCorteIfrnTool = dynamic(() => import("@/components/nota-corte-ifrn-tool").then((m) => m.NotaCorteIfrnTool), { loading: () => <p>Carregando consulta…</p> });

const NotaCorteIfceTool = dynamic(() => import("@/components/nota-corte-ifce-tool").then((m) => m.NotaCorteIfceTool), { loading: () => <p>Carregando consulta…</p> });

const NotaCorteIfspTool = dynamic(() => import("@/components/nota-corte-ifsp-tool").then((m) => m.NotaCorteIfspTool), { loading: () => <p>Carregando consulta…</p> });

const NotaCorteTool = dynamic(() => import("@/components/nota-corte-tool").then((m) => m.NotaCorteTool), { loading: () => <p>Carregando consulta…</p> });

type Tipo = "vestibulinho" | "enem" | "vestibular";
type Opcao = { id: string; nome: string; ferramenta?: string; treino: string; detalhe?: string; status?: string };

const opcoes: Record<Tipo, Opcao[]> = {
  vestibulinho: [
    { id: "etec", nome: "ETEC", ferramenta: "/nota-de-corte#etec", treino: "/provas/etec", detalhe: "Compare com as combinações já verificadas." },
    { id: "coluni", nome: "COLUNI/UFV", ferramenta: "/nota-de-corte-coluni", treino: "/provas/coluni", detalhe: "Dados e cortes derivados das fontes disponíveis." },
    { id: "ifsc", nome: "IFSC", ferramenta: "/nota-de-corte-ifsc", treino: "/provas/ifsc", detalhe: "Consulte as edições e modalidades já conferidas." },
    { id: "cotuca", nome: "COTUCA", treino: "/provas", detalhe: "Confira cursos e vagas de 2027 e calcule a pontuação; corte em coleta." },
    { id: "senai", nome: "SENAI", treino: "/provas", detalhe: "Dados de corte em coleta; consulte o acervo disponível." },
    { id: "ifsp", nome: "IFSP", treino: "/provas/ifsp", status: "Demanda disponível · corte em coleta", detalhe: "Consulte a relação candidatos por vaga para cursos técnicos integrados em 2027/1." },
    { id: "ifmg", nome: "IFMG", treino: "/provas/ifmg", detalhe: "Escolha campus e curso para acompanhar a conferência das notas." },
    { id: "ifrn", nome: "IFRN", ferramenta: "/nota-de-corte/ifrn", treino: "/provas/ifrn", detalhe: "Escore da última posição aprovada na classificação de 2026; não é resultado de matrícula." },
    { id: "ifce", nome: "IFCE", treino: "/provas/ifce", status: "Referência de classificação disponível", detalhe: "IFCE Fortaleza 2026.2, ampla concorrência; outras modalidades e campi em conferência." },
    { id: "ifba", nome: "IFBA", treino: "/provas/ifba" },
  ],
  enem: [
    { id: "enem-sisu", nome: "ENEM / Sisu", ferramenta: "/nota-de-corte/sisu", treino: "/provas/enem", detalhe: "Consulta disponível para a UFC na chamada regular de 2026; demais universidades em coleta." },
  ],
  vestibular: [
    { id: "fuvest", nome: "FUVEST", ferramenta: "/nota-de-corte/fuvest", treino: "/provas/fuvest", detalhe: "Corte para a segunda fase por carreira e modalidade." },
    { id: "unicamp", nome: "Unicamp", ferramenta: "/nota-de-corte/unicamp", treino: "/provas/unicamp", detalhe: "Convocação à segunda fase por curso e modalidade." },
    { id: "unesp", nome: "Unesp", ferramenta: "/nota-de-corte/unesp", treino: "/provas/unesp", detalhe: "Corte para a segunda fase de 2026 por curso, cidade e modalidade." },
    { id: "uerj", nome: "UERJ", treino: "/provas/uerj" },
    { id: "uel", nome: "UEL", treino: "/provas/uel" },
  ],
};

export function SeletorNotaDeCorte() {
  const tipoId = useId();
  const instituicaoId = useId();
  const [tipo, setTipo] = useState<Tipo | "">("");
  const [id, setId] = useState("");
  useEffect(() => { if (window.location.hash === "#etec") { setTipo("vestibulinho"); setId("etec"); } }, []);
  const instituicoes = tipo ? opcoes[tipo] : [];
  const selecionada = instituicoes.find((item) => item.id === id);

  return (
    <section aria-labelledby="seletor-corte-titulo" className="rounded-lg border border-n2 bg-white/60 p-5 sm:p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={tipoId} className="mb-2 block font-semibold">Tipo de prova</label>
          <select id={tipoId} value={tipo} onChange={(event) => { setTipo(event.target.value as Tipo | ""); setId(""); }} className="min-h-12 w-full rounded border border-n2 bg-white px-3">
            <option value="">Escolha o tipo</option>
            <option value="vestibulinho">Vestibulinho</option>
            <option value="enem">ENEM</option>
            <option value="vestibular">Vestibular</option>
          </select>
        </div>
        <div>
          <label htmlFor={instituicaoId} className="mb-2 block font-semibold">Instituição ou processo</label>
          <select id={instituicaoId} value={id} disabled={!tipo} onChange={(event) => setId(event.target.value)} className="min-h-12 w-full rounded border border-n2 bg-white px-3 disabled:opacity-60">
            <option value="">{tipo ? "Escolha uma opção" : "Escolha o tipo primeiro"}</option>
            {instituicoes.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
          </select>
        </div>
      </div>
      {selecionada && !selecionada.ferramenta && <div className="gb-notice mt-6" aria-live="polite">
        <p className="font-bold">{selecionada.nome} · {selecionada.status ?? (selecionada.ferramenta ? "Consulta disponível" : "Dados de corte em coleta")}</p>
        <p className="mt-2 text-n5">{selecionada.detalhe ?? "Ainda estamos reunindo e conferindo os dados desta seleção. Você já pode conhecer o acervo ou acompanhar sua disponibilidade."}</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">

          {selecionada.ferramenta && selecionada.id !== "etec" && <Link href={selecionada.ferramenta} className="gb-text-link">Abrir página completa →</Link>}
          <Link href={selecionada.treino} className="gb-text-link">{selecionada.id === "ifba" ? "Ver disponibilidade" : "Treinar com provas"} →</Link>
        </div>
      </div>}
      {selecionada?.id === "etec" && <div className="mt-7"><NotaCorteTool /></div>}
      {selecionada && selecionada.id !== "etec" && selecionada.ferramenta && <div className="mt-7">
        <h3 className="mb-3 text-xl font-bold">Escolha seu objetivo · {selecionada.nome}</h3>
        {selecionada.id === "fuvest" && <NotaCorteFuvestTool />}
        {selecionada.id === "unicamp" && <NotaCorteUnicampTool />}
        {selecionada.id === "ifsc" && <NotaCorteIfscTool />}
        {selecionada.id === "coluni" && <NotaCorteColuniTool />}
        {selecionada.id === "unesp" && <NotaCorteUnespTool />}
        {selecionada.id === "enem-sisu" && <NotaCorteSisuUfcTool />}
        {selecionada.id === "ifrn" && <NotaCorteIfrnTool />}
      </div>}
      {selecionada?.id === "cotuca" && <div className="mt-7"><NotaCorteCotucaTool /><Link href="/nota-de-corte/cotuca" className="gb-text-link">Abrir página completa do COTUCA →</Link></div>}
      {selecionada?.id === "ifsp" && <div className="mt-7"><NotaCorteIfspTool /></div>}
      {selecionada?.id === "ifce" && <div className="mt-7"><NotaCorteIfceTool /></div>}
      {selecionada?.id === "ifmg" && <div className="mt-7"><NotaCorteIfmgTool /></div>}
      {selecionada && !selecionada.ferramenta && selecionada.id !== "ifmg" && selecionada.id !== "cotuca" && selecionada.id !== "ifce" && selecionada.id !== "ifsp" && <p className="mt-4 text-sm text-n5">Próxima etapa após a conferência: escolher {tipo === "enem" ? "universidade, campus, curso, turno e modalidade" : "curso e, quando houver, campus, turno e modalidade"}. A consulta será aberta quando houver dados para essa combinação.</p>}
    </section>
  );
}

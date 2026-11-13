"use client";

import Link from "next/link";
import { useId, useState } from "react";

type Tipo = "vestibulinho" | "enem" | "vestibular";
type Opcao = { id: string; nome: string; ferramenta?: string; treino: string; detalhe?: string };

const opcoes: Record<Tipo, Opcao[]> = {
  vestibulinho: [
    { id: "etec", nome: "ETEC", ferramenta: "/nota-de-corte#etec", treino: "/provas/etec", detalhe: "Compare com as combinações já verificadas." },
    { id: "coluni", nome: "COLUNI/UFV", ferramenta: "/nota-de-corte-coluni", treino: "/provas/coluni", detalhe: "Dados e cortes derivados das fontes disponíveis." },
    { id: "ifsc", nome: "IFSC", ferramenta: "/nota-de-corte-ifsc", treino: "/provas/ifsc", detalhe: "Consulte as edições e modalidades já conferidas." },
    { id: "cotuca", nome: "COTUCA", treino: "/provas", detalhe: "Dados de corte em coleta; consulte o acervo disponível." },
    { id: "senai", nome: "SENAI", treino: "/provas", detalhe: "Dados de corte em coleta; consulte o acervo disponível." },
    { id: "ifsp", nome: "IFSP", treino: "/provas/ifsp" },
    { id: "ifmg", nome: "IFMG", treino: "/provas/ifmg" },
    { id: "ifrn", nome: "IFRN", treino: "/provas/ifrn" },
    { id: "ifce", nome: "IFCE", treino: "/provas/ifce" },
    { id: "ifba", nome: "IFBA", treino: "/provas/ifba" },
  ],
  enem: [
    { id: "enem-sisu", nome: "ENEM / Sisu", treino: "/provas/enem" },
  ],
  vestibular: [
    { id: "fuvest", nome: "FUVEST", ferramenta: "/nota-de-corte/fuvest", treino: "/provas/fuvest", detalhe: "Corte para a segunda fase por carreira e modalidade." },
    { id: "unicamp", nome: "Unicamp", ferramenta: "/nota-de-corte/unicamp", treino: "/provas/unicamp", detalhe: "Convocação à segunda fase por curso e modalidade." },
    { id: "unesp", nome: "Unesp", treino: "/provas/unesp" },
    { id: "uerj", nome: "UERJ", treino: "/provas/uerj" },
    { id: "uel", nome: "UEL", treino: "/provas/uel" },
  ],
};

export function SeletorNotaDeCorte() {
  const tipoId = useId();
  const instituicaoId = useId();
  const [tipo, setTipo] = useState<Tipo | "">("");
  const [id, setId] = useState("");
  const instituicoes = tipo ? opcoes[tipo] : [];
  const selecionada = instituicoes.find((item) => item.id === id);

  return (
    <section aria-labelledby="seletor-corte-titulo" className="rounded-lg border border-n2 bg-white/60 p-5 sm:p-7">
      <p className="gb-eyebrow">ENCONTRE SUA REFERÊNCIA</p>
      <h2 id="seletor-corte-titulo" className="gb-section-title mt-3">Qual prova você vai fazer?</h2>
      <p className="mt-3 text-n5">Escolha o tipo de prova e a instituição para consultar os dados já disponíveis.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
      {selecionada && <div className="gb-notice mt-6" aria-live="polite">
        <p className="font-bold">{selecionada.nome} · {selecionada.ferramenta ? "Consulta disponível" : "Dados de corte em coleta"}</p>
        <p className="mt-2 text-n5">{selecionada.detalhe ?? "Ainda estamos reunindo e conferindo os dados desta seleção. Você já pode conhecer o acervo ou acompanhar sua disponibilidade."}</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {selecionada.ferramenta && <Link href={selecionada.ferramenta} className="gb-button">Consultar {selecionada.nome} →</Link>}
          <Link href={selecionada.treino} className="gb-text-link">{selecionada.id === "ifba" ? "Ver disponibilidade" : "Treinar com provas"} →</Link>
        </div>
      </div>}
    </section>
  );
}

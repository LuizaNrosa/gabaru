"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { CONTAINER } from "@/components/ui";

type Exame = { nome: string; detalhe: string; href: string; busca?: string; emColeta?: boolean };
type Grupo = { id: string; titulo: string; descricao: string; exames: Exame[] };

// Um catálogo único mantém a navegação e a busca consistentes à medida que o acervo cresce.
const grupos: Grupo[] = [
  { id: "enem", titulo: "ENEM", descricao: "Encontre os cadernos e pratique para o Exame Nacional do Ensino Médio.", exames: [
    { nome: "ENEM", detalhe: "Exame Nacional do Ensino Médio", href: "/provas/enem" },
  ] },
  { id: "vestibulares", titulo: "Vestibulares", descricao: "Provas para ingresso no ensino superior, organizadas por instituição e edição.", exames: [
    { nome: "FUVEST", detalhe: "Universidade de São Paulo · USP", href: "/provas/fuvest", busca: "sao paulo" },
    { nome: "Unesp", detalhe: "Universidade Estadual Paulista · Vunesp", href: "/provas/unesp", busca: "vunesp sao paulo" },
    { nome: "Unicamp", detalhe: "Universidade Estadual de Campinas · Comvest", href: "/provas/unicamp", busca: "comvest sao paulo" },
    { nome: "UERJ", detalhe: "Universidade do Estado do Rio de Janeiro", href: "/provas/uerj" },
    { nome: "UEL", detalhe: "Universidade Estadual de Londrina · Paraná", href: "/provas/uel" },
  ] },
  { id: "institutos-federais", titulo: "Institutos Federais", descricao: "Encontre o IF do seu estado. Estamos ampliando o acervo para mais regiões.", exames: [
    { nome: "IFSC", detalhe: "Instituto Federal de Santa Catarina", href: "/provas/ifsc", busca: "santa catarina" },
    { nome: "IFSP", detalhe: "Instituto Federal de São Paulo", href: "/provas/ifsp", busca: "sao paulo" },
    { nome: "IFMG", detalhe: "Instituto Federal de Minas Gerais", href: "/provas/ifmg" },
    { nome: "IFRN", detalhe: "Instituto Federal do Rio Grande do Norte", href: "/provas/ifrn" },
    { nome: "IFCE", detalhe: "Instituto Federal do Ceará · campus Fortaleza", href: "/provas/ifce", busca: "ceara" },
    { nome: "IFMT", detalhe: "Instituto Federal de Mato Grosso", href: "/provas/ifmt" },
    { nome: "IFRS", detalhe: "Instituto Federal do Rio Grande do Sul", href: "/provas/ifrs" },
    { nome: "IFBA", detalhe: "Instituto Federal da Bahia · acervo em coleta", href: "/provas/ifba", emColeta: true },
  ] },
  { id: "vestibulinhos", titulo: "Outros vestibulinhos", descricao: "Seleções para o ensino médio e técnico.", exames: [
    { nome: "ETEC", detalhe: "Vestibulinho do Centro Paula Souza · São Paulo", href: "/provas/etec", busca: "sao paulo" },
    { nome: "COLUNI", detalhe: "Colégio de Aplicação da UFV · Minas Gerais", href: "/provas/coluni", busca: "vicosa" },
  ] },
];

const normalizar = (valor: string) => valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function AcervoBusca() {
  const id = useId();
  const [busca, setBusca] = useState("");
  const termo = normalizar(busca);
  const resultados = grupos.map((grupo) => ({ ...grupo, exames: grupo.exames.filter((exame) => normalizar(`${exame.nome} ${exame.detalhe} ${exame.busca ?? ""}`).includes(termo)) }));
  const total = resultados.reduce((soma, grupo) => soma + grupo.exames.length, 0);
  return <>
    <section className={`${CONTAINER} pt-8`} aria-label="Encontrar prova">
      <label htmlFor={id} className="block font-semibold">Busque por prova, instituição ou estado</label>
      <div className="mt-2 flex max-w-2xl flex-wrap gap-3">
        <input id={id} type="search" value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Ex.: ENEM, Vunesp, Minas Gerais" className="min-h-12 min-w-0 flex-1 rounded border border-n2 bg-white px-4" />
        {busca && <button type="button" onClick={() => setBusca("")} className="min-h-12 rounded border border-n2 px-4 font-semibold">Limpar busca</button>}
      </div>
      <p className="mt-3 text-sm text-n5" aria-live="polite">{termo ? `${total} ${total === 1 ? "resultado" : "resultados"} para “${busca.trim()}”` : "Escolha uma instituição abaixo ou use a busca."}</p>
      {!termo && <nav className="mt-5 flex flex-wrap gap-x-5 gap-y-3" aria-label="Categorias de provas">{grupos.map((grupo) => <a key={grupo.id} className="gb-text-link" href={`#${grupo.id}`}>{grupo.titulo} ↓</a>)}</nav>}
      {termo && total === 0 && <p className="gb-notice mt-5">Ainda não encontramos essa instituição no acervo. Tente outra sigla, nome ou estado.</p>}
    </section>
    {resultados.filter((grupo) => grupo.exames.length > 0).map((grupo) => <section id={grupo.id} key={grupo.id} className={`${CONTAINER} py-10`} aria-labelledby={`${grupo.id}-titulo`}>
      <h2 id={`${grupo.id}-titulo`} className="gb-section-title">{grupo.titulo}</h2>
      <p className="mt-3 mb-6 text-n5">{grupo.descricao}</p>
      <div className="gb-content-grid">{grupo.exames.map((exame) => <Link key={exame.href} href={exame.href} className="gb-content-card">
        <h3>{exame.nome}</h3><p>{exame.detalhe}</p><span className="gb-text-link">{exame.emColeta ? "Acompanhar disponibilidade" : "Ver provas e disponibilidade"} →</span>
      </Link>)}</div>
    </section>)}
  </>;
}

"use client";

import { useState } from "react";
import Link from "next/link";
import dados from "@/data/cotuca-2027-ofertas.json";

type Tipo = "integrado" | "tecnico";

export function NotaCorteCotucaTool() {
  const [tipo, setTipo] = useState<Tipo>("integrado");
  const [codigo, setCodigo] = useState(16);
  const [portugues, setPortugues] = useState(0);
  const [matematica, setMatematica] = useState(0);
  const [ciencias, setCiencias] = useState(0);
  const [redacao, setRedacao] = useState(0);
  const ofertas = dados.ofertas.filter((o) => o.tipo === tipo);
  const oferta = ofertas.find((o) => o.codigo === codigo) ?? ofertas[0];
  const notaInicial = 3 * portugues + 4 * matematica + 2 * ciencias;
  const notaFinal = 3 * (portugues + redacao) + 2 * (4 * matematica + 2 * ciencias);
  const campos = [
    { id: "portugues", label: "Acertos em Português", value: portugues, set: setPortugues },
    { id: "matematica", label: "Acertos em Matemática", value: matematica, set: setMatematica },
    { id: "ciencias", label: "Acertos em Ciências", value: ciencias, set: setCiencias },
  ];
  return <section className="rounded-lg border border-n2 bg-white/70 p-5 sm:p-8" aria-label="Consulta COTUCA 2027">
    <p className="gb-eyebrow">1 · SEU CURSO NO COTUCA</p>
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <label className="font-semibold">Modalidade de curso<select value={tipo} onChange={(e) => { const value = e.target.value as Tipo; setTipo(value); setCodigo(value === "integrado" ? 16 : 31); setRedacao(0); }} className="mt-2 block min-h-12 w-full rounded border border-n2 bg-white px-3 font-normal"><option value="integrado">Técnico integrado ao ensino médio</option><option value="tecnico">Técnico concomitante externo</option></select></label>
      <label className="font-semibold">Curso e turno<select value={oferta.codigo} onChange={(e) => setCodigo(Number(e.target.value))} className="mt-2 block min-h-12 w-full rounded border border-n2 bg-white px-3 font-normal">{ofertas.map((o) => <option key={o.codigo} value={o.codigo}>{o.curso} · {o.turno} · código {o.codigo}</option>)}</select></label>
    </div>
    <div className="gb-notice mt-5" aria-live="polite"><strong>{oferta.vagas} vagas totais</strong> no edital 2027 para {oferta.curso}, {oferta.turno.toLowerCase()}. A distribuição entre modalidades segue o edital. <strong>Corte por curso e modalidade: em coleta.</strong></div>
    <p className="gb-eyebrow mt-8">2 · SUA PONTUAÇÃO</p>
    {tipo === "integrado" ? <>
      <p className="mt-3 text-n5">Informe os acertos em cada disciplina e uma nota estimada para a redação para calcular sua pontuação conforme o edital de 2027.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{campos.map((c) => <label key={c.id} className="font-semibold">{c.label} (0 a 12)<input type="number" min="0" max="12" step="1" value={c.value} onChange={(e) => c.set(Math.min(12, Math.max(0, Math.trunc(Number(e.target.value) || 0))))} className="mt-2 block min-h-12 w-full rounded border border-n2 bg-white px-3 font-normal" /></label>)}<label className="font-semibold">Redação (0 a 8)<input type="number" min="0" max="8" step="0.1" value={redacao} onChange={(e) => setRedacao(Math.min(8, Math.max(0, Number(e.target.value) || 0)))} className="mt-2 block min-h-12 w-full rounded border border-n2 bg-white px-3 font-normal" /></label></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2" aria-live="polite"><div className="rounded border border-n2 p-4"><p className="text-sm text-n5">Nota inicial ponderada · até 108</p><strong className="text-2xl">{notaInicial.toLocaleString("pt-BR")}</strong></div><div className="rounded border border-n2 p-4"><p className="text-sm text-n5">Projeção da nota final · até 204</p><strong className="text-2xl">{notaFinal.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</strong></div></div>
      <p className="mt-4 text-sm text-n5">A nota final é apenas uma projeção: o edital prevê correção da redação para candidatos dentro do limite de classificação por curso; redação zero elimina. A nota não indica aprovação.</p>
    </> : <p className="mt-3 text-n5">Para os cursos técnicos concomitantes externos, o edital de 2027 prevê redação de 0 a 10 pontos, com zero eliminatório. Esta escala é diferente da usada nos cursos integrados.</p>}
    <p className="mt-4 text-sm text-n5">Fonte: <a className="underline" href={`${dados.fonte}#page=4`} target="_blank" rel="noopener noreferrer">edital oficial COTUCA 2027 ↗</a>, tabelas de cursos nas páginas 4 e 5 e regras nas páginas 23–26. Valores dependem da modalidade e do processo; não garantem vaga.</p>
    <div className="gb-actions"><Link href="/provas" className="gb-button">Ver acervo de provas →</Link></div>
  </section>;
}

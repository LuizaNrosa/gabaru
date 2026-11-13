"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import dados from "@/data/ifsp-2027-demanda.json";

/** Demanda oficial agregada; não é uma nota de corte. */
export function NotaCorteIfspTool() {
  const [campus, setCampus] = useState("");
  const [oferta, setOferta] = useState("");
  const campi = useMemo(() => [...new Set(dados.ofertas.map(o => o.campus))].sort((a, b) => a.localeCompare(b, "pt-BR")), []);
  const ofertas = dados.ofertas.filter(o => o.campus === campus);
  const identificador = (o: typeof dados.ofertas[number]) => `${o.curso}|${o.turno}`;
  const escolhida = ofertas.find(o => identificador(o) === oferta);
  return <section aria-label="Consulta de demanda IFSP" className="rounded-lg border border-n2 bg-white/70 p-5 sm:p-8">
    <p className="gb-eyebrow">IFSP · TÉCNICO INTEGRADO · 2027/1</p>
    <h3 className="mt-3 text-xl font-bold">Escolha seu campus e curso</h3>
    <p className="mt-3 text-n5">Consulte a demanda oficial da oferta escolhida. A nota de corte por modalidade está em coleta: demanda não é nota de corte.</p>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <label className="font-semibold">Campus<select className="mt-2 block min-h-12 w-full rounded border border-n2 bg-white px-3 font-normal" value={campus} onChange={e => {setCampus(e.target.value); setOferta("");}}><option value="">Escolha o campus</option>{campi.map(c => <option key={c} value={c}>{c}</option>)}</select></label>
      <label className="font-semibold">Curso e turno<select className="mt-2 block min-h-12 w-full rounded border border-n2 bg-white px-3 font-normal disabled:opacity-60" disabled={!campus} value={oferta} onChange={e => setOferta(e.target.value)}><option value="">{campus ? "Escolha o curso" : "Escolha o campus primeiro"}</option>{ofertas.map(o => <option key={identificador(o)} value={identificador(o)}>{o.curso} · {o.turno}</option>)}</select></label>
    </div>
    {escolhida && <div className="gb-notice mt-5" aria-live="polite">
      <p className="font-bold">Demanda oficial 2027/1 · {escolhida.candidatos_por_vaga.toLocaleString("pt-BR", {maximumFractionDigits: 2})} candidatos por vaga</p>
      <p className="mt-2">{escolhida.vagas.toLocaleString("pt-BR")} vagas · {escolhida.inscritos.toLocaleString("pt-BR")} inscrições · {escolhida.curso}, {escolhida.turno.toLowerCase()}</p>
      <p className="mt-2">Nota de corte por modalidade e chamada: <strong>em coleta</strong>.</p>
      {escolhida.dispensada_prova && <p className="mt-3">O IFSP marcou esta oferta com dispensa de prova, conforme a nota da tabela e o item 9.6 do edital. A convocação ocorre conforme o cronograma oficial.</p>}
      <p className="mt-3 text-sm">Fonte: <a href={`${dados.fonte}#page=${escolhida.pagina}`} target="_blank" rel="noopener noreferrer" className="underline">relação oficial candidatos/vagas, página {escolhida.pagina} ↗</a>.</p>
    </div>}
    <p className="mt-5 text-sm text-n5">A tabela traz vagas e inscritos totais por oferta, sem corte por modalidade. O resultado e as convocações dependem das regras do edital e não podem ser deduzidos da relação candidatos/vagas. Acesse também as provas disponíveis para praticar.</p>
    <div className="gb-actions"><Link href="/provas/ifsp" className="gb-button">Treinar provas do IFSP →</Link></div>
  </section>;
}

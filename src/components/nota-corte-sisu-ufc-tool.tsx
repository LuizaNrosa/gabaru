"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import dados from "@/data/sisu-ufc-2026-cortes.json";

const descricao: Record<string, string> = {
  AC: "Ampla concorrência",
  LB_EP: "Escola pública · renda até 1 salário mínimo",
  LB_PCD: "Escola pública · renda até 1 salário mínimo · pessoa com deficiência",
  LB_PPI: "Escola pública · renda até 1 salário mínimo · pessoas pretas, pardas ou indígenas",
  LB_Q: "Escola pública · renda até 1 salário mínimo · quilombolas",
  LI_EP: "Escola pública · independentemente da renda",
  LI_PCD: "Escola pública · independentemente da renda · pessoa com deficiência",
  LI_PPI: "Escola pública · independentemente da renda · pessoas pretas, pardas ou indígenas",
  LI_Q: "Escola pública · independentemente da renda · quilombolas",
  V1: "Ação afirmativa própria · Letras-Libras",
};

export function NotaCorteSisuUfcTool() {
  const [unidade, setUnidade] = useState("");
  const [oferta, setOferta] = useState("");
  const [modalidade, setModalidade] = useState("");
  const unidades = useMemo(() => [...new Set(dados.registros.map((r) => r.unidade))].sort((a,b) => a.localeCompare(b,"pt-BR")), []);
  const ofertas = useMemo(() => {
    const unique = new Map<string, typeof dados.registros[number]>();
    for (const r of dados.registros) if (r.unidade === unidade) unique.set(`${r.codigo}|${r.turno}`, r);
    return [...unique.entries()].sort((a,b) => a[1].curso.localeCompare(b[1].curso,"pt-BR"));
  }, [unidade]);
  const registros = dados.registros.filter((r) => r.unidade === unidade && `${r.codigo}|${r.turno}` === oferta);
  const escolhido = registros.find((r) => r.modalidade === modalidade);
  return <section aria-label="Consulta de corte Sisu UFC" className="rounded-lg border border-n2 bg-white/70 p-5 sm:p-8">
    <p className="gb-eyebrow">1 · SUA VAGA NA UFC</p>
    <p className="mt-2 text-n5">Chamada regular do Sisu 2026 · Universidade Federal do Ceará</p>
    <div className="mt-4 grid gap-5 md:grid-cols-3">
      <label className="font-semibold">Unidade acadêmica ou campus<select value={unidade} onChange={(e)=>{setUnidade(e.target.value);setOferta("");setModalidade("");}} className="mt-2 block min-h-12 w-full rounded border border-n2 bg-white px-3 font-normal"><option value="">Escolha a unidade</option>{unidades.map((u)=><option key={u} value={u}>{u}</option>)}</select></label>
      <label className="font-semibold">Curso e turno<select value={oferta} disabled={!unidade} onChange={(e)=>{setOferta(e.target.value);setModalidade("");}} className="mt-2 block min-h-12 w-full rounded border border-n2 bg-white px-3 font-normal disabled:opacity-60"><option value="">Escolha o curso</option>{ofertas.map(([id,r])=><option key={id} value={id}>{r.curso} · {r.formacao} · {r.turno} · cód. {r.codigo}</option>)}</select></label>
      <label className="font-semibold">Modalidade<select value={modalidade} disabled={!oferta} onChange={(e)=>setModalidade(e.target.value)} className="mt-2 block min-h-12 w-full rounded border border-n2 bg-white px-3 font-normal disabled:opacity-60"><option value="">Escolha a modalidade</option>{registros.map((r)=><option key={r.modalidade} value={r.modalidade}>{r.modalidade} · {descricao[r.modalidade] ?? "Consultar edital"}</option>)}</select></label>
    </div>
    <div aria-live="polite" className="mt-6 rounded border border-n2 p-4">
      {escolhido ? <><p className="text-sm text-n5">Nota de corte · chamada regular Sisu 2026</p><p className="mt-1 text-3xl font-bold">{escolhido.nota.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})} <span className="text-base font-normal">pontos</span></p><p className="mt-2 text-sm">{escolhido.curso} · {escolhido.unidade} · {escolhido.turno} · {escolhido.modalidade}</p></> : <p className="text-n5">Escolha unidade, curso e modalidade para consultar a referência disponível.</p>}
    </div>
    <p className="mt-5 text-sm text-n5">A UFC publica este valor para a chamada regular. Ele é uma referência histórica: não garante aprovação em outra edição. A nota utilizada no Sisu pode variar conforme os pesos e regras do curso. As opções exibidas são apenas as modalidades com valor na planilha; a ausência de uma modalidade aqui não comprova que não houve oferta. Confira os requisitos no edital da edição.</p>
    <p className="mt-3 text-sm text-n5">Fonte: <a href={dados.fonte} className="underline" target="_blank" rel="noopener noreferrer">dados abertos da UFC, planilha atualizada em outubro de 2026 ↗</a>. A base contém apenas a UFC; outras universidades ainda estão em coleta.</p>
    <div className="gb-actions"><Link href="/provas/enem" className="gb-button">Treinar provas do ENEM →</Link></div>
  </section>;
}

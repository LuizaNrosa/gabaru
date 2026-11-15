"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import dados from "@/data/ifrn-2026-cortes.json";

/** Consulta da lista de classificação; não é lista de matrícula. */
export function NotaCorteIfrnTool() {
  const [campus, setCampus] = useState("");
  const [oferta, setOferta] = useState("");
  const [modalidade, setModalidade] = useState("");
  const campi = useMemo(() => [...new Set(dados.listas.map((item) => item.campus))].sort((a, b) => a.localeCompare(b, "pt-BR")), []);
  const ofertas = useMemo(() => {
    const unicas = new Map<number, { oferta: number; curso: string; turno: string }>();
    for (const item of dados.listas) if (item.campus === campus) unicas.set(item.oferta, item);
    return [...unicas.values()].sort((a, b) => a.curso.localeCompare(b.curso, "pt-BR") || a.turno.localeCompare(b.turno, "pt-BR"));
  }, [campus]);
  const modalidades = dados.listas.filter((item) => item.campus === campus && String(item.oferta) === oferta);
  const linha = modalidades.find((item) => item.modalidade === modalidade);
  return <section className="rounded-lg border border-n2 bg-white/70 p-5 sm:p-8" aria-label="Consulta IFRN">
    <p className="gb-eyebrow">1 · ESCOLHA SUA VAGA · IFRN 2026</p>
    <div className="mt-4 grid gap-5 md:grid-cols-3">
      <label className="font-semibold">Campus<select className="mt-2 block min-h-12 w-full rounded border border-n2 bg-white px-3 font-normal" value={campus} onChange={(e) => {setCampus(e.target.value); setOferta(""); setModalidade("");}}><option value="">Escolha o campus</option>{campi.map((c) => <option key={c}>{c}</option>)}</select></label>
      <label className="font-semibold">Curso e turno<select className="mt-2 block min-h-12 w-full rounded border border-n2 bg-white px-3 font-normal disabled:opacity-60" disabled={!campus} value={oferta} onChange={(e) => {setOferta(e.target.value); setModalidade("");}}><option value="">Escolha o curso</option>{ofertas.map((o) => <option key={o.oferta} value={o.oferta}>{o.curso} · {o.turno}</option>)}</select></label>
      <label className="font-semibold">Modalidade<select className="mt-2 block min-h-12 w-full rounded border border-n2 bg-white px-3 font-normal disabled:opacity-60" disabled={!oferta} value={modalidade} onChange={(e) => setModalidade(e.target.value)}><option value="">Escolha a modalidade</option>{modalidades.map((m) => <option key={m.modalidade} value={m.modalidade}>{m.modalidade === "AC" ? "Ampla concorrência (AC)" : m.modalidade}</option>)}</select></label>
    </div>
    {linha && <div className="mt-6 rounded border border-n2 p-4" aria-live="polite">
      <p className="text-sm text-n5">Escore final do último classificado como aprovado · resultado final IFRN 2026</p>
      <p className="mt-2 text-3xl font-bold">{linha.referencia_disponivel ? linha.ultimo_aprovado_escore_final?.toLocaleString("pt-BR", {minimumFractionDigits: 1}) : "Referência indisponível"}</p>
      <p className="mt-2 text-sm text-n5">Escore final bonificado do mesmo classificado: {linha.referencia_disponivel ? linha.ultimo_aprovado_escore_final_bonificado?.toLocaleString("pt-BR", {minimumFractionDigits: 1}) : "indisponível"}.</p>
      <p className="mt-2 text-sm text-n5">{linha.vagas} vagas · {linha.aprovados} classificados como aprovados nesta lista.</p>
      {!linha.referencia_disponivel && <p className="gb-notice mt-4">A lista não apresenta escore para o último aprovado ou contém menos aprovados do que vagas. Não calculamos referência para esta combinação.</p>}
      <p className="mt-4 text-sm text-n5">Valor lido do escore final na lista de classificação, não da lista de matrícula nem de chamadas posteriores. A pontuação não é o número de acertos; confira também o escore bonificado, pois as regras de classificação variam. Consulte as regras do edital para a modalidade e para o cálculo do escore. Resultados passados não garantem aprovação.</p>
      <p className="mt-3 text-sm text-n5">Fonte: <a href={`${dados.fonte}#page=${linha.pagina}`} target="_blank" rel="noopener noreferrer" className="underline">resultado final oficial IFRN 2026, lista iniciada na página {linha.pagina} ↗</a>.</p>
    </div>}
    <div className="gb-actions"><Link href="/provas/ifrn" className="gb-button">Treinar provas do IFRN →</Link></div>
  </section>;
}

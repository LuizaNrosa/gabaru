"use client";

import Link from "next/link";
import { useState } from "react";
import dados from "@/data/ifce-fortaleza-2026-cortes.json";

/** Referência de classificação inicial; não identifica matriculados. */
export function NotaCorteIfceTool() {
  const [curso, setCurso] = useState("");
  const [modalidade, setModalidade] = useState("AC");
  const oferta = dados.ofertas.find((o) => o.curso === curso);
  return <section aria-label="Consulta IFCE" className="rounded-lg border border-n2 bg-white/70 p-5 sm:p-8">
    <p className="gb-eyebrow">IFCE · FORTALEZA · INTEGRADO 2026.2</p>
    <p className="mt-3 text-n5">Consulte a classificação retificada da ampla concorrência por curso. Outras modalidades e campi seguem em conferência.</p>
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      <label className="font-semibold">Curso<select value={curso} onChange={(e) => setCurso(e.target.value)} className="mt-2 block min-h-12 w-full rounded border border-n2 bg-white px-3 font-normal"><option value="">Escolha o curso</option>{dados.ofertas.map((o) => <option key={o.curso} value={o.curso}>{o.curso} · {o.turno}</option>)}</select></label>
      <label className="font-semibold">Modalidade<select value={modalidade} onChange={(e) => setModalidade(e.target.value)} className="mt-2 block min-h-12 w-full rounded border border-n2 bg-white px-3 font-normal"><option value="AC">Ampla concorrência</option><option value="outras">Outras modalidades · em conferência</option></select></label>
    </div>
    <div aria-live="polite" className="mt-6 rounded border border-n2 p-4">
      {!oferta ? <p className="text-n5">Escolha o curso para consultar a referência.</p> : modalidade !== "AC" ? <p className="font-semibold">Referência dessa modalidade em conferência.</p> : <><p className="text-sm text-n5">Nota da 16ª posição da ampla concorrência · classificação retificada de 20/07/2026</p><p className="mt-1 text-3xl font-bold">{oferta.nota.toLocaleString("pt-BR", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p><p className="mt-2 text-sm text-n5">{oferta.vagas_ac} vagas de ampla concorrência · {oferta.vagas_totais} vagas totais · {oferta.turno}</p></>}
    </div>
    <p className="mt-5 text-sm text-n5">Referência da classificação publicada nessa data, não da matrícula nem das chamadas posteriores. O processo admite concorrência em ampla e cotas, remanejamento e desempate; os resultados posteriores podem mudar a ocupação. A nota não garante aprovação em outra edição.</p>
    <p className="mt-3 text-sm text-n5">Fonte: <a href={`${dados.fonte}#page=${oferta?.pagina ?? 1}`} target="_blank" rel="noopener noreferrer" className="underline">classificação retificada oficial IFCE/FAIFCE ↗</a>. Não há dados pessoais nesta consulta.</p>
    <div className="gb-actions"><Link href="/provas/ifce" className="gb-button">Treinar provas do IFCE →</Link></div>
  </section>;
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import dados from "@/data/ifmg-2026-fontes-cursos.json";

/** O índice contém cursos com resultado publicado, não cortes calculados. */
export function NotaCorteIfmgTool() {
  const [campus, setCampus] = useState("");
  const [curso, setCurso] = useState("");
  const campi = useMemo(() => [...new Set(dados.cursos.map((item) => item.campus))].sort((a, b) => a.localeCompare(b, "pt-BR")), []);
  const cursos = dados.cursos.filter((item) => item.campus === campus);
  const escolhido = cursos.find((item) => item.curso === curso);

  return <section aria-label="Consulta de corte IFMG" className="rounded-lg border border-n2 bg-white/70 p-5 sm:p-8">
    <p className="gb-eyebrow">IFMG · PROCESSO SELETIVO {dados.edicao}</p>
    <h3 className="mt-3 text-xl font-bold">Escolha seu campus e curso</h3>
    <p className="mt-3 text-n5">Localizamos resultados oficiais para as opções abaixo. As notas de corte por modalidade e chamada estão em conferência.</p>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <label className="font-semibold">Campus<select className="mt-2 block min-h-12 w-full rounded border border-n2 bg-white px-3 font-normal" value={campus} onChange={(e) => { setCampus(e.target.value); setCurso(""); }}>
        <option value="">Escolha o campus</option>{campi.map((nome) => <option key={nome} value={nome}>{nome}</option>)}
      </select></label>
      <label className="font-semibold">Curso<select className="mt-2 block min-h-12 w-full rounded border border-n2 bg-white px-3 font-normal disabled:opacity-60" value={curso} disabled={!campus} onChange={(e) => setCurso(e.target.value)}>
        <option value="">{campus ? "Escolha o curso" : "Escolha o campus primeiro"}</option>{cursos.map((item) => <option key={item.curso} value={item.curso}>{item.curso}</option>)}
      </select></label>
    </div>
    {escolhido && <div aria-live="polite" className="gb-notice mt-5">
      <p className="font-bold">Nota de corte em conferência</p>
      <p className="mt-2">{escolhido.campus} · {escolhido.curso} · {dados.edicao}. Precisamos conferir modalidade, opção e chamada antes de apresentar uma nota. A classificação final não informa, por si só, uma nota de corte de primeira chamada.</p>
      <p className="mt-3 text-sm">Fonte: <a className="underline" href={escolhido.fonte} target="_blank" rel="noopener noreferrer">resultado oficial do curso ↗</a>.</p>
      <div className="gb-actions"><Link href="/provas/ifmg" className="gb-button">Treinar provas do IFMG →</Link></div>
    </div>}
    <p className="mt-5 text-sm text-n5">Ainda não encontrou sua opção? Este índice reúne apenas os cursos publicados na página oficial de resultados consultada para 2026/1; a ausência na lista não significa que o curso não exista.</p>
  </section>;
}

"use client";

import { useId, useState } from "react";
import Link from "next/link";
import dados from "@/data/unesp-2026-cortes.json";

type Modalidade = "su" | "srvebp";

export function NotaCorteUnespTool() {
  const cursoId = useId();
  const modalidadeId = useId();
  const pontosId = useId();
  const [codigo, setCodigo] = useState("");
  const [modalidade, setModalidade] = useState<Modalidade>("su");
  const [acertos, setAcertos] = useState(45);
  const curso = dados.registros.find((r) => r.codigo === codigo);
  const corte = curso?.[modalidade];
  const diferenca = corte === undefined ? undefined : acertos - corte;

  return (
    <section aria-label="Consulta de corte Unesp" className="rounded-lg border border-n2 bg-white/70 p-5 sm:p-8">
      <p className="gb-eyebrow">1 · SEU OBJETIVO · VESTIBULAR 2026</p>
      <div className="mt-4 grid gap-5 md:grid-cols-2">
        <label htmlFor={cursoId} className="font-semibold">Curso, turno e cidade
          <select id={cursoId} value={codigo} onChange={(e) => setCodigo(e.target.value)} className="mt-2 block min-h-12 w-full rounded border border-n2 bg-white px-3 font-normal">
            <option value="">Escolha seu curso</option>
            {dados.registros.map((r) => <option key={r.codigo} value={r.codigo}>{r.curso}{r.cidade ? ` · ${r.cidade}` : ""} · {r.codigo}</option>)}
          </select>
        </label>
        <label htmlFor={modalidadeId} className="font-semibold">Modalidade
          <select id={modalidadeId} value={modalidade} onChange={(e) => setModalidade(e.target.value as Modalidade)} className="mt-2 block min-h-12 w-full rounded border border-n2 bg-white px-3 font-normal">
            <option value="su">Sistema Universal (SU)</option>
            <option value="srvebp">Escola pública (SRVEBP e SRVEBP + PPI)</option>
          </select>
        </label>
      </div>
      <p className="mt-3 text-sm text-n5">A tabela oficial apresenta um valor conjunto para SRVEBP e SRVEBP + PPI. Escolha o curso e a cidade exatamente como aparecem na oferta.</p>
      <p className="gb-eyebrow mt-8">2 · SUA REFERÊNCIA</p>
      <label htmlFor={pontosId} className="mt-4 block font-semibold">Quantas questões você acertou ou pretende acertar na primeira fase? <span className="font-bold text-[#b3400c]">{acertos}</span></label>
      <input id={pontosId} className="mt-4 w-full accent-[#b3400c]" type="range" min={0} max={90} value={acertos} onChange={(e) => setAcertos(Number(e.target.value))} />
      <div className="mt-6 grid gap-4 md:grid-cols-2" aria-live="polite">
        <div className="rounded border border-n2 p-4"><p className="text-sm text-n5">Mínimo para a 2ª fase · 2026</p><p className="mt-1 text-3xl font-bold">{corte === undefined ? "Selecione seu curso" : <>{corte} <span className="text-base font-normal">acertos</span></>}</p></div>
        <div className="rounded border border-n2 p-4"><p className="text-sm text-n5">Sua comparação</p><p className="mt-1 font-semibold">{diferenca === undefined ? "Aguardando seleção" : diferenca === 0 ? "Igual à referência" : diferenca > 0 ? `${diferenca} acima da referência` : `${Math.abs(diferenca)} abaixo da referência`}</p></div>
      </div>
      {curso?.codigo === "183" && <p className="gb-notice mt-4">Treineiro é identificado separadamente na tabela da Unesp e não corresponde a uma vaga de curso.</p>}
      <p className="mt-5 text-sm text-n5">Número mínimo de acertos dos convocados à segunda fase na edição 2026; não representa o corte da matrícula nem garante resultado em outra edição.</p>
      <p className="mt-3 text-sm text-n5">Fonte: <a className="underline" href={`${dados.fonte}#page=${curso?.pagina ?? 1}`} target="_blank" rel="noopener noreferrer">tabela oficial Unesp 2026{curso ? `, página ${curso.pagina}` : ""} ↗</a>.</p>
      <div className="gb-actions"><Link href="/provas/unesp" className="gb-button">Treinar provas da Unesp →</Link></div>
    </section>
  );
}

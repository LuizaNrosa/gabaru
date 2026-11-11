"use client";
import { useState } from "react";
import { documentUrl, applicationName, type ArchiveDocument } from "@/lib/vestibular-documents";

export function VestibularDocumentReader({ documents }: { documents: ArchiveDocument[] }) {
  const [id, setId] = useState(documents.find(d => d.kind === "prova" && d.phase === "1ª fase")?.id ?? documents.find(d => d.kind === "prova")?.id ?? documents[0].id);
  const selected = documents.find(d => d.id === id)!;
  const [pages, setPages] = useState<Record<string, number>>({});
  const page = pages[id] ?? selected.startPage;
  const url = documentUrl(selected);
  return <section className="mt-8" aria-label="Cadernos e arquivos oficiais">
    <label htmlFor="archive-document" className="block font-semibold">Caderno, fase ou gabarito</label>
    <select id="archive-document" className="mt-3 min-h-14 w-full rounded-lg border border-n2 bg-white px-4" value={id} onChange={e => setId(e.target.value)}>
      {documents.map(d => <option key={d.id} value={d.id}>{applicationName(d.application)} · {d.phase} · {d.kind === "gabarito" ? "Respostas: " : ""}{d.label}</option>)}
    </select>
    <h2 className="mt-6 text-xl font-bold">{selected.label}</h2>
    <p className="mt-3 text-sm text-n5">{selected.pages} páginas no documento · {(selected.bytes / 1024 / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB.</p>
    {selected.kind === "relatorio-com-provas" && <p className="gb-notice mt-4">Os cadernos estão nos anexos do relatório oficial. O leitor abre na página {selected.startPage}, onde foi identificado o início das provas. O documento completo também contém estatísticas e informações do processo seletivo.</p>}
    {selected.kind === "relatorio-com-questoes" && <p className="gb-notice mt-4">Este relatório reproduz questões da seleção junto às análises de desempenho. O leitor abre na página {selected.startPage}, no capítulo de questões. A disposição das páginas acompanha o relatório da Vunesp.</p>}
    <div className="gb-actions">
      <a href={`${url}#page=${page}`} target="_blank" rel="noopener noreferrer" className="gb-button">Abrir PDF em outra aba ↗</a>
      <a href={selected.url} target="_blank" rel="noopener noreferrer" className="gb-text-link">Abrir na fonte oficial ↗</a>
      <a href={selected.source} target="_blank" rel="noopener noreferrer" className="gb-text-link">Página de origem ↗</a>
    </div>
    <label className="mt-5 flex items-center gap-3">Ir para a página
      <select className="min-h-12 rounded border border-n2 bg-white px-4" value={page} onChange={e => setPages({ ...pages, [id]: Number(e.target.value) })}>
        {Array.from({ length: selected.pages }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
      </select>
    </label>
    <iframe key={`${id}-${page}`} src={`${url}#page=${page}`} title={`PDF oficial: ${selected.label}`} className="mt-5 h-[78vh] min-h-[480px] w-full rounded-lg border border-n2 bg-white" loading="lazy" />
    <p className="mt-4 text-sm text-n5">No celular, abra o PDF em outra aba se o navegador não oferecer leitura integrada. As respostas discursivas e a redação exigem avaliação humana; este leitor não calcula nota.</p>
  </section>;
}

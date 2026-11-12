"use client";
import { useMemo, useState } from "react";
import { useSavedProgress } from "@/components/use-saved-progress";
import unesp2025 from "@/data/unesp-2025-regular.json";
import loteUnesp from "@/data/unesp-lote-quatro.json";
import loteUnespSeguinte from "@/data/unesp-lote-seguinte.json";
import unespAntigas from "@/data/unesp-2017-2020.json";
import unespNovas from "@/data/unesp-2015-2016-2021.json";
const provasUnesp = [{ ...unesp2025, titulo: "UNESP 2025 — vestibular regular, primeira fase" }, ...loteUnesp, ...loteUnespSeguinte, ...unespAntigas, ...unespNovas];
import { FolhaDeRespostas } from "@/components/folha-de-respostas";
import { documentUrl, applicationName, type ArchiveDocument } from "@/lib/vestibular-documents";

export function VestibularDocumentReader({ documents }: { documents: ArchiveDocument[] }) {
  const inicial = documents.find(d => d.application === "regular" && provasUnesp.some(p => p.id === d.id))?.id ?? documents.find(d => provasUnesp.some(p => p.id === d.id))?.id ?? documents.find(d => d.kind === "prova" && d.phase === "1ª fase")?.id ?? documents.find(d => d.kind === "prova")?.id ?? documents[0].id;
  const [id, setId] = useState(inicial);
  const selected = documents.find(d => d.id === id)!;
  const [pages, setPages] = useState<Record<string, number>>({});
  const estado = useMemo(() => ({ id, pages }), [id, pages]);
  const progresso = useSavedProgress(`gabaru:leitor:${documents[0].institution}:${documents[0].year}`, estado, saved => {
    if (documents.some(d => d.id === saved.id)) setId(saved.id);
    if (saved.pages && typeof saved.pages === "object") {
      const validas: Record<string, number> = {};
      for (const d of documents) { const p = saved.pages[d.id]; if (Number.isInteger(p) && p >= 1 && p <= d.pages) validas[d.id] = p; }
      setPages(validas);
    }
  }, { id: inicial, pages: {} });
  const provaCorrigida = provasUnesp.find(p => p.id === selected.id);
  const corrigida = Boolean(provaCorrigida);
  const page = pages[id] ?? (corrigida ? 3 : selected.startPage);
  const url = provaCorrigida && [...unespAntigas, ...unespNovas].some(p => p.id === selected.id) ? `/acervo/unesp/${provaCorrigida.ano}/${provaCorrigida.aplicacao}/prova.pdf` : documentUrl(selected);
  return <section className="mt-8" aria-label="Cadernos e arquivos oficiais">
    {progresso.resumed && <p className="gb-notice mb-4" role="status">Continuando do documento e página salvos neste navegador.</p>}
    {!progresso.storageAvailable && <p className="gb-notice mb-4" role="alert">Não foi possível salvar sua posição neste navegador.</p>}
    <label htmlFor="archive-document" className="block font-semibold">Caderno, fase ou gabarito</label>
    <select id="archive-document" className="mt-3 min-h-14 w-full rounded-lg border border-n2 bg-white px-4" value={id} onChange={e => { const selectedDocument = documents[e.currentTarget.selectedIndex]; if (selectedDocument) setId(selectedDocument.id); }}>
      {documents.map(d => <option key={d.id} value={d.id}>{applicationName(d.application)} · {d.phase} · {d.kind === "gabarito" ? "Respostas: " : ""}{d.label}</option>)}
    </select>
    <h2 className="mt-6 text-xl font-bold">{selected.label}</h2>
    <p className="mt-3 text-sm text-n5">{selected.pages} páginas no documento · {(selected.bytes / 1024 / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB.</p>
    {selected.kind === "relatorio-com-provas" && <p className="gb-notice mt-4">Os cadernos estão nos anexos do relatório oficial. O leitor abre na página {selected.startPage}, onde foi identificado o início das provas. O documento completo também contém estatísticas e informações do processo seletivo.</p>}
    {selected.kind === "relatorio-com-questoes" && <p className="gb-notice mt-4">Este relatório reproduz questões da seleção junto às análises de desempenho. O leitor abre na página {selected.startPage}, no capítulo de questões. A disposição das páginas acompanha o relatório da Vunesp.</p>}
    <div className="gb-actions">
      <a href={`${url}#page=${page}`} target="_blank" rel="noopener noreferrer" className="gb-button">Abrir PDF em outra aba ↗</a>
      <a href={selected.url} target="_blank" rel="noopener noreferrer" className="gb-text-link">{new URL(selected.url).hostname === "network.grupoabril.com.br" ? "Abrir cópia do Guia do Estudante ↗" : "Abrir na fonte oficial ↗"}</a>
      <a href={selected.source} target="_blank" rel="noopener noreferrer" className="gb-text-link">Página de origem ↗</a>
    </div>
    <label className="mt-5 flex items-center gap-3">Ir para a página
      <select className="min-h-12 rounded border border-n2 bg-white px-4" value={page} onChange={e => setPages({ ...pages, [id]: Number(e.target.value) })}>
        {Array.from({ length: selected.pages }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
      </select>
    </label>
    {corrigida && <p className="gb-notice mt-5">Correção automática pelo gabarito oficial da versão 1. O resultado mostra acertos e não calcula a nota de classificação.</p>}
    {corrigida ? <div className="mt-5 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div id="caderno">
        <div className="mb-3 flex flex-wrap items-center gap-3"><button type="button" className="min-h-12 rounded border border-n2 px-3" disabled={page <= 1} onClick={()=>setPages({...pages,[id]:page-1})}>← Página anterior</button><span>Página {page} de {selected.pages}</span><button type="button" className="min-h-12 rounded border border-n2 px-3" disabled={page >= selected.pages} onClick={()=>setPages({...pages,[id]:page+1})}>Próxima página →</button><a href="#folha" className="gb-text-link lg:hidden">Marcar respostas ↓</a></div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/acervo/unesp/${provaCorrigida!.ano}/${provaCorrigida!.aplicacao}/${String(page).padStart(2,"0")}.webp`} alt={`${provaCorrigida!.titulo}, página ${page} do caderno oficial`} className="h-auto w-full rounded-lg border border-n2 bg-white" />
        <p className="mt-3 text-sm text-n5">Consulte as páginas anteriores para textos e figuras compartilhados entre questões.</p>
      </div>
      <div id="folha" className="lg:sticky lg:top-4 lg:max-h-[90vh] lg:overflow-y-auto"><a href="#caderno" className="gb-text-link mb-3 inline-block lg:hidden">↑ Voltar ao caderno</a><FolhaDeRespostas key={selected.id} id={selected.id} titulo={provaCorrigida!.titulo} sugeridas={90} gabarito={provaCorrigida!.gabarito} compacto /></div>
    </div> : <>
      <iframe key={`${id}-${page}`} src={`${url}#page=${page}`} title={`PDF oficial: ${selected.label}`} className="mt-5 h-[78vh] min-h-[480px] w-full rounded-lg border border-n2 bg-white" loading="lazy" />
      <p className="mt-4 text-sm text-n5">No celular, abra o PDF em outra aba se o navegador não oferecer leitura integrada. As respostas discursivas e a redação exigem avaliação humana; este leitor não calcula nota.</p>
      {selected.kind === "prova" && selected.phase === "1ª fase" && <FolhaDeRespostas key={selected.id} id={selected.id} titulo={selected.label} sugeridas={selected.institution === "unicamp" ? 72 : 90} />}
    </>}
  </section>;
}

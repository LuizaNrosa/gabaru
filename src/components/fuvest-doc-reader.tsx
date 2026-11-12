// © 2026 Luiza Nascimento Rosa e Felipe Nascimento Rosa. Todos os direitos reservados.
"use client";

import { useMemo, useState } from "react";
import { useSavedProgress } from "@/components/use-saved-progress";
import fuvest2022versoes from "@/data/fuvest-2022-versoes.json";
import fuvest2023versoes from "@/data/fuvest-2023-versoes.json";
import fuvest2024versoes from "@/data/fuvest-2024-versoes.json";
import fuvest2025versoes from "@/data/fuvest-2025-versoes.json";
import { FolhaDeRespostas } from "@/components/folha-de-respostas";

const provasDisponiveis = [...fuvest2022versoes, ...fuvest2023versoes, ...fuvest2024versoes, ...fuvest2025versoes];

type DocFuvest = {
  globalIndex: number;
  year: number;
  label: string;
  url: string;
  pages: number;
};

/**
 * Leitor dos documentos oficiais da FUVEST com folha de respostas.
 * O PDF é servido pelo proxy do Gabaru (/api/v1/fuvest/[i]) e aberto
 * embutido na página: o aluno resolve a prova aqui, marca as alternativas
 * na folha ao lado e confere com o gabarito do mesmo ano — tudo sem sair
 * do site.
 */
export function FuvestDocReader({ documentos }: { documentos: DocFuvest[] }) {
  const [indice, setIndice] = useState(Math.max(0, documentos.findIndex(d => /1ª fase/i.test(d.label) && /prova/i.test(d.label) && !/gabarito|respostas/i.test(d.label))));
  const doc = documentos[indice];
  const paginaInicial = (d: DocFuvest) => provasDisponiveis.some(p => p.fonte_prova === d.url) ? 2 : 1;
  const [pagina, setPagina] = useState(() => paginaInicial(doc));
  const estado = useMemo(() => ({ indice, pagina }), [indice, pagina]);
  const progresso = useSavedProgress(`gabaru:leitor:fuvest:${documentos[0].year}`, estado, (saved) => {
    if (Number.isInteger(saved.indice) && saved.indice >= 0 && saved.indice < documentos.length) {
      setIndice(saved.indice);
      if (Number.isInteger(saved.pagina) && saved.pagina >= 1 && saved.pagina <= documentos[saved.indice].pages) setPagina(saved.pagina);
    }
  }, { indice: Math.max(0, documentos.findIndex(d => /1ª fase/i.test(d.label) && /prova/i.test(d.label) && !/gabarito|respostas/i.test(d.label))), pagina: paginaInicial(documentos[Math.max(0, documentos.findIndex(d => /1ª fase/i.test(d.label) && /prova/i.test(d.label) && !/gabarito|respostas/i.test(d.label)))]) });
  const provaCorrigida = provasDisponiveis.find(prova => prova.fonte_prova === doc.url);
  const is2025v1 = provaCorrigida?.id === "fuvest-2025-fase1-v1";
  const url = `${is2025v1 ? "/acervo/fuvest/2025/prova-v1.pdf" : `/api/v1/fuvest/${doc.globalIndex}`}#page=${pagina}`;
  const eGabarito = /gabarito|respostas/i.test(doc.label);
  return (
    <section className="mt-8" aria-label="Leitor de provas da FUVEST">
      {progresso.resumed && <p className="gb-notice mb-4" role="status">Continuando do documento e página salvos neste navegador.</p>}
      {!progresso.storageAvailable && <p role="alert" className="gb-notice mb-4">Não foi possível salvar sua posição neste navegador.</p>}
      <label htmlFor="fuvest-doc" className="block font-semibold">
        Caderno, fase ou gabarito
      </label>
      <select
        id="fuvest-doc"
        className="mt-3 min-h-14 w-full rounded-lg border border-n2 bg-white px-4"
        value={indice}
        onChange={(e) => {
          setIndice(Number(e.currentTarget.value));
          setPagina(paginaInicial(documentos[Number(e.currentTarget.value)]));
        }}
      >
        {documentos.map((d, i) => (
          <option key={`${d.url}-${i}`} value={i}>
            {d.label} · {d.pages} {d.pages === 1 ? "página" : "páginas"}
          </option>
        ))}
      </select>

      <h2 className="mt-6 text-xl font-bold">FUVEST {doc.year} — {doc.label}</h2>
      <p className="mt-2 text-sm text-n5">
        Documento oficial da FUVEST, aberto no leitor do Gabaru.{" "}
        {doc.pages} {doc.pages === 1 ? "página" : "páginas"}.
      </p>

      <div className="gb-actions">
        <a
          className="gb-text-link"
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir o PDF na fonte oficial ↗{" "}
          <span className="sr-only">em nova aba</span>
        </a>
      </div>

      <label className="mt-5 flex items-center gap-3">
        Ir para a página
        <select
          className="min-h-12 rounded border border-n2 bg-white px-4"
          value={pagina}
          onChange={(e) => setPagina(Number(e.currentTarget.value))}
        >
          {Array.from({ length: doc.pages }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      {provaCorrigida ? (
        <div className="mt-5 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div id="caderno">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <button type="button" className="min-h-12 rounded border border-n2 px-3" disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)}>← Página anterior</button>
              <span>Página {pagina} de {doc.pages}</span>
              <button type="button" className="min-h-12 rounded border border-n2 px-3" disabled={pagina >= doc.pages} onClick={() => setPagina(pagina + 1)}>Próxima página →</button>
              <a href="#folha" className="gb-text-link lg:hidden">Marcar respostas ↓</a>
            </div>
            {/* A página é imagem do caderno oficial, inclusive figuras e textos compartilhados. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/acervo/fuvest/${provaCorrigida.ano}/${provaCorrigida.versao.toLowerCase()}/${String(pagina).padStart(2, "0")}.webp`} alt={`FUVEST ${provaCorrigida.ano}, primeira fase, ${provaCorrigida.versao}, página ${pagina} do caderno oficial`} className="h-auto w-full rounded-lg border border-n2 bg-white" />
            <p className="mt-3 text-sm text-n5">Amplie a imagem para ler detalhes. Alguns textos servem a mais de uma questão; consulte as páginas anteriores quando necessário.</p>
            <a href={url} target="_blank" rel="noopener noreferrer" className="gb-text-link mt-3 inline-block">Abrir o caderno em PDF →</a>
          </div>
          <div id="folha" className="lg:sticky lg:top-4 lg:max-h-[90vh] lg:overflow-y-auto">
            <a href="#caderno" className="gb-text-link mb-3 inline-block lg:hidden">↑ Voltar ao caderno</a>
            <FolhaDeRespostas key={doc.globalIndex} id={`fuvest-${doc.globalIndex}`} titulo={`FUVEST ${doc.year} — ${doc.label}`} sugeridas={90} gabarito={provaCorrigida.gabarito} compacto />
          </div>
        </div>
      ) : (
        <>
          <iframe key={url} src={url} title={`PDF oficial: FUVEST ${doc.year} — ${doc.label}`} className="mt-5 h-[78vh] min-h-[480px] w-full rounded-lg border border-n2 bg-white" loading="lazy" />
          <p className="mt-4 text-sm text-n5">Se o navegador não abrir o leitor integrado, use o link para a fonte oficial. A segunda fase é discursiva e requer avaliação humana.</p>
          {!eGabarito && /1ª fase/i.test(doc.label) && <div id="folha"><FolhaDeRespostas key={doc.globalIndex} id={`fuvest-${doc.globalIndex}`} titulo={`FUVEST ${doc.year} — ${doc.label}`} sugeridas={doc.year >= 2027 ? 80 : 90} /></div>}
        </>
      )}
    </section>
  );
}

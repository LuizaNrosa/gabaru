// © 2026 Luiza Nascimento Rosa e Felipe Nascimento Rosa. Todos os direitos reservados.
"use client";

import { useState } from "react";
import { FolhaDeRespostas } from "@/components/folha-de-respostas";

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
  const [pagina, setPagina] = useState(1);
  const url = `/api/v1/fuvest/${doc.globalIndex}#page=${pagina}`;
  const eGabarito = /gabarito|respostas/i.test(doc.label);
  return (
    <section className="mt-8" aria-label="Leitor de provas da FUVEST">
      <label htmlFor="fuvest-doc" className="block font-semibold">
        Caderno, fase ou gabarito
      </label>
      <select
        id="fuvest-doc"
        className="mt-3 min-h-14 w-full rounded-lg border border-n2 bg-white px-4"
        value={indice}
        onChange={(e) => {
          setIndice(Number(e.currentTarget.value));
          setPagina(1);
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

      <iframe
        key={url}
        src={url}
        title={`PDF oficial: FUVEST ${doc.year} — ${doc.label}`}
        className="mt-5 h-[78vh] min-h-[480px] w-full rounded-lg border border-n2 bg-white"
        loading="lazy"
      />
      <p className="mt-4 text-sm text-n5">
        No celular, se o navegador não abrir o leitor integrado, use “abrir
        o PDF na fonte oficial”. A 2ª fase é discursiva: a folha de respostas
        abaixo serve para a 1ª fase objetiva.
      </p>

      {!eGabarito && /1ª fase/i.test(doc.label) && (
        <div id="folha">
          <FolhaDeRespostas
            key={doc.globalIndex}
            id={`fuvest-${doc.globalIndex}`}
            titulo={`FUVEST ${doc.year} — ${doc.label}`}
            sugeridas={doc.year >= 2027 ? 80 : 90}
          />
        </div>
      )}
    </section>
  );
}

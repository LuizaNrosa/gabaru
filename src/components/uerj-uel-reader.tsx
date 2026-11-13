"use client";
import { useMemo, useState } from "react";
import { FolhaDeRespostas } from "@/components/folha-de-respostas";
import { useSavedProgress } from "@/components/use-saved-progress";

type Caderno = { id: string; titulo: string; paginas: number; inicio: number; alternativas: string[]; gabaritos: Record<string, string[] | undefined> };
const idiomas: Record<string, string> = { portugues: "Português", ingles: "Inglês", espanhol: "Espanhol", frances: "Francês" };
export function UerjUelReader({ caderno }: { caderno: Caderno }) {
  const chaves = Object.keys(caderno.gabaritos);
  const [idioma, setIdioma] = useState(chaves.includes("ingles") ? "ingles" : chaves[0]);
  const [pagina, setPagina] = useState(caderno.inicio);
  const estado = useMemo(() => ({ idioma, pagina }), [idioma, pagina]);
  const progresso = useSavedProgress(`gabaru:leitor:${caderno.id}`, estado, salvo => {
    if (chaves.includes(salvo.idioma)) setIdioma(salvo.idioma);
    if (Number.isInteger(salvo.pagina) && salvo.pagina >= 1 && salvo.pagina <= caderno.paginas) setPagina(salvo.pagina);
  }, { idioma: chaves.includes("ingles") ? "ingles" : chaves[0], pagina: caderno.inicio });
  return <section className="mt-8" aria-label="Prova e folha de respostas">
    {progresso.resumed && <p className="gb-notice mb-4" role="status">Continuando da página salva neste navegador.</p>}
    {!progresso.storageAvailable && <p className="gb-notice mb-4" role="alert">Não foi possível salvar a posição neste navegador.</p>}
    {chaves.length > 1 && <label className="block font-semibold">Língua estrangeira para as questões 23 a 27<select className="mt-3 block min-h-12 w-full max-w-sm rounded border border-n2 bg-white px-4" value={idioma} onChange={e => setIdioma(e.target.value)}>{chaves.map(i => <option key={i} value={i}>{idiomas[i] ?? i}</option>)}</select><span className="mt-2 block text-sm font-normal text-n5">As respostas ficam salvas separadamente por idioma.</span></label>}
    <div className="mt-5 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div id="caderno"><div className="mb-3 flex flex-wrap items-center gap-3"><button type="button" className="min-h-12 rounded border border-n2 px-3" disabled={pagina<=1} onClick={()=>setPagina(pagina-1)}>← Página anterior</button><span>Página {pagina} de {caderno.paginas}</span><button type="button" className="min-h-12 rounded border border-n2 px-3" disabled={pagina>=caderno.paginas} onClick={()=>setPagina(pagina+1)}>Próxima página →</button><a href="#folha" className="gb-text-link lg:hidden">Marcar respostas ↓</a></div>
        <label className="mb-4 flex items-center gap-3">Ir para a página<select className="min-h-12 rounded border border-n2 bg-white px-3" value={pagina} onChange={e=>setPagina(Number(e.target.value))}>{Array.from({length:caderno.paginas},(_,i)=><option key={i} value={i+1}>{i+1}</option>)}</select></label>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/acervo/${caderno.id}/${String(pagina).padStart(2,"0")}.webp`} alt={`${caderno.titulo}, página ${pagina} do caderno`} className="h-auto w-full rounded-lg border border-n2 bg-white" />
        <p className="mt-3 text-sm text-n5">Consulte as páginas anteriores para textos e figuras compartilhados. A redação e as questões discursivas não são corrigidas automaticamente.</p>
      </div>
      <div id="folha" className="lg:sticky lg:top-4 lg:max-h-[90vh] lg:overflow-y-auto"><a href="#caderno" className="gb-text-link mb-3 inline-block lg:hidden">↑ Voltar ao caderno</a><FolhaDeRespostas key={`${caderno.id}-${idioma}`} id={`${caderno.id}-${idioma}`} titulo={caderno.titulo} sugeridas={60} alternativas={caderno.alternativas} gabarito={caderno.gabaritos[idioma]!} compacto /></div>
    </div>
  </section>;
}

"use client";
import {useMemo,useState} from "react";
import {FolhaDeRespostas} from "@/components/folha-de-respostas";
import {useSavedProgress} from "@/components/use-saved-progress";
type Caderno={id:string;titulo:string;paginas:number;inicio:number;total:number;alternativas:string[];gabarito:string[]|null};
export function IfCadernoReader({caderno}:{caderno:Caderno}){
 const [pagina,setPagina]=useState(caderno.inicio);const estado=useMemo(()=>({pagina}),[pagina]);
 const progresso=useSavedProgress(`gabaru:leitor:${caderno.id}`,estado,s=>{if(Number.isInteger(s.pagina)&&s.pagina>=1&&s.pagina<=caderno.paginas)setPagina(s.pagina);},{pagina:caderno.inicio});
 return <section className="mt-8" aria-label="Prova e folha de respostas">
  {progresso.resumed&&<p className="gb-notice mb-4" role="status">Continuando da página salva neste navegador.</p>}
  {!progresso.storageAvailable&&<p role="alert" className="gb-notice mb-4">Não foi possível salvar a posição neste navegador.</p>}
  <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
   <div id="caderno"><div className="mb-3 flex flex-wrap items-center gap-3"><button type="button" className="min-h-12 rounded border border-n2 px-3" disabled={pagina<=1} onClick={()=>setPagina(pagina-1)}>← Página anterior</button><span>Página {pagina} de {caderno.paginas}</span><button type="button" className="min-h-12 rounded border border-n2 px-3" disabled={pagina>=caderno.paginas} onClick={()=>setPagina(pagina+1)}>Próxima página →</button><a href="#folha" className="gb-text-link lg:hidden">Marcar respostas ↓</a></div>
    <label className="mb-4 flex items-center gap-3">Ir para a página<select className="min-h-12 rounded border border-n2 bg-white px-3" value={pagina} onChange={e=>setPagina(Number(e.target.value))}>{Array.from({length:caderno.paginas},(_,i)=><option key={i} value={i+1}>{i+1}</option>)}</select></label>
    {/* eslint-disable-next-line @next/next/no-img-element */}<img src={`/acervo/${caderno.id}/${String(pagina).padStart(2,"0")}.webp`} alt={`${caderno.titulo}, página ${pagina} do caderno`} className="h-auto w-full rounded-lg border border-n2 bg-white" />
    {!caderno.gabarito&&<p className="mt-4 gb-notice">Conferência manual: o gabarito oficial contém marcações em revisão. <a className="gb-text-link" href={`/acervo/${caderno.id}/gabarito.pdf`} target="_blank" rel="noopener noreferrer">Abrir gabarito no Gabaru ↗</a></p>}
   </div><div id="folha" className="lg:sticky lg:top-4 lg:max-h-[90vh] lg:overflow-y-auto"><a href="#caderno" className="gb-text-link mb-3 inline-block lg:hidden">↑ Voltar ao caderno</a><FolhaDeRespostas id={caderno.id} titulo={caderno.titulo} sugeridas={caderno.total} alternativas={caderno.alternativas} gabarito={caderno.gabarito??undefined} compacto /></div>
  </div></section>;
}

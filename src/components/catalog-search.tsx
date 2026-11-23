'use client';
import {SafeText} from "./safe-text";
import {useStudyProgress} from './use-study-progress';
import { QualityBadge } from './quality-badge';
import type { NivelQualidade } from '@/lib/catalogo/types';
import Link from 'next/link';
import {useCallback,useEffect,useMemo,useState} from 'react';
import {useQueryStates} from 'nuqs';
import {questionParsers} from '@/lib/catalogo/query-parsers';
import { makeSearch, filterItems, emptyFilters, filterParams, PAGE_SIZE, type Filters, type SearchItem } from '@/lib/catalogo/search';

type Options={habilidade:string[];ano:string[];disciplina:string[];assunto:Record<string,string[]>};
const NO_ITEMS:SearchItem[]=[];
/** Índice completo da busca, baixado uma única vez por sessão e só quando o aluno usa os filtros. */
let indexPromise:Promise<SearchItem[]>|null=null;
function loadIndex(){indexPromise??=fetch('/questoes/indice-busca').then(r=>{if(!r.ok)throw new Error('índice');return r.json() as Promise<SearchItem[]>;}).catch(e=>{indexPromise=null;throw e;});return indexPromise;}
export function CatalogSearch({initial,initialTotal,options:optionLists,labels,bancas}:{initial:SearchItem[];initialTotal:number;options:Options;labels:Record<string,string>;bancas:string[]}) {
  const [filters,setQueryFilters]=useQueryStates(questionParsers,{history:'push',shallow:true,clearOnDefault:true});
  const [loaded,setLoaded]=useState<SearchItem[]|null>(null);const [loadError,setLoadError]=useState(false);
  const ensureIndex=useCallback(()=>{if(loaded)return;loadIndex().then(setLoaded,()=>setLoadError(true));},[loaded]);
  // Filtros que dependem do progresso local só funcionam com o índice completo.
  useEffect(()=>{if(filters.status==='erradas'||filters.status==='nao-resolvidas'||filters.erros)ensureIndex();},[filters.status,filters.erros,ensureIndex]);
  const items=loaded??NO_ITEMS;
  const {progress,errors,syncError,user,retry}=useStudyProgress();
  const wrongIDs=useMemo(()=>new Set(items.filter(q=>{const entry=progress[q.id];return filters.status==='erradas'?entry&&!entry.correct&&entry.correctKey===q.correta:errors[q.id]&&(errors[q.id].correctKey??(errors[q.id] as unknown as {correta:string}).correta)===q.correta;}).map(q=>q.id)),[items,progress,errors,filters.status]);
  const resolvedIDs=useMemo(()=>new Set(items.filter(q=>progress[q.id]?.correctKey===q.correta).map(q=>q.id)),[items,progress]);
  const index=useMemo(()=>loaded?makeSearch(loaded):null,[loaded]);
  const results=useMemo(()=>loaded?filterItems(loaded,index,filters,wrongIDs,resolvedIDs):null,[loaded,index,filters,wrongIDs,resolvedIDs]);
  const total=results?results.length:initialTotal;
  const pages=Math.max(1,Math.ceil(total/PAGE_SIZE)),page=Math.max(1,Math.min(pages,Number(filters.pagina)||1));
  // Até o índice chegar, mostra a página que o servidor já renderizou.
  const visible=results?results.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE):initial;
  function change(next:Filters,history:'push'|'replace'='push'){ensureIndex();void setQueryFilters(next,{history});}
  function pageHref(n:number){const p=filterParams({...filters,pagina:String(n)});return '/questoes'+(p.size?'?'+p:'');}
  function options(key:'habilidade'|'categoria'|'banca'|'disciplina'|'assunto'|'ano'){if(key==='banca')return bancas;if(key==='categoria')return ['enem','vestibulinho','vestibulares'];if(key==='assunto')return optionLists.assunto[filters.disciplina]??optionLists.assunto[''];return optionLists[key];}
  return <><form method="get" action="/questoes" onSubmit={e=>e.preventDefault()} onFocus={ensureIndex} onPointerEnter={ensureIndex} className="v2-filters" aria-label="Filtrar banco de questões">
    <label>Palavra-chave<input name="busca" type="search" value={filters.busca} onChange={e=>change({...filters,busca:e.target.value,pagina:'1'},'replace')} placeholder="Enunciado, tema ou habilidade"/></label>
    {(['categoria','banca','ano','disciplina','assunto','habilidade'] as const).map(k=><label key={k}>{({habilidade:'Habilidade ENEM',categoria:'Categoria',banca:'Banca',ano:'Ano',disciplina:'Disciplina',assunto:'Assunto'})[k]}<select name={k} value={filters[k]} onChange={e=>change({...filters,[k]:e.target.value,...(k==='disciplina'?{assunto:''}:{}),pagina:'1'})}><option value="">Todos</option>{options(k).map(v=><option key={v} value={v}>{labels[v]??v}</option>)}</select></label>)}
    <label>Status<select name="status" value={filters.status} onChange={e=>change({...filters,status:e.target.value,pagina:'1'})}><option value="">Todas</option><option value="nao-resolvidas">Não resolvidas</option><option value="erradas">Erradas</option><option value="comentadas">Com resolução comentada</option><option value="video">Com vídeo</option></select></label><label className="v2-filter-toggle"><input type="checkbox" name="comentadas" value="1" checked={!!filters.comentadas} onChange={e=>change({...filters,comentadas:e.target.checked?'1':'',pagina:'1'})}/>Somente com resolução comentada</label><label className="v2-filter-toggle"><input type="checkbox" name="erros" value="1" checked={!!filters.erros} onChange={e=>change({...filters,erros:e.target.checked?'1':'',pagina:'1'})}/>Caderno de erros e revisão</label><div className="v2-actions"><button type="submit" className="v2-button v2-primary">Buscar questões</button><button type="button" className="v2-button" onClick={()=>change(emptyFilters)}>Limpar filtros</button></div>
    </form>{syncError&&user&&<p role="status">Sincronização indisponível. O progresso deste navegador está preservado; reconecte para tentar novamente. <button type="button" className="v2-button" onClick={()=>void retry()}>Tentar sincronização</button></p>}<p role="status" aria-live="polite" className="v2-help">{total} {total===1?"questão encontrada":"questões encontradas"} · página {page} de {pages}. Filtros refletem o endereço desta página.{loadError&&' Não foi possível carregar a busca completa; recarregue a página.'}</p>
    <ol className="v2-results">{visible.map(q=><li key={q.id} className="v2-result"><article><p className="gb-eyebrow">{labels[q.banca]??q.banca} · {q.ano} · {labels[q.disciplina]??q.disciplina}</p><h2><Link href={`/questoes/${q.slug}`}>{q.tema}</Link></h2><p><SafeText text={q.enunciado.slice(0,220)}/>{q.enunciado.length>220?'…':''}</p><p className="mt-3 text-sm"><QualityBadge nivel={q.nivelQualidade as NivelQualidade}/> · {labels[q.assunto]??q.assunto}</p>{filters.erros&&errors[q.id]?.dueAt&&<p>Próxima revisão: {new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo'}).format(errors[q.id].dueAt)}</p>}</article></li>)}</ol>
    {!visible.length&&<p className="v2-editorial">Nenhuma questão atende a essa combinação. Tente remover um filtro ou buscar outro termo.</p>}
    <nav className="v2-actions mt-6" aria-label="Páginas de resultados">{page>1?<Link className="v2-button" href={pageHref(page-1)} rel="prev" onClick={e=>{if(loaded){e.preventDefault();change({...filters,pagina:String(page-1)});}}}>Página anterior</Link>:<span className="v2-button" aria-disabled="true">Página anterior</span>}{page<pages?<Link className="v2-button" href={pageHref(page+1)} rel="next" onClick={e=>{if(loaded){e.preventDefault();change({...filters,pagina:String(page+1)});}}}>Próxima página</Link>:<span className="v2-button" aria-disabled="true">Próxima página</span>}</nav></>;
}

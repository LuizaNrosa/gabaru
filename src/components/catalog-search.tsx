'use client';
import { QualityBadge } from './quality-badge';
import type { NivelQualidade } from '@/lib/catalogo/types';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { makeSearch, filterItems, filtersFromParams, emptyFilters, type Filters, type SearchItem } from '@/lib/catalogo/search';
export function CatalogSearch({items,initialFilters,labels}:{items:SearchItem[];initialFilters:Filters;labels:Record<string,string>}) {
  const [filters,setFilters]=useState(initialFilters);
  const [wrongIDs,setWrongIDs]=useState<Set<string>>(new Set());
  useEffect(()=>{const restore=()=>{try{const ledger=JSON.parse(localStorage.getItem('gabaru:v2:erros')??'{}');setWrongIDs(new Set(items.filter(q=>ledger[q.id]&&ledger[q.id].correta===q.correta).map(q=>q.id)));}catch{setWrongIDs(new Set());}};restore();window.addEventListener('storage',restore);window.addEventListener('gabaru-progresso',restore);return()=>{window.removeEventListener('storage',restore);window.removeEventListener('gabaru-progresso',restore);};},[items]);
  const index=useMemo(()=>makeSearch(items),[items]);
  const results=useMemo(()=>filterItems(items,index,filters,wrongIDs),[items,index,filters,wrongIDs]);
  const pages=Math.max(1,Math.ceil(results.length/30)),page=Math.max(1,Math.min(pages,Number(filters.pagina)||1));
  useEffect(()=>{const restore=()=>setFilters(filtersFromParams(new URLSearchParams(location.search)));window.addEventListener('popstate',restore);return()=>window.removeEventListener('popstate',restore);},[]);
  function change(next:Filters){setFilters(next);const params=new URLSearchParams();Object.entries(next).forEach(([k,v])=>{if(v&&!(k==='pagina'&&v==='1'))params.set(k,v);});history.replaceState(null,'',`${location.pathname}${params.size?'?'+params:''}`);}
  function options(key:'categoria'|'banca'|'disciplina'|'assunto'|'ano'){const applicable=key==='assunto'?items.filter(q=>!filters.disciplina||q.disciplina===filters.disciplina):items;return [...new Set(applicable.map(q=>String(q[key])))].sort((a,b)=>key==='ano'?Number(b)-Number(a):a.localeCompare(b,'pt-BR'));}
  return <><form method="get" action="/questoes" onSubmit={e=>e.preventDefault()} className="v2-filters" aria-label="Filtrar banco de questões">
    <label>Palavra-chave<input name="busca" type="search" value={filters.busca} onChange={e=>change({...filters,busca:e.target.value,pagina:'1'})} placeholder="Enunciado, tema ou habilidade"/></label>
    {(['categoria','banca','ano','disciplina','assunto'] as const).map(k=><label key={k}>{({categoria:'Categoria',banca:'Banca',ano:'Ano',disciplina:'Disciplina',assunto:'Assunto'})[k]}<select name={k} value={filters[k]} onChange={e=>change({...filters,[k]:e.target.value,...(k==='disciplina'?{assunto:''}:{}),pagina:'1'})}><option value="">Todos</option>{options(k).map(v=><option key={v} value={v}>{labels[v]??v}</option>)}</select></label>)}
    <label className="v2-filter-toggle"><input type="checkbox" name="comentadas" value="1" checked={!!filters.comentadas} onChange={e=>change({...filters,comentadas:e.target.checked?'1':'',pagina:'1'})}/>Somente com resolução comentada</label><label className="v2-filter-toggle"><input type="checkbox" name="erros" value="1" checked={!!filters.erros} onChange={e=>change({...filters,erros:e.target.checked?'1':'',pagina:'1'})}/>Meu caderno de erros neste navegador</label><div className="v2-actions"><button type="submit" className="v2-button v2-primary">Buscar questões</button><button type="button" className="v2-button" onClick={()=>change(emptyFilters)}>Limpar filtros</button></div>
    </form><p role="status" aria-live="polite" className="v2-help">{results.length} {results.length===1?"questão encontrada":"questões encontradas"} · página {page} de {pages}. Filtros refletem o endereço desta página.</p>
    <ol className="v2-results">{results.slice((page-1)*30,page*30).map(q=><li key={q.id} className="v2-result"><article><p className="gb-eyebrow">{labels[q.banca]??q.banca} · {q.ano} · {labels[q.disciplina]??q.disciplina}</p><h2><Link href={`/questoes/${q.slug}`}>{q.tema}</Link></h2><p>{q.enunciado.slice(0,220)}{q.enunciado.length>220?'…':''}</p><p className="mt-3 text-sm"><QualityBadge nivel={q.nivelQualidade as NivelQualidade}/> · {labels[q.assunto]??q.assunto}</p></article></li>)}</ol>
    {!results.length&&<p className="v2-editorial">Nenhuma questão atende a essa combinação. Tente remover um filtro ou buscar outro termo.</p>}
    <nav className="v2-actions mt-6" aria-label="Páginas de resultados"><button type="button" className="v2-button" disabled={page<=1} onClick={()=>change({...filters,pagina:String(page-1)})}>Página anterior</button><button type="button" className="v2-button" disabled={page>=pages} onClick={()=>change({...filters,pagina:String(page+1)})}>Próxima página</button></nav></>;
}

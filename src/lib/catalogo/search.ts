import MiniSearch from 'minisearch';
export type SearchItem = { id: string; slug: string; banca: string; ano: number; disciplina: string; assunto: string; tema: string; enunciado: string; habilidade?:string; youtubeVideoId?:string; categoria:string; nivelQualidade:string; correta:string|null; statusPublicacao: string };
export type Filters = { status:string; habilidade:string; categoria:string; comentadas:string; erros:string; banca:string; ano:string; disciplina:string; assunto:string; busca:string; pagina:string };
export const emptyFilters:Filters={status:'',habilidade:'',categoria:'',comentadas:'',erros:'',banca:'',ano:'',disciplina:'',assunto:'',busca:'',pagina:'1'};
export function filtersFromParams(params:URLSearchParams):Filters { return Object.fromEntries(Object.keys(emptyFilters).map(k=>[k,params.get(k)??emptyFilters[k as keyof Filters]])) as Filters; }
export function makeSearch(items:SearchItem[]) {
  const index=new MiniSearch<SearchItem>({fields:['enunciado','tema','banca','disciplina','assunto','habilidade'],idField:'id',processTerm:term=>term.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,''),searchOptions:{prefix:true,fuzzy:0.15,combineWith:'AND'}});
  index.addAll(items);return index;
}
export function filterItems(items:SearchItem[],index:MiniSearch<SearchItem>,filters:Filters,wrongIDs:Set<string>=new Set(),resolvedIDs:Set<string>=new Set()) {
  const ids=filters.busca.trim()?new Set(index.search(filters.busca.trim()).map(r=>r.id as string)):null;
  return items.filter(q=>(!filters.habilidade||q.habilidade===filters.habilidade)&&(!filters.status||filters.status==='nao-resolvidas'&&!resolvedIDs.has(q.id)||filters.status==='erradas'&&wrongIDs.has(q.id)||filters.status==='comentadas'&&q.nivelQualidade==='nivel-2-resolucao-comentada'||filters.status==='video'&&!!q.youtubeVideoId)&&(!filters.categoria||q.categoria===filters.categoria)&&(!filters.comentadas||q.nivelQualidade==='nivel-2-resolucao-comentada')&&(!filters.erros||wrongIDs.has(q.id))&&(!ids||ids.has(q.id))&&(!filters.banca||q.banca===filters.banca)&&(!filters.ano||String(q.ano)===filters.ano)&&(!filters.disciplina||q.disciplina===filters.disciplina)&&(!filters.assunto||q.assunto===filters.assunto));
}

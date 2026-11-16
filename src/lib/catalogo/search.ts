import MiniSearch from 'minisearch';
export type SearchItem = { id: string; slug: string; banca: string; ano: number; disciplina: string; assunto: string; tema: string; enunciado: string; statusPublicacao: string };
export type Filters = { banca:string; ano:string; disciplina:string; assunto:string; busca:string; pagina:string };
export const emptyFilters:Filters={banca:'',ano:'',disciplina:'',assunto:'',busca:'',pagina:'1'};
export function filtersFromParams(params:URLSearchParams):Filters { return Object.fromEntries(Object.keys(emptyFilters).map(k=>[k,params.get(k)??emptyFilters[k as keyof Filters]])) as Filters; }
export function makeSearch(items:SearchItem[]) {
  const index=new MiniSearch<SearchItem>({fields:['enunciado','tema','banca','disciplina','assunto'],idField:'id',searchOptions:{prefix:true,fuzzy:0.15,combineWith:'AND'}});
  index.addAll(items);return index;
}
export function filterItems(items:SearchItem[],index:MiniSearch<SearchItem>,filters:Filters) {
  const ids=filters.busca.trim()?new Set(index.search(filters.busca.trim()).map(r=>r.id as string)):null;
  return items.filter(q=>(!ids||ids.has(q.id))&&(!filters.banca||q.banca===filters.banca)&&(!filters.ano||String(q.ano)===filters.ano)&&(!filters.disciplina||q.disciplina===filters.disciplina)&&(!filters.assunto||q.assunto===filters.assunto));
}

import livrosBase from '@/data/livros-base.json';
// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
/** Metadados públicos; o texto dos capítulos vive exclusivamente no módulo server-only. */
import colecao from '@/data/colecao-vestibulinho.json';
import gerados from '@/data/livros-gerados.json';import {obterCapitulo} from './livros-conteudo';
export type Livro={slug:string;titulo:string;descricao:string;colecao?:string;capitulos:{slug:string;titulo:string;topicos?:string[];status?:'preparacao'|'amostra'|'publicado'}[]};
const base=livrosBase.map(b=>({...b,capitulos:b.capitulos.map(({slug,titulo})=>({slug,titulo}))}));
const novos:Livro[]=colecao.map(l=>({slug:l.slug,titulo:l.titulo,descricao:l.descricao,colecao:l.colecao,capitulos:l.capitulos.map(c=>({slug:c.slug,titulo:c.titulo,topicos:c.topicos}))}));
const merged=new Map<string,Livro>([...novos,...base].map(b=>[b.slug,{...b,capitulos:[...b.capitulos]}]));for(const g of gerados as Livro[]){const old=merged.get(g.slug);if(old){for(const c of g.capitulos)if(!old.capitulos.some(x=>x.slug===c.slug))old.capitulos.push(c);}else merged.set(g.slug,g);}
export const livros:Livro[]=[...merged.values()].map(l=>({...l,capitulos:l.capitulos.map(c=>{const content=obterCapitulo(l.slug,c.slug);return {...c,status:content?(content.amostra?'amostra' as const:'publicado' as const):'preparacao' as const};}).filter(c=>l.colecao==='vestibulinho-ifs-etec'||c.status!=='preparacao')})).filter(l=>l.capitulos.length);

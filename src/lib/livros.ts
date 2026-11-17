// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
/** Metadados públicos; o texto dos capítulos vive exclusivamente no módulo server-only. */
import gerados from '@/data/livros-gerados.json';import {obterCapitulo} from './livros-conteudo';
type Livro={slug:string;titulo:string;descricao:string;capitulos:{slug:string;titulo:string}[]};
const base=[{slug:'vestibulinho-etec',titulo:'Apostila Preparatória Vestibulinho ETEC',descricao:'Razão, unidades e leitura de problemas para começar a preparação.',capitulos:[{slug:'razao-e-proporcao',titulo:'Razão e proporção'},{slug:'unidades-e-escalas',titulo:'Unidades e escalas'}]},{slug:'enem-exatas-e-linguagens',titulo:'Guia ENEM: Exatas e Linguagens',descricao:'Fundamentos de funções, química e interpretação, com prática ao final de cada capítulo.',capitulos:[{slug:'funcoes-e-modelagem',titulo:'Funções e modelagem'},{slug:'moleculas-e-leitura-cientifica',titulo:'Moléculas e leitura científica'}]}] as const;

const merged=new Map<string,Livro>(base.map(b=>[b.slug,{...b,capitulos:[...b.capitulos]}]));for(const g of gerados as Livro[]){const old=merged.get(g.slug);if(old){for(const c of g.capitulos)if(!old.capitulos.some(x=>x.slug===c.slug))old.capitulos.push(c);}else merged.set(g.slug,g);}
export const livros=[...merged.values()].map(l=>({...l,capitulos:l.capitulos.filter(c=>!!obterCapitulo(l.slug,c.slug))})).filter(l=>l.capitulos.length);

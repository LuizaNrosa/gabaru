import {redirect} from 'next/navigation';
import {JsonLd} from '@/components/json-ld';
import {schemaGraph} from '@/lib/seo/schema-graph';
import { CatalogSearch } from '@/components/catalog-search';
import { catalogo } from '@/lib/catalogo';
import { searchItems,searchLabels,searchOptions } from '@/lib/catalogo/search-items';
import { filtersFromParams,filterParams,filterItems,makeSearch,PAGE_SIZE } from '@/lib/catalogo/search';
import { metaPagina } from '@/lib/seo';
type Props={searchParams:Promise<Record<string,string|string[]|undefined>>};
export async function generateMetadata({searchParams}:Props){return metaPagina({titulo:'Banco de questões: encontre seu próximo treino',descricao:'Combine banca, ano, disciplina e assunto. Leia as questões, confira o gabarito oficial e acompanhe o estado da revisão editorial.',caminho:'/questoes',semIndice:Object.keys(await searchParams).length>0});}
export default async function Page({searchParams}:Props){const params=await searchParams;const query=new URLSearchParams();for(const [k,v]of Object.entries(params))if(typeof v==='string')query.set(k,v);
 const parsed=filtersFromParams(query);
 for(const key of ['disciplina','assunto','habilidade','ano'] as const)if(parsed[key]&&!catalogo.questoes.some(q=>String(q[key])===parsed[key]))parsed[key]=key==='ano'?'':'';
 const clean=filterParams(parsed);if(Object.values(params).some(Array.isArray)||query.toString()!==clean.toString())redirect('/questoes'+(clean.size?'?'+clean:''));
 // Paginação no servidor: o HTML leva só a página pedida (30 questões), não o banco inteiro.
 // Filtros que dependem do progresso do aluno (erradas, não resolvidas, caderno de erros) são aplicados no cliente.
 const results=filterItems(searchItems,parsed.busca.trim()?makeSearch(searchItems):null,{...parsed,status:['erradas','nao-resolvidas'].includes(parsed.status)?'':parsed.status,erros:''});
 const pages=Math.max(1,Math.ceil(results.length/PAGE_SIZE)),page=Math.max(1,Math.min(pages,Number(parsed.pagina)||1));
 return <main id="conteudo-principal" className="gb-container v2-page"><JsonLd dados={schemaGraph({path:"/questoes",title:"Banco de questões",breadcrumbs:[{name:"Início",path:"/"},{name:"Questões",path:"/questoes"}]})}/><p className="gb-eyebrow">Encontre · resolva · revise</p><h1 className="gb-page-title">Uma questão de cada vez.</h1><p className="v2-lead">Cruze banca, ano, disciplina e assunto para montar seu estudo. As questões com enunciado íntegro e gabarito conferido são identificadas. Itens em quarentena ficam fora da busca e dos sitemaps.</p><CatalogSearch bancas={catalogo.bancas.map(b=>b.slug)} initial={results.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE)} initialTotal={results.length} options={searchOptions} labels={searchLabels}/></main>;
}

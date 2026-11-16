import { CatalogSearch } from '@/components/catalog-search';
import { catalogo,nomeTaxonomia } from '@/lib/catalogo';
import { filtersFromParams } from '@/lib/catalogo/search';
import { metaPagina } from '@/lib/seo';
type Props={searchParams:Promise<Record<string,string|string[]|undefined>>};
export async function generateMetadata({searchParams}:Props){return metaPagina({titulo:'Banco de questões: encontre seu próximo treino',descricao:'Combine banca, ano, disciplina e assunto. Leia as questões, confira o gabarito oficial e acompanhe o estado da revisão editorial.',caminho:'/questoes',semIndice:Object.keys(await searchParams).length>0});}
export default async function Page({searchParams}:Props){const params=await searchParams;const query=new URLSearchParams();for(const [k,v]of Object.entries(params))if(typeof v==='string')query.set(k,v);
 const items=catalogo.questoes.filter(q=>q.enunciado.trim()&&q.alternativas.length>=4).map(({id,slug,banca,ano,disciplina,assunto,tema,enunciado,categoria,nivelQualidade,correta,statusPublicacao})=>({id,slug,banca,ano,disciplina,assunto,tema,enunciado,categoria,nivelQualidade,correta,statusPublicacao}));
 const labels={enem:'ENEM',vestibulinho:'Vestibulinho',vestibulares:'Vestibulares',...Object.fromEntries([...items.flatMap(q=>[q.disciplina,q.assunto]).map(s=>[s,nomeTaxonomia(s)]),...catalogo.bancas.map(b=>[b.slug,b.sigla])])};
 return <main id="conteudo-principal" className="gb-container v2-page"><p className="gb-eyebrow">Encontre · resolva · revise</p><h1 className="gb-page-title">Uma questão de cada vez.</h1><p className="v2-lead">Cruze banca, ano, disciplina e assunto para montar seu estudo. As transcrições em revisão são identificadas; somente questões completas com resolução comentada entram no sitemap de questões.</p><CatalogSearch items={items} initialFilters={filtersFromParams(query)} labels={labels}/></main>;
}

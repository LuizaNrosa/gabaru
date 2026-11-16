import { notFound } from 'next/navigation';
import { catalogo,nomeTaxonomia } from '@/lib/catalogo';
import { metaPagina } from '@/lib/seo';
import { TopicPage } from '@/components/topic-page';
type Props={params:Promise<{slug:string}>};
export function generateStaticParams(){return [...new Set(catalogo.questoes.filter(q=>q.statusPublicacao==='completa').map(q=>q.assunto))].map(s=>({slug:s}));}
export async function generateMetadata({params}:Props){const slug=(await params).slug;return metaPagina({titulo:`${nomeTaxonomia(slug)}: questões e resoluções`,descricao:`Estude ${nomeTaxonomia(slug)} com questões organizadas por banca e ano, gabaritos e resoluções publicadas.`,caminho:`/assunto/${slug}`,semIndice:!catalogo.questoes.some(q=>q.assunto===slug&&q.statusPublicacao==='completa')});}
export default async function Page({params}:Props){const slug=(await params).slug;if(!catalogo.questoes.some(q=>q.assunto===slug))notFound();return <TopicPage kind="assunto" slug={slug}/>;}

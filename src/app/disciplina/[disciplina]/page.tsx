import { notFound } from 'next/navigation';
import { catalogo,nomeTaxonomia } from '@/lib/catalogo';
import { metaPagina } from '@/lib/seo';
import { TopicPage } from '@/components/topic-page';
type Props={params:Promise<{disciplina:string}>};
export function generateStaticParams(){return [...new Set(catalogo.questoes.filter(q=>q.statusPublicacao==='completa').map(q=>q.disciplina))].map(s=>({disciplina:s}));}
export async function generateMetadata({params}:Props){const slug=(await params).disciplina;return metaPagina({titulo:`${nomeTaxonomia(slug)}: questões e resoluções`,descricao:`Estude ${nomeTaxonomia(slug)} com questões organizadas por banca e ano, gabaritos e resoluções publicadas.`,caminho:`/disciplina/${slug}`,semIndice:slug==='a-classificar'||!catalogo.questoes.some(q=>q.disciplina===slug&&q.statusPublicacao==='completa')});}
export default async function Page({params}:Props){const slug=(await params).disciplina;if(!catalogo.questoes.some(q=>q.disciplina===slug))notFound();return <TopicPage kind="disciplina" slug={slug}/>;}

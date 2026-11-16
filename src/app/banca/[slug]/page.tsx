import { notFound } from 'next/navigation';
import { catalogo } from '@/lib/catalogo';
import { CatalogHub } from '@/components/catalog-hub';
import { metaPagina } from '@/lib/seo';
type Props={params:Promise<{slug:string}>};
export function generateStaticParams(){return catalogo.bancas.map(b=>({slug:b.slug}));}
export async function generateMetadata({params}:Props){const {slug}=await params;const b=catalogo.bancas.find(b=>b.slug===slug);return metaPagina({titulo:`${b?.sigla??'Banca'}: provas por ano e questões`,descricao:b?.descricao??'Catálogo de provas e questões do Gabaru.',caminho:`/banca/${slug}`,semIndice:!catalogo.cadernos.some(e=>e.banca===slug)});}
export default async function Page({params}:Props){const {slug}=await params;if(!catalogo.bancas.some(b=>b.slug===slug))notFound();return <CatalogHub banca={slug}/>;}

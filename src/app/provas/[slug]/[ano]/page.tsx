import { catalogo } from '@/lib/catalogo';
import { metaPagina } from '@/lib/seo';
import { ExamYearIndex } from '@/components/exam-year-index';
type Props={params:Promise<{slug:string;ano:string}>};
export async function generateMetadata({params}:Props){const {slug,ano}=await params;return metaPagina({titulo:`Provas ${slug.toUpperCase()} ${ano}`,descricao:'Cadernos oficiais organizados por ano e instituição, com indicação das fontes e do estado de revisão editorial.',caminho:`/provas/${slug}/${ano}`,semIndice:!catalogo.cadernos.some(e=>e.banca===slug&&e.ano===Number(ano)&&e.statusPublicacao==='completa')});}
export default async function Page({params}:Props){const {slug,ano}=await params;return <ExamYearIndex banca={slug} year={Number(ano)}/>;}

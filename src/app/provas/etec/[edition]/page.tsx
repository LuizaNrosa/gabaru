import { ExamYearIndex } from "@/components/exam-year-index";
import { ExamEditorial } from "@/components/exam-editorial";
import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import exams from "@/data/etec-exams.json";
import {AcervoExamReader} from "@/components/etec-exam-reader";
import {toPaginatedReaderExam} from "@/lib/paginated-reader-exam";
import {JsonLd} from "@/components/json-ld";
import {jsonLd,metaPagina} from "@/lib/seo";
export function generateStaticParams(){return exams.filter(e=>e.id!=="2026-2").map(e=>({edition:e.id}));}
export async function generateMetadata({params}:{params:Promise<{edition:string}>}):Promise<Metadata>{const {edition}=await params;const e=exams.find(x=>x.id===edition);return metaPagina({titulo:e?`${e.title}: ${e.questions.length} questões e gabarito oficial`:"Prova ETEC",descricao:"Consulte o caderno integral, responda às questões e confira o gabarito oficial no Gabaru.",caminho:`/provas/etec/${edition}`});}
export default async function Page({params}:{params:Promise<{edition:string}>}){const {edition}=await params;const e=exams.find(x=>x.id===edition);if(!e&&/^\d{4}$/.test(edition))return <ExamYearIndex banca="etec" year={Number(edition)}/>;if(!e)notFound();
return <main id="conteudo-principal" tabIndex={-1} className="gb-container py-10"><JsonLd dados={jsonLd.trilhas([{nome:"Início",caminho:"/"},{nome:"Vestibulinhos",caminho:"/pre-vestibulinho"},{nome:"Acervo ETEC",caminho:"/provas/etec"},{nome:e.title,caminho:`/provas/etec/${e.id}`}])}/><Link href="/provas/etec" className="gb-text-link">← Acervo ETEC</Link><p className="gb-eyebrow mt-8">ACERVO OFICIAL · ETEC</p><h1 className="gb-page-title">{e.title}</h1><p className="mt-5 text-lg text-n5">{e.questions.length} questões. Caderno integral e correção pelo gabarito oficial{e.answerKeyRevised?' retificado':''}.</p><details className="mt-4"><summary className="cursor-pointer py-2 text-sm text-n5">Origem do caderno e do gabarito</summary><a className="gb-text-link" href={e.source} target="_blank" rel="noopener noreferrer">Consultar fonte oficial ↗</a></details><details className="v2-solution"><summary>Caderno original e leitor de imagens</summary><AcervoExamReader key={e.id} exam={toPaginatedReaderExam(e, "etec")} institution="etec" catalog={exams.map(x=>({id:x.id,title:x.title,count:x.questions.length}))}/></details><ExamEditorial banca="etec" edition={e.id} />
</main>}

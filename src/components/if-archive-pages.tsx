import Link from "next/link";
import {notFound} from "next/navigation";
import primeiros from "@/data/ifs-primeiros.json";
import adicionais from "@/data/ifs-2023.json";
import recentes from "@/data/ifs-lote-2026.json";
import historicos from "@/data/ifs-historicos.json";
import agentes from "@/data/ifs-agentes.json";
import agentes2 from "@/data/ifs-agentes-2.json";
const dados=[...primeiros,...adicionais,...recentes,...historicos,...agentes,...agentes2];
import {IfCadernoReader} from "@/components/if-caderno-reader";
import {metaPagina} from "@/lib/seo";
const nomes:Record<string,string>={ifmg:"Instituto Federal de Minas Gerais",ifrn:"Instituto Federal do Rio Grande do Norte",ifce:"Instituto Federal do Ceará",ifba:"Instituto Federal da Bahia"};
export const listaIfs=dados;
export function metaIf(slug:string){return metaPagina({titulo:`${slug.toUpperCase()}: provas anteriores e gabaritos`,descricao:`Treine provas oficiais do ${nomes[slug]} gratuitamente no Gabaru.`,caminho:`/provas/${slug}`});}
export function metaIfEdicao(slug:string,id:string){const c=dados.find(e=>e.id===id&&e.instituicao.toLowerCase()===slug);return c?metaPagina({titulo:`${c.titulo}: prova e gabarito`,descricao:`Responda ${c.total} questões da prova ${c.titulo} no Gabaru.`,caminho:`/provas/${slug}/${id}`}):{};}
export function IfArchive({slug}:{slug:string}){const exames=dados.filter(e=>e.instituicao.toLowerCase()===slug);return <main className="gb-container py-10"><Link className="gb-text-link" href="/pre-vestibulinho">← Vestibulinhos</Link><p className="gb-eyebrow mt-8">ACERVO OFICIAL · {slug.toUpperCase()}</p><h1 className="gb-page-title">Provas do {slug.toUpperCase()} para treinar.</h1><p className="mt-5 text-lg">{nomes[slug]} · escolha uma prova e responda aqui, gratuitamente.</p><div className="my-8 grid gap-4 md:grid-cols-2">{exames.map(e=><Link className="gb-content-card" key={e.id} href={`/provas/${slug}/${e.id}`}><h2 className="text-xl font-bold">{e.titulo}</h2><p>{e.total} questões · {e.gabarito?"correção automática":"conferência manual"}</p><span className="gb-text-link">Abrir caderno e responder ↗</span></Link>)}</div></main>;}
export function IfExam({slug,id}:{slug:string;id:string}){const c=dados.find(e=>e.id===id&&e.instituicao.toLowerCase()===slug);if(!c)notFound();return <main className="gb-container py-10"><Link href={`/provas/${slug}`} className="gb-text-link">← Provas do {slug.toUpperCase()}</Link><p className="gb-eyebrow mt-8">TREINO GRATUITO · PROVA OFICIAL</p><h1 className="gb-page-title">{c.titulo}</h1><p className="mt-5 text-lg">Leia o caderno e marque as {c.total} questões sem sair do Gabaru.</p><p className="gb-notice mt-6">{c.gabarito?"Correção automática pelo gabarito oficial final. O resultado mostra acertos, erros, questões em branco e anuladas.":"Conferência manual: o gabarito oficial está disponível aqui no Gabaru; a correção automática está em revisão."} Redação e questões discursivas não recebem correção automática.</p><IfCadernoReader caderno={c}/><p className="mt-8"><a className="gb-text-link" href={c.fonte} target="_blank" rel="noopener noreferrer">Fonte da prova e do gabarito ↗</a></p></main>;}

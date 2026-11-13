import Link from "next/link";
import ifsc from "@/data/ifsc-exams.json";
import ifsp from "@/data/ifsp-exams.json";
import primeiros from "@/data/ifs-primeiros.json";
import anteriores from "@/data/ifs-2023.json";
import recentes from "@/data/ifs-lote-2026.json";
import historicos from "@/data/ifs-historicos.json";
import agentes from "@/data/ifs-agentes.json";

const acervo=[...primeiros,...anteriores,...recentes,...historicos,...agentes];
export function InstitutoCollection(){
 const institutos=[
  {slug:"ifsp",nome:"IFSP",estado:"São Paulo",quantidade:ifsp.length},
  {slug:"ifsc",nome:"IFSC",estado:"Santa Catarina",quantidade:ifsc.length},
  {slug:"ifmg",nome:"IFMG",estado:"Minas Gerais",quantidade:acervo.filter(e=>e.instituicao==="IFMG").length},
  {slug:"ifrn",nome:"IFRN",estado:"Rio Grande do Norte",quantidade:acervo.filter(e=>e.instituicao==="IFRN").length},
  {slug:"ifce",nome:"IFCE",estado:"Ceará",quantidade:acervo.filter(e=>e.instituicao==="IFCE").length},
  {slug:"ifba",nome:"IFBA",estado:"Bahia",quantidade:0},
 ];
 return <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Institutos Federais por estado">{institutos.map(i=><li key={i.slug}><Link href={`/provas/${i.slug}`} className="gb-content-card flex h-full flex-col gap-3"><span className="flex items-baseline justify-between gap-3"><strong className="text-xl">{i.nome}</strong><span className="text-sm text-n5">{i.estado}</span></span><span className="text-n5">{i.quantidade?`${i.quantidade} ${i.quantidade===1?"caderno disponível":"cadernos disponíveis"}`:"Acervo em coleta"}</span><span className="gb-text-link mt-auto">{i.quantidade?"Escolher prova":"Acompanhar acervo"} →</span></Link></li>)}</ul>;
}

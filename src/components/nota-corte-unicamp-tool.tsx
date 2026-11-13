"use client";
import {useState} from "react";
import Link from "next/link";
import { CarimboResultado } from "@/components/carimbo-resultado";
import dados from "@/data/unicamp-2027-cortes.json";
type Faixa="0"|"20"|"40"|"60";
export function NotaCorteUnicampTool(){
 const [indice,setIndice]=useState(()=>Math.max(0,dados.ofertas.findIndex(o=>o.curso==="Medicina (I)")));const [cota,setCota]=useState<"nao_cotistas"|"cotistas">("nao_cotistas");const [paais,setPaais]=useState<Faixa>("0");const [acertos,setAcertos]=useState(40);const [informouAcertos,setInformouAcertos]=useState(false);
 const oferta=dados.ofertas[indice];const corte=oferta[cota][paais];const diferenca=corte===null?null:acertos-corte;
 return <section className="rounded-lg border border-n2 bg-white/70 p-5 sm:p-8" aria-label="Consulta de corte Unicamp">
  <p className="gb-eyebrow">1 · SEU OBJETIVO</p><div className="mt-4 grid gap-5 md:grid-cols-3">
   <label className="font-semibold">Curso ou opção de treineiro<select className="mt-2 block min-h-12 w-full rounded border border-n2 bg-white px-3 font-normal" value={indice} onChange={e=>setIndice(Number(e.target.value))}>{dados.ofertas.map((o,i)=><option key={`${o.curso}-${i}`} value={i}>{o.curso}</option>)}</select></label>
   <label className="font-semibold">Modalidade<select className="mt-2 block min-h-12 w-full rounded border border-n2 bg-white px-3 font-normal" value={cota} onChange={e=>setCota(e.target.value as typeof cota)}><option value="nao_cotistas">Não cotista</option><option value="cotistas">Cotista</option></select></label>
   <label className="font-semibold">Pontuação PAAIS<select className="mt-2 block min-h-12 w-full rounded border border-n2 bg-white px-3 font-normal" value={paais} onChange={e=>setPaais(e.target.value as Faixa)}><option value="0">0 pontos</option><option value="20">20 pontos</option><option value="40">40 pontos</option><option value="60">60 pontos</option></select></label>
  </div>
  {oferta.tipo==="treineiro"&&<p className="gb-notice mt-5">Esta opção é destinada a treineiros e está identificada assim na tabela da COMVEST.</p>}
  <p className="gb-eyebrow mt-8">2 · SUA REFERÊNCIA</p><label className="mt-4 block font-semibold" htmlFor="unicamp-acertos">Quantas questões você acertou ou pretende acertar? <span className="font-bold text-[#b3400c]">{acertos}</span></label><input id="unicamp-acertos" className="mt-4 w-full accent-[#b3400c]" type="range" min={0} max={72} value={acertos} onChange={e=>{setInformouAcertos(true);setAcertos(Number(e.target.value));}}/>
  <input aria-label="Acertos (número)" type="number" min={0} max={72} value={acertos} onChange={e => { setInformouAcertos(true); setAcertos(Math.max(0, Math.min(72, Number(e.target.value)))); }} className="mt-3 min-h-12 w-24 rounded border border-n2 bg-white px-3" />
  {informouAcertos && <CarimboResultado resultado={acertos} referencia={corte} margemProximidade={5} unidade="acertos" treinoHref="/provas/unicamp" />}
  <div className="mt-6 grid gap-4 md:grid-cols-2" aria-live="polite"><div className="rounded border border-n2 p-4"><p className="text-sm text-n5">Último convocado à 2ª fase · 2027</p><p className="mt-1 text-3xl font-bold">{corte===null?"Não informado":<>{corte} <span className="text-base font-normal">acertos</span></>}</p></div><div className="rounded border border-n2 p-4"><p className="text-sm text-n5">Sua comparação</p><p className="mt-1 font-semibold">{diferenca===null?"Comparação indisponível":diferenca===0?"Igual à referência":diferenca>0?`${diferenca} acima da referência`:`${Math.abs(diferenca)} abaixo da referência`}</p></div></div>
  {corte===null&&<p className="gb-notice mt-4">A tabela oficial não apresenta valor para esta combinação.</p>}
  <p className="mt-5 text-sm text-n5">Escolha a faixa PAAIS que corresponde à sua situação na edição. A tabela mostra acertos do último convocado para a segunda fase; não é nota de matrícula nem garante resultado em outra edição. A prova de Música possui publicação específica.</p>
  <p className="mt-3 text-sm text-n5">Fonte: <a className="underline" href={`${dados.fonte}#page=${oferta.pagina}`} target="_blank" rel="noopener noreferrer">tabela oficial COMVEST 2027, página {oferta.pagina} ↗</a>.</p>
  <div className="gb-actions"><Link href="/provas/unicamp" className="gb-button">Treinar provas da Unicamp →</Link><Link href="/nota-de-corte/fuvest" className="gb-text-link">Consultar FUVEST →</Link></div>
 </section>;
}

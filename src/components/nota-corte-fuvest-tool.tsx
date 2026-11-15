"use client";
import {useState} from "react";
import Link from "next/link";
import { CarimboResultado } from "@/components/carimbo-resultado";
import dados2026 from "@/data/fuvest-2026-cortes.json";
import dados2027 from "@/data/fuvest-2027-cortes.json";

const modalidades=[{id:"AC",nome:"Ampla concorrência"},{id:"EP",nome:"Escola pública (EP)"},{id:"PPI",nome:"Escola pública · grupo PPI"}];
export function NotaCorteFuvestTool(){
 const [ano,setAno]=useState<2026 | 2027>(2027);
 const dados=ano===2027?dados2027:dados2026;
 const carreiras=dados.registros.filter(r=>r.modalidade==="AC").map(r=>({codigo:r.carreira_codigo,nome:r.carreira}));
 const [codigo,setCodigo]=useState("111");
 const [modalidade,setModalidade]=useState("AC");
 const [acertos,setAcertos]=useState(50);const [informouAcertos,setInformouAcertos]=useState(false);
 const linha=dados.registros.find(r=>r.carreira_codigo===codigo&&r.modalidade===modalidade);
 if(!linha)return <p className="gb-notice">Dados da combinação indisponíveis.</p>;
 const situacao="situacao" in linha ? linha.situacao : "informado";
 const comparavel=linha.corte_acertos!==null&&situacao!=="sem_convocados";
 const diferenca=comparavel?acertos-linha.corte_acertos!:null;
 return <section className="rounded-lg border border-n2 bg-white/70 p-5 sm:p-8" aria-label="Consulta de corte FUVEST">
  <p className="gb-eyebrow">1 · SEU OBJETIVO</p>
  <div className="mt-4 grid gap-5 md:grid-cols-3">
   <label className="font-semibold">Edição<select className="mt-2 block min-h-12 w-full rounded border border-n2 bg-white px-3 font-normal" value={ano} onChange={e=>{const proximo=Number(e.target.value) as 2026 | 2027;const lista=proximo===2027?dados2027.registros:dados2026.registros;if(!lista.some(r=>r.carreira_codigo===codigo))setCodigo("111");setAno(proximo);}}><option value={2027}>FUVEST 2027</option><option value={2026}>FUVEST 2026</option></select></label>
   <label className="font-semibold">Carreira<select className="mt-2 block min-h-12 w-full rounded border border-n2 bg-white px-3 font-normal" value={codigo} onChange={e=>setCodigo(e.target.value)}>{carreiras.map(c=><option key={c.codigo} value={c.codigo}>{c.nome} · código {c.codigo}</option>)}</select></label>
   <label className="font-semibold">Modalidade<select className="mt-2 block min-h-12 w-full rounded border border-n2 bg-white px-3 font-normal" value={modalidade} onChange={e=>setModalidade(e.target.value)}>{modalidades.map(m=><option key={m.id} value={m.id}>{m.nome}</option>)}</select></label>
  </div>
  {linha.carreira.startsWith("Treinamento")&&<p className="gb-notice mt-5">Esta é uma carreira de treinamento, identificada como tal na tabela da FUVEST.</p>}
  <p className="gb-eyebrow mt-8">2 · SUA REFERÊNCIA</p>
  <label className="mt-4 block font-semibold" htmlFor="fuvest-acertos">Quantos pontos você obteve ou pretende obter na primeira fase? <span className="font-bold text-[#b3400c]">{acertos}</span></label>
  <input id="fuvest-acertos" className="mt-4 w-full accent-[#b3400c]" type="range" min={0} max={90} value={acertos} onChange={e=>{setInformouAcertos(true);setAcertos(Number(e.target.value));}}/>
  <input aria-label="Pontos (número)" type="number" min={0} max={90} value={acertos} onChange={e => { setInformouAcertos(true); setAcertos(Math.max(0, Math.min(90, Number(e.target.value)))); }} className="mt-3 min-h-12 w-24 rounded border border-n2 bg-white px-3" />
  {informouAcertos && <CarimboResultado resultado={acertos} referencia={comparavel ? linha.corte_acertos : null} margemProximidade={5} unidade="pontos" treinoHref="/provas/fuvest" />}
  <div className="mt-6 grid gap-4 md:grid-cols-3" aria-live="polite">
   <div className="rounded border border-n2 p-4"><p className="text-sm text-n5">Corte para a 2ª fase · {ano}</p><p className="mt-1 text-3xl font-bold">{linha.corte_acertos===null?"Não informado":<>{linha.corte_acertos} <span className="text-base font-normal">pontos</span></>}</p></div>
   <div className="rounded border border-n2 p-4"><p className="text-sm text-n5">Sua comparação</p><p className="mt-1 font-semibold">{diferenca===null?"Comparação indisponível":diferenca===0?"Igual ao corte informado":diferenca>0?`${diferenca} acima do corte informado`:`${Math.abs(diferenca)} abaixo do corte informado`}</p></div>
   <div className="rounded border border-n2 p-4"><p className="text-sm text-n5">Inscritos e vagas · modalidade</p><p className="mt-1 font-semibold">{linha.inscritos.toLocaleString("pt-BR")} inscritos · {linha.vagas} vagas</p></div>
  </div>
  {situacao==="sem_convocados"&&<p className="gb-notice mt-4">A tabela apresenta o corte de {linha.corte_acertos} pontos, mas registra zero convocados nesta modalidade. Por isso não há comparação disponível.</p>}
  {linha.corte_acertos===null&&<p className="gb-notice mt-4">A tabela oficial não informa o corte para esta combinação.</p>}
  <p className="mt-5 text-sm text-n5">Referência para convocação à segunda fase da FUVEST {ano}, por carreira e modalidade. Informe a pontuação incluindo eventuais pontos atribuídos por anulação. Não é nota de aprovação final nem garante resultado em outra edição.</p>
  <p className="mt-3 text-sm text-n5">Fonte: <a className="underline" href={`${dados.fonte}#page=${linha.pagina}`} target="_blank" rel="noopener noreferrer">tabela oficial FUVEST {ano}, página {linha.pagina} ↗</a>.</p>
  <div className="gb-actions"><Link href="/provas/fuvest/2026" className="gb-button">Treinar provas da FUVEST →</Link><Link href="/provas/fuvest" className="gb-text-link">Ver outras edições →</Link></div>
 </section>;
}

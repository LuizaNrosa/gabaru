"use client";
import {useState} from "react";
import Link from "next/link";
import {useMemo} from "react";
import {useSavedProgress} from "@/components/use-saved-progress";
import type {EtecReaderExam,EtecSummary} from "@/lib/etec-types";
export function EtecExamReader({exam,catalog}:{exam:EtecReaderExam;catalog:EtecSummary[]}){
 const count=exam.questions.length,valid=exam.questions.filter(q=>!q.annulled);
 const [number,setNumber]=useState(1),[page,setPage]=useState(exam.questions[0].page),[answers,setAnswers]=useState<Record<number,string>>({}),[answerKey,setAnswerKey]=useState<Record<number,string> | null>(null);
 const [pending,setPending]=useState(false),[error,setError]=useState("");
 const done=answerKey!==null;
 const savedState=useMemo(()=>({number,page,answers,answerKey}),[number,page,answers,answerKey]);
 const progress=useSavedProgress(`gabaru:prova:etec:${exam.id}`,savedState,(s)=>{
  if(Number.isInteger(s.number)&&s.number>=1&&s.number<=count)setNumber(s.number);
  if(exam.pages.some(p=>p.number===s.page))setPage(s.page);
  if(s.answers&&typeof s.answers==="object")setAnswers(s.answers);
  setAnswerKey(s.answerKey ?? null);
 },{number:1,page:exam.questions[0].page,answers:{},answerKey:null});
 const current=exam.pages.find(p=>p.number===page),question=exam.questions[number-1];
 const correctAnswer=answerKey?.[number];
 const score=valid.filter(q=>answerKey && answers[q.number]===answerKey[q.number]).length,filled=valid.filter(q=>answers[q.number]).length,annulled=count-valid.length;
 async function checkAnswers() {
  setPending(true);
  setError("");
  try {
   const response=await fetch("/api/v1/etec/correcao", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({edition:exam.id,answers}),
   });
   const data=await response.json() as {answerKey?:Record<number,string>;error?:string};
   if(!response.ok || !data.answerKey) throw new Error(data.error ?? "Não foi possível conferir a prova.");
   setAnswerKey(data.answerKey);
  } catch {
   setError("Não foi possível conferir a prova. Suas respostas foram mantidas. Tente novamente.");
  } finally {
   setPending(false);
  }
 }
 function reset() {
  if (pending || !window.confirm("Apagar as respostas e recomeçar esta prova?")) return;
  setAnswers({});
  setAnswerKey(null);
  setError("");
  select(1);
  progress.dismissResume();
 }
 function select(n:number){setNumber(n);if(exam.questions[n-1].pageMapped)setPage(exam.questions[n-1].page);}
 const pdf=`/acervo/etec/${exam.id}/prova.pdf#page=${page}`;
 return <section className="mt-8" aria-label="Caderno e respostas"><Link href="/provas/etec" className="gb-text-link">← Todas as {catalog.length} provas</Link>{progress.resumed&&<div className="gb-notice mt-4" role="status">Progresso encontrado neste navegador. <button type="button" className="underline font-semibold" onClick={progress.dismissResume}>Continuar de onde parei</button> · <button type="button" className="underline font-semibold" onClick={reset} disabled={pending}>Recomeçar</button></div>}{!progress.storageAvailable&&<p role="alert" className="gb-notice mt-4">Não foi possível salvar neste navegador. Mantenha a página aberta para preservar suas respostas.</p>}<details className="mt-4"><summary className="cursor-pointer py-3">Trocar de edição</summary><div className="mt-3 grid gap-2 sm:grid-cols-2">{catalog.map(e=><Link className="min-h-12 rounded border border-n2 p-3" key={e.id} href={`/provas/etec/${e.id}`} aria-current={e.id===exam.id?"page":undefined}>{e.title} · {e.count} questões</Link>)}</div></details>
 <p className="my-6 text-n5">Caderno integral: figuras, alternativas e textos compartilhados preservados. Consulte as páginas anteriores quando houver referência a um texto.</p>
 <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]"><div id="etec-caderno" className="scroll-mt-24"><a href="#etec-respostas" className="gb-text-link mb-4 inline-block py-2 lg:hidden">Ir para a folha de respostas ↓</a><div className="mb-3 flex flex-wrap items-center gap-3"><button className="min-h-12 rounded border border-n2 px-3" disabled={page<=exam.pages[0].number} onClick={()=>setPage(page-1)}>← Página anterior</button><label>Página <select aria-label="Página do caderno" className="min-h-12 rounded border border-n2 px-3" value={page} onChange={e=>setPage(Number(e.target.value))}>{exam.pages.map(p=><option key={p.number} value={p.number}>{p.number}</option>)}</select> de {exam.pageCount}</label><button className="min-h-12 rounded border border-n2 px-3" disabled={page>=exam.pages[exam.pages.length-1].number} onClick={()=>setPage(page+1)}>Próxima página →</button></div>
 {current?.image ? (
   <img src={current.image} alt={`Caderno oficial ${exam.title}, página ${page}.`} width={988} height={1278} className="h-auto w-full rounded-md border border-n2 bg-white" />
 ) : (
   <>
     <iframe key={pdf} src={pdf} title={`Caderno oficial ${exam.title}, página ${page}`} className="h-[75vh] min-h-[480px] w-full rounded-md border border-n2 bg-white" loading="lazy" />
     <details className="mt-4 text-sm text-n5">
       <summary className="cursor-pointer py-2">O caderno não carregou?</summary>
       <a className="gb-text-link py-2" href={pdf} target="_blank" rel="noopener noreferrer">Abrir página do caderno em outra aba ↗</a>
     </details>
   </>
 )}
 {current?.text&&<details className="mt-4"><summary className="cursor-pointer py-3">Texto extraído desta página</summary><p className="mb-3 text-sm">Texto auxiliar: a extração pode alterar a ordem de leitura e não descreve figuras. O PDF é a referência.</p><pre className="whitespace-pre-wrap font-sans text-sm">{current.text}</pre></details>}</div>
 <div id="etec-respostas" className="scroll-mt-24"><a href="#etec-caderno" className="gb-text-link mb-4 inline-block py-2 lg:hidden">↑ Voltar ao caderno</a><h2 className="gb-section-title" aria-live="polite" aria-atomic="true">Questão {number}</h2><p className="mt-2" role="status">{filled} de {valid.length} válidas respondidas</p>{!question.pageMapped&&<p className="gb-notice mt-3">A página desta questão não foi identificada automaticamente. Localize o número no caderno usando o seletor de páginas.</p>}
 {question.statement&&<div className="mt-5"><p className="leading-relaxed">{question.statement}</p><p className="mt-2 text-sm text-n5">Texto extraído automaticamente do caderno oficial. Se divergir, vale o PDF.</p></div>}
 {question.annulled?<><p role="status" className="gb-notice my-5">Questão anulada no gabarito oficial. Separada dos acertos e erros; conta como ponto atribuído na soma bruta.</p>{question.options&&<ol className="my-5 grid gap-2">{(['A','B','C','D','E'] as const).map(a=><li key={a} className="flex gap-3 rounded border border-n2 p-3"><strong>{a}</strong><span>{question.options?.[a]}</span></li>)}</ol>}</>:question.options?<fieldset className="my-5"><legend className="mb-3">Sua alternativa</legend><div className="grid gap-2">{(['A','B','C','D','E'] as const).map(a=><label key={a} className={`flex min-h-12 cursor-pointer items-start gap-3 rounded border border-n2 p-3 focus-within:ring-2 focus-within:ring-[#232323] ${done&&a===correctAnswer?'bg-[#f2cdb4] text-[#232323] ring-2 ring-[#c8501e]':answers[number]===a?'bg-[#232323] text-white':'bg-white text-[#232323]'}`}><input className="sr-only" type="radio" name={`q${number}`} value={a} checked={answers[number]===a} disabled={done||pending} onChange={()=>setAnswers({...answers,[number]:a})}/><strong>{a}</strong><span>{question.options?.[a]}</span></label>)}</div></fieldset>:<fieldset className="my-5"><legend className="mb-3">Sua alternativa</legend><div className="grid grid-cols-5 gap-2">{['A','B','C','D','E'].map(a=><label key={a} className={`flex min-h-12 cursor-pointer items-center justify-center rounded border focus-within:ring-2 focus-within:ring-[#232323] ${answers[number]===a?'bg-[#232323] text-white':'bg-white text-[#232323]'}`}><input className="sr-only" type="radio" name={`q${number}`} value={a} checked={answers[number]===a} disabled={done||pending} onChange={()=>setAnswers({...answers,[number]:a})}/>{a}</label>)}</div></fieldset>}
 {done&&!question.annulled&&<p role="status" className="my-4 font-semibold">{answers[number]===correctAnswer?'Resposta correta.':'Gabarito oficial: '+correctAnswer+'.'}</p>}
 <div className="mb-5 flex gap-2"><button className="min-h-12 rounded border border-n2 px-3" disabled={number===1} onClick={()=>select(number-1)}>← Anterior</button><button className="min-h-12 rounded border border-n2 px-3" disabled={number===count} onClick={()=>select(number+1)}>Próxima →</button></div>
 <nav aria-label="Questões da prova" className="grid grid-cols-5 gap-2">{exam.questions.map(q=><button key={q.number} aria-label={`Questão ${q.number}${q.annulled?', anulada':answers[q.number]?', respondida':''}`} aria-current={q.number===number?'step':undefined} onClick={()=>select(q.number)} className={`min-h-12 rounded border ${q.number===number?'ring-2 ring-[#232323]':''} ${answers[q.number]?'bg-[#f2cdb4]':'bg-white'}`}>{q.number}{q.annulled?'*':''}</button>)}</nav>
 <button className="mt-6 min-h-12 w-full rounded bg-[#232323] px-4 text-white" onClick={checkAnswers} disabled={pending||done||!filled}>{pending?"Conferindo…":"Conferir respostas"}</button>{error&&<p role="alert" className="gb-notice mt-3">{error}</p>}{done&&<div role="status" className="my-4 font-semibold"><p>{score} acertos · {filled-score} erros · {valid.length-filled} em branco · {annulled} anuladas.</p><p>Soma bruta: {score+annulled} de {count} pontos, incluindo anuladas. Sem acréscimos, desempates ou classificação.</p></div>}
 {done&&<div className="gb-notice mt-4"><h3 className="font-semibold">Revise seus erros</h3><div className="mt-3 flex flex-wrap gap-2">{valid.filter(q=>answers[q.number]&&answers[q.number]!==answerKey?.[q.number]).map(q=><button type="button" className="rounded border border-n2 px-3 py-2 underline" key={q.number} onClick={()=>select(q.number)}>Questão {q.number}</button>)}</div><Link href="/provas" className="gb-text-link mt-4 inline-block">Escolher outra prova →</Link></div>}
 <button className="mt-3 min-h-12 rounded border border-n2 px-3" onClick={reset} disabled={pending}>Recomeçar</button><p className="mt-4 text-sm text-n5">Respostas salvas neste navegador quando disponível. Correção automática pelo gabarito conferido. Correção pelo gabarito oficial{exam.answerKeyRevised?', retificado':''}. Resoluções comentadas ainda não disponíveis.</p></div></div></section>;
}

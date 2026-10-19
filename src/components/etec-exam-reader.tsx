"use client";
import {useState} from "react";
import Link from "next/link";
import exams from "@/data/etec-exams.json";
export function EtecExamReader({id}:{id:string}){
 const exam=exams.find(e=>e.id===id)!;
 const [number,setNumber]=useState(1),[page,setPage]=useState(exam.questions[0].page),[answers,setAnswers]=useState<Record<number,string>>({}),[done,setDone]=useState(false);
 const current=exam.pages.find(p=>p.number===page)!;
 const score=exam.questions.filter(q=>answers[q.number]===q.answer).length;
 function select(n:number){setNumber(n);setPage(exam.questions[n-1].page);}
 return <section className="mt-8" aria-label="Caderno e respostas"><div className="flex flex-wrap gap-3">{exams.map(e=><Link className="gb-button-secondary" key={e.id} href={`/provas/etec/${e.id}`} aria-current={e.id===id?"page":undefined}>{e.title}</Link>)}</div>
 <p className="my-6 text-n5">Selecione uma questão para abrir sua página no caderno original. As páginas completas preservam figuras, alternativas e textos compartilhados. Consulte também as páginas anteriores quando o enunciado fizer referência a um texto.</p>
 <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]"><div><div className="mb-3 flex flex-wrap items-center gap-3"><button className="gb-button-secondary min-h-12" disabled={page<=2} onClick={()=>setPage(page-1)}>← Página anterior</button><span>Página {page} de 24</span><button className="gb-button-secondary min-h-12" disabled={page>=23} onClick={()=>setPage(page+1)}>Próxima página →</button></div>
 <a href={`/acervo/etec/${id}/prova.pdf#page=${page}`} target="_blank" rel="noopener noreferrer" className="block"><img src={current.image} alt={`Caderno oficial ${exam.title}, página ${page}. Abra o PDF para ampliar.`} width={1012} height={1432} className="h-auto w-full rounded-md border border-n2 bg-white" /></a>
 <details className="mt-4"><summary className="cursor-pointer py-3">Texto extraído desta página</summary><p className="mb-3 text-sm">A extração automática pode alterar a ordem de leitura e não descreve figuras. O PDF é a referência.</p><pre className="whitespace-pre-wrap font-sans text-sm">{current.text}</pre></details></div>
 <div><h2 className="gb-section-title">Questão {number}</h2><p className="mt-2" role="status">{Object.keys(answers).length} de 50 respondidas</p><fieldset className="my-5"><legend className="mb-3">Sua alternativa</legend><div className="grid grid-cols-5 gap-2">{['A','B','C','D','E'].map(a=><label key={a} className={`flex min-h-12 cursor-pointer items-center justify-center rounded border ${answers[number]===a?'bg-[#123d35] text-white':'bg-white text-[#123d35]'}`}><input className="sr-only" type="radio" name={`q${number}`} value={a} checked={answers[number]===a} disabled={done} onChange={()=>setAnswers({...answers,[number]:a})}/>{a}</label>)}</div></fieldset>
 {done&&<p role="status" className="my-4 font-semibold">{answers[number]===exam.questions[number-1].answer?'Resposta correta.':'Gabarito oficial: '+exam.questions[number-1].answer+'.'}</p>}
 <div className="mb-5 flex gap-2"><button className="gb-button-secondary min-h-12" disabled={number===1} onClick={()=>select(number-1)}>← Anterior</button><button className="gb-button-secondary min-h-12" disabled={number===50} onClick={()=>select(number+1)}>Próxima →</button></div>
 <nav aria-label="Questões da prova" className="grid grid-cols-5 gap-2">{exam.questions.map(q=><button key={q.number} aria-label={`Questão ${q.number}${answers[q.number]?', respondida':''}`} aria-current={q.number===number?'step':undefined} onClick={()=>select(q.number)} className={`min-h-12 rounded border ${q.number===number?'ring-2 ring-[#123d35]':''} ${answers[q.number]?'bg-[#d7ee79]':'bg-white'}`}>{q.number}</button>)}</nav>
 <button className="gb-button mt-6 min-h-12 w-full" onClick={()=>setDone(true)} disabled={done}>Conferir respostas</button>{done&&<p role="status" className="my-4 font-semibold">{score} acertos · {Object.keys(answers).length-score} erros · {50-Object.keys(answers).length} em branco.</p>}
 <button className="gb-button-secondary mt-3 min-h-12" onClick={()=>{setDone(false);setAnswers({});select(1);}}>Recomeçar</button><p className="mt-4 text-sm text-n5">Marcações temporárias: recarregar ou trocar de edição reinicia esta sessão. A correção usa o gabarito oficial; resoluções comentadas ainda não estão disponíveis.</p></div></div></section>;
}

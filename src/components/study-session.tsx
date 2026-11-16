'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Scissors, RotateCcw, Clock3 } from 'lucide-react';
import type { Questao } from '@/lib/catalogo/types';
export type StudyCard = { q: Questao; statement: ReactNode; options: ReactNode[]; resolution: ReactNode };
type Saved = { version: 1; answers: Record<string,string>; excluded: Record<string,string[]>; graded: string[]; mode: 'estudo'|'simulado'; deadline: number|null; finished: boolean };
const empty: Saved = {version:1,answers:{},excluded:{},graded:[],mode:'estudo',deadline:null,finished:false};
export function StudySession({ cards, storageKey, durationMinutes = 240 }: { cards: StudyCard[]; storageKey: string; durationMinutes?: number }) {
  const [state,setState]=useState<Saved>(empty);
  const [hydrated,setHydrated]=useState(false),[storageError,setStorageError]=useState(false);
  const [active,setActive]=useState(0),[now,setNow]=useState(0),[onlyErrors,setOnlyErrors]=useState(false),[shortcuts,setShortcuts]=useState(false);
  const ref=useRef<HTMLDivElement>(null);
  const key=`gabaru:v2:${storageKey}`;
  useEffect(()=>{
    let cancelled=false;
    queueMicrotask(()=>{
      if(cancelled)return;
      try { const raw=localStorage.getItem(key); if(raw){const saved=JSON.parse(raw) as Partial<Saved>;
        if(saved.version===1&&saved.answers&&typeof saved.answers==='object'&&saved.excluded&&typeof saved.excluded==='object'&&Array.isArray(saved.graded)&&['estudo','simulado'].includes(saved.mode??'')) {
          const answers: Record<string,string>={},excluded: Record<string,string[]>={};
          for(const {q} of cards){if(q.alternativas.some(a=>a.letra===saved.answers?.[q.id]))answers[q.id]=saved.answers[q.id];const letters=saved.excluded[q.id];if(Array.isArray(letters))excluded[q.id]=letters.filter(v=>q.alternativas.some(a=>a.letra===v));}
          setState({...empty,answers,excluded,graded:saved.graded.filter(id=>cards.some(c=>c.q.id===id)),mode:saved.mode as Saved['mode'],finished:saved.finished===true,deadline:typeof saved.deadline==='number'&&Number.isFinite(saved.deadline)?saved.deadline:null});
        }
      }} catch {setStorageError(true);}
      setNow(Date.now());setHydrated(true);
    });return()=>{cancelled=true;};
  },[key,cards]);
  useEffect(()=>{if(!hydrated)return;try{localStorage.setItem(key,JSON.stringify(state));}catch{queueMicrotask(()=>setStorageError(true));}},[key,state,hydrated]);
  useEffect(()=>{if(state.mode!=='simulado'||state.finished||!state.deadline)return;const deadline=state.deadline;const tick=()=>{const time=Date.now();setNow(time);if(time>=deadline)setState(s=>({...s,finished:true}));};const timer=setInterval(tick,1000);return()=>clearInterval(timer);},[state.mode,state.deadline,state.finished]);
  const simulado=state.mode==='simulado',showResults=!simulado||state.finished;
  const answered=cards.filter(({q})=>state.answers[q.id]);
  const mistakes=cards.filter(({q})=>q.correta&&state.answers[q.id]&&state.answers[q.id]!==q.correta);
  const score=cards.filter(({q})=>q.correta&&state.answers[q.id]===q.correta).length;
  const seconds=state.deadline?Math.max(0,Math.ceil((state.deadline-now)/1000)):durationMinutes*60;
  const time=`${Math.floor(seconds/3600).toString().padStart(2,'0')}:${Math.floor(seconds%3600/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;
  function move(index:number){const next=Math.max(0,Math.min(cards.length-1,index));setActive(next);requestAnimationFrame(()=>document.getElementById(`estudo-${cards[next].q.id}`)?.focus());}
  function choose(q:Questao,letter:string){if(state.finished||state.graded.includes(q.id)||state.excluded[q.id]?.includes(letter))return;setState(s=>({...s,answers:{...s.answers,[q.id]:letter}}));}
  function grade(q:Questao){if(simulado||!state.answers[q.id])return;setState(s=>({...s,graded:[...new Set([...s.graded,q.id])]}));}
  function start(){setOnlyErrors(false);setNow(Date.now());setState({...empty,mode:'simulado',deadline:Date.now()+durationMinutes*60000});}
  function reset(){setState(empty);setOnlyErrors(false);setActive(0);}
  const disciplines=[...new Set(cards.map(c=>c.q.disciplina))];
  return <div className="v2-workspace" ref={ref} onKeyDown={e=>{
    if(!shortcuts||e.altKey||e.ctrlKey||e.metaKey||e.repeat||(e.target instanceof HTMLElement&&e.target.closest('input,select,textarea,button,a,[contenteditable]')))return;
    const q=cards[active]?.q;if(!q)return;const letter=/^[1-5]$/.test(e.key)?String.fromCharCode(64+Number(e.key)):e.key.toUpperCase();
    if(q.alternativas.some(a=>a.letra===letter)){e.preventDefault();choose(q,letter);}else if(e.key==='Enter'){e.preventDefault();grade(q);}else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(active+(e.key==='ArrowRight'?1:-1));}
  }}>
    <div className="v2-toolbar"><div><p className="gb-eyebrow">Seu caderno de estudo</p><h2 className="v2-subtitle">Entenda cada resposta.</h2></div><div className="v2-actions"><button type="button" className="v2-button" onClick={reset}><RotateCcw size={16} aria-hidden="true"/>Recomeçar no modo estudo</button><button type="button" className="v2-button v2-primary" onClick={start}>Iniciar simulado de {durationMinutes} min</button></div></div>
    <p className="v2-help">Estudo: responda e confira cada questão. Simulado: o gabarito fica fechado até finalizar. Iniciar outro simulado ou recomeçar apaga as marcações deste caderno.</p>
    <label className="v2-shortcuts"><input type="checkbox" checked={shortcuts} onChange={e=>setShortcuts(e.target.checked)}/>Ativar atalhos: A–E ou 1–5 para marcar; Enter para responder; ← e → para navegar. Use fora dos campos e botões.</label>
    {storageError&&<p role="status">O navegador não permitiu salvar o progresso. Esta sessão continua disponível enquanto a página estiver aberta.</p>}
    <div className="v2-study-grid"><div>
    {cards.map(({q,statement,options,resolution},index)=>{
      const graded=state.graded.includes(q.id),reveal=showResults&&(graded||state.finished),correct=state.answers[q.id]===q.correta;
      return <article key={q.id} id={`estudo-${q.id}`} tabIndex={-1} onFocus={()=>setActive(index)} className="v2-question" aria-labelledby={`titulo-${q.id}`} hidden={onlyErrors&&!mistakes.some(c=>c.q.id===q.id)}>
        <div className="v2-question-heading"><h3 id={`titulo-${q.id}`}>Questão {q.numero}</h3><span>{q.banca.toUpperCase()} · {q.ano} · {q.disciplina==='a-classificar'?'Disciplina em revisão':q.disciplina}</span></div>
        <fieldset><legend className="v2-statement">{statement}</legend>
        <div className="v2-options">{q.alternativas.map((a,i)=>{const eliminated=state.excluded[q.id]?.includes(a.letra)??false;return <div key={a.letra} className={`v2-option ${eliminated?'v2-eliminated':''}`}>
          <label htmlFor={`${key}-${q.id}-${a.letra}`}><input id={`${key}-${q.id}-${a.letra}`} type="radio" name={`${key}-${q.id}`} value={a.letra} checked={state.answers[q.id]===a.letra} disabled={state.finished||graded||eliminated} onChange={()=>choose(q,a.letra)}/><strong>{a.letra}</strong><span>{options[i]}</span></label>
          <button type="button" className="v2-eliminate" aria-label={`${eliminated?'Restaurar':'Eliminar'} alternativa ${a.letra} da questão ${q.numero}`} aria-pressed={eliminated} disabled={graded||state.finished} onClick={()=>setState(s=>{const old=s.excluded[q.id]??[];const answers={...s.answers};if(!eliminated&&answers[q.id]===a.letra)delete answers[q.id];return {...s,answers,excluded:{...s.excluded,[q.id]:eliminated?old.filter(x=>x!==a.letra):[...old,a.letra]}};})}><Scissors size={18} aria-hidden="true"/></button>
        </div>;})}</div></fieldset>
        {!q.alternativas.length&&<p>Alternativas em transcrição. Consulte o caderno na fonte oficial.</p>}
        {!simulado&&<button type="button" className="v2-button v2-primary" disabled={!state.answers[q.id]||graded||!q.correta} onClick={()=>grade(q)}>Responder questão {q.numero}</button>}
        <p role="status" aria-live="polite" aria-atomic="true">{reveal&&q.correta?(correct?'Resposta correta.':`Revise sua resposta. Gabarito oficial: ${q.correta}.`):''}</p>
        <details className="v2-solution" hidden={simulado&&!state.finished} open={reveal}><summary>Gabarito e resolução da questão {q.numero}</summary>{resolution}</details>
        <a href={q.fonte} className="v2-source" target="_blank" rel="noopener noreferrer">Consultar a fonte oficial</a>
      </article>;
    })}
    {onlyErrors&&!mistakes.length&&<p role="status">Nenhum erro registrado neste caderno.</p>}
    </div><aside className="v2-answer-sheet" aria-label="Cartão-resposta e desempenho">
      <h3>Cartão-resposta</h3><p className="v2-numbers">{answered.length} de {cards.length} respondidas</p>
      {simulado&&!state.finished&&<p className="v2-clock" role="timer" aria-label="Tempo restante"><Clock3 size={18} aria-hidden="true"/>{time}</p>}
      <nav className="v2-question-nav" aria-label="Navegar pelas questões">{cards.map(({q},i)=><button type="button" key={q.id} aria-current={active===i?'step':undefined} aria-label={`Ir à questão ${q.numero}${state.answers[q.id]?`, marcada ${state.answers[q.id]}`:', em branco'}`} onClick={()=>move(i)}>{q.numero}{state.answers[q.id]&&<small>{state.answers[q.id]}</small>}</button>)}</nav>
      {simulado&&!state.finished&&<button type="button" className="v2-button v2-primary" onClick={()=>setState(s=>({...s,finished:true}))}>Finalizar simulado</button>}
      {state.finished&&<section aria-labelledby="boletim-titulo"><h3 id="boletim-titulo">Seu desempenho</h3><p role="status">{score} acertos · {mistakes.length} erros · {cards.length-answered.length} em branco.</p><p>Contagem de acertos, sem cálculo de TRI ou classificação.</p><table><caption>Acertos por disciplina</caption><thead><tr><th scope="col">Disciplina</th><th scope="col">Acertos</th></tr></thead><tbody>{disciplines.map(d=><tr key={d}><th scope="row">{d==='a-classificar'?'Em revisão':d}</th><td>{cards.filter(c=>c.q.disciplina===d&&c.q.correta&&state.answers[c.q.id]===c.q.correta).length} / {cards.filter(c=>c.q.disciplina===d).length}</td></tr>)}</tbody></table><label className="v2-shortcuts"><input type="checkbox" checked={onlyErrors} onChange={e=>setOnlyErrors(e.target.checked)}/>Revisar apenas as erradas</label></section>}
    </aside></div>
  </div>;
}

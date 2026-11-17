// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
"use client";
import {SafeText} from "./safe-text";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSavedProgress } from "@/components/use-saved-progress";

import { enemDisplayNumber, hasEnemLanguages, selectEnemQuestions, type EnemLanguage } from "@/lib/enem-question-order";
type Question = { numero: number; texto: string; disciplina: string; habilidade: string; tema: string; obs?: string; pagina?: number; annulled?: boolean };

export function EnemExamReader({ id, title, questions, verified, pageCount }: { id: string; title: string; questions: Question[]; verified: boolean; pageCount?: number }) {
  const [pageOverride, setPageOverride] = useState<{question:number; page:number} | null>(null);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState<{ correct: number; incorrect: number; blank: number; annulled: number; items: { number: number; selected: string | null; key: string; status: "correct" | "incorrect" | "blank" | "annulled" }[] } | null>(null);
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState<EnemLanguage>("ingles");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const savedState = useMemo(() => ({ index, finished, score, language, answers }), [index, finished, score, language, answers]);
  const progress = useSavedProgress(`gabaru:prova:enem:${id}`, savedState, (s) => {
    const chosen = s.language === "espanhol" ? "espanhol" : "ingles";
    if (Number.isInteger(s.index) && s.index >= 0 && s.index < selectEnemQuestions(questions, chosen).length) setIndex(s.index);
    if (s.language === "ingles" || s.language === "espanhol") setLanguage(s.language);
    if (s.answers && typeof s.answers === "object") setAnswers(s.answers);
    setScore(s.score && Array.isArray(s.score.items) ? s.score : null);
    if (typeof s.finished === "boolean") setFinished(s.finished);
  }, {index:0,finished:false,score:null,language:"ingles",answers:{}});
  function restart() {
    if (!window.confirm("Apagar as respostas e recomeçar este caderno?")) return;
    setAnswers({}); setIndex(0); setPageOverride(null); setFinished(false); setScore(null); setError(""); progress.dismissResume();
  }
  const hasLanguages = hasEnemLanguages(questions);
  const orderedQuestions = selectEnemQuestions(questions, language);
  const question = orderedQuestions[index];
  if (!question) return <p className="gb-notice mt-8">Este caderno ainda não tem questões disponíveis.</p>;
  const displayedPage = pageOverride?.question === question.numero ? pageOverride.page : question.pagina;
  const reviewed = score?.items.find(item => item.number === question.numero);
  const marked = orderedQuestions.filter(q => answers[q.numero]).length;
  const needsReview = /apenas|incomplet|cortad|misturad|ileg[ií]vel|ausente|coluna|confund|errad|faltando|não aparece/i.test(question.obs ?? "");
  const related = id === "enem-2008" ? (question.numero === 1 ? [2] : question.numero === 23 ? [21, 22] : []) : [];
  async function finish() {
    if (!verified) { setFinished(true); return; }
    setGrading(true); setError("");
    try {
      const selectedAnswers = Object.fromEntries(orderedQuestions.filter(q => answers[q.numero]).map(q => [String(q.numero), answers[q.numero]]));
      const response = await fetch("/api/v1/enem-simulado", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ examId: id, language, answers: selectedAnswers }) });
      if (!response.ok) throw new Error("Falha ao corrigir");
      setScore(await response.json()); setFinished(true);
    } catch { setError("Não foi possível corrigir agora. Suas respostas continuam nesta página; tente novamente."); }
    finally { setGrading(false); }
  }
  return <section className="mt-8" aria-label="Caderno e respostas">
    {progress.resumed && <div className="gb-notice mb-4" role="status">Progresso encontrado neste navegador. <button type="button" className="underline font-semibold" onClick={progress.dismissResume}>Continuar de onde parei</button> · <button type="button" className="underline font-semibold" onClick={restart}>Recomeçar</button></div>}
    {!progress.storageAvailable && <p role="alert" className="gb-notice mb-4">Não foi possível salvar neste navegador. Mantenha a página aberta para preservar suas respostas.</p>}
    <div className="mb-6 flex items-center gap-3">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/marca/gabaru-carimbo.webp" width={48} height={48} alt="" className="rounded-full" /><div><p className="gb-eyebrow">SIMULADO GRATUITO</p><h2 className="gb-section-title">Sua prova do ENEM</h2></div></div>
    <p className="mb-6 text-n5">{pageCount ? "Leia o caderno e marque suas alternativas." : "Consulte o recorte original e marque suas alternativas."} As respostas ficam salvas neste navegador, quando disponível. {verified ? "Correção automática pelo gabarito oficial conferido." : "Gabarito em conferência: a correção automática ainda está em preparação."}</p>
    {hasLanguages && <fieldset className="mb-6" disabled={grading}><legend className="font-semibold">Escolha sua língua estrangeira</legend><div className="mt-2 flex gap-6">{(["ingles", "espanhol"] as const).map(l => <label key={l} className="flex items-center gap-2"><input type="radio" name="idioma" checked={language === l} onChange={() => { setLanguage(l); setIndex(0); setFinished(false); setScore(null); }} />{l === "ingles" ? "Inglês" : "Espanhol"}</label>)}</div><p className="mt-2 text-sm text-n5">As duas opções usam a numeração de 1 a 5 do caderno oficial. Só a língua escolhida entra na correção.</p></fieldset>}
    {finished ? <div className="gb-notice mb-8" role="status"><h3 className="text-xl font-bold">Simulado finalizado</h3>{!score && <p className="mt-3">{marked} de {orderedQuestions.length} questões respondidas · {orderedQuestions.length - marked} em branco.</p>}<p className="mt-3">{score ? <>{score.correct} acertos · {score.incorrect} erros · {score.blank} em branco · {score.annulled} anuladas. Questões anuladas aparecem separadamente. Resultado por acertos, não uma nota TRI.</> : <>O número de acertos e a nota TRI não estão disponíveis. Consulte o gabarito oficial para conferir suas respostas.</>}</p>{score && <details className="mt-5"><summary className="cursor-pointer font-semibold">Ver correção de cada questão</summary><ol className="mt-4 grid gap-3 sm:grid-cols-2">{score.items.map(item => <li key={item.number} className="rounded border border-n2 bg-white/60 p-3"><button type="button" className="font-semibold underline" onClick={() => { const i = orderedQuestions.findIndex(q => q.numero === item.number); if (i >= 0) { setIndex(i); setFinished(false); } }}>Questão {enemDisplayNumber(orderedQuestions.find(q => q.numero === item.number) ?? {numero:item.number, disciplina:""})}</button> · {item.status === "correct" ? "Acertou" : item.status === "incorrect" ? "Rever" : item.status === "annulled" ? "Anulada" : "Em branco"}<br />Sua resposta: {item.selected ?? "—"} · Gabarito: <strong>{item.key}</strong></li>)}</ol></details>}<div className="mt-4 flex flex-wrap gap-3"><button type="button" className="gb-button" onClick={() => setFinished(false)}>Revisar respostas</button><Link href="/provas/enem" className="gb-text-link">Escolher outra prova do ENEM →</Link><Link href="/treino" className="gb-text-link">Praticar mais questões →</Link><button type="button" className="gb-text-link" onClick={restart}>Recomeçar prova</button></div></div> :
    <fieldset disabled={grading} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div id="enem-caderno" className="min-w-0 scroll-mt-24">
        <a href="#enem-respostas" className="gb-text-link mb-3 inline-block lg:hidden">Ir para as respostas ↓</a>
        {needsReview && <p className="gb-notice mb-4">Este recorte está em revisão e pode não mostrar todo o conteúdo. <a className="underline" href={`https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos/${id.slice(5, 9)}`} target="_blank" rel="noopener noreferrer">Consulte o caderno oficial do Inep ↗</a></p>}
        {pageCount && displayedPage && <div className="mb-4 flex flex-wrap items-center gap-2">
          <button type="button" className="min-h-12 rounded border border-n2 px-3" disabled={displayedPage <= 1} onClick={() => setPageOverride({question:question.numero,page:displayedPage - 1})}>← Página anterior</button>
          <label>Página <select aria-label="Página do caderno" value={displayedPage} onChange={e => setPageOverride({question:question.numero,page:Number(e.currentTarget.value)})} className="min-h-12 rounded border border-n2 px-2">{Array.from({length:pageCount}, (_,i) => <option key={i} value={i+1}>{i+1}</option>)}</select> de {pageCount}</label>
          <button type="button" className="min-h-12 rounded border border-n2 px-3" disabled={displayedPage >= pageCount} onClick={() => setPageOverride({question:question.numero,page:displayedPage + 1})}>Próxima página →</button>
        </div>}
        <img src={displayedPage ? `/acervo/enem/${id}/${String(displayedPage).padStart(2,"0")}.webp` : `/questoes/${id}-q${String(question.numero).padStart(3, "0")}.webp`} alt={displayedPage ? `Página ${displayedPage} do caderno, ${title}` : `Recorte da questão ${enemDisplayNumber(question)}, ${title}`} className="h-auto w-full rounded-md border border-n2 bg-white" />
        {related.length > 0 && <details className="mt-4"><summary className="cursor-pointer py-3">Ver recortes relacionados</summary>{related.map(num => <img key={num} src={`/questoes/${id}-q${String(num).padStart(3,"0")}.webp`} alt={`Recorte da questão ${num}, ${title}`} className="mt-3 h-auto w-full rounded-md border border-n2" loading="lazy" />)}</details>}
        {question.texto && <details className="mt-4"><summary className="cursor-pointer py-3">Ler transcrição do enunciado</summary><p className="mb-3 text-sm">Texto auxiliar; confira figuras e alternativas no recorte original.</p><p className="whitespace-pre-wrap text-n5"><SafeText text={question.texto}/></p></details>}
      </div>
      <div id="enem-respostas" className="min-w-0 scroll-mt-24">
        <a href="#enem-caderno" className="gb-text-link mb-3 inline-block lg:hidden">↑ Voltar à questão</a>
        <h2 className="gb-section-title" aria-live="polite">Questão {enemDisplayNumber(question)}{question.annulled && <span className="ml-3 rounded border border-n2 bg-white px-2 py-1 align-middle text-sm">Anulada</span>}</h2>
        {question.annulled && <p className="mt-2 text-sm text-n5">Anulada no gabarito oficial. Não conta como acerto, erro ou questão em branco.</p>}
        <p className="mt-2 text-n5">{[question.disciplina, question.tema, question.habilidade].filter(Boolean).join(" · ")}</p>
        <p className="mt-2" role="status">{marked} de {orderedQuestions.length} itens marcados</p>
        {reviewed && <p className="gb-notice mt-4">Sua resposta: {reviewed.selected ?? "em branco"} · Gabarito oficial: <strong>{reviewed.key}</strong> · {reviewed.status === "incorrect" ? "Rever" : reviewed.status === "correct" ? "Correta" : reviewed.status === "annulled" ? "Anulada" : "Em branco"}.</p>}
        <fieldset className="my-5"><legend className="mb-3">Sua alternativa</legend><div className="grid grid-cols-5 gap-2">{["A", "B", "C", "D", "E"].map(a => <label key={a} className={`flex min-h-12 cursor-pointer items-center justify-center rounded border focus-within:ring-2 focus-within:ring-[#123d35] ${answers[question.numero] === a ? "bg-[#123d35] text-white" : "bg-white text-[#123d35]"}`}><input className="sr-only" type="radio" name={`enem-q${question.numero}`} value={a} checked={answers[question.numero] === a} onChange={() => { setScore(null); setAnswers({ ...answers, [question.numero]: a }); }} />{a}</label>)}</div></fieldset>
        <button className="mb-5 text-sm underline" onClick={() => { if (window.confirm("Apagar a resposta desta questão?")) { setScore(null); setAnswers(({ [question.numero]: _removed, ...rest }) => rest); } }}>Limpar resposta</button>
        <div className="mb-5 flex gap-2"><button className="min-h-12 rounded border border-n2 px-3" disabled={index === 0} onClick={() => setIndex(index - 1)}>← Anterior</button><button className="min-h-12 rounded border border-n2 px-3" disabled={index === orderedQuestions.length - 1} onClick={() => setIndex(index + 1)}>Próxima →</button></div>
        <nav aria-label="Questões da prova" className="grid grid-cols-5 gap-2">{orderedQuestions.map((q, i) => <button key={q.numero} aria-label={`Questão ${enemDisplayNumber(q)}${q.annulled ? ", anulada" : ""}${answers[q.numero] ? ", respondida" : ""}`} aria-current={i === index ? "step" : undefined} onClick={() => setIndex(i)} className={`min-h-12 rounded border ${i === index ? "ring-2 ring-[#123d35]" : ""} ${answers[q.numero] ? "bg-[#f2cdb4]" : "bg-white"}`}>{enemDisplayNumber(q)}</button>)}</nav>
        <button type="button" className="gb-button mt-6" disabled={grading || marked === 0} onClick={finish}>{grading ? "Corrigindo…" : "Finalizar simulado"}</button>{error && <p role="alert" className="mt-3 text-sm">{error}</p>} <button type="button" className="mt-6 min-h-12 rounded border border-n2 px-3" onClick={restart}>Recomeçar</button>
        <p className="mt-4 text-sm text-n5">Seu progresso fica neste navegador. Para preservar seus dados, não apague os dados do site.</p>
      </div>
    </fieldset>}
  </section>;
}

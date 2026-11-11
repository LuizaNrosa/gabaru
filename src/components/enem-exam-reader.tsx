// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
"use client";

import { useState } from "react";

type Question = { numero: number; texto: string; disciplina: string; habilidade: string; tema: string };

export function EnemExamReader({ id, title, questions }: { id: string; title: string; questions: Question[] }) {
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [language, setLanguage] = useState<"ingles" | "espanhol">("ingles");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const hasLanguages = questions.some(q => q.numero >= 101 && q.numero <= 105 && q.disciplina === "espanhol");
  const selectedQuestions = hasLanguages ? questions.filter(q => language === "ingles" ? !(q.numero >= 101 && q.numero <= 105 && q.disciplina === "espanhol") : !(q.numero >= 1 && q.numero <= 5 && q.disciplina === "ingles")) : questions;
  const question = selectedQuestions[index];
  if (!question) return <p className="gb-notice mt-8">Este caderno ainda não tem questões disponíveis.</p>;
  const marked = selectedQuestions.filter(q => answers[q.numero]).length;
  return <section className="mt-8" aria-label="Caderno e respostas">
    <div className="mb-6 flex items-center gap-3">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/marca/gabaru-carimbo.webp" width={48} height={48} alt="" className="rounded-full" /><div><p className="gb-eyebrow">SIMULADO GRATUITO</p><h2 className="gb-section-title">Sua prova do ENEM</h2></div></div>
    <p className="mb-6 text-n5">Consulte o recorte original e marque suas alternativas. As marcações são temporárias e não há correção automática neste caderno.</p>
    {hasLanguages && <fieldset className="mb-6"><legend className="font-semibold">Escolha sua língua estrangeira</legend><div className="mt-2 flex gap-6">{(["ingles", "espanhol"] as const).map(l => <label key={l} className="flex items-center gap-2"><input type="radio" name="idioma" checked={language === l} onChange={() => { setLanguage(l); setIndex(0); setFinished(false); }} />{l === "ingles" ? "Inglês" : "Espanhol"}</label>)}</div><p className="mt-2 text-sm text-n5">Escolha apenas uma língua. As questões de espanhol usam os números internos 101–105.</p></fieldset>}
    {finished ? <div className="gb-notice mb-8" role="status"><h3 className="text-xl font-bold">Simulado finalizado</h3><p className="mt-3">{marked} de {selectedQuestions.length} questões respondidas · {selectedQuestions.length - marked} em branco.</p><p className="mt-3">O número de acertos e a nota TRI não estão disponíveis. Consulte o gabarito oficial para conferir suas respostas.</p><button type="button" className="gb-button mt-4" onClick={() => setFinished(false)}>Revisar respostas</button></div> :
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <img src={`/questoes/${id}-q${String(question.numero).padStart(3, "0")}.webp`} alt={`Recorte da questão ${question.numero}, ${title}`} className="h-auto w-full rounded-md border border-n2 bg-white" />
        <details className="mt-4"><summary className="cursor-pointer py-3">Ler transcrição do enunciado</summary><p className="mb-3 text-sm">Texto auxiliar; confira figuras e alternativas no recorte original.</p><p className="whitespace-pre-wrap text-n5">{question.texto}</p></details>
      </div>
      <div>
        <h2 className="gb-section-title" aria-live="polite">Questão {question.numero}</h2>
        <p className="mt-2 text-n5">{question.disciplina} · {question.tema} · {question.habilidade}</p>
        <p className="mt-2" role="status">{marked} de {selectedQuestions.length} itens marcados</p>
        <fieldset className="my-5"><legend className="mb-3">Sua alternativa</legend><div className="grid grid-cols-5 gap-2">{["A", "B", "C", "D", "E"].map(a => <label key={a} className={`flex min-h-12 cursor-pointer items-center justify-center rounded border focus-within:ring-2 focus-within:ring-[#232323] ${answers[question.numero] === a ? "bg-[#232323] text-white" : "bg-white text-[#232323]"}`}><input className="sr-only" type="radio" name={`enem-q${question.numero}`} value={a} checked={answers[question.numero] === a} onChange={() => setAnswers({ ...answers, [question.numero]: a })} />{a}</label>)}</div></fieldset>
        <button className="mb-5 text-sm underline" onClick={() => setAnswers(({ [question.numero]: _removed, ...rest }) => rest)}>Limpar resposta</button>
        <div className="mb-5 flex gap-2"><button className="min-h-12 rounded border border-n2 px-3" disabled={index === 0} onClick={() => setIndex(index - 1)}>← Anterior</button><button className="min-h-12 rounded border border-n2 px-3" disabled={index === selectedQuestions.length - 1} onClick={() => setIndex(index + 1)}>Próxima →</button></div>
        <nav aria-label="Questões da prova" className="grid grid-cols-5 gap-2">{selectedQuestions.map((q, i) => <button key={q.numero} aria-label={`Questão ${q.numero}${answers[q.numero] ? ", respondida" : ""}`} aria-current={i === index ? "step" : undefined} onClick={() => setIndex(i)} className={`min-h-12 rounded border ${i === index ? "ring-2 ring-[#232323]" : ""} ${answers[q.numero] ? "bg-[#f2cdb4]" : "bg-white"}`}>{q.numero}</button>)}</nav>
        <button type="button" className="gb-button mt-6" onClick={() => setFinished(true)}>Finalizar simulado</button> <button type="button" className="mt-6 min-h-12 rounded border border-n2 px-3" onClick={() => { if (window.confirm("Apagar suas respostas deste caderno?")) { setAnswers({}); setIndex(0); } }}>Recomeçar</button>
        <p className="mt-4 text-sm text-n5">Ao recarregar ou trocar de edição, suas marcações serão apagadas. Consulte o gabarito oficial do Inep para conferir as respostas.</p>
      </div>
    </div>}
  </section>;
}

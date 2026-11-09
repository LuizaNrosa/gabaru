// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
"use client";

import { useState } from "react";

type Question = { numero: number; texto: string; disciplina: string; habilidade: string; tema: string };

export function EnemExamReader({ id, title, questions }: { id: string; title: string; questions: Question[] }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const question = questions[index];
  if (!question) return <p className="gb-notice mt-8">Este caderno ainda não tem questões disponíveis.</p>;
  const marked = Object.keys(answers).length;
  return <section className="mt-8" aria-label="Caderno e respostas">
    <p className="mb-6 text-n5">Consulte o recorte original e marque suas alternativas. As marcações são temporárias e não há correção automática neste caderno.</p>
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <img src={`/questoes/${id}-q${String(question.numero).padStart(3, "0")}.webp`} alt={`Recorte da questão ${question.numero}, ${title}`} className="h-auto w-full rounded-md border border-n2 bg-white" />
        <details className="mt-4"><summary className="cursor-pointer py-3">Ler transcrição do enunciado</summary><p className="mb-3 text-sm">Texto auxiliar; confira figuras e alternativas no recorte original.</p><p className="whitespace-pre-wrap text-n5">{question.texto}</p></details>
      </div>
      <div>
        <h2 className="gb-section-title" aria-live="polite">Questão {question.numero}</h2>
        <p className="mt-2 text-n5">{question.disciplina} · {question.tema} · {question.habilidade}</p>
        <p className="mt-2" role="status">{marked} de {questions.length} itens marcados</p>
        <fieldset className="my-5"><legend className="mb-3">Sua alternativa</legend><div className="grid grid-cols-5 gap-2">{["A", "B", "C", "D", "E"].map(a => <label key={a} className={`flex min-h-12 cursor-pointer items-center justify-center rounded border focus-within:ring-2 focus-within:ring-[#232323] ${answers[question.numero] === a ? "bg-[#232323] text-white" : "bg-white text-[#232323]"}`}><input className="sr-only" type="radio" name={`enem-q${question.numero}`} value={a} checked={answers[question.numero] === a} onChange={() => setAnswers({ ...answers, [question.numero]: a })} />{a}</label>)}</div></fieldset>
        <button className="mb-5 text-sm underline" onClick={() => setAnswers(({ [question.numero]: _removed, ...rest }) => rest)}>Limpar resposta</button>
        <div className="mb-5 flex gap-2"><button className="min-h-12 rounded border border-n2 px-3" disabled={index === 0} onClick={() => setIndex(index - 1)}>← Anterior</button><button className="min-h-12 rounded border border-n2 px-3" disabled={index === questions.length - 1} onClick={() => setIndex(index + 1)}>Próxima →</button></div>
        <nav aria-label="Questões da prova" className="grid grid-cols-5 gap-2">{questions.map((q, i) => <button key={q.numero} aria-label={`Questão ${q.numero}${answers[q.numero] ? ", respondida" : ""}`} aria-current={i === index ? "step" : undefined} onClick={() => setIndex(i)} className={`min-h-12 rounded border ${i === index ? "ring-2 ring-[#232323]" : ""} ${answers[q.numero] ? "bg-[#f2cdb4]" : "bg-white"}`}>{q.numero}</button>)}</nav>
        <button className="mt-6 min-h-12 rounded border border-n2 px-3" onClick={() => { setAnswers({}); setIndex(0); }}>Recomeçar</button>
        <p className="mt-4 text-sm text-n5">Ao recarregar ou trocar de edição, suas marcações serão apagadas. Consulte o gabarito oficial do Inep para conferir as respostas.</p>
      </div>
    </div>
  </section>;
}

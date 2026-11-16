import { MathText } from './math-text';
import { StudySession } from './study-session';
import type { Questao } from '@/lib/catalogo/types';
/** Server components render every statement, alternative and explanation before hydration. */
export function QuestionWorkspace({ questions, id, durationMinutes }: { questions: Questao[]; id: string; durationMinutes?: number }) {
  return <StudySession storageKey={id} durationMinutes={durationMinutes} cards={questions.map(q=>({q,statement:<MathText text={q.enunciado}/>,options:q.alternativas.map(a=><MathText key={a.letra} text={a.texto}/>),resolution:<div className="v2-resolution">{q.correta?<p><strong>Alternativa {q.correta}.</strong> {q.alternativas.find(a=>a.letra===q.correta)?.texto}</p>:<p>Gabarito em conferência.</p>}{q.comentarioResolucao.length?<ol>{q.comentarioResolucao.map((step,i)=><li key={i}><MathText text={step}/></li>)}</ol>:<p>A resolução comentada ainda não foi publicada. Este registro está em revisão editorial.</p>}</div>}))}/>;
}

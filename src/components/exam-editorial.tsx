import Link from 'next/link';
import { catalogo,questaoPorSlug } from '@/lib/catalogo';
import { QuestionWorkspace } from './question-workspace';
import { JsonLd } from './json-ld';
import { schemaGraph } from '@/lib/seo/schema-graph';
export function ExamEditorial({banca,edition}:{banca:string;edition:string}) {
 const exam=catalogo.cadernos.find(e=>e.id===`${banca}:${edition}`);if(!exam)return null;
 const questions=exam.questoes.flatMap(id=>{const q=questaoPorSlug.get(id);return q?.enunciado&&q.alternativas.length>=4?[q]:[];});
 if(!questions.length)return <section className="v2-editorial" aria-label="Situação da transcrição"><h2 className="v2-subtitle">Transcrição em revisão</h2><p>Este caderno está disponível no leitor original. Os textos completos e as resoluções ainda precisam de revisão antes de integrar o banco de questões comentadas.</p></section>;
 return <section aria-label="Questões em texto e ferramentas de estudo" className="mt-12"><JsonLd dados={schemaGraph({path:exam.href,title:exam.titulo,questions:questions.filter(q=>q.statusPublicacao==='completa')})}/><p className="v2-editorial">{questions.length} itens com enunciado e alternativas transcritos. {questions.filter(q=>q.statusPublicacao==='completa').length} resoluções publicadas; os demais textos estão em revisão. Confira a reprodução oficial no leitor e na fonte antes de usar a transcrição.</p><nav aria-label="Índice editorial das questões" className="v2-actions my-5">{questions.filter(q=>q.statusPublicacao==='completa').map(q=><Link className="v2-button" key={q.id} href={`/questoes/${q.slug}`}>Questão {q.numero}: resolução comentada</Link>)}</nav><QuestionWorkspace id={`caderno-${exam.id}`} questions={questions} durationMinutes={exam.duracaoMinutos??240}/></section>;
}

import { QualityBadge } from '@/components/quality-badge';
import Link from 'next/link';
import { catalogo,questaoPorSlug } from '@/lib/catalogo';
import { QuestionWorkspace } from './question-workspace';
import { JsonLd } from './json-ld';
import { schemaGraph } from '@/lib/seo/schema-graph';
export function ExamEditorial({banca,edition}:{banca:string;edition:string}) {
 const exam=catalogo.cadernos.find(e=>e.id===`${banca}:${edition}`);if(!exam)return null;
 const questions=exam.questoes.flatMap(id=>{const q=questaoPorSlug.get(id);return q?.enunciado?[q]:[];});
 if(!questions.length)return <section className="v2-editorial" aria-label="Situação da transcrição"><h2 className="v2-subtitle">Transcrição em revisão</h2><p>Este caderno está disponível no leitor original. Os textos completos e as resoluções ainda precisam de revisão antes de integrar o banco de questões comentadas.</p></section>;
 return <section aria-label="Questões em texto e ferramentas de estudo" className="mt-12"><QualityBadge nivel={exam.nivelQualidade}/>{exam.percentualValidado!==undefined&&exam.percentualValidado<1&&<p className="v2-editorial" role="note">{Math.round(exam.percentualValidado*100)}% do caderno validado. Os itens ainda em revisão estão sinalizados individualmente e não entram no banco indexável.</p>}<JsonLd dados={schemaGraph({path:exam.href,title:exam.titulo,questions:questions.filter(q=>q.nivelQualidade!=='nivel-0-quarentena')})}/><p className="v2-editorial">{questions.length} itens com enunciado e alternativas transcritos. {questions.filter(q=>q.nivelQualidade==='nivel-2-resolucao-comentada').length} resoluções publicadas. Confira a situação editorial indicada para cada item. Confira a reprodução oficial no leitor e na fonte antes de usar a transcrição.</p><nav aria-label="Índice editorial das questões" className="v2-actions my-5">{questions.filter(q=>q.nivelQualidade!=='nivel-0-quarentena').map(q=><Link className="v2-button" key={q.id} href={`/questoes/${q.slug}`}>Questão {q.numero}: {q.nivelQualidade==='nivel-2-resolucao-comentada'?'resolução comentada':'gabarito oficial'}</Link>)}</nav><QuestionWorkspace id={`caderno-${exam.id}`} questions={questions} durationMinutes={exam.duracaoMinutos??240}/></section>;
}

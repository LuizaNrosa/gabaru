import { QualityBadge } from '@/components/quality-badge';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { catalogo,questoesPublicadas,questoesIndexaveis,questaoPorSlug,nomeTaxonomia } from '@/lib/catalogo';
import { metaPagina } from '@/lib/seo';
import { schemaGraph } from '@/lib/seo/schema-graph';
import { JsonLd } from '@/components/json-ld';
import { QuestionWorkspace } from '@/components/question-workspace';
import { EditorialByline } from '@/components/editorial-byline';
type Props={params:Promise<{slug:string}>};
export function generateStaticParams(){return [...questoesIndexaveis].sort((a,b)=>Number(b.nivelQualidade==='nivel-2-resolucao-comentada')-Number(a.nivelQualidade==='nivel-2-resolucao-comentada')||b.ano-a.ano).slice(0,200).map(q=>({slug:q.slug}));}
export async function generateMetadata({params}:Props){const q=questaoPorSlug.get((await params).slug);return metaPagina({titulo:q?`${q.banca.toUpperCase()} ${q.ano}: ${q.tema}`:'Questão não encontrada',descricao:q?.enunciado.slice(0,155)??'Consulte o banco de questões do Gabaru.',caminho:`/questoes/${q?.slug??''}`,semIndice:!q||q.nivelQualidade==='nivel-0-quarentena'});}
export default async function Page({params}:Props){const q=questaoPorSlug.get((await params).slug);if(!q)notFound();const exam=catalogo.cadernos.find(e=>e.id===q.edicao);const related=questoesPublicadas.filter(r=>r.id!==q.id&&r.assunto===q.assunto).slice(0,3);const title=`${q.banca.toUpperCase()} ${q.ano} — Questão ${q.numero}`;
 return <main id="conteudo-principal" className="gb-container v2-page"><nav aria-label="Trilha de navegação" className="v2-breadcrumb"><Link href="/questoes">Questões</Link><span aria-hidden="true">/</span><Link href={`/banca/${q.banca}`}>{q.banca.toUpperCase()}</Link><span aria-hidden="true">/</span><Link href={`/disciplina/${q.disciplina}`}>{nomeTaxonomia(q.disciplina)}</Link></nav><h1 className="gb-page-title">{title}</h1><p className="v2-lead">{q.tema} · <Link className="underline" href={`/assunto/${q.assunto}`}>{nomeTaxonomia(q.assunto)}</Link> · Dificuldade: {nomeTaxonomia(q.dificuldade)}.</p>
 {q.nivelQualidade==='nivel-0-quarentena'&&<p className="gb-notice">Transcrição em revisão editorial. Confira textos e figuras no caderno oficial; esta página não é enviada aos buscadores no sitemap.</p>}
 <JsonLd dados={schemaGraph({path:`/questoes/${q.slug}`,title,questions:q.statusPublicacao==='completa'?[q]:[],breadcrumbs:[{name:'Início',path:'/'},{name:'Questões',path:'/questoes'},{name:title,path:`/questoes/${q.slug}`}]})}/>
 <QualityBadge nivel={q.nivelQualidade} carimbo /><QuestionWorkspace id={q.id} questions={[q]} durationMinutes={5}/><EditorialByline source={q.fonte} complete={q.nivelQualidade==='nivel-2-resolucao-comentada'} official={q.nivelQualidade==='nivel-1-gabarito-oficial'}/>
 {exam&&<Link className="v2-source" href={exam.href}>Abrir o caderno completo: {exam.titulo}</Link>}
 {related.length>0&&<section aria-labelledby="relacionadas-titulo"><h2 id="relacionadas-titulo" className="v2-subtitle">Continue no mesmo assunto</h2><ul className="v2-results mt-5">{related.map(r=><li className="v2-result" key={r.id}><Link href={`/questoes/${r.slug}`}>{r.banca.toUpperCase()} {r.ano} · Questão {r.numero}: {r.tema}</Link></li>)}</ul></section>}
 </main>;
}

import {SafeText} from "@/components/safe-text";
import { ExamYearIndex } from "@/components/exam-year-index";
import { ExamEditorial } from "@/components/exam-editorial";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ENEM_SOURCE, enemExams, enemTitle, readEnemExam } from "@/lib/enem-acervo";
import { JsonLd } from "@/components/json-ld";
import { jsonLd, metaPagina } from "@/lib/seo";
import { enemDisplayNumber } from "@/lib/enem-question-order";
import { EnemExamReader } from "@/components/enem-exam-reader";
import verifiedExams from "@/data/enem-gabaritos-conferidos.json";
type Props = { params: Promise<{ edition: string }> };
export function generateStaticParams() { return enemExams.map(e => ({ edition: e.id })); }
export async function generateMetadata({ params }: Props) {
  const { edition } = await params;
  const current = enemExams.find(e => e.id === edition);
  return metaPagina({
    titulo: current ? enemTitle(current) : "Prova ENEM",
    descricao: current
      ? `${current.total} itens do caderno do ENEM para responder no Gabaru. Consulte as fontes oficiais do Inep.`
      : "Caderno do ENEM organizado por questão no Gabaru.",
    caminho: `/provas/enem/${edition}`,
  });
}
export default async function Page({ params }: Props) {
  const {edition}=await params;
  if (/^\d{4}$/.test(edition)) return <ExamYearIndex banca="enem" year={Number(edition)}/>;
  const exam = readEnemExam(edition);
  if (!exam) notFound();
  const verification = verifiedExams.find(e => e.id === exam.id);
  const verified = !!verification || !!exam.pageCount;
  return <main id="conteudo-principal" tabIndex={-1} className="gb-container py-10">
    <JsonLd dados={jsonLd.trilhas([{ nome: "Início", caminho: "/" }, { nome: "ENEM e vestibulares", caminho: "/pre-vestibular" }, { nome: "Acervo ENEM", caminho: "/provas/enem" }, { nome: enemTitle(exam), caminho: `/provas/enem/${exam.id}` }])} />
    <Link href={`/provas/enem#ano-${exam.year}`} className="gb-text-link">← Acervo ENEM {exam.year}</Link>
    <p className="gb-eyebrow mt-8">VESTIBULAR · ENEM</p>
    <h1 className="gb-page-title">{enemTitle(exam)}</h1>
    <p className="mt-5 text-lg">{exam.total} itens · caderno organizado por questão.</p>
    <p className="gb-notice mt-6">Consulte cada questão abaixo. As disciplinas e habilidades são classificações de estudo do Gabaru. {verified ? "Este caderno conta com correção pelo gabarito oficial." : "Este caderno ainda não tem correção automática."} {exam.pageCount ? "As páginas integrais aparecem no leitor." : "Os recortes originais aparecem no leitor."} Quando o caderno inclui as duas opções de língua estrangeira, escolha inglês ou espanhol antes de responder.</p>
    <details className="mt-4"><summary className="cursor-pointer py-2 text-sm text-n5">Fonte oficial e outros materiais</summary><div className="gb-actions"><a className="gb-text-link" href={`${ENEM_SOURCE}/${exam.year}`} target="_blank" rel="noopener noreferrer">Consultar a edição no Inep ↗</a><Link className="gb-text-link" href={`/treino?ano=${exam.year}`}>Treinar questões deste ano ↗</Link></div></details>
    {verification && "language" in verification && <p className="gb-notice mt-5">
      Neste caderno, a correção das questões de língua estrangeira corresponde à opção de inglês.
    </p>}
    <details className="v2-solution"><summary>Caderno original e leitor de imagens</summary><EnemExamReader key={exam.id} id={exam.id} title={enemTitle(exam)} verified={verified} pageCount={exam.pageCount} questions={exam.questions.map(({numero,texto,disciplina,habilidade,tema,obs,pagina,annulled})=>({numero,texto,disciplina,habilidade,tema,obs,pagina,annulled}))} /></details>
    {!exam.pageCount && <section className="mt-12" aria-label="Transcrições das questões">
      <h2 className="gb-section-title">Transcrições das questões</h2>
      <p className="mt-3 text-sm text-n5">Texto auxiliar: para figuras e alternativas, consulte o recorte ou o caderno oficial.</p>
      <div className="mt-5 grid gap-4">{exam.questions.map(q => <article aria-labelledby={`titulo-${q.numero}-${q.disciplina}`} key={`${q.numero}-${q.disciplina}`} id={`questao-${q.numero}${q.disciplina==='espanhol'?'-es':''}`} className="scroll-mt-28 rounded-lg border border-n2 bg-white/60 p-5">
        <h3 id={`titulo-${q.numero}-${q.disciplina}`} className="font-semibold">Questão {enemDisplayNumber(q)} · {q.disciplina}</h3>
        <p className="mt-3 text-sm text-n5">{q.tema} · {q.habilidade}</p>
        <p className="mt-4 whitespace-pre-wrap text-n5"><SafeText text={q.texto}/></p>
      </article>)}</div>
    </section>}
  <ExamEditorial banca="enem" edition={exam.id} />
</main>;
}

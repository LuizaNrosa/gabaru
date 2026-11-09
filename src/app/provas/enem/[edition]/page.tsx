import Link from "next/link";
import { notFound } from "next/navigation";
import { ENEM_SOURCE, enemExams, enemTitle, readEnemExam } from "@/lib/enem-acervo";
import { JsonLd } from "@/components/json-ld";
import { jsonLd, metaPagina } from "@/lib/seo";
import { EnemExamReader } from "@/components/enem-exam-reader";
type Props = { params: Promise<{ edition: string }> };
export function generateStaticParams() { return enemExams.map(e => ({ edition: e.id })); }
export async function generateMetadata({ params }: Props) {
  const { edition } = await params;
  const current = enemExams.find(e => e.id === edition);
  return metaPagina({
    titulo: current ? enemTitle(current) : "Prova ENEM",
    descricao: current
      ? `${current.total} itens do caderno, organizados por questão, com transcrição do enunciado. Consulte também os cadernos e gabaritos oficiais do Inep.`
      : "Caderno do ENEM organizado por questão no Gabaru.",
    caminho: `/provas/enem/${edition}`,
  });
}
export default async function Page({ params }: Props) {
  const exam = readEnemExam((await params).edition);
  if (!exam) notFound();
  return <main className="gb-container py-10">
    <JsonLd dados={jsonLd.trilhas([{ nome: "Início", caminho: "/" }, { nome: "ENEM e vestibulares", caminho: "/pre-vestibular" }, { nome: "Acervo ENEM", caminho: "/provas/enem" }, { nome: enemTitle(exam), caminho: `/provas/enem/${exam.id}` }])} />
    <Link href={`/provas/enem#ano-${exam.year}`} className="gb-text-link">← Acervo ENEM {exam.year}</Link>
    <p className="gb-eyebrow mt-8">VESTIBULAR · ENEM</p>
    <h1 className="gb-page-title">{enemTitle(exam)}</h1>
    <p className="mt-5 text-lg">{exam.total} itens · caderno organizado por questão.</p>
    <p className="gb-notice mt-6">Consulte cada questão abaixo. As disciplinas e habilidades são classificações de estudo do Gabaru. Este caderno não tem correção automática. Para conferir imagens, gráficos, diagramação original e gabarito, consulte a edição oficial do Inep. Em Linguagens, escolha inglês ou espanhol; os itens 101–105 são a identificação interna das opções de espanhol quando presentes.</p>
    <div className="gb-actions"><a className="gb-button" href={`${ENEM_SOURCE}/${exam.year}`} target="_blank" rel="noopener noreferrer">Cadernos e gabaritos oficiais ↗</a><Link className="gb-text-link" href={`/treino?ano=${exam.year}`}>Treinar questões deste ano ↗</Link></div>
    <EnemExamReader id={exam.id} title={enemTitle(exam)} questions={exam.questions} />
    <section className="mt-12" aria-label="Transcrições das questões">
      <h2 className="gb-section-title">Transcrições das questões</h2>
      <p className="mt-3 text-sm text-n5">Texto auxiliar: para figuras e alternativas, consulte o recorte ou o caderno oficial.</p>
      <div className="mt-5 grid gap-4">{exam.questions.map(q => <details key={q.numero} id={`questao-${q.numero}`} className="scroll-mt-28 rounded-lg border border-n2 bg-white/60 p-5">
        <summary className="min-h-11 cursor-pointer font-semibold">Questão {q.numero} · {q.disciplina}</summary>
        <p className="mt-3 text-sm text-n5">{q.tema} · {q.habilidade}</p>
        <p className="mt-4 whitespace-pre-wrap text-n5">{q.texto}</p>
      </details>)}</div>
    </section>
  </main>;
}

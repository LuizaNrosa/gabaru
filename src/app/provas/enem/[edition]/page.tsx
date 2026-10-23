import Link from "next/link";
import { notFound } from "next/navigation";
import { ENEM_SOURCE, enemExams, enemTitle, readEnemExam } from "@/lib/enem-acervo";
type Props = { params: Promise<{ edition: string }> };
export function generateStaticParams() { return enemExams.map(e => ({ edition: e.id })); }
export async function generateMetadata({ params }: Props) {
  const { edition } = await params;
  const current = enemExams.find(e => e.id === edition);
  return { title: current ? enemTitle(current) : "Prova ENEM", alternates: { canonical: `/provas/enem/${edition}` } };
}
export default async function Page({ params }: Props) {
  const exam = readEnemExam((await params).edition);
  if (!exam) notFound();
  return <main className="gb-container py-10">
    <Link href={`/provas/enem#ano-${exam.year}`} className="gb-text-link">← Acervo ENEM {exam.year}</Link>
    <p className="gb-eyebrow mt-8">VESTIBULAR · ENEM</p>
    <h1 className="gb-page-title">{enemTitle(exam)}</h1>
    <p className="mt-5 text-lg">{exam.total} itens · caderno organizado por questão.</p>
    <p className="gb-notice mt-6">Consulte cada questão abaixo. As disciplinas e habilidades são classificações de estudo do Gabaru. Este caderno não tem correção automática. Para conferir imagens, gráficos, diagramação original e gabarito, consulte a edição oficial do Inep. Em Linguagens, escolha inglês ou espanhol; os itens 101–105 são a identificação interna das opções de espanhol quando presentes.</p>
    <div className="gb-actions"><a className="gb-button" href={`${ENEM_SOURCE}/${exam.year}`} target="_blank" rel="noopener noreferrer">Cadernos e gabaritos oficiais ↗</a><Link className="gb-text-link" href={`/treino?ano=${exam.year}`}>Treinar questões deste ano ↗</Link></div>
    <nav className="my-8 flex flex-wrap gap-2" aria-label="Questões do caderno">{exam.questions.map(q => <a key={q.numero} href={`#questao-${q.numero}`} className="flex min-h-11 min-w-11 items-center justify-center rounded border border-n2 px-2">{q.numero}</a>)}</nav>
    <div className="grid gap-4">{exam.questions.map(q => <details key={q.numero} id={`questao-${q.numero}`} className="scroll-mt-28 rounded-lg border border-n2 bg-white/60 p-5">
      <summary className="min-h-11 cursor-pointer font-semibold">Questão {q.numero} · {q.disciplina}</summary>
      <p className="mt-3 text-sm text-n5">{q.tema} · {q.habilidade}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/questoes/${exam.id}-q${String(q.numero).padStart(3, "0")}.webp`} alt={`Recorte da questão ${q.numero}, ${enemTitle(exam)}`} loading="lazy" className="mx-auto mt-5 h-auto max-w-full" />
      <details className="mt-4"><summary className="cursor-pointer text-sm underline">Ler transcrição do enunciado</summary><p className="mt-4 whitespace-pre-wrap text-n5">{q.texto}</p></details>
    </details>)}</div>
  </main>;
}

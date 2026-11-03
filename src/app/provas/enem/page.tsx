import Link from "next/link";
import { ENEM_SOURCE, ENEM_YEARS, enemExams, enemTitle } from "@/lib/enem-acervo";
import { JsonLd } from "@/components/json-ld";
import { jsonLd, metaPagina } from "@/lib/seo";
export const metadata = metaPagina({
  titulo: "ENEM: provas por ano e aplicação",
  descricao: "Cadernos incorporados ao Gabaru e acesso às provas e gabaritos oficiais do Inep, de 1998 a 2025.",
  caminho: "/provas/enem",
});
export default function Page() {
  return <main className="gb-container py-10">
    <JsonLd dados={jsonLd.lista(enemExams.map(e => ({ nome: enemTitle(e), caminho: `/provas/enem/${e.id}` })))} />
    <Link href="/pre-vestibular" className="gb-text-link">← Vestibular</Link>
    <p className="gb-eyebrow mt-8">VESTIBULAR · ENEM</p>
    <h1 className="gb-page-title">Uma edição de cada vez.</h1>
    <p className="mt-5 text-lg">{enemExams.length} cadernos incorporados · {enemExams.reduce((n, e) => n + e.total, 0).toLocaleString("pt-BR")} itens para consulta.</p>
    <p className="gb-notice mt-6">Os itens de língua estrangeira incluem as opções de inglês e espanhol quando presentes. Escolha apenas uma língua ao resolver a prova. Cores e versões acessíveis não são somadas como novas provas. Os gabaritos do ENEM ainda precisam de integração e revisão para liberar correção automática.</p>
    <nav aria-label="Anos do ENEM" className="my-6 flex flex-wrap gap-3">{ENEM_YEARS.map(year => <a key={year} className="flex min-h-12 items-center rounded border border-n2 px-4" href={`#ano-${year}`}>{year}</a>)}</nav>
    {ENEM_YEARS.map(year => {
      const available = enemExams.filter(e => e.year === year);
      return <section id={`ano-${year}`} key={year} className="scroll-mt-24 border-t border-n2 py-8">
        <h2 className="gb-section-title">ENEM {year}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">{available.map(e =>
          <Link key={e.id} href={`/provas/enem/${e.id}`} className="gb-content-card">
            <h3>{enemTitle(e)}</h3>
            <p>{e.total} itens · {e.disciplines.length} disciplinas</p>
            <span className="gb-text-link">Abrir caderno de questões ↗</span>
          </Link>)}</div>
        <p className="mt-4 text-sm text-n5">{available.length ? "Há cadernos incorporados deste ano. Outras aplicações e versões podem estar disponíveis na fonte oficial." : "A incorporação deste ano ao Gabaru está pendente. Consulte os cadernos e gabaritos na fonte oficial."}</p>
        <a href={`${ENEM_SOURCE}/${year}`} target="_blank" rel="noopener noreferrer" className="gb-text-link mt-4 inline-block">Provas e gabaritos de {year} no Inep ↗</a>
      </section>;
    })}
    <a href={ENEM_SOURCE} target="_blank" rel="noopener noreferrer" className="gb-text-link">Acervo oficial completo do Inep ↗</a>
  </main>;
}

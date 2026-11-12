import Link from "next/link";
import { ARCHIVES, ARCHIVE_INFO, archiveYears, applicationName, type Institution } from "@/lib/vestibular-archive";

export function VestibularArchivePage({ institution }: { institution: Institution }) {
  const archive = ARCHIVES[institution], info = ARCHIVE_INFO[institution], years = archiveYears(institution);
  return <main className="gb-container py-10">
    <Link href="/pre-vestibular#paulistas" className="gb-text-link">← Vestibulares</Link>
    <p className="gb-eyebrow mt-8">VESTIBULARES · ACERVO OFICIAL</p>
    <h1 className="gb-page-title">Provas da {info.name}</h1>
    <p className="mt-5 text-lg">{years.length} anos · {archive.documents.length} documentos oficiais verificados · {years.at(-1)} a {years[0]}.</p>
    <p className="gb-notice mt-6">Escolha o ano para consultar os cadernos e documentos oficiais, com textos, figuras e propostas de redação preservados. Algumas edições da UNESP são apresentadas pelas questões reproduzidas nos relatórios da Vunesp. Gabaritos e respostas esperadas aparecem quando disponíveis na fonte. Versões de um mesmo caderno não são somadas como novas questões. {institution === "unesp" ? "As primeiras fases de 2026, 2025 e 2024 (regular e meio de ano), 2023 (regular) e 2022 (Biológicas e Exatas/Humanidades) têm correção automática; nos demais cadernos a disponibilidade varia. A separação por disciplina ainda não está disponível." : "A correção automática e a separação por disciplina ainda não estão disponíveis neste acervo."}</p>
    <nav aria-label="Anos do acervo" className="my-6 flex flex-wrap gap-3">{years.map(year => <a key={year} href={`#ano-${year}`} className="flex min-h-12 items-center rounded border border-n2 px-4">{year}</a>)}</nav>
    <div className="grid gap-6 md:grid-cols-2">{years.map(year => {
      const docs = archive.documents.filter(d => d.year === year);
      const applications = [...new Set(docs.map(d => applicationName(d.application)))];
      return <Link key={year} href={`/provas/${institution}/${year}`} id={`ano-${year}`} className="gb-content-card scroll-mt-24">
        <h2 className="text-2xl font-bold">{info.name} {year}</h2>
        <p>{docs.length} documentos · {applications.join(" e ")}</p>
        <p>{docs.some(d => d.kind === "relatorio-com-provas") ? "Inclui cadernos nos anexos do relatório oficial." : docs.some(d => d.kind === "relatorio-com-questoes") ? "Questões e análises no relatório oficial da Vunesp." : "Cadernos, fases e arquivos de respostas disponíveis."}</p>
        <span className="gb-text-link">Escolher caderno e abrir prova ↗</span>
      </Link>;
    })}</div>
    <section className="mt-10 rounded-lg border border-n2 p-6">
      <h2 className="gb-section-title">Cobertura do acervo</h2>
      <p className="mt-4 text-n5">Conferência em {archive.checkedAt.split("-").reverse().join("/")}. Somente arquivos PDF efetivamente acessados e verificados entram na lista. Este levantamento não comprova que todas as edições históricas, fases e versões estejam disponíveis.</p>
      {!!archive.unavailable.length && <p className="mt-3 text-n5">{archive.unavailable.length} arquivos encontrados na fonte aguardam acesso ou verificação.</p>}
      {!!archive.discoveryErrors.length && <p className="mt-3 text-n5">Algumas páginas oficiais não puderam ser consultadas. A cobertura desses anos está pendente.</p>}
      <a href={info.source} target="_blank" rel="noopener noreferrer" className="gb-text-link mt-4 inline-block">Consultar o acervo da instituição ↗</a>
    </section>
  </main>;
}

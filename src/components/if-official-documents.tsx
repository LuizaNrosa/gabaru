import sources from "@/data/if-document-sources.json";

export function IfOfficialDocuments({ slug, included = [] }: { slug: string; included?: string[] }) {
  if (!(slug === "ifam" || slug === "ifrn" || slug === "ifmg")) return null;
  const { source, editions } = sources[slug];
  const remaining = editions.filter(({edition}) => !included.includes(slug + "-" + edition.replace("/", "-")));
  if (!remaining.length) return null;
  return (
    <section className="mt-10" aria-labelledby="if-documentos">
      <h2 id="if-documentos" className="gb-section-title">Provas e gabaritos em PDF</h2>
      <p className="mt-3 text-n5">Abra os documentos no portal do instituto. A conferência destas edições é manual.</p>
      {slug === "ifam" && (
        <p className="gb-notice mt-4">O portal do IFAM lista estas edições. A abertura dos arquivos individuais não pôde ser confirmada. Se um PDF não abrir, consulte a página do instituto abaixo.</p>
      )}
      <div className="gb-content-grid mt-6">
        {remaining.map(({ edition, exam, key, keyLabel }) => (
          <article key={edition} className="gb-content-card">
            <h3>{slug.toUpperCase()} · {edition}</h3>
            <a href={exam} target="_blank" rel="noopener noreferrer">Caderno oficial ↗ <span className="sr-only">em nova aba</span></a>
            <a href={key} target="_blank" rel="noopener noreferrer">{keyLabel} ↗ <span className="sr-only">em nova aba</span></a>
          </article>
        ))}
      </div>
      <a className="gb-text-link mt-6 inline-block" href={source} target="_blank" rel="noopener noreferrer">Consultar a página do instituto ↗ <span className="sr-only">em nova aba</span></a>
    </section>
  );
}

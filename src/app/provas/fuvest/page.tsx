import Link from "next/link";
import { CONTAINER, PageHero } from "@/components/ui";
import { metaPagina } from "@/lib/seo";

export const metadata = metaPagina({
  titulo: "FUVEST: provas e gabaritos por ano",
  descricao: "Encontre as páginas oficiais da FUVEST para as edições do vestibular da USP de 1977 a 2026.",
  caminho: "/provas/fuvest",
});

// Páginas de edição listadas no acervo oficial da FUVEST, conferidas em 11/11/2026.
const edicoes = [
  { ano: 2026, url: "https://www.fuvest.br/acervo-vestibular-2026/" },
  { ano: 2025, url: "https://www.fuvest.br/acervo-vestibular-2025" },
  { ano: 2024, url: "https://www.fuvest.br/acervo-vestibular-2024" },
  { ano: 2023, url: "https://www.fuvest.br/acervo-vestibular-2023" },
  { ano: 2022, url: "https://www.fuvest.br/acervo-vestibular-2022" },
  { ano: 2021, url: "https://www.fuvest.br/acervo-vestibular-2021" },
  { ano: 2020, url: "https://www.fuvest.br/acervo-vestibular-2020" },
  { ano: 2019, url: "https://www.fuvest.br/acervo-vestibular-2019" },
  { ano: 2018, url: "https://www.fuvest.br/acervo-vestibular-2018" },
  { ano: 2017, url: "https://www.fuvest.br/acervo-vestibular-2017" },
  { ano: 2016, url: "https://www.fuvest.br/acervo-vestibular-2016" },
  { ano: 2015, url: "https://www.fuvest.br/acervo-vestibular-2015" },
  { ano: 2014, url: "https://www.fuvest.br/acervo-vestibular-2014" },
  { ano: 2013, url: "https://www.fuvest.br/acervo-vestibular-2013" },
  { ano: 2012, url: "https://www.fuvest.br/acervo-vestibular-2012" },
  { ano: 2011, url: "https://www.fuvest.br/acervo-vestibular-2011" },
  { ano: 2010, url: "https://www.fuvest.br/acervo-vestibular-2010" },
  { ano: 2009, url: "https://www.fuvest.br/acervo-vestibular-2009" },
  { ano: 2008, url: "https://www.fuvest.br/acervo-vestibular-2008" },
  { ano: 2007, url: "https://www.fuvest.br/acervo-vestibular-2007" },
  { ano: 2006, url: "https://www.fuvest.br/acervo-vestibular-2006" },
  { ano: 2005, url: "https://www.fuvest.br/acervo-vestibular-2005" },
  { ano: 2004, url: "https://www.fuvest.br/acervo-vestibular-2004" },
  { ano: 2003, url: "https://www.fuvest.br/acervo-vestibular-2003" },
  { ano: 2002, url: "https://www.fuvest.br/acervo-vestibular-2002" },
  { ano: 2001, url: "https://www.fuvest.br/acervo-vestibular-2001" },
  { ano: 2000, url: "https://www.fuvest.br/acervo-vestibular-2000" },
  { ano: 1999, url: "https://www.fuvest.br/acervo-vestibular-1999" },
  { ano: 1998, url: "https://www.fuvest.br/acervo-vestibular-1998" },
  { ano: 1997, url: "https://www.fuvest.br/acervo-vestibular-1997" },
  { ano: 1996, url: "https://www.fuvest.br/acervo-vestibular-1996" },
  { ano: 1995, url: "https://www.fuvest.br/acervo-vestibular-1995" },
  { ano: 1994, url: "https://www.fuvest.br/acervo-vestibular-1994" },
  { ano: 1993, url: "https://www.fuvest.br/acervo-vestibular-1993" },
  { ano: 1992, url: "https://www.fuvest.br/acervo-vestibular-1992" },
  { ano: 1991, url: "https://www.fuvest.br/acervo-vestibular-1991" },
  { ano: 1990, url: "https://www.fuvest.br/acervo-vestibular-1990" },
  { ano: 1989, url: "https://www.fuvest.br/acervo-vestibular-1989" },
  { ano: 1988, url: "https://www.fuvest.br/acervo-vestibular-1988" },
  { ano: 1987, url: "https://www.fuvest.br/acervo-vestibular-1987" },
  { ano: 1986, url: "https://www.fuvest.br/acervo-vestibular-1986" },
  { ano: 1985, url: "https://www.fuvest.br/acervo-vestibular-1985" },
  { ano: 1984, url: "https://www.fuvest.br/acervo-vestibular-1984" },
  { ano: 1983, url: "https://www.fuvest.br/acervo-vestibular-1983" },
  { ano: 1982, url: "https://www.fuvest.br/acervo-vestibular-1982" },
  { ano: 1981, url: "https://www.fuvest.br/acervo-vestibular-1981" },
  { ano: 1980, url: "https://www.fuvest.br/acervo-vestibular-1980" },
  { ano: 1979, url: "https://www.fuvest.br/acervo-vestibular-1979" },
  { ano: 1978, url: "https://www.fuvest.br/acervo-vestibular-1978" },
  { ano: 1977, url: "https://www.fuvest.br/acervo-vestibular-1977" },
];
const documentos2026 = [
  { nome: "1ª fase · prova V4", url: "https://www.fuvest.br/wp-content/uploads/fuvest2026-fase1-prova-V4.pdf" },
  { nome: "1ª fase · gabaritos retificados", url: "https://www.fuvest.br/wp-content/uploads/fuvest2026-fase1-gabarito.pdf" },
  { nome: "2ª fase · 1º dia", url: "https://www.fuvest.br/wp-content/uploads/fuvest2026-fase2-dia1-prova.pdf" },
  { nome: "2ª fase · 1º dia · respostas esperadas", url: "https://www.fuvest.br/wp-content/uploads/fuvest2026-fase2-dia1-respostas-esperadas.pdf" },
  { nome: "2ª fase · 2º dia", url: "https://www.fuvest.br/wp-content/uploads/fuvest2026-fase2-dia2-prova.pdf" },
];

export default function FuvestPage() {
  return (
    <main>
      <PageHero eyebrow="Vestibulares · FUVEST" titulo={<>Uma edição de cada vez.<br /><mark>Provas da FUVEST.</mark></>}>
        <p>Encontre o vestibular da USP por ano e acesse os documentos disponibilizados pela FUVEST.</p>
      </PageHero>
      <section className={`${CONTAINER} py-10`} aria-labelledby="fuvest-2026">
        <p className="gb-eyebrow">EDIÇÃO EM DESTAQUE · FONTE OFICIAL</p>
        <h2 id="fuvest-2026" className="gb-section-title mt-3">FUVEST 2026</h2>
        <p className="mt-3 text-n5">Abra os documentos originais. O gabarito da primeira fase reúne versões diferentes: confira a versão indicada no caderno.</p>
        <div className="gb-content-grid mt-6">
          {documentos2026.map(doc => <a key={doc.url} href={doc.url} target="_blank" rel="noopener noreferrer" className="gb-content-card"><h3>{doc.nome}</h3><span className="gb-text-link">Abrir PDF oficial ↗<span className="sr-only"> em nova aba</span></span></a>)}
        </div>
      </section>
      <section className={`${CONTAINER} pb-12`} aria-labelledby="fuvest-edicoes">
        <h2 id="fuvest-edicoes" className="gb-section-title">Edições de 1977 a 2026</h2>
        <p className="gb-notice mt-5">Os botões abrem as páginas oficiais de cada ano. A disponibilidade de provas, fases, gabaritos e respostas varia conforme a edição. Estes documentos ainda não foram incorporados como questões ou simulados corrigidos no Gabaru.</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {edicoes.map(({ ano, url }) => <a key={ano} href={url} target="_blank" rel="noopener noreferrer" className="rounded-md border border-n2 bg-white/60 px-4 py-4 font-semibold hover:bg-gold-soft">FUVEST {ano} ↗<span className="sr-only">, abrir fonte oficial em nova aba</span></a>)}
        </div>
        <p className="mt-8 text-sm text-n5">Fontes consultadas em 11/11/2026. Os arquivos permanecem sujeitos à disponibilidade da FUVEST.</p>
        <Link href="/provas" className="gb-text-link mt-5 inline-block">← Voltar ao acervo de provas</Link>
      </section>
    </main>
  );
}

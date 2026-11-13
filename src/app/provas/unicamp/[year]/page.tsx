import unicampLote1 from "@/data/unicamp-lote1.json";
import { VestibularYearPage } from "@/components/vestibular-year-page";
import { archiveYears } from "@/lib/vestibular-archive";
import { metaPagina } from "@/lib/seo";
type Props = { params: Promise<{ year: string }> };
export function generateStaticParams() { return archiveYears("unicamp").map(year => ({ year: String(year) })); }
export async function generateMetadata({ params }: Props) { const { year } = await params; const temCorrecao = unicampLote1.some(p => p.ano === Number(year)); return metaPagina({ titulo: temCorrecao ? `Unicamp ${year}: prova e gabarito | Treine grátis` : `Unicamp ${year}: provas e arquivos de respostas`, descricao: temCorrecao ? `Treine com a prova da Unicamp ${year}, marque suas respostas e corrija pelo gabarito oficial. Acesso grátis no Gabaru.` : `Cadernos, gabaritos e respostas esperadas do Vestibular Unicamp ${year}, organizados por fase e aplicação.`, caminho: `/provas/unicamp/${year}` }); }
export default async function Page({ params }: Props) { return <VestibularYearPage institution="unicamp" year={(await params).year} />; }

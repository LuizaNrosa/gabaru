import { VestibularYearPage } from "@/components/vestibular-year-page";
import { archiveYears } from "@/lib/vestibular-archive";
import { metaPagina } from "@/lib/seo";
type Props = { params: Promise<{ year: string }> };
export function generateStaticParams() { return archiveYears("unicamp").map(year => ({ year: String(year) })); }
export async function generateMetadata({ params }: Props) { const { year } = await params; return metaPagina({ titulo: `Unicamp ${year}: provas e arquivos de respostas`, descricao: `Cadernos, gabaritos e respostas esperadas do Vestibular Unicamp ${year}, organizados por fase e aplicação.`, caminho: `/provas/unicamp/${year}` }); }
export default async function Page({ params }: Props) { return <VestibularYearPage institution="unicamp" year={(await params).year} />; }

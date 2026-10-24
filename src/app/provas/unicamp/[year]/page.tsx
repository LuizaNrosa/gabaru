import { VestibularYearPage } from "@/components/vestibular-year-page";
import { archiveYears } from "@/lib/vestibular-archive";
type Props = { params: Promise<{ year: string }> };
export function generateStaticParams() { return archiveYears("unicamp").map(year => ({ year: String(year) })); }
export async function generateMetadata({ params }: Props) { const { year } = await params; return { title: `Unicamp ${year}: provas e arquivos de respostas`, alternates: { canonical: `/provas/unicamp/${year}` } }; }
export default async function Page({ params }: Props) { return <VestibularYearPage institution="unicamp" year={(await params).year} />; }

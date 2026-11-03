import { VestibularYearPage } from "@/components/vestibular-year-page";
import { archiveYears } from "@/lib/vestibular-archive";
import { metaPagina } from "@/lib/seo";
type Props = { params: Promise<{ year: string }> };
export function generateStaticParams() { return archiveYears("unesp").map(year => ({ year: String(year) })); }
export async function generateMetadata({ params }: Props) { const { year } = await params; return metaPagina({ titulo: `UNESP ${year}: cadernos oficiais`, descricao: `Cadernos oficiais do Vestibular UNESP ${year}, com fases, arquivos de respostas e anexos da Vunesp.`, caminho: `/provas/unesp/${year}` }); }
export default async function Page({ params }: Props) { return <VestibularYearPage institution="unesp" year={(await params).year} />; }

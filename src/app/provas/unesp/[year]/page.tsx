import { VestibularYearPage } from "@/components/vestibular-year-page";
import { archiveYears } from "@/lib/vestibular-archive";
type Props = { params: Promise<{ year: string }> };
export function generateStaticParams() { return archiveYears("unesp").map(year => ({ year: String(year) })); }
export async function generateMetadata({ params }: Props) { const { year } = await params; return { title: `UNESP ${year}: cadernos oficiais`, alternates: { canonical: `/provas/unesp/${year}` } }; }
export default async function Page({ params }: Props) { return <VestibularYearPage institution="unesp" year={(await params).year} />; }

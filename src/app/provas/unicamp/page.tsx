import { VestibularArchivePage } from "@/components/vestibular-archive-page";
import { metaPagina } from "@/lib/seo";
export const metadata = metaPagina({ titulo: "Unicamp / Comvest: provas anteriores e gabaritos", descricao: "Acervo de cadernos originais, gabaritos e respostas esperadas do Vestibular Unicamp, organizado por ano.", caminho: "/provas/unicamp" });
export default function Page() { return <VestibularArchivePage institution="unicamp" />; }

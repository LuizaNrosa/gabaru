import { VestibularArchivePage } from "@/components/vestibular-archive-page";
import { metaPagina } from "@/lib/seo";
export const metadata = metaPagina({ titulo: "UNESP / Vunesp: provas anteriores e documentos oficiais", descricao: "Cadernos originais da UNESP, organizados por ano, com fases, arquivos de respostas e anexos oficiais da Vunesp.", caminho: "/provas/unesp" });
export default function Page() { return <VestibularArchivePage institution="unesp" />; }

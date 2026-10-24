import { VestibularArchivePage } from "@/components/vestibular-archive-page";
export const metadata = { title: "UNESP / Vunesp: provas anteriores e documentos oficiais", description: "Cadernos originais da UNESP, organizados por ano, com fases, arquivos de respostas e anexos oficiais da Vunesp.", alternates: { canonical: "/provas/unesp" } };
export default function Page() { return <VestibularArchivePage institution="unesp" />; }

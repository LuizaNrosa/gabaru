import { VestibularArchivePage } from "@/components/vestibular-archive-page";
export const metadata = { title: "Unicamp / Comvest: provas anteriores e gabaritos", description: "Acervo de cadernos originais, gabaritos e respostas esperadas do Vestibular Unicamp, organizado por ano.", alternates: { canonical: "/provas/unicamp" } };
export default function Page() { return <VestibularArchivePage institution="unicamp" />; }

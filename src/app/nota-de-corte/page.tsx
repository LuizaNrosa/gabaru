import type { Metadata } from "next";
import { SeletorNotaDeCorte } from "@/components/seletor-nota-de-corte";
import { metaPagina } from "@/lib/seo";

export const metadata: Metadata = metaPagina({
  titulo: "Minha nota dá para passar? Notas de corte | Gabaru",
  descricao: "Escolha sua prova e seu curso e compare sua pontuação com referências disponíveis de vestibulinhos, ENEM e vestibulares.",
  caminho: "/nota-de-corte",
});

export default function NotaDeCorte() {
  return <main className="gb-container py-10">
    <h1 className="gb-page-title">Minha nota <mark>dá para passar?</mark></h1>
    <div id="etec" className="mt-8"><SeletorNotaDeCorte /></div>
  </main>;
}

import type { Metadata } from "next";
import { TreinoApp } from "@/components/treino-app";
import { metaPagina } from "@/lib/seo";

export const metadata: Metadata = metaPagina({
  titulo: "Treino grátis: questões oficiais do ENEM",
  descricao:
    "Treine com questões oficiais do ENEM, escolhendo quantas quer fazer hoje e a disciplina. Sem cadastro para começar.",
  caminho: "/treino",
});

export default function Treino() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      <TreinoApp />
    </main>
  );
}

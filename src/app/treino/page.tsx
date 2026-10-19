import type { Metadata } from "next";
import { TreinoApp } from "@/components/treino-app";

export const metadata: Metadata = {
  title: "Treino grátis: questões oficiais do ENEM",
  description:
    "Treine com questões oficiais do ENEM, escolhendo quantas quer fazer hoje e a disciplina. Sem cadastro para começar.",
};

export default function Treino() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      <TreinoApp />
    </main>
  );
}

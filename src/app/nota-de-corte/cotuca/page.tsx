import type { Metadata } from "next";
import { NotaCorteCotucaTool } from "@/components/nota-corte-cotuca-tool";
import { metaPagina } from "@/lib/seo";

export const metadata: Metadata = metaPagina({ titulo: "COTUCA 2027: cursos, vagas e cálculo de nota", descricao: "Escolha seu curso e consulte as vagas do COTUCA 2027. Para cursos integrados, calcule uma projeção de nota com as regras oficiais.", caminho: "/nota-de-corte/cotuca" });

export default function NotaCorteCotucaPage() {
  return <main className="gb-container py-10"><p className="gb-eyebrow">VESTIBULINHO · COTUCA</p><h1 className="gb-page-title">Sua nota no <mark>COTUCA</mark></h1><p className="mt-5 max-w-2xl text-lg leading-relaxed text-n5">Escolha o curso e o turno para consultar as vagas do edital de 2027. Para o ensino técnico integrado, projete sua pontuação pela fórmula oficial.</p><p className="mt-3 max-w-2xl text-n5">Os cortes por curso e modalidade estão em coleta: a classificação de 2027 ainda não está disponível nesta consulta.</p><div className="mt-8"><NotaCorteCotucaTool /></div></main>;
}

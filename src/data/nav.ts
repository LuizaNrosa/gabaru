import { DISCIPLINAS } from "./disciplinas";
import { provasDa } from "./provas";

export type NavFilho = { label: string; href: string; nota?: string };
export type NavItem = { label: string; href: string; filhos?: NavFilho[] };

const discAtivas = DISCIPLINAS.filter((d) => d.status === "ativo");
const discBreve = DISCIPLINAS.filter((d) => d.status === "em-breve");

export const NAV: NavItem[] = [
  {
    label: "Pré-vestibulinho",
    href: "/pre-vestibulinho",
    filhos: provasDa("vestibulinho").map((p) => ({ label: p.nome, href: `/provas/${p.slug}`, nota: p.completo })),
  },
  {
    label: "Pré-vestibular",
    href: "/pre-vestibular",
    filhos: [
      { label: "ENEM · provas anteriores", href: "/provas/enem", nota: "Por ano e aplicação" },
      ...discAtivas.map((d) => ({ label: d.nome, href: `/disciplinas/${d.slug}`, nota: "Disponível" })),
      ...discBreve.slice(0, 4).map((d) => ({ label: d.nome, href: `/disciplinas/${d.slug}`, nota: "Em breve" })),
      ...provasDa("militar").map((p) => ({ label: p.nome, href: `/provas/${p.slug}`, nota: "Militares e ITA/IME" })),
    ],
  },
  { label: "ENEM", href: "/enem" },
  { label: "Treino grátis", href: "/treino" },
  {
    label: "Vestibulares paulistas",
    href: "/pre-vestibular#paulistas",
    filhos: provasDa("vestibular-paulista").map((p) => ({ label: p.nome, href: `/provas/${p.slug}`, nota: p.completo })),
  },
  { label: "Materiais gratuitos", href: "/materiais-gratuitos" },
  { label: "Concursos", href: "/concursos" },
];


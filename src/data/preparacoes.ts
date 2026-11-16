export const preparacoes = {
  etec: {
    titulo: "ETEC",
    detalhe: "Estudo voltado ao Vestibulinho das Escolas Técnicas Estaduais.",
    acervo: "/provas/etec",
    linkAcervo: "Resolver provas da ETEC",
  },
  ifs: {
    titulo: "Institutos Federais",
    detalhe: "Preparação para cursos técnicos, com indicação de quais institutos e processos seletivos estão cobertos.",
    acervo: "/institutos-federais",
    linkAcervo: "Encontrar meu Instituto Federal",
  },
  enem: {
    titulo: "ENEM",
    detalhe: "Trilha de estudo pelas quatro áreas do exame, com preparação para a redação.",
    acervo: "/provas/enem",
    linkAcervo: "Resolver provas do ENEM",
  },
  paulistas: {
    titulo: "Vestibulares paulistas",
    detalhe: "Uma preparação reunindo FUVEST, Unesp (Vunesp) e Unicamp (Comvest).",
    acervo: "/vestibulares-paulistas",
    linkAcervo: "Explorar vestibulares paulistas",
  },
} as const;

export type ObjetivoPreparacao = keyof typeof preparacoes;

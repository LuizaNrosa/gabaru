export type Categoria =
  | "vestibulinho"
  | "vestibular-paulista"
  | "enem"
  | "militar"
  | "concurso";

export type Prova = {
  slug: string;
  nome: string;
  completo: string;
  categoria: Categoria;
  resumo: string;
  /** Como a prova é montada. Confira sempre o edital vigente. */
  estrutura: string[];
  /** Slugs de disciplinas (ver disciplinas.ts). */
  disciplinas: string[];
  /** true: ainda mapeando o edital; a lista é de referência. */
  confirmar?: boolean;
};

export const CATEGORIAS: Record<Categoria, { nome: string; href: string }> = {
  vestibulinho: { nome: "Pré-vestibulinho", href: "/pre-vestibulinho" },
  "vestibular-paulista": {
    nome: "Vestibulares paulistas",
    href: "/pre-vestibular",
  },
  enem: { nome: "ENEM", href: "/enem" },
  militar: { nome: "ITA, IME e militares", href: "/pre-vestibular" },
  concurso: { nome: "Concursos", href: "/concursos" },
};

export const PROVAS: Prova[] = [
  {
    slug: "etec",
    nome: "ETEC",
    completo: "Vestibulinho das Etecs (Centro Paula Souza)",
    categoria: "vestibulinho",
    resumo:
      "Porta de entrada do ensino técnico e médio técnico no estado de São Paulo.",
    estrutura: [
      "Prova objetiva, de múltipla escolha.",
      "Língua Portuguesa: interpretação, gramática e vocabulário.",
      "Matemática: operações, geometria, equações, proporcionalidade e raciocínio lógico.",
      "Conhecimentos gerais: ciências humanas e da natureza.",
    ],
    disciplinas: [
      "portugues",
      "matematica",
      "historia",
      "geografia",
      "ciencias",
    ],
  },
  {
    slug: "coluni",
    nome: "COLUNI/UFV",
    completo: "Colégio de Aplicação da Universidade Federal de Viçosa",
    categoria: "vestibulinho",
    resumo: "Provas oficiais de 2016 a 2026 (11 edições), com cadernos integrais e gabaritos após recursos.",
    estrutura: [
      "Nas edições 2018 a 2026: 38 questões objetivas, com quatro alternativas, e produção textual.",
      "Nas edições 2016 e 2017: 48 questões objetivas no 1.º dia e prova discursiva no 2.º dia (caderno arquivado em cada edição).",
      "Língua Portuguesa, Matemática, Língua Inglesa, Ciências, Geografia e História.",
    ],
    disciplinas: [
      "portugues",
      "matematica",
      "ciencias",
      "historia",
      "geografia",
    ],
  },
  {
    slug: "ifsc",
    nome: "IFSC",
    completo: "Instituto Federal de Santa Catarina — Exame de Classificação",
    categoria: "vestibulinho",
    resumo: "Provas oficiais de 2017.1 a 2026.2 (18 cadernos, incluindo a prova própria do Câmpus Itajaí em 2024.1), com gabaritos definitivos após recursos.",
    estrutura: [
      "Nas edições atuais: 28 questões objetivas com 5 alternativas — Língua Portuguesa, Matemática, Geografia e História e Ciências, 7 de cada — em 4 horas de prova.",
      "Em 2024.1: 24 questões (Linguagens, Matemática e Ciências Humanas). Até 2023.2: 20 questões de Português e Matemática.",
      "Instituto misto: a maioria dos câmpus seleciona por prova; em algumas edições, câmpus específicos ofertam as vagas por sorteio público (indicado em cada edição). Cursos com inscritos em número menor ou igual ao de vagas não realizam prova.",
      "Classificação, nos editais atuais, pela ordem decrescente do número de acertos, por curso e modalidade de concorrência.",
    ],
    disciplinas: [
      "portugues",
      "matematica",
      "historia",
      "geografia",
      "ciencias",
    ],
  },
  {
    slug: "ifsp",
    nome: "IFSP",
    completo: "Instituto Federal de São Paulo — Processo Seletivo dos Cursos Técnicos Integrados",
    categoria: "vestibulinho",
    resumo: "Provas oficiais de 2022.1 a 2026.1 (10 cadernos: dois turnos ou tipos por ano), com gabaritos definitivos após recursos.",
    estrutura: [
      "30 questões objetivas: Língua Portuguesa (15) e Matemática (15), 1 ponto por questão, em 3 horas de prova.",
      "Até 2025.1: 4 alternativas por questão, em processo conjunto com os cursos concomitantes/subsequentes (Provas A e B, de turnos diferentes e com questões diferentes). Em 2026.1, com a Fundação CEFETMINAS: 5 alternativas e caderno próprio do Integrado (Tipos 1 e 2 — o mesmo conjunto, com as secções trocadas).",
      "Entre 2017 e 2021 não houve prova (seleção por análise de histórico escolar); a prova regressou em 2022.1.",
      "Classificação por curso, turno e câmpus, em ordem decrescente de acertos, com os desempates de cada edital.",
    ],
    disciplinas: [
      "portugues",
      "matematica",
    ],
  },
  {
    slug: "embraer",
    nome: "Embraer",
    completo: "Colégios Embraer",
    categoria: "vestibulinho",
    resumo:
      "Seleção para ingresso nos Colégios Embraer; requisitos conforme edital vigente.",
    estrutura: [
      "O formato muda a cada edital. Mapeamos antes de publicar o plano de estudo.",
    ],
    disciplinas: ["portugues", "matematica", "ciencias"],
    confirmar: true,
  },
  {
    slug: "if",
    nome: "Institutos Federais",
    completo: "IFSP e demais institutos federais (ensino médio técnico)",
    categoria: "vestibulinho",
    resumo:
      "Processos seletivos de cursos técnicos integrados ao ensino médio.",
    estrutura: [
      "O formato varia por instituto e por edital. Mapeamos antes de publicar o plano de estudo.",
    ],
    disciplinas: ["portugues", "matematica"],
    confirmar: true,
  },
  {
    slug: "fuvest",
    nome: "FUVEST",
    completo: "Vestibular da USP",
    categoria: "vestibular-paulista",
    resumo:
      "Duas fases. A primeira cobre todas as áreas; a segunda é discursiva.",
    estrutura: [
      "Primeira fase objetiva. Quantidade de questões e distribuição conforme o edital da edição.",
      "Disciplinas da 1ª fase: Arte, Biologia, Educação Física, Filosofia, Física, Geografia, História, Inglês, Matemática, Português, Química e Sociologia.",
      "2ª fase, dia 1: questões discursivas de Português e Redação.",
      "2ª fase, dia 2: questões discursivas de duas a quatro disciplinas da carreira escolhida.",
    ],
    disciplinas: [
      "matematica",
      "fisica",
      "quimica",
      "biologia",
      "portugues",
      "redacao",
      "ingles",
      "historia",
      "geografia",
      "filosofia",
      "sociologia",
    ],
  },
  {
    slug: "unicamp",
    nome: "UNICAMP",
    completo: "Vestibular da Unicamp (Comvest)",
    categoria: "vestibular-paulista",
    resumo:
      "Primeira fase de conhecimentos gerais e segunda fase discursiva por área.",
    estrutura: [
      "Primeira fase objetiva. Quantidade de questões e distribuição conforme o edital da edição.",
      "2ª fase, dia 1: Redação, Português e Literaturas e questões interdisciplinares.",
      "2ª fase, dia 2: Matemática e provas específicas por área (Exatas, Biológicas, Humanas).",
    ],
    disciplinas: [
      "matematica",
      "fisica",
      "quimica",
      "biologia",
      "portugues",
      "redacao",
      "ingles",
      "historia",
      "geografia",
      "filosofia",
      "sociologia",
    ],
  },
  {
    slug: "unesp",
    nome: "UNESP",
    completo: "Vestibular da Unesp (Vunesp)",
    categoria: "vestibular-paulista",
    resumo: "Primeira fase objetiva e segunda fase discursiva, com Redação.",
    estrutura: [
      "Primeira fase objetiva. Quantidade de questões e distribuição conforme o edital da edição.",
      "2ª fase, dia 1: conhecimentos específicos discursivos de Humanas, Natureza e Matemática.",
      "2ª fase, dia 2: questões discursivas de Linguagens e Redação.",
    ],
    disciplinas: [
      "matematica",
      "fisica",
      "quimica",
      "biologia",
      "portugues",
      "redacao",
      "ingles",
      "historia",
      "geografia",
    ],
  },
  {
    slug: "ita",
    nome: "ITA",
    completo: "Instituto Tecnológico de Aeronáutica",
    categoria: "militar",
    resumo:
      "Um dos vestibulares mais exigentes do país, com forte base em Matemática e Física.",
    estrutura: [
      "Provas de Matemática, Física, Química, Português e Inglês, e Redação. Confira o edital vigente.",
    ],
    disciplinas: [
      "matematica",
      "fisica",
      "quimica",
      "portugues",
      "ingles",
      "redacao",
    ],
    confirmar: true,
  },
  {
    slug: "ime",
    nome: "IME",
    completo: "Instituto Militar de Engenharia",
    categoria: "militar",
    resumo:
      "Seleção para engenharia militar, com provas discursivas de exatas.",
    estrutura: [
      "Provas de Matemática, Física, Química, Português, Inglês e Redação. Confira o edital vigente.",
    ],
    disciplinas: [
      "matematica",
      "fisica",
      "quimica",
      "portugues",
      "ingles",
      "redacao",
    ],
    confirmar: true,
  },
  {
    slug: "espcex",
    nome: "EsPCEx",
    completo: "Escola Preparatória de Cadetes do Exército",
    categoria: "militar",
    resumo: "Porta de entrada da carreira de oficial do Exército.",
    estrutura: [
      "Provas de Português, Redação, Inglês, Matemática, Física, Química, História e Geografia. Confira o edital vigente.",
    ],
    disciplinas: [
      "matematica",
      "fisica",
      "quimica",
      "portugues",
      "redacao",
      "ingles",
      "historia",
      "geografia",
    ],
    confirmar: true,
  },
  {
    slug: "eear",
    nome: "EEAR",
    completo: "Escola de Especialistas de Aeronáutica",
    categoria: "militar",
    resumo: "Formação de sargentos especialistas da Aeronáutica.",
    estrutura: [
      "Provas de Português, Matemática, Física e Inglês. Confira o edital vigente.",
    ],
    disciplinas: ["matematica", "fisica", "portugues", "ingles"],
    confirmar: true,
  },
];

export const provaPorSlug = (slug: string) =>
  PROVAS.find((p) => p.slug === slug);
export const provasDa = (c: Categoria) =>
  PROVAS.filter((p) => p.categoria === c);


export type StatusDisciplina = "ativo" | "em-breve";

export type Disciplina = {
  slug: string;
  nome: string;
  status: StatusDisciplina;
  resumo: string;
  topicos: string[];
};

/** Matemática e Física abrem o Gabaru. As demais já têm lugar na estrutura. */
export const DISCIPLINAS: Disciplina[] = [
  {
    slug: "matematica",
    nome: "Matemática",
    status: "ativo",
    resumo: "Da aritmética ao ensino médio completo, com questões ligadas às habilidades da Matriz do ENEM.",
    topicos: [
      "Aritmética, razão e proporção",
      "Álgebra e funções",
      "Geometria plana e espacial",
      "Trigonometria",
      "Estatística e probabilidade",
      "Análise combinatória",
    ],
  },
  {
    slug: "fisica",
    nome: "Física",
    status: "ativo",
    resumo: "Conceito primeiro, conta depois: mecânica, termologia, ondas e eletricidade.",
    topicos: [
      "Cinemática e dinâmica",
      "Energia, trabalho e potência",
      "Termologia e termodinâmica",
      "Óptica e ondulatória",
      "Eletricidade e magnetismo",
      "Gravitação e hidrostática",
    ],
  },
  {
    slug: "portugues",
    nome: "Português",
    status: "em-breve",
    resumo: "Interpretação de texto, gramática e literatura.",
    topicos: ["Interpretação de texto", "Gramática", "Literatura", "Gêneros textuais"],
  },
  {
    slug: "redacao",
    nome: "Redação",
    status: "em-breve",
    resumo: "Texto dissertativo-argumentativo e as competências cobradas nas provas.",
    topicos: ["Estrutura dissertativa", "Repertório", "Proposta de intervenção", "Coesão e coerência"],
  },
  {
    slug: "quimica",
    nome: "Química",
    status: "em-breve",
    resumo: "Química geral, físico-química e orgânica.",
    topicos: ["Estequiometria", "Soluções e equilíbrio", "Termoquímica", "Química orgânica"],
  },
  {
    slug: "biologia",
    nome: "Biologia",
    status: "em-breve",
    resumo: "Ecologia, genética, fisiologia e evolução.",
    topicos: ["Ecologia", "Genética", "Fisiologia humana", "Evolução"],
  },
  {
    slug: "historia",
    nome: "História",
    status: "em-breve",
    resumo: "História do Brasil e geral, com leitura de fontes.",
    topicos: ["Brasil Colônia, Império e República", "História geral", "Atualidades"],
  },
  {
    slug: "geografia",
    nome: "Geografia",
    status: "em-breve",
    resumo: "Geografia física, humana e geopolítica.",
    topicos: ["Cartografia", "Meio ambiente", "Geopolítica", "Urbanização e população"],
  },
  {
    slug: "ingles",
    nome: "Inglês",
    status: "em-breve",
    resumo: "Leitura e interpretação de textos em inglês.",
    topicos: ["Leitura instrumental", "Vocabulário", "Estruturas gramaticais"],
  },
  {
    slug: "filosofia",
    nome: "Filosofia",
    status: "em-breve",
    resumo: "Pensamento filosófico e ética, no formato das provas.",
    topicos: ["Filosofia antiga e moderna", "Ética e política", "Teoria do conhecimento"],
  },
  {
    slug: "sociologia",
    nome: "Sociologia",
    status: "em-breve",
    resumo: "Teoria social clássica e questões contemporâneas.",
    topicos: ["Clássicos da Sociologia", "Cultura e sociedade", "Trabalho e desigualdade"],
  },
  {
    slug: "ciencias",
    nome: "Ciências",
    status: "em-breve",
    resumo: "Ciências do ensino fundamental para os vestibulinhos.",
    topicos: ["Corpo humano", "Matéria e energia", "Meio ambiente"],
  },
  {
    slug: "raciocinio-logico",
    nome: "Raciocínio lógico",
    status: "em-breve",
    resumo: "Lógica e matemática básica para concursos.",
    topicos: ["Proposições", "Sequências", "Porcentagem e proporção", "Problemas de contagem"],
  },
];

export const disciplinaPorSlug = (slug: string) => DISCIPLINAS.find((d) => d.slug === slug);

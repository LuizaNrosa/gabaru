/**
 * Números e preços que aparecem no site. Uma fonte só: troque aqui, o site inteiro acompanha.
 *
 * ATENÇÃO: `oficiais`, `internacionais` e `passoAPasso` são metas de lançamento.
 * Antes de publicar, confira a contagem real em content/questoes/indice.json e
 * ajuste estes valores. Anúncio com número maior que o banco real é propaganda enganosa.
 */
export const BANCO = {
  oficiais: 20_000,
  internacionais: 10_000,
  passoAPasso: 5_000,
};

export type Plano = {
  slug: "basico" | "elite";
  nome: string;
  parcelas: number;
  valorParcela: string;
  destaque?: boolean;
  aulas?: number;
  itens: string[];
};

export const PLANOS: Plano[] = [
  {
    slug: "basico",
    nome: "Básico",
    parcelas: 12,
    valorParcela: "R$ 40",
    itens: [
      "Banco de questões oficiais resolvidas",
      "Cronograma de estudo individualizado",
      "Mapa de habilidades da sua prova",
      "Revisão automática dos erros",
    ],
  },
  {
    slug: "elite",
    nome: "Elite",
    parcelas: 12,
    valorParcela: "R$ 52",
    destaque: true,
    aulas: 300,
    itens: [
      "Tudo do plano Básico",
      "300 aulas focadas na sua prova",
      "Questões resolvidas passo a passo",
      "Banco internacional para ITA, IME e militares",
    ],
  },
];

/** "20 mil", "10 mil", etc. para usar em texto. */
export function mil(n: number): string {
  return `${Math.round(n / 1000)} mil`;
}

/**
 * Oferta de lançamento do vestibulinho: primeiros alunos com desconto.
 * PROPOSTA. Confirmar percentuais e vagas antes de abrir as vendas.
 * Não há contador de vagas restantes: sem banco de vendas, o número seria inventado.
 */
export const OFERTA_VESTIBULINHO = {
  vagas: 50,
  mensalidade: 40, // valor cheio, em 12 parcelas
  parcelas: 12,
  descontoPrimeiros: 50, // % sobre a mensalidade, só para as primeiras vagas
  descontoPix: 10, // % à vista no Pix, sobre o total
};

export function valoresOferta() {
  const o = OFERTA_VESTIBULINHO;
  const parcelaOferta = o.mensalidade * (1 - o.descontoPrimeiros / 100);
  const totalCheio = o.mensalidade * o.parcelas;
  const totalOferta = parcelaOferta * o.parcelas;
  const pixOferta = totalOferta * (1 - o.descontoPix / 100);
  return {
    parcelaOferta: Math.round(parcelaOferta),
    parcelaCheia: o.mensalidade,
    parcelas: o.parcelas,
    pixOferta: Math.round(pixOferta),
    totalCheio,
    descontoPrimeiros: o.descontoPrimeiros,
    descontoPix: o.descontoPix,
  };
}

export type Universidade = { slug: string; nome: string; cidade: string; arquivo: string };

/**
 * Fotos ficam em public/universidades/<arquivo>. Enquanto o arquivo não existir,
 * o cartão mostra o fundo de tinta. Use só imagens com licença que permita uso
 * comercial (ver docs/FOTOS.md).
 */
export const UNIVERSIDADES: Universidade[] = [
  { slug: "usp", nome: "USP", cidade: "São Paulo", arquivo: "/universidades/usp.jpg" },
  { slug: "unicamp", nome: "Unicamp", cidade: "Campinas", arquivo: "/universidades/unicamp.jpg" },
  { slug: "unesp", nome: "Unesp", cidade: "Estado de São Paulo", arquivo: "/universidades/unesp.jpg" },
  { slug: "federal", nome: "Universidades federais", cidade: "Todo o Brasil", arquivo: "/universidades/federal.jpg" },
];

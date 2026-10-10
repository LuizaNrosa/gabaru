export type Universidade = { slug: string; nome: string; cidade: string; arquivo: string; href: string };

/**
 * Fotos ficam em public/universidades/<arquivo>. Enquanto o arquivo não existir,
 * o cartão mostra o fundo de tinta. Use só imagens com licença que permita uso
 * comercial (ver docs/FOTOS.md).
 */
export const UNIVERSIDADES: Universidade[] = [
  { slug: "usp", nome: "USP", cidade: "São Paulo", arquivo: "/universidades/usp.jpg", href: "/provas/fuvest" },
  { slug: "unicamp", nome: "Unicamp", cidade: "Campinas", arquivo: "/universidades/unicamp.jpg", href: "/provas/unicamp" },
  { slug: "unesp", nome: "Unesp", cidade: "Estado de São Paulo", arquivo: "/universidades/unesp.jpg", href: "/provas/unesp" },
  { slug: "federal", nome: "Universidades federais", cidade: "Todo o Brasil", arquivo: "/universidades/federal.jpg", href: "/pre-vestibular" },
];

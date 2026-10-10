export type QuestaoGratis = { id: string; ano: number; dia: number; numero: number; tema: string; img: string };

/** 12 questões oficiais do ENEM (Matemática, 2020 a 2025). Gabarito oficial ainda pendente. */
export const QUESTOES_GRATIS: QuestaoGratis[] = [
  {"id": "enem-2025-d2-q136", "ano": 2025, "dia": 2, "numero": 136, "tema": "Unidade padrão do SI para passos em tirinha", "img": "/questoes/enem-2025-d2-q136.webp"},
  {"id": "enem-2025-d2-q137", "ano": 2025, "dia": 2, "numero": 137, "tema": "Razão entre raios de cilindros com mesma área lateral", "img": "/questoes/enem-2025-d2-q137.webp"},
  {"id": "enem-2024-d2-q136", "ano": 2024, "dia": 2, "numero": 136, "tema": "Leitura de gráfico radar de distâncias interpessoais", "img": "/questoes/enem-2024-d2-q136.webp"},
  {"id": "enem-2024-d2-q137", "ano": 2024, "dia": 2, "numero": 137, "tema": "Compra de apartamentos com acréscimos percentuais e maior lucro", "img": "/questoes/enem-2024-d2-q137.webp"},
  {"id": "enem-2023-d2-q136", "ano": 2023, "dia": 2, "numero": 136, "tema": "Massa de escultura em tronco de cone perfurado", "img": "/questoes/enem-2023-d2-q136.webp"},
  {"id": "enem-2023-d2-q137", "ano": 2023, "dia": 2, "numero": 137, "tema": "Média ponderada de salários por setor", "img": "/questoes/enem-2023-d2-q137.webp"},
  {"id": "enem-2022-d2-q136", "ano": 2022, "dia": 2, "numero": 136, "tema": "Comparação de capacidade entre prisma hexagonal e cilindro", "img": "/questoes/enem-2022-d2-q136.webp"},
  {"id": "enem-2022-d2-q136", "ano": 2022, "dia": 2, "numero": 136, "tema": "Esperança de vida em 2014 pela média de anos vizinhos", "img": "/questoes/enem-2022-d2-q136.webp"},
  {"id": "enem-2021-d2-q136", "ano": 2021, "dia": 2, "numero": 136, "tema": "Numeração romana e anos de fundação da cidade", "img": "/questoes/enem-2021-d2-q136.webp"},
  {"id": "enem-2021-d2-q137", "ano": 2021, "dia": 2, "numero": 137, "tema": "Adição de números na base binária", "img": "/questoes/enem-2021-d2-q137.webp"},
  {"id": "enem-2020-d2-q136", "ano": 2020, "dia": 2, "numero": 136, "tema": "Anagramas com bloco fixo de letras", "img": "/questoes/enem-2020-d2-q136.webp"},
  {"id": "enem-2020-d2-q137", "ano": 2020, "dia": 2, "numero": 137, "tema": "Área habitacional de edifício com recuos no lote", "img": "/questoes/enem-2020-d2-q137.webp"},
];

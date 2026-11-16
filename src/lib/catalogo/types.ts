export type Categoria = 'enem' | 'vestibulinho' | 'vestibulares';
export type Alternativa = { letra: string; texto: string };
export type Questao = {
  id: string; slug: string; banca: string; ano: number; edicao: string; numero: number;
  area: string; disciplina: string; assunto: string; tema: string;
  dificuldade: 'nao-classificada' | 'facil' | 'media' | 'dificil';
  textoBase?: { texto: string; fonte: string; idioma?: 'pt-BR' | 'en' | 'es' };
  enunciado: string; imagens: { src: string; alt: string; caption: string }[];
  alternativas: Alternativa[]; anulada: boolean; correta: string | null; comentarioResolucao: string[];
  statusPublicacao: 'completa' | 'rascunho'; fonte: string;
  idioma?: 'pt-BR' | 'en' | 'es'; atualizadaEm?: string;
};
export type Caderno = {
  id: string; banca: string; ano: number; titulo: string; href: string; fonte: string;
  questoes: string[]; total: number; duracaoMinutos: number | null;
  statusPublicacao: 'completa' | 'rascunho';
};
export type Banca = { slug: string; sigla: string; nome: string; estado: string; categoria: Categoria;
  periodicidade: string; descricao: string; fonte: string; duracaoMinutos: number | null };
export type Catalogo = { bancas: Banca[]; cadernos: Caderno[]; questoes: Questao[];
  inventario: { fontes: { arquivo: string; registros: number }[]; anos: number[]; gabaritoSeco: number; comentadas: number; completas: number } };

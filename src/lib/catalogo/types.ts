export type TierPublicacao='tier-0-quarentena'|'tier-1-gabarito-oficial'|'tier-2-completa';
export type NivelQualidade='nivel-0-quarentena'|'nivel-1-gabarito-oficial'|'nivel-2-resolucao-comentada';
export type Categoria = 'enem' | 'vestibulinho' | 'vestibulares';
export type Alternativa = { letra: string; texto: string };
export type Questao = {
  statusQuestao?:'regular'|'anulada'; quantidadeAlternativas?:number;
  tier?: TierPublicacao; youtubeVideoId?:string; youtubeStartSec?:number;
  nivelQualidade: NivelQualidade; motivos: string[]; categoria: Categoria;
  tabelas?: {linhas:(string|null)[][];pagina:number}[];
  resolucaoEstruturada?: {alternativaCorreta:string;conceito:string;passos:string[];distratores:Record<string,string>;grafico?:{funcao:string;pontos:[number,number][]}};
  id: string; slug: string; banca: string; ano: number; edicao: string; numero: number;
  habilidade?:string; area: string; disciplina: string; assunto: string; tema: string;
  dificuldade: 'nao-classificada' | 'facil' | 'media' | 'dificil';
  textoBase?: { texto: string; fonte: string; idioma?: 'pt-BR' | 'en' | 'es' };
  enunciado: string; imagens: { src: string; alt: string; caption: string; width:number; height:number }[];
  alternativas: Alternativa[]; anulada: boolean; correta: string | null; comentarioResolucao: string[];
  statusPublicacao: 'completa' | 'rascunho'; fonte: string;
  idioma?: 'pt-BR' | 'en' | 'es'; atualizadaEm?: string;
};
export type Caderno = {
  percentualValidado?:number; nivelQualidade:NivelQualidade; motivos:string[];
  id: string; banca: string; ano: number; titulo: string; href: string; fonte: string;
  questoes: string[]; total: number; duracaoMinutos: number | null;
  statusPublicacao: 'completa' | 'rascunho';
};
export type Banca = { slug: string; sigla: string; nome: string; estado: string; categoria: Categoria;
  periodicidade: string; descricao: string; fonte: string; duracaoMinutos: number | null };
export type Catalogo = { bancas: Banca[]; cadernos: Caderno[]; questoes: Questao[];
  inventario: { fontes: { arquivo: string; registros: number }[]; anos: number[]; gabaritoSeco: number; comentadas: number; completas: number } };

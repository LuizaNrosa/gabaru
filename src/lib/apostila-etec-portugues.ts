import 'server-only';
import conteudo from '@/data/apostila-etec-portugues.json';
import ciencias from '@/data/apostila-etec-ciencias.json';
import matematica from '@/data/apostila-etec-matematica.json';
import historia from '@/data/apostila-etec-historia.json';
import geografia from '@/data/apostila-etec-geografia.json';

export type FiguraApostila = { src: string; alt: string; largura: number; altura: number; legenda?: string };

export type ExemploPortugues = {
  figura?: FiguraApostila;
  suporte: string[];
  comando: string;
  alternativas: string[];
  passos: string[];
  correta: string;
  distratores: string[];
};

type QuestaoComentada = {
  id: string;
  correta: string;
  justificativa: string;
  topicoComplementar?: string;
  distratores: string[];
};

export type CapituloPortugues = {
  materia?: string;
  introducao: string;
  codigos: string[];
  raioX: string;
  intuicao: string[];
  teoria: { titulo: string; texto: string; figura?: FiguraApostila }[];
  armadilha: string;
  exemplos: ExemploPortugues[];
  /** Exercícios de fixação de autoria Gabaru, com gabarito comentado. */
  fixacao?: ExemploPortugues[];
  oficiais: QuestaoComentada[];
  resumo: string[];
};

export const capitulosPortugues: Record<string, CapituloPortugues> = { ...conteudo, ...ciencias, ...matematica, ...historia, ...geografia };
export const apostilaEtecSlug = 'vestibulinho-etec';

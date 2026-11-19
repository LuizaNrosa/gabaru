import 'server-only';
import conteudo from '@/data/apostila-etec-portugues.json';

export type ExemploPortugues = {
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
  teoria: { titulo: string; texto: string }[];
  armadilha: string;
  exemplos: ExemploPortugues[];
  oficiais: QuestaoComentada[];
  resumo: string[];
};

export const capitulosPortugues: Record<string, CapituloPortugues> = conteudo;
export const apostilaEtecSlug = 'vestibulinho-etec';

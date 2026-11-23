import 'server-only';
import {questionMetaSchema} from './schema';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Catalogo } from './types';
export const catalogo = JSON.parse(readFileSync(join(process.cwd(), 'src/data/catalogo-v2.json'), 'utf8')) as Catalogo;
questionMetaSchema.array().parse(catalogo.questoes);
export const questoesIndexaveis=catalogo.questoes.filter(q=>q.nivelQualidade!=='nivel-0-quarentena');
export const questoesPublicadas = catalogo.questoes.filter(q => q.nivelQualidade === 'nivel-2-resolucao-comentada');
export const questaoPorSlug = new Map(catalogo.questoes.map(q => [q.slug, q]));
export function nomeTaxonomia(slug: string) {
  const nomes: Record<string,string> = { matematica:'Matemática', ciencias:'Ciências', artes:'Artes', redacao:'Redação', interdisciplinar:'Interdisciplinar', portugues:'Português', fisica:'Física', quimica:'Química', biologia:'Biologia', historia:'História', geografia:'Geografia', ingles:'Inglês', espanhol:'Espanhol', literatura:'Literatura', filosofia:'Filosofia', sociologia:'Sociologia', atualidades:'Atualidades', 'a-classificar':'Classificação pendente', 'razao-proporcao-e-unidades':'Razão, proporção e unidades', 'nao-classificada':'Não classificada', 'sequencias-pa-pg':'Sequências (PA e PG)', 'interdisciplinar-ciencias-natureza':'Interdisciplinar: Ciências da Natureza', 'energia-fontes-e-meio-ambiente':'Energia, fontes e meio ambiente', 'energia-trabalho-e-potencia':'Energia, trabalho e potência', 'grandezas-medidas-e-escalas':'Grandezas, medidas e escalas', 'geografia-fisica-clima-relevo-hidrografia':'Geografia física: clima, relevo e hidrografia', 'historia-cultura-e-sociedade':'História, cultura e sociedade', 'mecanica-cinematica':'Mecânica: cinemática', 'mecanica-dinamica-e-estatica':'Mecânica: dinâmica e estática', 'geografia-do-brasil-urbana-e-agraria':'Geografia do Brasil urbana e agrária', 'estatistica-tabelas-e-graficos':'Estatística, tabelas e gráficos', 'conjuntos-numeros-e-divisibilidade':'Conjuntos, números e divisibilidade', 'algebra-equacoes-e-inequacoes':'Álgebra: equações e inequações', 'aritmetica-razao-proporcao':'Aritmética: razão e proporção' };
  const nome = nomes[slug] ?? slug.split('-').map(p => ACENTOS[p] ?? p).join(' ');
  return nome.replace(/^./, c => c.toUpperCase());
}

/** Palavras dos slugs de assunto sem acento -> forma correta (títulos, H1 e descrições). */
const ACENTOS: Record<string,string> = {
  algebra:'álgebra', analise:'análise', analitica:'analítica', aritmetica:'aritmética', atlantico:'Atlântico', atomica:'atômica',
  bioquimica:'bioquímica', botanica:'botânica', brasil:'Brasil', calculos:'cálculos', ciencia:'ciência', ciencias:'ciências',
  cinematica:'cinemática', cinetica:'cinética', colonia:'Colônia', comunicacao:'comunicação', compreensao:'compreensão',
  contemporanea:'contemporânea', danca:'dança', dinamica:'dinâmica', eletroquimica:'eletroquímica', equacoes:'equações',
  equilibrio:'equilíbrio', escravidao:'escravidão', estatica:'estática', estatistica:'estatística', etica:'ética',
  evolucao:'evolução', expansao:'expansão', fisica:'física', funcoes:'funções', generos:'gêneros', genetica:'genética',
  geopolitica:'geopolítica', globalizacao:'globalização', graficos:'gráficos', gravitacao:'gravitação', hidrostatica:'hidrostática',
  historia:'história', imperio:'Império', industria:'indústria', ingles:'inglês', inequacoes:'inequações', inorganicas:'inorgânicas',
  interpretacao:'interpretação', ligacoes:'ligações', linguistica:'linguística', gramatica:'gramática', literarias:'literárias',
  logico:'lógico', maritima:'marítima', matematica:'matemática', materia:'matéria', mecanica:'mecânica', musica:'música',
  neutralizacao:'neutralização', numeros:'números', ondulatoria:'ondulatória', optica:'óptica', organica:'orgânica',
  periodica:'periódica', politica:'política', populacao:'população', proporcao:'proporção', quimica:'química', quimicos:'químicos',
  raciocinio:'raciocínio', razao:'razão', reacoes:'reações', republica:'República', saude:'saúde', sequencias:'sequências',
  solucoes:'soluções', substancias:'substâncias', termoquimica:'termoquímica', urbanizacao:'urbanização', variacao:'variação', reproducao:'reprodução', potencia:'potência', agraria:'agrária', violencia:'violência', termodinamica:'termodinâmica',
};

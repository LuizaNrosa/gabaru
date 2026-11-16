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
  const nomes: Record<string,string> = { matematica:'Matemática', ciencias:'Ciências', artes:'Artes', redacao:'Redação', interdisciplinar:'Interdisciplinar', portugues:'Português', fisica:'Física', quimica:'Química', biologia:'Biologia', historia:'História', geografia:'Geografia', ingles:'Inglês', espanhol:'Espanhol', literatura:'Literatura', filosofia:'Filosofia', sociologia:'Sociologia', atualidades:'Atualidades', 'a-classificar':'Classificação pendente', 'razao-proporcao-e-unidades':'Razão, proporção e unidades', 'nao-classificada':'Não classificada' };
  return nomes[slug] ?? slug.replaceAll('-', ' ').replace(/^./, c => c.toUpperCase());
}

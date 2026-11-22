// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import 'server-only';
import {createHash} from 'node:crypto';
import {adminDb} from '@/lib/firebase/admin';
import indice from '../../content/apostilas/matematica-etec/indice.json';

/**
 * Apostila de Matemática ETEC (13 capítulos). O HTML de cada capítulo é gerado fora do repositório
 * (matematica-final/site/exportar_site.py, mesmos .md e figuras SVG do PDF). Só o indice.json, público
 * (página de venda), fica no Git; o corpo vem do Firestore depois do controle de acesso.
 */
export type CapituloMatematica = (typeof indice.capitulos)[number];

export const apostilaMatematica = {
  slug: 'matematica-etec',
  produto: 'apostila-matematica-etec' as const,
  capitulos: indice.capitulos as CapituloMatematica[],
  /** Capítulo liberado como amostra para contas cadastradas. */
  amostra: 1,
};

export function totaisApostila() {
  const c = apostilaMatematica.capitulos;
  const soma = (k: 'figuras' | 'questoes' | 'fixacao' | 'exemplos' | 'minutos' | 'questoesEtec') => c.reduce((n, x) => n + x[k], 0);
  return {capitulos: c.length, figuras: soma('figuras'), questoes: soma('questoes'), fixacao: soma('fixacao'),
    exemplos: soma('exemplos'), minutos: soma('minutos'), questoesEtec: soma('questoesEtec')};
}

export function capituloPorSlug(slug: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return undefined;
  return apostilaMatematica.capitulos.find(c => c.slug === slug);
}

const cache = new Map<string, string>();
/**
 * Corpo do capítulo. O repositório é público, então o HTML pago fica no Firestore (coleção apostilas_conteudo,
 * fechada para o cliente), enviado por scripts/publicar-apostila-matematica.mjs. O sha256 do indice.json garante
 * que o texto publicado é exatamente o validado. HTML confiável: gerado por nós, sem entrada de usuário.
 */
export async function htmlCapitulo(capitulo: CapituloMatematica): Promise<string | null> {
  const id = `matematica-etec__${String(capitulo.numero).padStart(2, '0')}`;
  const pronto = cache.get(id);
  if (pronto) return pronto;
  try {
    const doc = (await (await adminDb()).collection('apostilas_conteudo').doc(id).get()).data();
    const html = typeof doc?.html === 'string' ? doc.html : null;
    if (!html || createHash('sha256').update(html).digest('hex') !== capitulo.sha256) return null;
    cache.set(id, html);
    return html;
  } catch {
    return null;
  }
}

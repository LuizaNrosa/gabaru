import { catalogo,questoesPublicadas } from '@/lib/catalogo';
import { ORIGIN } from './schema-graph';
import { chunks,serializeSitemap,serializeIndex,type SitemapEntry } from './sitemap-stream';
export const sitemapNames=['sitemap-hubs.xml','sitemap-provas.xml','sitemap-disciplinas.xml','sitemap-questoes.xml'] as const;
export type SitemapName=typeof sitemapNames[number];
export function sitemapEntries(name:SitemapName):SitemapEntry[]{
 if(name==='sitemap-hubs.xml')return [{path:'/'},{path:'/sobre'},{path:'/enem'},{path:'/vestibulinho'},{path:'/vestibulares'},{path:'/questoes'},...catalogo.bancas.filter(b=>catalogo.cadernos.some(e=>e.banca===b.slug)).map(b=>({path:`/banca/${b.slug}`}))];
 if(name==='sitemap-provas.xml')return [...new Set(catalogo.cadernos.filter(e=>e.nivelQualidade!=='nivel-0-rascunho').map(e=>e.href))].map(path=>({path,priority:0.8}));
 if(name==='sitemap-disciplinas.xml')return [...new Set(questoesPublicadas.map(q=>`/disciplina/${q.disciplina}`)),...new Set(questoesPublicadas.map(q=>`/assunto/${q.assunto}`))].map(path=>({path}));
 return questoesPublicadas.map(q=>({path:`/questoes/${q.slug}`,priority:1,...(q.atualizadaEm?{updated:q.atualizadaEm}:{})}));
}
export function partPath(name:SitemapName,part:number){return part===1?'/'+name:`/sitemaps/${name.replace('sitemap-','').replace('.xml','')}/${part}.xml`;}
export async function sitemapXml(name:SitemapName,part=1){const groups=chunks(sitemapEntries(name));if(part<1||part>Math.max(1,groups.length))throw new Error('Parte inexistente');return serializeSitemap(groups[part-1]??[],ORIGIN);}
export async function sitemapIndexXml(){return serializeIndex(sitemapNames.flatMap(n=>chunks(sitemapEntries(n)).map((_,i)=>ORIGIN+partPath(n,i+1))));}

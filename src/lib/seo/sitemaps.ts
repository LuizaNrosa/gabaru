import { catalogo,questoesPublicadas } from '@/lib/catalogo';
import { ORIGIN } from './schema-graph';
export const sitemapNames=['sitemap-hubs.xml','sitemap-provas.xml','sitemap-disciplinas.xml','sitemap-questoes.xml'] as const;
export type SitemapName=typeof sitemapNames[number];
type Entry={path:string;updated?:string};
export function sitemapEntries(name:SitemapName):Entry[]{
 if(name==='sitemap-hubs.xml')return [{path:'/'},{path:'/sobre'},{path:'/enem'},{path:'/vestibulinho'},{path:'/vestibulares'},{path:'/questoes'},...catalogo.bancas.filter(b=>catalogo.cadernos.some(e=>e.banca===b.slug)).map(b=>({path:`/banca/${b.slug}`}))];
 if(name==='sitemap-provas.xml')return [...new Set(catalogo.cadernos.filter(e=>e.statusPublicacao==='completa').map(e=>e.href))].map(path=>({path}));
 if(name==='sitemap-disciplinas.xml')return [...new Set(questoesPublicadas.map(q=>`/disciplina/${q.disciplina}`)),...new Set(questoesPublicadas.map(q=>`/assunto/${q.assunto}`))].map(path=>({path}));
 return questoesPublicadas.map(q=>({path:`/questoes/${q.slug}`,...(q.atualizadaEm?{updated:q.atualizadaEm}:{})}));
}
export function escapeXml(value:string){return value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');}
export function sitemapXml(name:SitemapName){return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapEntries(name).map(e=>`<url><loc>${escapeXml(ORIGIN+e.path)}</loc>${e.updated?`<lastmod>${escapeXml(e.updated)}</lastmod>`:''}</url>`).join('')}</urlset>`;}
export function sitemapIndexXml(){return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapNames.filter(n=>sitemapEntries(n).length>0).map(n=>`<sitemap><loc>${ORIGIN}/${n}</loc></sitemap>`).join('')}</sitemapindex>`;}

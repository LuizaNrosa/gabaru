import { sitemapXml } from '@/lib/seo/sitemaps';
export const dynamic='force-static';
export function GET(){return new Response(sitemapXml('sitemap-disciplinas.xml'),{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=3600'}});}

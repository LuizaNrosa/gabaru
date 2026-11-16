import { sitemapXml } from '@/lib/seo/sitemaps';
export const dynamic='force-static';
export async function GET(){return new Response(await sitemapXml('sitemap-provas.xml'),{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=3600'}});}

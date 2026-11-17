import test from 'node:test';import assert from 'node:assert/strict';
import {getServerSideSitemap,getServerSideSitemapIndex} from 'next-sitemap';
import {partUrls} from '../scripts/lib/catalogo-seo.mjs';
test('next-sitemap serializa campos ISO e índice sem alias duplicado',async()=>{
 const xml=await(await getServerSideSitemap([{loc:'https://gabaru.com.br/questoes/teste',lastmod:'2026-11-17T00:00:00.000Z',changefreq:'monthly',priority:0.8}])).text();
 assert.match(xml,/<lastmod>2026-11-17T00:00:00.000Z<\/lastmod>/);assert.match(xml,/<priority>0.8<\/priority>/);
 const parts=partUrls('questoes',4501);assert.equal(parts.length,3);assert.ok(!parts.some(p=>p.includes('/sitemaps/questoes/1')));
 const index=await(await getServerSideSitemapIndex(parts.map(p=>'https://gabaru.com.br'+p))).text();assert.equal((index.match(/<sitemap>/g)??[]).length,3);
});

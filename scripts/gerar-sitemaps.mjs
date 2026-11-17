import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {FAMILIES,partUrls} from './lib/catalogo-seo.mjs';
const manifest=JSON.parse(fs.readFileSync('src/data/seo-publico.json','utf8'));
for(const file of fs.readdirSync('public'))if(/^sitemap.*\.xml$/.test(file)||file==='robots.txt')fs.rmSync('public/'+file);
for(const kind of [...FAMILIES,'index']){
 const result=spawnSync(process.execPath,['node_modules/next-sitemap/bin/next-sitemap.mjs','--config','next-sitemap.config.js'],{env:{...process.env,GABARU_SITEMAP_KIND:kind},stdio:'inherit'});
 if(result.status!==0)throw new Error(`next-sitemap falhou: ${kind}`);
}
const unique=new Set();
for(const kind of FAMILIES)for(const path of partUrls(kind,manifest.families[kind].length)){
 const xml=fs.readFileSync('public'+path,'utf8'),blocks=[...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)];
 if(!blocks.length||blocks.length>2000)throw new Error('Parte vazia ou excedida: '+path);
 for(const [,block] of blocks){const loc=/<loc>(.*?)<\/loc>/.exec(block)?.[1],date=/<lastmod>(.*?)<\/lastmod>/.exec(block)?.[1];
 if(!loc||unique.has(loc))throw new Error('URL ausente/duplicada: '+loc);unique.add(loc);
 if(!date||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.000Z$/.test(date)||Number.isNaN(Date.parse(date)))throw new Error('Lastmod inválido: '+loc);
 if(!block.includes('<priority>')||!block.includes('<changefreq>'))throw new Error('SEO incompleto: '+loc);
 }
}
if(!fs.readFileSync('public/sitemap.xml','utf8').includes('<sitemapindex'))throw new Error('Índice não gerado');
const robots=fs.readFileSync('public/robots.txt','utf8');if((robots.match(/^Sitemap:/gm)??[]).length!==1||!robots.includes('Sitemap: https://gabaru.com.br/sitemap.xml'))throw new Error('Robots inválido');
console.log(`next-sitemap: ${unique.size} URLs únicas, 100% lastmod ISO válido.`);

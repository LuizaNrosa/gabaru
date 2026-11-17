import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPublicCatalog,partUrls} from '../scripts/lib/catalogo-seo.mjs';
const c={bancas:[{slug:'etec'}],cadernos:[{id:'etec:2026',banca:'etec',href:'/provas/etec/2026',nivelQualidade:'nivel-1-gabarito-oficial',questoes:['q1']}],questoes:[{id:'q1',slug:'q1',banca:'etec',disciplina:'matematica',assunto:'funcoes',tier:'tier-1-gabarito-oficial',enunciado:'Texto íntegro'},{id:'q0',slug:'q0',tier:'tier-0-quarentena'}]};
test('catálogo único não duplica livros, exclui Tier 0 e congela lastmod quando o conteúdo não muda',()=>{
 const a=buildPublicCatalog({catalog:c,books:[{slug:'matematica',titulo:'Matemática'}],sourceDate:'2026-11-01T12:00:00.000Z'});
 const b=buildPublicCatalog({catalog:c,books:[{slug:'matematica',titulo:'Matemática'}],sourceDate:'2026-11-17T12:00:00.000Z',previous:a});
 const entries=Object.values(a.families).flat();assert.equal(entries.length,new Set(entries.map(x=>x.loc)).size);assert.ok(!entries.some(x=>x.loc.includes('q0')));assert.ok(a.families.livros.some(x=>x.loc==='/livros'));assert.ok(!a.families.hubs.some(x=>x.loc==='/livros'));
 assert.deepEqual(b,a);assert.ok(entries.every(x=>/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.000Z$/.test(x.lastmod)&&x.changefreq&&x.priority));
 const changed=buildPublicCatalog({catalog:{...c,questoes:c.questoes.map(q=>q.id==='q1'?{...q,enunciado:'Texto atualizado'}:q)},sourceDate:'2026-11-17T12:00:00.000Z',previous:a,books:[{slug:'matematica',titulo:'Matemática'}]});assert.notEqual(changed.families.questoes[0].lastmod,a.families.questoes[0].lastmod);
});
test('partes de 2.000 não emitem alias /sitemaps/questoes/1.xml',()=>{
 assert.deepEqual(partUrls('questoes',4501),['/sitemap-questoes.xml','/sitemap-questoes-1.xml','/sitemap-questoes-2.xml']);
});
test('classificação ambígua falha fechada: Tier 0 nunca ganha indexação por outro campo',()=>{
 const manifest=buildPublicCatalog({catalog:{...c,questoes:[{...c.questoes[0],tier:'tier-0-quarentena',nivelQualidade:'nivel-1-gabarito-oficial'}]},sourceDate:'2026-11-17T00:00:00.000Z'});assert.equal(manifest.families.questoes.length,0);
});

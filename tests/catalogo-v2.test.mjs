import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { makeSearch,filterItems,emptyFilters } from '../src/lib/catalogo/search.ts';
import { schemaGraph } from '../src/lib/seo/schema-graph.ts';
const catalog=JSON.parse(readFileSync('src/data/catalogo-v2.json','utf8'));
const published=catalog.questoes.filter(q=>q.statusPublicacao==='completa');
test('identidades únicas, proveniência e vínculos entre cadernos e questões',()=>{
 assert.equal(new Set(catalog.questoes.map(q=>q.id)).size,catalog.questoes.length);
 assert.equal(new Set(catalog.cadernos.map(e=>e.id)).size,catalog.cadernos.length);
 const ids=new Set(catalog.questoes.map(q=>q.id));
 for(const e of catalog.cadernos){assert.ok(e.ano>=1900&&e.ano<=2100);assert.ok(catalog.bancas.some(b=>b.slug===e.banca));for(const id of e.questoes)assert.ok(ids.has(id),id);}
});
test('gate editorial não publica gabarito seco nem OCR incompleto',()=>{
 assert.equal(published.length,4);
 for(const q of published){assert.ok(q.enunciado);assert.ok(q.comentarioResolucao.length>=3);assert.equal(q.alternativas.length,5);assert.ok(q.alternativas.some(a=>a.letra===q.correta));assert.ok(q.fonte.startsWith('https://'));assert.ok(q.atualizadaEm);assert.equal(published.filter(r=>r.id!==q.id&&r.assunto===q.assunto).length,3);}
 assert.ok(catalog.questoes.filter(q=>!q.comentarioResolucao.length).every(q=>q.statusPublicacao==='rascunho'));
 assert.ok(catalog.questoes.some(q=>q.anulada));
 assert.ok(catalog.questoes.filter(q=>q.anulada).every(q=>q.correta===null&&q.statusPublicacao==='rascunho'));
});
test('busca combina palavra, banca, ano, disciplina e assunto sem falsos resultados',()=>{
 const items=catalog.questoes.filter(q=>q.enunciado&&q.alternativas.length>=4);const index=makeSearch(items);
 const f={...emptyFilters,banca:'enem',ano:'2011',disciplina:'matematica',assunto:'razao-proporcao-e-unidades',busca:'pistão'};
 assert.deepEqual(filterItems(items,index,f).map(q=>q.id),['enem-2011-d2-q138']);
 assert.equal(filterItems(items,index,{...f,ano:'2025'}).length,0);
 assert.equal(filterItems(items,index,{...f,busca:'pistao'}).length,1);
});
test('schemas mantêm respostas correspondentes ao conteúdo e referências resolvidas',()=>{
 const q=published[0],g=schemaGraph({path:`/questoes/${q.slug}`,title:q.tema,questions:[q]});
 const nodes=g['@graph'];assert.ok(nodes.some(n=>n['@type']==='EducationalOrganization'));assert.ok(nodes.some(n=>n['@type']==='Person'&&n.name==='Felipe Nascimento Rosa'));
 const quiz=nodes.find(n=>n['@type']==='Quiz');assert.ok(quiz.hasPart[0].acceptedAnswer.text.includes(q.alternativas.find(a=>a.letra===q.correta).texto));
 assert.equal(quiz.hasPart[0].suggestedAnswer.length,4);
 assert.ok(!JSON.stringify(g).includes('undefined'));
});

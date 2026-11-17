import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {questionQuality,resolutionValid,examQuality,N0,N1,N2} from '../scripts/lib/qualidade.mjs';
const c=JSON.parse(readFileSync('src/data/catalogo-v2.json'));const q=c.questoes.find(q=>q.id==='etec-2026-2-q001');
test('conferência documental é obrigatória; gabarito sem comentários pode promover caderno',()=>{
 const base={...q,resolucaoEstruturada:undefined};assert.equal(questionQuality(base).nivelQualidade,N0);assert.equal(questionQuality(base,{gabaritoVerificado:true}).nivelQualidade,N1);
 assert.equal(examQuality({total:1,questoes:[q.id]},new Map([[q.id,{...base,nivelQualidade:N1}]] )).nivelQualidade,N1);
 assert.equal(questionQuality({...base,alternativas:base.alternativas.slice(1)},{gabaritoVerificado:true}).nivelQualidade,N0);
 assert.equal(examQuality({total:2,questoes:[q.id]},new Map([[q.id,q]])).nivelQualidade,N0);
});
test('resolução divergente ou sem análise de todos os distratores não é nível 2',()=>{
 assert.ok(resolutionValid(q.resolucaoEstruturada,q));assert.equal(q.nivelQualidade,N2);
 assert.equal(resolutionValid({...q.resolucaoEstruturada,alternativaCorreta:'A'},q),false);
 assert.equal(resolutionValid({...q.resolucaoEstruturada,distratores:{}},q),false);
});
test('todos os lotes possuem três blocos e correspondem ao gabarito',()=>{
 const pilot=JSON.parse(readFileSync('src/data/editorial/resolucoes-lotes.json'));assert.ok(Object.keys(pilot).length>=150);
 for(const id of Object.keys(pilot)){const item=c.questoes.find(q=>q.id===id);assert.equal(item.nivelQualidade,N2,id);assert.ok(resolutionValid(item.resolucaoEstruturada,item));}
});

test('OCR legado sem layout não promove questão contextual incompleta',()=>{const item={...q,proveniencia:undefined,banca:'enem',resolucaoEstruturada:undefined,enunciado:'Nesse texto, o autor pretende criticar uma prática social.'};assert.equal(questionQuality(item,{gabaritoVerificado:true}).nivelQualidade,N0);});

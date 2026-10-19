import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const exams=JSON.parse(readFileSync(new URL('../src/data/etec-exams.json',import.meta.url)));
test('historical ETEC archive: 41 unique exams, 1990 questions and official annulments',()=>{
 assert.equal(exams.length,41);assert.equal(new Set(exams.map(e=>e.id)).size,41);let total=0,annulled=0;
 for(const e of exams){assert.ok([30,40,50].includes(e.questions.length));assert.deepEqual(e.questions.map(q=>q.number),Array.from({length:e.questions.length},(_,i)=>i+1));let previous=0;for(const q of e.questions){assert.match(q.answer,/^(?:[ABCDE]|ANULADA)$/);assert.ok(e.pages.some(p=>p.number===q.page));if(q.pageMapped){assert.ok(q.page>=previous,`${e.id}:${q.number} page order`);previous=q.page;}if(q.answer==='ANULADA')annulled++;total++;}}
 assert.equal(total,1990);assert.equal(annulled,6);assert.equal(exams.find(e=>e.id==='2023-1').questions.length,40);assert.equal(exams.find(e=>e.id==='2008-1-extra1').questions.length,30);
 assert.equal(exams.find(e=>e.id==='2014-1').questions[25].answer,'ANULADA');assert.equal(exams.find(e=>e.id==='2012-2').questions[11].answer,'ANULADA');
});
test('82 original PDFs match their SHA-256 provenance and existing page images remain present',()=>{
 for(const e of exams){for(const [name,expected] of [['prova',e.examSha256],['gabarito',e.answerSha256]]){const file=new URL(`../public/acervo/etec/${e.id}/${name}.pdf`,import.meta.url);assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),expected);}for(const p of e.pages)if(p.image)assert.ok(existsSync(new URL(`../public${p.image}`,import.meta.url)));}
});

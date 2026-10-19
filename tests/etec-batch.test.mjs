import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const exams=JSON.parse(readFileSync(new URL('../src/data/etec-exams.json',import.meta.url)));
test('three official ETEC exams contain 150 unique numbered questions',()=>{
 assert.equal(exams.length,3);const ids=new Set();
 for(const e of exams){assert.equal(e.questions.length,50);assert.deepEqual(e.questions.map(q=>q.number),Array.from({length:50},(_,i)=>i+1));for(const q of e.questions){assert.match(q.answer,/^[ABCDE]$/);assert.ok(e.pages.some(p=>p.number===q.page));ids.add(`${e.id}:${q.number}`);}}
 assert.equal(ids.size,150);
});
test('all original PDF hashes and rendered pages match the manifest',()=>{
 for(const e of exams){for(const [name,expected] of [['prova',e.examSha256],['gabarito',e.answerSha256]]){const file=new URL(`../public/acervo/etec/${e.id}/${name}.pdf`,import.meta.url);assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),expected);}assert.equal(e.pages.length,22);for(const p of e.pages){assert.ok(existsSync(new URL(`../public${p.image}`,import.meta.url)));assert.ok(p.text.length>0);}}
});

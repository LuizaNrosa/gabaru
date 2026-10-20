import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const exams=JSON.parse(await readFile(new URL('../src/data/coluni-exams.json',import.meta.url),'utf8'));
const keys={
 '2026':'A B B A A D ANULADA C C B B C D ANULADA B B A C C A D A ANULADA ANULADA C B ANULADA C B D C A A B C B A A',
 '2025':'B B D A D A C B C C A D C C A B D D B D C B D C B B D C ANULADA A ANULADA B D C ANULADA B D D',
 '2024':'A A B D C D A C C B ANULADA D A B C D A B C D C A B C A B D A A B A D B ANULADA B C D C'
};
test('One caderno per edition, no duplicate IDs or PDFs',()=>{
 assert.deepEqual(exams.map(e=>e.id),['2026','2025','2024']);
 assert.equal(new Set(exams.map(e=>e.examSha256)).size,3);
 assert.equal(exams.reduce((n,e)=>n+e.questions.length,0),114);
});
for(const e of exams)test(`COLUNI ${e.id}: final caderno 1 key, question mapping and original PDFs`,async()=>{
 assert.deepEqual(e.questions.map(q=>q.answer),keys[e.id].split(' '));
 assert.deepEqual(e.questions.map(q=>q.number),Array.from({length:38},(_,i)=>i+1));
 assert.equal(new URL(e.source).hostname,'www.pse.coluni.ufv.br');
 for(const [file,key] of [['prova','examSha256'],['gabarito','answerSha256']]){
  const bytes=await readFile(new URL(`../public/acervo/coluni/${e.id}/${file}.pdf`,import.meta.url));
  assert.equal(bytes.subarray(0,4).toString(),'%PDF');
  assert.equal(createHash('sha256').update(bytes).digest('hex'),e[key]);
 }
 for(const q of e.questions){assert.ok(q.pageMapped);assert.ok(e.pages.find(p=>p.number===q.page)?.text.includes(String(q.number).padStart(2,'0')+'.'));}
 assert.match(e.pages.at(-1).text,/TEXTUAL/i);
});

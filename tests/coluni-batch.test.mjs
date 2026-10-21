import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const exams=JSON.parse(await readFile(new URL('../src/data/coluni-exams.json',import.meta.url),'utf8'));
const keys={
 '2016':'A C A D A A ANULADA C D B A D C ANULADA D A C A A ANULADA C B C C C A C D A B B D B A D D D B ANULADA A B C A B A D A B',
 '2015':'B B ANULADA C D A B A C B B C D C D A C D C B B D C A A A C B C C C D B C D D B ANULADA A C B ANULADA B A D B ANULADA A',
 '2014':'C D C B A A D D C ANULADA D D A A C A D A C A D B B C C D A A C B D C B D C A C B A D ANULADA A C D A B B D',
 '2013':'B A C B D C D A D C D B C A C B D A A B B D C A ANULADA C C D D B B C B A B C D A D B C B A C D B A D',

 '2020':'A D ANULADA B C B D B C D B D A D C D C D A B B C D C D A B C B D C C ANULADA D B A C D',
 '2019':'B D C B A D A C A C D A D A D B D A C C B A C B B D C B A A B D D B D B A C',
 '2018':'C C A C D B B D C A C C C D B D A ANULADA B A B C A B C D A D C B C D C C C D D A',
 '2017':'C A B A ANULADA ANULADA B C D A C D A B D C A A C D A B ANULADA B C B B C A C D D D A A B D C A D B B D C B C D A',

 '2023':'D C B A A B B D A C D A B D C B A A D C C D B D C B D B A D D C D ANULADA A C D B',
 '2022':'B C A B D D A C D C A A D D C D D A C B C A A B D A D C ANULADA B ANULADA D C A B C D B',
 '2021':'C B D C A D B ANULADA B C C B D A D A ANULADA B B A D C C D B A C B D C ANULADA C D B A C D C',

 '2026':'A B B A A D ANULADA C C B B C D ANULADA B B A C C A D A ANULADA ANULADA C B ANULADA C B D C A A B C B A A',
 '2025':'B B D A D A C B C C A D C C A B D D B D C B D C B B D C ANULADA A ANULADA B D C ANULADA B D D',
 '2024':'A A B D C D A C C B ANULADA D A B C D A B C D C A B C A B D A A B A D B ANULADA B C D C'
};
test('One caderno per edition, no duplicate IDs or PDFs',()=>{
 assert.ok(exams.length>=14);
 assert.equal(new Set(exams.map(e=>e.id)).size,exams.length);
 for(const id of Object.keys(keys))assert.ok(exams.some(e=>e.id===id),`Reviewed edition missing: ${id}`);
 assert.equal(new Set(exams.map(e=>e.examSha256)).size,exams.length);
 assert.ok(exams.reduce((n,e)=>n+e.questions.length,0)>=582);
});
for(const e of exams)test(`COLUNI ${e.id}: final caderno 1 key, question mapping and original PDFs`,async()=>{
 if(keys[e.id])assert.deepEqual(e.questions.map(q=>q.answer),keys[e.id].split(' '));
 assert.deepEqual(e.questions.map(q=>q.number),Array.from({length:e.questions.length},(_,i)=>i+1));
 assert.ok(['www.pse.coluni.ufv.br','coluni.ufv.br'].includes(new URL(e.source).hostname));
 for(const [file,key] of [['prova','examSha256'],['gabarito','answerSha256']]){
  const bytes=await readFile(new URL(`../public/acervo/coluni/${e.id}/${file}.pdf`,import.meta.url));
  assert.equal(bytes.subarray(0,4).toString(),'%PDF');
  assert.equal(createHash('sha256').update(bytes).digest('hex'),e[key]);
 }
 for(const q of e.questions){assert.ok(q.pageMapped);assert.ok(e.pages.find(p=>p.number===q.page)?.text.includes(String(q.number).padStart(2,'0')+'.'));}
 if(Number(e.id)>=2018)assert.ok(e.pages.some(p=>/TEXTUAL|REDAÇÃO|REDACAO/i.test(p.text)), 'Proposal preserved in original pages');
});

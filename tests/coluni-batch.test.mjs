import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const exams=JSON.parse(await readFile(new URL('../src/data/coluni-exams.json',import.meta.url),'utf8'));
// Chaves do Caderno 1 (coluna "Gabarito 1" do gabarito oficial pós-recursos).
// 2023–2026: extraídas na Fase 1. 2016–2022: parser de tabela validado por
// reproduzir exatamente as chaves de 2023–2026 e conferido contra os
// gabaritos preliminares (as diferenças são só as anulações pós-recursos);
// 2017 e 2018, cujos PDFs são só imagem, por leitura visual dupla.
const keys={
 '2026':'A B B A A D ANULADA C C B B C D ANULADA B B A C C A D A ANULADA ANULADA C B ANULADA C B D C A A B C B A A',
 '2025':'B B D A D A C B C C A D C C A B D D B D C B D C B B D C ANULADA A ANULADA B D C ANULADA B D D',
 '2024':'A A B D C D A C C B ANULADA D A B C D A B C D C A B C A B D A A B A D B ANULADA B C D C',
 '2023':'D C B A A B B D A C D A B D C B A A D C C D B D C B D B A D D C D ANULADA A C D B',
 '2022':'B C A B D D A C D C A A D D C D D A C B C A A B D A D C ANULADA B ANULADA D C A B C D B',
 '2021':'C B D C A D B ANULADA B C C B D A D A ANULADA B B A D C C D B A C B D C ANULADA C D B A C D C',
 '2020':'A D ANULADA B C B D B C D B D A D C D C D A B B C D C D A B C B D C C ANULADA D B A C D',
 '2019':'B D C B A D A C A C D A D A D B D A C C B A C B B D C B A A B D D B D B A C',
 '2018':'C C A C D B B D C A C C C D B D A ANULADA B A B C A B C D A D C B C D C C C D D A',
 '2017':'C A B A ANULADA ANULADA B C D A C D A B D C A A C D A B ANULADA B C B B C A C D D D A A B D C A D B B D C B C D A',
 '2016':'A C A D A A ANULADA C D B A D C ANULADA D A C A A ANULADA C B C C C A C D A B B D B A D D D B ANULADA A B C A B A D A B'
};
// Questões com enunciado/alternativas em texto (portão de qualidade do
// scripts/import-coluni-texts.mjs; as restantes ficam só no PDF).
const withText={'2026':27,'2025':30,'2024':25,'2023':24,'2022':23,'2021':23,'2020':27,'2019':26,'2018':26,'2017':33,'2016':32};
test('One caderno per edition, no duplicate IDs or PDFs',()=>{
 assert.deepEqual(exams.map(e=>e.id),['2026','2025','2024','2023','2022','2021','2020','2019','2018','2017','2016']);
 assert.equal(new Set(exams.map(e=>e.examSha256)).size,11);
 assert.equal(exams.reduce((n,e)=>n+e.questions.length,0),438);
 assert.equal(exams.reduce((n,e)=>n+e.questions.filter(q=>q.statement).length,0),296);
});
for(const e of exams)test(`COLUNI ${e.id}: final caderno 1 key, question mapping and original PDFs`,async()=>{
 assert.deepEqual(e.questions.map(q=>q.answer),keys[e.id].split(' '));
 assert.deepEqual(e.questions.map(q=>q.number),Array.from({length:e.questions.length},(_,i)=>i+1));
 assert.equal(new URL(e.source).hostname,'www.pse.coluni.ufv.br');
 for(const url of [e.examUrl,e.answerUrl])assert.ok(['www.pse.coluni.ufv.br','coluni.ufv.br'].includes(new URL(url).hostname));
 for(const [file,key] of [['prova','examSha256'],['gabarito','answerSha256']]){
  const bytes=await readFile(new URL(`../public/acervo/coluni/${e.id}/${file}.pdf`,import.meta.url));
  assert.equal(bytes.subarray(0,4).toString(),'%PDF');
  assert.equal(createHash('sha256').update(bytes).digest('hex'),e[key]);
 }
 for(const q of e.questions){assert.ok(q.pageMapped);assert.ok(e.pages.find(p=>p.number===q.page)?.text.includes(String(q.number).padStart(2,'0')+'.'));}
 assert.equal(e.questions.filter(q=>q.statement).length,withText[e.id]);
 // 2018–2026: caderno de dia único, fecha com a Produção Textual.
 // 2016–2017: 1.º dia só com objetivas — fecha na questão 48.
 if(e.id>='2018')assert.match(e.pages.at(-1).text,/TEXTUAL/i);
 else assert.ok(e.pages.at(-1).text.includes('48.'));
 // Material extra: prova discursiva do 2.º dia, só em 2016–2017.
 if(e.id==='2016'||e.id==='2017'){
  assert.equal(e.extraMaterials.length,1);
  const extra=e.extraMaterials[0];
  assert.equal(extra.kind,'prova-discursiva');
  const bytes=await readFile(new URL(`../public/acervo/coluni/${e.id}/${extra.file}`,import.meta.url));
  assert.equal(bytes.subarray(0,4).toString(),'%PDF');
  assert.equal(createHash('sha256').update(bytes).digest('hex'),extra.sha256);
 }else assert.equal(e.extraMaterials,undefined);
});

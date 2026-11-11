import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const exams=JSON.parse(await readFile(new URL('../src/data/ifsp-exams.json',import.meta.url),'utf8'));
// Chaves dos gabaritos oficiais DEFINITIVOS (após recursos) de cada
// caderno, extraídas dos PDFs oficiais na construção do acervo
// (~/workspace/gabaru-ifsp/ferramentas/construir-acervo.mjs). 2026.1:
// um único PDF da Fundação CEFETMINAS com as secções dos Tipos 1 e 2.
const keys={
 '2026-1-tipo1':'C C E E B E B D A B A A C D D C D E A B E A B D C C ANULADA D C C',
 '2026-1-tipo2':'C D E A B E A B D C C ANULADA D C C C C E E B E B D A B A A C D D',
 '2025-1-a':'C A D A ANULADA D D B D B B A A C C D C B A D D A B B A A C C B D',
 '2025-1-b':'D D B A C A C D C B B C B B D D A C C D A B B D C A B C D B',
 '2024-1-a':'A A C D B C A B D C D B B C A C B D B ANULADA A C D A ANULADA D D A B A',
 '2024-1-b':'C B A A D C D A A D B B A C B A B C A B D D B D A C D A C C',
 '2023-1-a':'A B C B C D B A C A D D C D B B A C B C A C D B A C A D B D',
 '2023-1-b':'B A D C D D A C C B D B A C C ANULADA A B D B A D A ANULADA D C C A B B',
 '2022-1-manha':'B C D D C B A A B C A D A C B D C A D C A C B D B D B A C B',
 '2022-1-tarde':'B A D B A C D A C C C D B D ANULADA A C B D B D C B C A A A C D B'
};
// Questões com enunciado/alternativas em texto (portão de qualidade do
// scripts/import-ifsp-texts.mjs; as restantes ficam só no PDF).
const withText={'2026-1-tipo1':15,'2026-1-tipo2':16,'2025-1-a':17,'2025-1-b':19,'2024-1-a':13,'2024-1-b':15,'2023-1-a':17,'2023-1-b':10,'2022-1-manha':17,'2022-1-tarde':9};
const editais={'2026-1-tipo1':'211/2025','2026-1-tipo2':'211/2025','2025-1-a':'88/2024','2025-1-b':'88/2024','2024-1-a':'449/2023','2024-1-b':'449/2023','2023-1-a':'609/2022','2023-1-b':'609/2022','2022-1-manha':'400/2021','2022-1-tarde':'400/2021'};
const HOSTS=new Set(['processoseletivo.ifsp.edu.br','www.ifsp.edu.br','ifsp.edu.br','concurso30.fundacaocefetminas.org.br']);
test('IFSP editions newest-first, no duplicate IDs or PDFs',()=>{
 assert.deepEqual(exams.map(e=>e.id),['2026-1-tipo1','2026-1-tipo2','2025-1-a','2025-1-b','2024-1-a','2024-1-b','2023-1-a','2023-1-b','2022-1-manha','2022-1-tarde']);
 assert.equal(new Set(exams.map(e=>e.examSha256)).size,10);
 assert.equal(exams.reduce((n,e)=>n+e.questions.length,0),300);
 assert.equal(exams.reduce((n,e)=>n+e.questions.filter(q=>q.statement).length,0),148);
});
test('IFSP 2026.1: Tipo 2 é o Tipo 1 com as secções trocadas',()=>{
 const t1=exams.find(e=>e.id==='2026-1-tipo1'),t2=exams.find(e=>e.id==='2026-1-tipo2');
 assert.equal(t1.answerUrl,t2.answerUrl);
 assert.equal(t1.answerSha256,t2.answerSha256);
 for(let i=0;i<30;i++)assert.equal(t2.questions[i].answer,t1.questions[(i+15)%30].answer);
});
for(const e of exams)test(`IFSP ${e.id}: official key, mapping, method/format and original PDFs`,async()=>{
 assert.deepEqual(e.questions.map(q=>q.answer),keys[e.id].split(' '));
 assert.deepEqual(e.questions.map(q=>q.number),Array.from({length:e.questions.length},(_,i)=>i+1));
 assert.equal(e.format.questions,e.questions.length);
 assert.equal(e.format.questions,30);
 // Alternativas por era: 5 só em 2026.1 (CEFETMINAS); 4 até 2025.1 —
 // as instruções impressas dos cadernos antigos dizem "apenas 4".
 assert.equal(e.format.alternatives,e.id.startsWith('2026-1')?5:4);
 assert.equal(e.format.durationMinutes,180);
 // Áreas contíguas 1..30; Tipo 2 começa por Matemática.
 assert.equal(e.format.areas[0].from,1);
 assert.equal(e.format.areas.at(-1).to,30);
 for(let i=1;i<e.format.areas.length;i++)assert.equal(e.format.areas[i].from,e.format.areas[i-1].to+1);
 assert.equal(e.format.areas[0].name,e.id==='2026-1-tipo2'?'Matemática':'Língua Portuguesa');
 assert.equal(e.method.selection,'prova');
 assert.equal(e.method.edital,editais[e.id]);
 assert.ok(HOSTS.has(new URL(e.source).hostname));
 for(const url of [e.examUrl,e.answerUrl])assert.ok(HOSTS.has(new URL(url).hostname));
 for(const [file,key] of [['prova','examSha256'],['gabarito','answerSha256']]){
  const bytes=await readFile(new URL(`../public/acervo/ifsp/${e.id}/${file}.pdf`,import.meta.url));
  assert.equal(bytes.subarray(0,4).toString(),'%PDF');
  assert.equal(createHash('sha256').update(bytes).digest('hex'),e[key]);
 }
 const letters=['A','B','C','D','E'].slice(0,e.format.alternatives);
 for(const q of e.questions){
  assert.ok(q.pageMapped);
  assert.ok(q.page>=1&&q.page<=e.pageCount);
  const pageText=e.pages.find(p=>p.number===q.page)?.text??'';
  if(e.id.startsWith('2022-1')||e.id.startsWith('2026-1'))
   assert.ok(new RegExp(`QUEST[ÃA]O\\s+0?${q.number}\\b`).test(pageText),`marcador Q${q.number} na página ${q.page}`);
  else{
   // Era "número": enunciado, gráfico/tabela e alternativas podem
   // atravessar a viragem de página — aceita marcador ou cadeia na
   // página indicada ou nas vizinhas.
   const vizinhas=e.pages.filter(p=>Math.abs(p.number-q.page)<=1).map(p=>p.text).join('\n');
   assert.ok(new RegExp(`(^|\\n)\\s*${q.number}(?=\\s|$)`).test(vizinhas)||vizinhas.includes('( A )'),`marcador/cadeia Q${q.number} perto da página ${q.page}`);
  }
 }
 assert.equal(e.questions.filter(q=>q.statement).length,withText[e.id]);
 for(const q of e.questions)if(q.statement){
  assert.deepEqual(Object.keys(q.options),letters);
  for(const letter of letters)assert.ok(q.options[letter].length>0);
 }
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const exams=JSON.parse(await readFile(new URL('../src/data/ifsc-exams.json',import.meta.url),'utf8'));
// Chaves dos gabaritos oficiais DEFINITIVOS (após recursos) de cada
// caderno, extraídas dos PDFs oficiais na construção do acervo
// (~/workspace/gabaru-ifs/ferramentas/construir-acervo.mjs). 2022.1: os
// gabaritos são documentos de imagem — chave por leitura visual dupla
// independente (definitivo e preliminar, leituras idênticas).
const keys={
 '2026-2':'A D A D E C D E B C E C D C A D C B B C E B B B E A A A',
 '2026-1':'C A A E D E C D D E A E C B A E C D B C A B C E C B D B',
 '2025-2':'C B A C B D C C C B D C E D A E E A D B E C A A E B D E',
 '2025-1':'D E A D A E B A D C B C C E ANULADA A E D E C A C E B C B E C',
 '2024-2':'B E C C B C D D B E A A D D E C A E C C D A E D E A B E',
 '2024-1':'E D C C D B A E E C C A A D D B C A E C B D E D',
 '2024-1-itajai':'C B A E A D D C E B C A C B D D D A E D B B C E',
 '2023-2':'B D C C D ANULADA C A A A D B B E C E C D B A',
 '2023-1':'D C D E C B E B C C C B D D E A D C E B',
 '2022-2':'C E B E D A A E C C ANULADA B B B C B E A ANULADA B',
 '2022-1':'C A B E A C D B E D A A D B C E E D C B',
 '2020-1':'B A C E D E B D A C A E C B E D C D A B',
 '2019-2':'D E E A E ANULADA C A C A E B C E A ANULADA B D A C',
 '2019-1':'B C A A E D B D A ANULADA C E D B A E B C B E',
 '2018-2':'B C C E A D A D B E D C B A B B B C D E',
 '2018-1':'E ANULADA D B B C D E A C C E A B D E A D B A',
 '2017-2':'E B D A C D C A E D B D E E B D A A C E',
 '2017-1':'E C E B ANULADA A E D C E B D A B D C A B A B'
};
// Questões com enunciado/alternativas em texto (portão de qualidade do
// scripts/import-ifsc-texts.mjs; as restantes ficam só no PDF). 2019.2 e
// 2024.2 (cadernos digitalizados) e 2025.2 (camada de texto corrompida na
// fonte) publicam 0 por desenho.
const withText={'2026-2':11,'2026-1':12,'2025-2':0,'2025-1':12,'2024-2':0,'2024-1':15,'2024-1-itajai':15,'2023-2':12,'2023-1':16,'2022-2':18,'2022-1':15,'2020-1':17,'2019-2':0,'2019-1':12,'2018-2':13,'2018-1':17,'2017-2':18,'2017-1':16};
// Edições cujo caderno não tem camada de texto utilizável: nenhuma
// questão tem página mapeada.
const unmapped=new Set(['2019-2','2024-2','2025-2']);
test('IFSC editions newest-first, no duplicate IDs or PDFs',()=>{
 assert.deepEqual(exams.map(e=>e.id),['2026-2','2026-1','2025-2','2025-1','2024-2','2024-1','2024-1-itajai','2023-2','2023-1','2022-2','2022-1','2020-1','2019-2','2019-1','2018-2','2018-1','2017-2','2017-1']);
 assert.equal(new Set(exams.map(e=>e.examSha256)).size,18);
 assert.equal(exams.reduce((n,e)=>n+e.questions.length,0),408);
 assert.equal(exams.reduce((n,e)=>n+e.questions.filter(q=>q.statement).length,0),219);
});
for(const e of exams)test(`IFSC ${e.id}: official key, mapping, method/format and original PDFs`,async()=>{
 assert.deepEqual(e.questions.map(q=>q.answer),keys[e.id].split(' '));
 assert.deepEqual(e.questions.map(q=>q.number),Array.from({length:e.questions.length},(_,i)=>i+1));
 assert.equal(e.format.questions,e.questions.length);
 assert.equal(e.format.alternatives,5);
 // Áreas contíguas 1..N quando o gabarito/caderno as separa (2017.1: o
 // gabarito oficial não separa por área — lista única, areas vazio).
 if(e.id==='2017-1')assert.deepEqual(e.format.areas,[]);
 else{
  assert.equal(e.format.areas[0].from,1);
  assert.equal(e.format.areas.at(-1).to,e.questions.length);
  for(let i=1;i<e.format.areas.length;i++)assert.equal(e.format.areas[i].from,e.format.areas[i-1].to+1);
 }
 // Método por edição: misto só onde há edital paralelo de sorteio para
 // cursos integrados, verificado na listagem oficial de editais.
 if(e.id==='2026-1'){assert.equal(e.method.selection,'misto');assert.deepEqual(e.method.lotteryCampuses,['Caçador','Itajaí','Palhoça Bilíngue','São Carlos']);}
 else if(e.id==='2025-2'){assert.equal(e.method.selection,'misto');assert.deepEqual(e.method.lotteryCampuses,['Garopaba','Itajaí']);}
 else assert.equal(e.method.selection,'prova');
 assert.ok(['https://www.ifsc.edu.br/provas-e-gabaritos','https://www.ifsc.edu.br/provas-e-gabaritos-antigos'].includes(e.source));
 for(const url of [e.examUrl,e.answerUrl])assert.equal(new URL(url).hostname,'www.ifsc.edu.br');
 for(const [file,key] of [['prova','examSha256'],['gabarito','answerSha256']]){
  const bytes=await readFile(new URL(`../public/acervo/ifsc/${e.id}/${file}.pdf`,import.meta.url));
  assert.equal(bytes.subarray(0,4).toString(),'%PDF');
  assert.equal(createHash('sha256').update(bytes).digest('hex'),e[key]);
 }
 for(const q of e.questions){
  if(unmapped.has(e.id)){assert.equal(q.pageMapped,false);continue;}
  assert.ok(q.pageMapped);
  assert.ok(e.pages.find(p=>p.number===q.page)?.text.includes(`QUESTÃO ${String(q.number).padStart(2,'0')}`));
 }
 if(e.id==='2025-2')assert.ok(e.pages.every(p=>p.text===''));
 assert.equal(e.questions.filter(q=>q.statement).length,withText[e.id]);
 for(const q of e.questions)if(q.statement){
  assert.deepEqual(Object.keys(q.options),['A','B','C','D','E']);
  for(const letter of ['A','B','C','D','E'])assert.ok(q.options[letter].length>0);
 }
 // Materiais extra oficiais: resposta aos recursos (2026.1, 2026.2) e
 // justificativa de anulação (2019.2).
 const extras=e.extraMaterials??[];
 if(e.id==='2026-2'||e.id==='2026-1')assert.deepEqual(extras.map(x=>x.kind),['resposta-recursos']);
 else if(e.id==='2019-2')assert.deepEqual(extras.map(x=>x.kind),['justificativa-anulacao']);
 else assert.deepEqual(extras,[]);
 for(const extra of extras){
  assert.equal(new URL(extra.url).hostname,'www.ifsc.edu.br');
  const bytes=await readFile(new URL(`../public/acervo/ifsc/${e.id}/${extra.file}`,import.meta.url));
  assert.equal(bytes.subarray(0,4).toString(),'%PDF');
  assert.equal(createHash('sha256').update(bytes).digest('hex'),extra.sha256);
 }
});

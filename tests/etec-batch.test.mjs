import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const exams=JSON.parse(readFileSync(new URL('../src/data/etec-exams.json',import.meta.url)));
test('historical ETEC archive: 43 unique exams, 2090 questions and official annulments',()=>{
 assert.equal(exams.length,43);assert.equal(new Set(exams.map(e=>e.id)).size,43);let total=0,annulled=0;
 for(const e of exams){assert.ok([30,40,50].includes(e.questions.length));assert.deepEqual(e.questions.map(q=>q.number),Array.from({length:e.questions.length},(_,i)=>i+1));let previous=0;for(const q of e.questions){assert.match(q.answer,/^(?:[ABCDE]|ANULADA)$/);assert.ok(e.pages.some(p=>p.number===q.page));if(q.pageMapped){assert.ok(q.page>=previous,`${e.id}:${q.number} page order`);previous=q.page;}if(q.answer==='ANULADA')annulled++;total++;}}
 assert.equal(total,2090);assert.equal(annulled,7);assert.equal(exams.find(e=>e.id==='2023-1').questions.length,40);assert.equal(exams.find(e=>e.id==='2008-1-extra1').questions.length,30);
 assert.equal(exams.find(e=>e.id==='2005-2').questions[36].answer,'ANULADA');
 assert.equal(exams.find(e=>e.id==='2014-1').questions[25].answer,'ANULADA');assert.equal(exams.find(e=>e.id==='2012-2').questions[11].answer,'ANULADA');
});
test('PDFs kept by the reader match their SHA-256 provenance and page images remain present',()=>{
 for(const e of exams){if(!e.pageImagesOnly)for(const [name,expected] of [['prova',e.examSha256],['gabarito',e.answerSha256]]){const file=new URL(`../public/acervo/etec/${e.id}/${name}.pdf`,import.meta.url);const cached = new URL(`../.next/cache/etec-pdfs/${e.id}/${name}.pdf`,import.meta.url);
     assert.equal(createHash('sha256').update(readFileSync(existsSync(file) ? file : cached)).digest('hex'),expected);}for(const p of e.pages)if(p.image)assert.ok(existsSync(new URL(`../public${p.image}`,import.meta.url)));}
});

test('ETEC 2025/2 has 50 mapped questions and serves every page as a WebP', () => {
 const exam = exams.find(e => e.id === '2025-2');
 assert.equal(exam.pageImagesOnly, true);
 assert.equal(exam.questions.length, 50);
 assert.equal(exam.pageCount, 12);
 assert.deepEqual(exam.pages.map(p => p.number), Array.from({length: 12}, (_, i) => i + 1));
 assert.ok(exam.questions.every(q => q.pageMapped));
 for (const page of exam.pages) {
  const image = readFileSync(new URL(`../public${page.image}`, import.meta.url));
  assert.equal(image.toString('ascii', 8, 12), 'WEBP');
 }
 for (const file of ['prova.pdf', 'gabarito.pdf']) {
  assert.equal(existsSync(new URL(`../public/acervo/etec/2025-2/${file}`, import.meta.url)), false);
 }
});

test('paginated builds serve only individual images for every ETEC caderno', (context) => {
 const cache = new URL('../.next/cache/etec-pdfs/', import.meta.url);
 if (!existsSync(cache)) {
  context.skip('Run prepare-etec.mjs --paginar first.');
  return;
 }
 for (const exam of exams) {
  for (let number = 1; number <= exam.pageCount; number++) {
   const name = `pagina-${String(number).padStart(2, '0')}.webp`;
   const image = readFileSync(new URL(`../public/acervo/etec/${exam.id}/${name}`, import.meta.url));
   assert.equal(image.toString('ascii', 8, 12), 'WEBP', `${exam.id} ${name}`);
  }
  for (const file of ['prova.pdf', 'gabarito.pdf']) {
   assert.equal(existsSync(new URL(`../public/acervo/etec/${exam.id}/${file}`, import.meta.url)), false, exam.id);
  }
 }
});

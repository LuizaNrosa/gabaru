import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile,access} from 'node:fs/promises';import {createHash} from 'node:crypto';
const read=async p=>JSON.parse(await readFile(new URL(`../${p}`,import.meta.url),'utf8'));
test('UNESP 2015, 2016 e dois cadernos de 2021: arquivos, dados e respostas',async()=>{
 const exams=await read('src/data/unesp-2015-2016-2021.json'), archive=await read('src/data/unesp-archive.json');assert.equal(exams.length,4);assert.equal(new Set(exams.map(e=>e.id)).size,4);
 const expected={'2021-biologicas':['A','C','E','B','B'],'2021-exatas-humanidades':['B','D','A','B','C'],'2016-regular':['B','E','C','D','A'],'2015-regular':['A','A','D','C','E']};
 for(const e of exams){assert.equal(e.gabarito.length,90);assert(e.gabarito.every(a=>/^[A-E]$/.test(a)));assert.deepEqual(e.gabarito.slice(0,5),expected[`${e.ano}-${e.aplicacao}`]);const pdf=await readFile(new URL(`../public/acervo/unesp/${e.ano}/${e.aplicacao}/prova.pdf`,import.meta.url));assert.equal(createHash('sha256').update(pdf).digest('hex'),e.sha256_prova);for(let i=1;i<=e.pages;i++)await access(new URL(`../public/acervo/unesp/${e.ano}/${e.aplicacao}/${String(i).padStart(2,'0')}.webp`,import.meta.url));if(e.ano<2021)assert(archive.documents.some(d=>d.id===e.id&&d.sha256===e.sha256_prova));else assert.equal(e.report_end-e.report_start+1,32);}
});

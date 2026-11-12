import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile,access} from 'node:fs/promises';import {createHash} from 'node:crypto';
const read=async p=>JSON.parse(await readFile(new URL(`../${p}`,import.meta.url),'utf8'));
test('UNESP de 2011 a 2014: arquivos, dados e respostas',async()=>{
 const exams=await read('src/data/unesp-2011-2014.json'), archive=await read('src/data/unesp-archive.json');assert.equal(exams.length,4);assert.equal(new Set(exams.map(e=>e.id)).size,4);
 const expected={'2011-regular':['C','D','A','E','B'],'2012-regular':['C','A','D','E','C'],'2013-regular':['C','E','B','A','D'],'2014-regular':['D','B','B','A','C']};
 for(const e of exams){assert.equal(e.gabarito.length,90);assert(e.gabarito.every(a=>/^[A-E]$/.test(a)));assert.deepEqual(e.gabarito.slice(0,5),expected[`${e.ano}-${e.aplicacao}`]);const pdf=await readFile(new URL(`../public/acervo/unesp/${e.ano}/${e.aplicacao}/prova.pdf`,import.meta.url));assert.equal(createHash('sha256').update(pdf).digest('hex'),e.sha256_prova);for(let i=1;i<=e.pages;i++)await access(new URL(`../public/acervo/unesp/${e.ano}/${e.aplicacao}/${String(i).padStart(2,'0')}.webp`,import.meta.url));assert(archive.documents.some(d=>d.year===e.ano));assert.match(e.sha256_gabarito,/^[a-f0-9]{64}$/);}
});

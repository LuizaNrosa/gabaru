import {createHash} from 'node:crypto';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
const read=async p=>JSON.parse(await readFile(new URL(`../${p}`,import.meta.url),'utf8'));
test('quatro cadernos UNESP têm gabaritos, fontes e imagens correspondentes',async()=>{
 const exams=await read('src/data/unesp-2017-2020.json'), archive=await read('src/data/unesp-archive.json');
 assert.equal(exams.length,4);assert.equal(new Set(exams.map(e=>e.id)).size,4);
 const samples={'2020-regular-6f85d56ada8b':['A','A','B','C','A'],'2019-regular-dbeba9650b1f':['C','D','A','A','A'],'2018-regular-72619edc7c4e':['C','B','A','E','C'],'2017-regular-d9daaeab4048':['D','A','D','B','C']};
 for(const e of exams){const p=archive.documents.find(d=>d.id===e.id);assert.equal(e.gabarito.length,90);assert(e.gabarito.every(a=>/^[A-E]$/.test(a)));assert.deepEqual(e.gabarito.slice(0,5),samples[e.id]);assert.equal(p.sha256,e.sha256_prova);assert.equal(p.year,e.ano);assert.equal(p.url,e.fonte_prova);const pdf=await readFile(new URL(`../public/acervo/unesp/${e.ano}/regular/prova.pdf`,import.meta.url));assert.equal(createHash('sha256').update(pdf).digest('hex'),e.sha256_prova);assert.match(e.sha256_gabarito,/^[a-f0-9]{64}$/);for(let i=1;i<=p.pages;i++)await access(new URL(`../public/acervo/unesp/${e.ano}/${e.aplicacao}/${String(i).padStart(2,'0')}.webp`,import.meta.url));}
});

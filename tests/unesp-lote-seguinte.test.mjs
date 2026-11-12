import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
const read=async p=>JSON.parse(await readFile(new URL(`../${p}`,import.meta.url),'utf8'));
test('quatro cadernos UNESP têm gabaritos, fontes e imagens correspondentes',async()=>{
 const exams=await read('src/data/unesp-lote-seguinte.json'), archive=await read('src/data/unesp-archive.json');
 assert.equal(exams.length,4);assert.equal(new Set(exams.map(e=>e.id)).size,4);
 const samples={'2024-regular-d92735849ccb':['D','B','C','A','B'],'2024-meio-de-ano-8b6277736f6e':['D','C','B','D','B'],'2023-regular-112e58e8a5f4':['A','A','D','C','A'],'2022-regular-8f9a7b32abdd':['C','A','A','D','B']};
 for(const e of exams){const p=archive.documents.find(d=>d.id===e.id),k=archive.documents.find(d=>d.sha256===e.sha256_gabarito);assert.equal(e.gabarito.length,90);assert(e.gabarito.every(a=>/^[A-E]$/.test(a)));assert.deepEqual(e.gabarito.slice(0,5),samples[e.id]);assert.equal(p.sha256,e.sha256_prova);assert.equal(p.year,k.year);assert.equal(p.application,k.application);for(let i=1;i<=p.pages;i++)await access(new URL(`../public/acervo/unesp/${e.ano}/${e.aplicacao}/${String(i).padStart(2,'0')}.webp`,import.meta.url));}
});

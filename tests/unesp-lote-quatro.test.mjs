import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
const read=async p=>JSON.parse(await readFile(new URL(`../${p}`,import.meta.url),'utf8'));
test('quatro cadernos UNESP têm gabaritos, fontes e imagens correspondentes',async()=>{
 const exams=await read('src/data/unesp-lote-quatro.json'), archive=await read('src/data/unesp-archive.json');
 assert.equal(exams.length,4);assert.equal(new Set(exams.map(e=>e.id)).size,4);
 const samples={'2026-regular-fda4e93aa4b1':['E','A','C','B','D'],'2026-meio-de-ano-0f790bbaf9e9':['A','A','B','D','C'],'2025-meio-de-ano-f66a29024b39':['E','A','D','B','E'],'2022-regular-4f7c409ccb6a':['A','D','B','C','E']};
 for(const e of exams){const p=archive.documents.find(d=>d.id===e.id),k=archive.documents.find(d=>d.sha256===e.sha256_gabarito);assert.equal(e.gabarito.length,90);assert(e.gabarito.every(a=>/^[A-E]$/.test(a)));assert.deepEqual(e.gabarito.slice(0,5),samples[e.id]);assert.equal(p.sha256,e.sha256_prova);assert.equal(p.year,k.year);assert.equal(p.application,k.application);for(let i=1;i<=p.pages;i++)await access(new URL(`../public/acervo/unesp/${e.ano}/${e.aplicacao}/${String(i).padStart(2,'0')}.webp`,import.meta.url));}
});

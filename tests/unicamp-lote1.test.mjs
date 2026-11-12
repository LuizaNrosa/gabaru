import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const read=async p=>JSON.parse(await readFile(new URL(`../${p}`,import.meta.url),'utf8'));
test('Unicamp: gabaritos e alternativas conferidos por caderno',async()=>{
 const exams=await read('src/data/unicamp-lote1.json'), archive=await read('src/data/unicamp-archive.json');assert.equal(exams.length,4);
 const annulled={2023:[23],2024:[],2025:[53],2026:[]};const first={2023:['B','D','D','B','A'],2024:['B','A','C','A','D'],2025:['C','B','D','A','B'],2026:['C','B','C','B','D']};
 for(const e of exams){const p=archive.documents.find(d=>d.id===e.id);assert.equal(p.sha256,e.sha256_prova);assert.deepEqual(e.alternativas,['A','B','C','D']);assert.equal(e.gabarito.length,72);assert(e.gabarito.every(g=>/^[A-D*]$/.test(g)));assert.deepEqual(e.gabarito.map((g,i)=>g==='*'?i+1:null).filter(Boolean),annulled[e.ano]);if(e.ano!==2025)assert.deepEqual(e.gabarito.slice(0,5),first[e.ano]);assert.match(e.sha256_gabarito,/^[a-f0-9]{64}$/)}
});

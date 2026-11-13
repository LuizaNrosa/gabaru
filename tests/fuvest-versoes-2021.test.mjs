import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=async p=>JSON.parse(await readFile(new URL(`../${p}`,import.meta.url),'utf8'));
test('FUVEST 2021 V: 90 respostas e caderno oficial identificado',async()=>{
 const [exame]=await read('src/data/fuvest-2021-versoes.json'), docs=await read('src/data/fuvest-documentos.json');
 assert.equal(exame.ano,2021);assert.equal(exame.versao,'V');assert.equal(exame.gabarito.length,90);
 assert(exame.gabarito.every(a=>/^[A-E]$/.test(a)));assert.deepEqual(exame.gabarito.slice(0,5),['B','E','D','C','D']);
 assert.equal(docs.filter(d=>d.year===2021&&d.url===exame.fonte_prova).length,1);assert.match(exame.sha256_prova,/^[a-f0-9]{64}$/);
});

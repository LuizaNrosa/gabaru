import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read = async p => JSON.parse(await readFile(new URL(`../${p}`, import.meta.url), 'utf8'));
test('FUVEST 2023: cinco versões completas com identidade e gabarito próprios', async () => {
 const provas=await read('src/data/fuvest-2023-versoes.json'), docs=await read('src/data/fuvest-documentos.json');
 assert.deepEqual(provas.map(p=>p.versao),['V','K','Q','X','Z']);
 for(const prova of provas){assert.equal(prova.gabarito.length,90);assert(prova.gabarito.every(x=>/^[A-E]$/.test(x)));assert.match(prova.sha256_prova,/^[a-f0-9]{64}$/);assert.equal(docs.filter(d=>d.year===2023&&d.url===prova.fonte_prova).length,1)}
 assert.deepEqual(provas.map(p=>p.gabarito[0]),['D','E','A','B','A']);
});

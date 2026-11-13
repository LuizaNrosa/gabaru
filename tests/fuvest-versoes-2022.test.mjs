import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read = async p => JSON.parse(await readFile(new URL(`../${p}`, import.meta.url), 'utf8'));
test('FUVEST 2022: cinco versões identificam gabarito e questão anulada', async () => {
 const provas=await read('src/data/fuvest-2022-versoes.json'), docs=await read('src/data/fuvest-documentos.json');
 assert.deepEqual(provas.map(p=>p.versao),['V','K','Q','X','Z']);
 for(const prova of provas){assert.equal(prova.gabarito.length,90);assert(prova.gabarito.every(x=>/^[A-E*]$/.test(x)));assert.equal(prova.gabarito.filter(x=>x==='*').length,1);assert.equal(docs.filter(d=>d.year===2022&&d.url===prova.fonte_prova).length,1);assert.match(prova.sha256_prova,/^[a-f0-9]{64}$/)}
 assert.equal(provas[0].gabarito[53],'*');assert.equal(provas[1].gabarito[89],'*');assert.equal(provas[2].gabarito[6],'*');assert.equal(provas[3].gabarito[37],'*');assert.equal(provas[4].gabarito[87],'*');
});

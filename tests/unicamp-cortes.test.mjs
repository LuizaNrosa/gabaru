import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
test('Unicamp 2027 preserva todas as modalidades e lacunas da COMVEST',async()=>{
 const d=JSON.parse(await readFile(new URL('../src/data/unicamp-2027-cortes.json',import.meta.url),'utf8'));
 assert.equal(d.ofertas.length,64);assert.equal(d.ofertas.filter(o=>o.tipo==='treineiro').length,3);const valores=d.ofertas.flatMap(o=>[...Object.values(o.nao_cotistas),...Object.values(o.cotistas)]);assert.equal(valores.length,512);assert.equal(valores.filter(v=>v===null).length,57);assert(valores.every(v=>v===null||Number.isInteger(v)&&v>=0&&v<=72));
 const med=d.ofertas.find(o=>o.curso==='Medicina (I)');assert.deepEqual(Object.values(med.nao_cotistas),[62,60,58,56]);assert.deepEqual(Object.values(med.cotistas),[57,56,53,51]);
});

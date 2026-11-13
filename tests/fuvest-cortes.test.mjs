import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=async y=>JSON.parse(await readFile(new URL(`../src/data/fuvest-${y}-cortes.json`,import.meta.url),'utf8'));
test('FUVEST: dados oficiais têm uma linha por carreira e modalidade',async()=>{
 for(const year of [2026,2027]){const d=await read(year);assert.equal(d.quantidade_carreiras,77);assert.equal(d.registros.length,231);assert.equal(new Set(d.registros.map(r=>`${r.carreira_codigo}:${r.modalidade}`)).size,231);assert(d.registros.every(r=>r.ano===year&&['AC','EP','PPI'].includes(r.modalidade)&&r.vagas>0));}
});
test('FUVEST 2027 preserva valores ausentes e ausência de convocados',async()=>{
 const d=await read(2027);const get=(c,m)=>d.registros.find(r=>r.carreira_codigo===c&&r.modalidade===m);
 assert.equal(get('111','AC').corte_acertos,68);assert.equal(get('111','EP').corte_acertos,61);assert.equal(get('111','PPI').corte_acertos,51);
 assert.equal(get('104','PPI').corte_acertos,null);assert.equal(get('104','PPI').situacao,'corte_nao_divulgado');assert.equal(get('315','PPI').convocados,0);assert.equal(get('315','PPI').situacao,'sem_convocados');
});

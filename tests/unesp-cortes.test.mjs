import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('UNESP 2026: tabela oficial por curso e modalidade', async () => {
 const d=JSON.parse(await readFile(new URL('../src/data/unesp-2026-cortes.json',import.meta.url),'utf8'));
 assert.equal(d.edicao,2026);
 assert.equal(d.registros.length,183);
 assert.equal(new Set(d.registros.map(r=>r.codigo)).size,183);
 assert.deepEqual(d.registros.find(r=>r.codigo==='132'),{codigo:'132',curso:'Medicina - integral',cidade:'Botucatu',srvebp:60,su:78,pagina:6});
 const t=d.registros.find(r=>r.codigo==='183');
 assert.equal(t.cidade,null);
 assert.equal(t.curso,'Treineiro');
 for(const r of d.registros) { assert.ok(r.su>=0&&r.su<=90); assert.ok(r.srvebp>=0&&r.srvebp<=90); }
});

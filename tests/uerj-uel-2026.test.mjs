import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile,access} from 'node:fs/promises';import {createHash} from 'node:crypto';
test('UERJ e UEL 2026: arquivos, idiomas e gabaritos',async()=>{
 const data=JSON.parse(await readFile(new URL('../src/data/uerj-uel-2026.json',import.meta.url),'utf8'));assert.equal(data.length,4);
 const starts={'uerj-2026-eq1':'ACBCDADB','uerj-2026-eq2':'ADBACBDC','uel-2026-ingles-tipo1':'DABADEDB','uel-2026-espanhol-tipo1':'DABADEDB'};
 const stars={'uerj-2026-eq1':[38],'uerj-2026-eq2':[],'uel-2026-ingles-tipo1':[41],'uel-2026-espanhol-tipo1':[43]};
 for(const e of data){let pdf=await readFile(new URL(`../public/acervo/${e.id}/prova.pdf`,import.meta.url));assert.equal(createHash('sha256').update(pdf).digest('hex'),e.sha256_prova);for(let i=1;i<=e.paginas;i++)await access(new URL(`../public/acervo/${e.id}/${String(i).padStart(2,'0')}.webp`,import.meta.url));for(const key of Object.values(e.gabaritos)){assert.equal(key.length,60);assert.equal(key.slice(0,8).join(''),starts[e.id]);assert.deepEqual(key.map((a,i)=>a==='*'?i+1:null).filter(Boolean),stars[e.id]);assert(key.every(a=>a==='*'||e.alternativas.includes(a)));}}
 const [one,two]=data;assert.deepEqual(one.gabaritos.ingles.slice(22,27),['D','C','A','D','B']);assert.deepEqual(two.gabaritos.espanhol.slice(22,27),['B','D','B','A','C']);assert.deepEqual(one.alternativas,['A','B','C','D']);assert.equal(data[2].alternativas.length,5);
});

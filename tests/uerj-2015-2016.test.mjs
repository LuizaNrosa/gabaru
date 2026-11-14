import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
test('UERJ 2015 e 2016: cadernos, idiomas e anulação oficial',async()=>{
 const data=JSON.parse(await readFile(new URL('../src/data/uerj-2015-2016.json',import.meta.url),'utf8'));
 assert.equal(data.length,4);
 const expected={'uerj-2015-eq1':[['ABBDA','BBACD','ABACD'],[41]],'uerj-2015-eq2':[['DCADA','ADBDC','DCADB'],[]],'uerj-2016-eq1':[['CDBBD','BCBCA','CCBAB'],[]],'uerj-2016-eq2':[['CADDB','BDCAD','BADAC'],[]]};
 for(const e of data){const [foreign,annulled]=expected[e.id];assert.equal(e.lingua_inicio,17);assert.equal(e.lingua_fim,21);assert.equal(e.paginas,e.id==='uerj-2016-eq1'?34:40);assert.equal(e.inicio,e.id==='uerj-2016-eq1'?2:3);assert.deepEqual(e.alternativas,['A','B','C','D']);
  const pdf=await readFile(new URL(`../public/acervo/${e.id}/prova.pdf`,import.meta.url));assert.equal(createHash('sha256').update(pdf).digest('hex'),e.sha256_prova);
  for(let i=1;i<=e.paginas;i++)await access(new URL(`../public/acervo/${e.id}/${String(i).padStart(2,'0')}.webp`,import.meta.url));
  for(const [i,lang] of ['espanhol','frances','ingles'].entries()){const k=e.gabaritos[lang];assert.equal(k.length,60);assert(k.every(a=>/^[A-D*]$/.test(a)));assert.equal(k.slice(16,21).join(''),foreign[i]);assert.deepEqual(k.map((v,j)=>v==='*'?j+1:null).filter(Boolean),annulled);}
 }
});

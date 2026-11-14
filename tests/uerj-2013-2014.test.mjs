import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
test('UERJ 2013 e 2014: cadernos e gabaritos por idioma',async()=>{
 const data=JSON.parse(await readFile(new URL('../src/data/uerj-2013-2014.json',import.meta.url),'utf8'));assert.equal(data.length,4);
 const expected={'uerj-2013-eq1':[16,21,['ADBCCA','BDDADB','AADBBC']],'uerj-2013-eq2':[16,21,['BCDADB','ABACBD','DAACBD']],'uerj-2014-eq1':[17,21,['ABDBC','ACDCA','ADDCB']],'uerj-2014-eq2':[17,21,['BBABC','ABCBD','CBDDA']]};
 for(const e of data){const [start,end,foreign]=expected[e.id];assert.equal(e.lingua_inicio,start);assert.equal(e.lingua_fim,end);assert.equal(e.paginas,e.id==='uerj-2014-eq2'?48:40);assert.deepEqual(e.alternativas,['A','B','C','D']);
  const pdf=await readFile(new URL(`../public/acervo/${e.id}/prova.pdf`,import.meta.url));assert.equal(createHash('sha256').update(pdf).digest('hex'),e.sha256_prova);
  for(let i=1;i<=e.paginas;i++)await access(new URL(`../public/acervo/${e.id}/${String(i).padStart(2,'0')}.webp`,import.meta.url));
  for(const [i,lang] of ['espanhol','frances','ingles'].entries()){const k=e.gabaritos[lang];assert.equal(k.length,60);assert(k.every(a=>/^[A-D]$/.test(a)));assert.equal(k.slice(start-1,end).join(''),foreign[i]);}
 }
});

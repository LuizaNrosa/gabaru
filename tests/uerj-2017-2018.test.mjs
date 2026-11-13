import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
test('UERJ 2017 e 2018: cadernos, idiomas e anulação oficial',async()=>{
 const data=JSON.parse(await readFile(new URL('../src/data/uerj-2017-2018.json',import.meta.url),'utf8'));
 assert.equal(data.length,4);
 const expected={'uerj-2017-eq1':[17,['ADBCD','DBABC','BCDCA'],[]],'uerj-2017-eq2':[17,['CBDCA','DCABD','ACDCB'],[35]],'uerj-2018-eq1':[26,['BABDC','DDCAB','AACBD'],[]],'uerj-2018-eq2':[25,['BDACA','BCADD','DCBCA'],[]]};
 for(const e of data){const [start,foreign,annulled]=expected[e.id];assert.equal(e.lingua_inicio,start);assert.equal(e.lingua_fim,start+4);assert.deepEqual(e.alternativas,['A','B','C','D']);
  const pdf=await readFile(new URL(`../public/acervo/${e.id}/prova.pdf`,import.meta.url));assert.equal(createHash('sha256').update(pdf).digest('hex'),e.sha256_prova);
  for(let i=1;i<=e.paginas;i++)await access(new URL(`../public/acervo/${e.id}/${String(i).padStart(2,'0')}.webp`,import.meta.url));
  for(const [i,lang] of ['espanhol','frances','ingles'].entries()){const k=e.gabaritos[lang];assert.equal(k.length,60);assert(k.every(a=>/^[A-D*]$/.test(a)));assert.equal(k.slice(start-1,start+4).join(''),foreign[i]);assert.deepEqual(k.map((v,j)=>v==='*'?j+1:null).filter(Boolean),annulled);}
 }
});

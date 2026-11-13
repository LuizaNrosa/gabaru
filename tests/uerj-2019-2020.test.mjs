import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
test('UERJ 2019 e 2020: cadernos e gabaritos por idioma',async()=>{
 const data=JSON.parse(await readFile(new URL('../src/data/uerj-2019-2020.json',import.meta.url),'utf8'));
 assert.equal(data.length,4);
 const foreign={'uerj-2019-eq1':['ACDBC','DACCB','DDCAB'],'uerj-2019-eq2':['ACDBD','DABBB','BCADD'],'uerj-2020-eq1':['BABDC','BDACD','BDCDA'],'uerj-2020-eq2':['CBCAD','BDCBA','CDABA']};
 for(const e of data){
  assert.equal(e.lingua_inicio,e.ano===2019?24:23);assert.equal(e.lingua_fim,e.lingua_inicio+4);
  assert.deepEqual(e.alternativas,['A','B','C','D']);
  const pdf=await readFile(new URL(`../public/acervo/${e.id}/prova.pdf`,import.meta.url));
  assert.equal(createHash('sha256').update(pdf).digest('hex'),e.sha256_prova);
  for(let i=1;i<=e.paginas;i++)await access(new URL(`../public/acervo/${e.id}/${String(i).padStart(2,'0')}.webp`,import.meta.url));
  for(const [i,lang] of ['espanhol','frances','ingles'].entries()){
   const k=e.gabaritos[lang];assert.equal(k.length,60);assert(k.every(a=>/^[A-D]$/.test(a)));
   assert.equal(k.slice(e.lingua_inicio-1,e.lingua_fim).join(''),foreign[e.id][i]);
  }
 }
});

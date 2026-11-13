import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile,access} from 'node:fs/promises';import {createHash} from 'node:crypto';
test('IFMG, IFRN e IFCE de 2023: arquivos e correção',async()=>{
 const data=JSON.parse(await readFile(new URL('../src/data/ifs-2023.json',import.meta.url),'utf8'));assert.equal(data.length,3);
 for(const e of data){for(const name of ['prova','gabarito']){const b=await readFile(new URL(`../public/acervo/${e.id}/${name}.pdf`,import.meta.url));assert.equal(createHash('sha256').update(b).digest('hex'),e[`sha256_${name}`]);}for(let i=1;i<=e.paginas;i++)await access(new URL(`../public/acervo/${e.id}/${String(i).padStart(2,'0')}.webp`,import.meta.url));
  if(e.instituicao==='IFMG'){assert.equal(e.gabarito.length,50);assert.deepEqual(e.gabarito.map((v,i)=>v==='*'?i+1:null).filter(Boolean),[28,46]);assert(e.gabarito.every(v=>/^[A-D*]$/.test(v)));}else assert.equal(e.gabarito,null);
 }
});

import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile,access} from 'node:fs/promises';import {createHash} from 'node:crypto';
test('IFRN 2016–2018 e IFMG 2019: provas e gabaritos',async()=>{
 const data=JSON.parse(await readFile(new URL('../src/data/ifs-agentes.json',import.meta.url),'utf8'));assert.equal(data.length,4);
 const expected={'ifrn-2016':[7,17],'ifrn-2017':[14,33],'ifrn-2018':[5],'ifmg-2019-1':[35]};
 for(const e of data){for(const name of ['prova','gabarito']){const b=await readFile(new URL(`../public/acervo/${e.id}/${name}.pdf`,import.meta.url));assert.equal(createHash('sha256').update(b).digest('hex'),e[`sha256_${name}`]);}for(let i=1;i<=e.paginas;i++)await access(new URL(`../public/acervo/${e.id}/${String(i).padStart(2,'0')}.webp`,import.meta.url));assert.equal(e.gabarito.length,e.total);assert(e.gabarito.every(v=>/^[A-D*]$/.test(v)));assert.deepEqual(e.gabarito.map((v,i)=>v==='*'?i+1:null).filter(Boolean),expected[e.id]);}
});

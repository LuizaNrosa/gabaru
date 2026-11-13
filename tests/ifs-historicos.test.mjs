import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile,access} from 'node:fs/promises';import {createHash} from 'node:crypto';
test('IFRN 2019, 2020 e 2026 e IFMG 2020: arquivos e anulações',async()=>{
 const data=JSON.parse(await readFile(new URL('../src/data/ifs-historicos.json',import.meta.url),'utf8'));assert.equal(data.length,4);
 const expected={'ifrn-2019':[11],'ifrn-2020':[7,26],'ifrn-2026':[37],'ifmg-2020-1':[]};
 for(const e of data){for(const name of ['prova','gabarito']){const b=await readFile(new URL(`../public/acervo/${e.id}/${name}.pdf`,import.meta.url));assert.equal(createHash('sha256').update(b).digest('hex'),e[`sha256_${name}`]);}for(let i=1;i<=e.paginas;i++)await access(new URL(`../public/acervo/${e.id}/${String(i).padStart(2,'0')}.webp`,import.meta.url));assert.equal(e.gabarito.length,e.total);assert(e.gabarito.every(v=>/^[A-D*]$/.test(v)));assert.deepEqual(e.gabarito.map((v,i)=>v==='*'?i+1:null).filter(Boolean),expected[e.id]);}
});

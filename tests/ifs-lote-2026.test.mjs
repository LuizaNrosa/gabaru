import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile,access} from 'node:fs/promises';import {createHash} from 'node:crypto';
test('quatro cadernos IFMG, IFRN e IFCE: arquivos e gabaritos',async()=>{
 const data=JSON.parse(await readFile(new URL('../src/data/ifs-lote-2026.json',import.meta.url),'utf8'));assert.equal(data.length,4);
 const keys={'ifmg-2026-1':'AAACBABCAABAACBDDAACA*ADADBBBDCBADADCB*DADBBCC*D','ifrn-2025':'CBADBDABBCDCDAADCACBDCBCDACBACCADACABABD','ifrn-2022':'BACBDCBAABCADCCABADBCBDADABDCDDCBABCCDCB'};
 for(const e of data){for(const name of ['prova','gabarito']){const b=await readFile(new URL(`../public/acervo/${e.id}/${name}.pdf`,import.meta.url));assert.equal(createHash('sha256').update(b).digest('hex'),e[`sha256_${name}`]);}for(let i=1;i<=e.paginas;i++)await access(new URL(`../public/acervo/${e.id}/${String(i).padStart(2,'0')}.webp`,import.meta.url));
  if(e.gabarito){assert.equal(e.gabarito.length,e.total);assert.equal(e.gabarito.join(''),keys[e.id]);}else assert.equal(e.id,'ifce-fortaleza-caucaia-2025-1');
 }
});

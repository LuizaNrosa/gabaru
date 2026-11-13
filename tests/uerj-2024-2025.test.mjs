import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile,access} from 'node:fs/promises';import {createHash} from 'node:crypto';
test('quatro exames UERJ 2024–2025: gabaritos, idiomas, anulações e arquivos',async()=>{
 const data=JSON.parse(await readFile(new URL('../src/data/uerj-2024-2025.json',import.meta.url),'utf8'));assert.equal(data.length,4);
 const stars={'uerj-2025-eq1':[],'uerj-2025-eq2':[38],'uerj-2024-eq1':[29],'uerj-2024-eq2':[59]};
 const idiomas={'uerj-2025-eq1':['BDACD','CADDB','ACBDD'],'uerj-2025-eq2':['ADBCC','DCACB','DCBCA'],'uerj-2024-eq1':['CCBDA','ADBCA','CBDDA'],'uerj-2024-eq2':['BACDB','BCDAA','CBDAD']};
 for(const e of data){assert.deepEqual(e.alternativas,['A','B','C','D']);const pdf=await readFile(new URL(`../public/acervo/${e.id}/prova.pdf`,import.meta.url));assert.equal(createHash('sha256').update(pdf).digest('hex'),e.sha256_prova);for(let i=1;i<=e.paginas;i++)await access(new URL(`../public/acervo/${e.id}/${String(i).padStart(2,'0')}.webp`,import.meta.url));for(const [i,lang] of ['espanhol','frances','ingles'].entries()){const k=e.gabaritos[lang];assert.equal(k.length,60);assert.equal(k.slice(22,27).join(''),idiomas[e.id][i]);assert.deepEqual(k.map((a,i)=>a==='*'?i+1:null).filter(Boolean),stars[e.id]);assert(k.every(a=>/^[A-D*]$/.test(a)));}}
});

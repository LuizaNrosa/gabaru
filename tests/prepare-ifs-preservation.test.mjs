import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const script=fileURLToPath(new URL('../scripts/prepare-ifs-reader.mjs',import.meta.url));
test('preparar o leitor IF preserva os bytes da prova e do gabarito',async()=>{
 const root=await mkdtemp(join(tmpdir(),'gabaru-ifs-preservacao-'));
 const catalogs=['ifs-primeiros','ifs-2023','ifs-lote-2026','ifmt-2025-1','ifmt-2026-1','ifrs-2025-1','ifrs-2026-1','ifrn-2026'];
 const pdf=Buffer.from('%PDF-1.7\noriginal fixture\n%%EOF');
 try{
  await mkdir(join(root,'src/data'),{recursive:true});await mkdir(join(root,'public/acervo/ifrn-fixture'),{recursive:true});
  for(const [i,catalog] of catalogs.entries())await writeFile(join(root,'src/data',catalog+'.json'),JSON.stringify(i===0?[{id:'ifrn-fixture',paginas:1,gabarito:['A'],total:1,alternativas:['A','B']}]:[]));
  const image=Buffer.from('RIFF0000WEBP');await writeFile(join(root,'public/acervo/ifrn-fixture/01.webp'),image);
  for(const name of ['prova','gabarito'])await writeFile(join(root,'public/acervo/ifrn-fixture',name+'.pdf'),pdf);
  for(let attempt=0;attempt<2;attempt++){const result=spawnSync(process.execPath,[script],{cwd:root,encoding:'utf8'});assert.equal(result.status,0,result.stderr);for(const name of ['prova','gabarito'])assert.deepEqual(await readFile(join(root,'public/acervo/ifrn-fixture',name+'.pdf')),pdf);assert.deepEqual(await readFile(join(root,'public/acervo/ifrn-fixture/01.webp')),image);}
 }finally{await rm(root,{recursive:true,force:true});}
});

import test from 'node:test';import assert from 'node:assert/strict';import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';import {spawnSync} from 'node:child_process';
test('checkpoint retoma sem duplicar e rejeita letra divergente sem salvar resolução',()=>{
 const dir=mkdtempSync('work/test-resolucoes-');try{
 const source=JSON.parse(readFileSync('src/data/editorial/piloto-fase2.json'));const id='enem-2025-d2-q153';const input=dir+'/entrada.json',output=dir+'/saida.json',checkpoint=dir+'/checkpoint.json';writeFileSync(input,JSON.stringify({[id]:source[id]}));
 const args=['scripts/gerar-resolucoes-lote.mjs','--entrada='+input,'--saida='+output,'--checkpoint='+checkpoint];let result=spawnSync(process.execPath,args,{encoding:'utf8'});assert.equal(result.status,0,result.stderr);assert.equal(JSON.parse(result.stdout).aceitas,1);
 result=spawnSync(process.execPath,args,{encoding:'utf8'});assert.equal(result.status,0);assert.equal(JSON.parse(result.stdout).retomadas,1);
 source[id].resolucaoEstruturada.alternativaCorreta='A';writeFileSync(input,JSON.stringify({[id]:source[id]}));result=spawnSync(process.execPath,args,{encoding:'utf8'});assert.equal(result.status,1);assert.deepEqual(JSON.parse(readFileSync(output)),{});assert.equal(JSON.parse(readFileSync(checkpoint)).itens[id].status,'rejeitada');
 }finally{rmSync(dir,{recursive:true});}
});

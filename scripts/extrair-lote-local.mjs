import {readFile,writeFile,mkdir} from 'node:fs/promises';import {spawnSync} from 'node:child_process';
const args=Object.fromEntries(process.argv.slice(2).map(x=>x.replace(/^--/,'').split('=')));
const limit=Number(args.lote??5);if(!Number.isInteger(limit)||limit<1||limit>10)throw Error('Lote entre 1 e 10');
const path='docs/engenharia/fase2/progresso-extracao-local.json';let progress={};try{progress=JSON.parse(await readFile(path,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
await mkdir('work/extracao/logs',{recursive:true});let count=0;
for(const bank of ['etec','coluni','ifsc','ifsp'])for(const e of JSON.parse(await readFile(`src/data/${bank}-exams.json`,'utf8'))){
 if(args.banca&&!args.banca.split(',').includes(bank))continue;
 const id=`${bank}-${e.id}`;if(progress[id]||count>=limit)continue;count++;
 const result=spawnSync(process.execPath,['scripts/extrair-provas-pdf.mjs',`--banca=${bank}`,`--edicao=${e.id}`],{encoding:'utf8',timeout:120000,maxBuffer:1024*1024*4});
 await writeFile(`work/extracao/logs/${id}.log`,result.stdout+'\n'+result.stderr);
 progress[id]={status:result.status===0?'processado':'retido',erro:result.status===0?null:(result.error?.message??result.stderr).slice(-1500)};
 await writeFile(path,JSON.stringify(progress,null,2)+'\n');console.log(id,progress[id].status);
}
console.log('Lote concluído:',count,'Total:',Object.keys(progress).length);

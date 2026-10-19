import {readFile,mkdir,writeFile,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const exams=JSON.parse(await readFile('src/data/etec-exams.json','utf8'));
const jobs=exams.flatMap(e=>[{id:e.id,name:'prova',url:e.examUrl,hash:e.examSha256},{id:e.id,name:'gabarito',url:e.answerUrl,hash:e.answerSha256}]);
const digest=b=>createHash('sha256').update(b).digest('hex');
let cursor=0,complete=0;
async function worker(){while(cursor<jobs.length){const job=jobs[cursor++];const dir=path.join('public','acervo','etec',job.id),file=path.join(dir,job.name+'.pdf');try{if(digest(await readFile(file))===job.hash){complete++;continue;}}catch{}
 const url=new URL(job.url);if(url.protocol!=='https:'||!['fatweb.s3.amazonaws.com','vestibulinho.etec.sp.gov.br'].includes(url.hostname))throw new Error('Fonte não permitida: '+job.id);
 let bytes;for(let attempt=0;attempt<2;attempt++){try{const response=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!response.ok)throw new Error('HTTP '+response.status);bytes=Buffer.from(await response.arrayBuffer());if(bytes.subarray(0,4).toString()!=='%PDF'||digest(bytes)!==job.hash)throw new Error('Integridade inválida');break;}catch(error){if(attempt===1)throw new Error(`${job.id}/${job.name}: ${error.message}`);}}
 await mkdir(dir,{recursive:true});await writeFile(file+'.tmp',bytes);await rename(file+'.tmp',file);complete++;console.log(`ETEC ${complete}/${jobs.length}: ${job.id}/${job.name}`);
}}
await Promise.all(Array.from({length:4},worker));console.log(`ETEC: ${complete} PDFs oficiais verificados.`);

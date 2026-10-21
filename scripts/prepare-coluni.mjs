import {readFile,mkdir,writeFile,rename,rm} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

export function validateExams(exams){
 if(!Array.isArray(exams))throw new Error('Catálogo COLUNI inválido');
 const ids=new Set(),hashes=new Set(),hosts=new Set(['www.pse.coluni.ufv.br','coluni.ufv.br']);
 for(const e of exams){
  const fail=m=>{throw new Error(`COLUNI ${e.id}: ${m}`);};
  if(typeof e.id!=='string'||!/^\d{4}$/.test(e.id)||ids.has(e.id))fail('edição inválida ou duplicada');
  ids.add(e.id);
  for(const field of ['examSha256','answerSha256'])if(!/^[0-9a-f]{64}$/.test(e[field]??''))fail(`hash inválido: ${field}`);
  if(hashes.has(e.examSha256))fail('caderno duplicado por hash');
  hashes.add(e.examSha256);
  for(const field of ['examUrl','answerUrl']){
   let url;try{url=new URL(e[field]);}catch{fail(`URL inválida: ${field}`);}
   if(url.protocol!=='https:'||!hosts.has(url.hostname)||url.username||url.password||url.port)fail(`fonte não oficial: ${field}`);
  }
  if(!Number.isInteger(e.pageCount)||e.pageCount<1||!Array.isArray(e.pages)||e.pages.length!==e.pageCount)fail('total de páginas divergente');
  for(let i=0;i<e.pages.length;i++)if(e.pages[i].number!==i+1||typeof e.pages[i].text!=='string')fail(`página inválida: ${i+1}`);
  if(!Array.isArray(e.questions)||!e.questions.length)fail('questões ausentes');
  for(let i=0;i<e.questions.length;i++){
   const q=e.questions[i];
   if(q.number!==i+1)fail(`sequência de questões inválida: ${i+1}`);
   if(!['A','B','C','D','ANULADA'].includes(q.answer))fail(`resposta inválida: ${q.number}`);
   if(!Number.isInteger(q.page)||q.page<1||q.page>e.pageCount||q.pageMapped!==true)fail(`mapeamento não revisado: ${q.number}`);
  }
  if(typeof e.answerKeyRevised!=='boolean')fail('estado de revisão do gabarito ausente');
 }
 return exams;
}

const digest=b=>createHash('sha256').update(b).digest('hex');
const transient=new Set([408,425,429,500,502,503,504]);
export async function prepareExams(exams,{root='.',fetcher=fetch,delay=ms=>new Promise(r=>setTimeout(r,ms))}={}){
 validateExams(exams);
 const jobs=exams.flatMap(e=>[['prova',e.examUrl,e.examSha256],['gabarito',e.answerUrl,e.answerSha256]].map(([name,url,hash])=>({e,name,url,hash})));
 let next=0;
 async function worker(){
  while(next<jobs.length){
   const {e,name,url,hash}=jobs[next++];
   const folder=path.join(root,'public','acervo','coluni',e.id),file=path.join(folder,name+'.pdf');
   try{if(digest(await readFile(file))===hash)continue;}catch{}
   let bytes;
   for(let attempt=0;attempt<3;attempt++){
    let response;
    try{response=await fetcher(url,{signal:AbortSignal.timeout(60000),redirect:'error'});}catch(error){
     if(attempt===2||!['TimeoutError','AbortError'].includes(error.name)&&!['ECONNRESET','ETIMEDOUT','EAI_AGAIN','ECONNREFUSED','UND_ERR_CONNECT_TIMEOUT','UND_ERR_SOCKET'].includes(error.cause?.code??error.code))throw error;
     await delay(500*2**attempt);continue;
    }
    if(!response.ok){
     if(attempt<2&&transient.has(response.status)){await response.body?.cancel();await delay(500*2**attempt);continue;}
     throw new Error(`COLUNI ${e.id}/${name}: HTTP ${response.status}`);
    }
    bytes=Buffer.from(await response.arrayBuffer());break;
   }
   if(!bytes||bytes.subarray(0,4).toString()!=='%PDF'||digest(bytes)!==hash)throw new Error('PDF divergente da fonte conferida: '+file);
   await mkdir(folder,{recursive:true});
   const temp=file+'.'+randomUUID()+'.tmp';
   try{await writeFile(temp,bytes);await rename(temp,file);}finally{await rm(temp,{force:true});}
  }
 }
 const outcomes=await Promise.allSettled(Array.from({length:Math.min(4,jobs.length)},worker));
 const failures=outcomes.filter(x=>x.status==='rejected');
 if(failures.length)throw new AggregateError(failures.map(x=>x.reason),'Falha na preparação COLUNI');
 console.log(`COLUNI: ${jobs.length} PDFs oficiais verificados; ${exams.reduce((n,e)=>n+e.questions.length,0)} questões.`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 await prepareExams(JSON.parse(await readFile('src/data/coluni-exams.json','utf8')));
}

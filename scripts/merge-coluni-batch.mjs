import {readFile,writeFile,rename,rm,mkdir} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {validateExams} from './prepare-coluni.mjs';

// A revisão humana independente é obrigatória; este comando nunca publica.
export async function mergeBatch({batchFile,reviewFile,root='.',write=false}){
 const catalogFile=path.join(root,'src/data/coluni-exams.json');
 const [catalog,batch,review]=await Promise.all([catalogFile,batchFile,reviewFile].map(async p=>JSON.parse(await readFile(p,'utf8'))));
 validateExams(catalog);validateExams(batch);
 if(review.status!=='approved'||!review.extractor||!review.reviewer||review.extractor===review.reviewer)throw new Error('Revisão independente aprovada ausente');
 for(const e of batch){
  const evidence=review.editions?.find(x=>x.id===e.id);
  if(!evidence||evidence.examSha256!==e.examSha256||evidence.answerSha256!==e.answerSha256||evidence.questionCount!==e.questions.length||!evidence.answersChecked||!evidence.pagesChecked)throw new Error('Evidência de revisão divergente: '+e.id);
 }
 const merged=[...catalog,...batch].sort((a,b)=>b.id.localeCompare(a.id));
 validateExams(merged); // IDs e cadernos repetidos são recusados, nunca sobrescritos.
 for(const e of merged)for(const [name,key] of [['prova','examSha256'],['gabarito','answerSha256']]){
  const bytes=await readFile(path.join(root,'public/acervo/coluni',e.id,name+'.pdf'));
  if(bytes.subarray(0,4).toString()!=='%PDF'||createHash('sha256').update(bytes).digest('hex')!==e[key])throw new Error('PDF local ausente ou divergente: '+e.id+'/'+name);
 }
 const report={added:batch.map(e=>e.id),editions:merged.length,questions:merged.reduce((n,e)=>n+e.questions.length,0),written:write};
 if(write){
  const temp=catalogFile+'.'+randomUUID()+'.tmp';
  try{await writeFile(temp,JSON.stringify(merged));await rename(temp,catalogFile);}finally{await rm(temp,{force:true});}
 }
 return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const [batchFile,reviewFile,...flags]=process.argv.slice(2);
 if(!batchFile||!reviewFile||flags.some(x=>x!=='--write'))throw new Error('Uso: node scripts/merge-coluni-batch.mjs lote.json revisao.json [--write]');
 console.log(JSON.stringify(await mergeBatch({batchFile,reviewFile,write:flags.includes('--write')}),null,2));
}

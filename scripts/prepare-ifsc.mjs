import {readFile,mkdir,writeFile,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const exams=JSON.parse(await readFile('src/data/ifsc-exams.json','utf8'));
const digest=b=>createHash('sha256').update(b).digest('hex');
const ids=new Set(),hashes=new Set();
for(const e of exams){
 if(!/^\d{4}-\d(-itajai)?$/.test(e.id)||ids.has(e.id)||hashes.has(e.examSha256))throw new Error('Edição ou caderno duplicado/inválido: '+e.id);
 ids.add(e.id);hashes.add(e.examSha256);
 if(new Set(e.questions.map(q=>q.number)).size!==e.questions.length)throw new Error('Questões duplicadas: '+e.id);
 const docs=[['prova',e.examUrl,e.examSha256],['gabarito',e.answerUrl,e.answerSha256],
  ...(e.extraMaterials??[]).map(x=>[x.file.replace(/\.pdf$/,''),x.url,x.sha256])];
 for(const [name,url,hash] of docs){
  if(!/^[a-zA-Z0-9_-]+$/.test(name))throw new Error("Nome de documento inválido");
  const source=new URL(url);
  // Host oficial único: todos os documentos do acervo do IFSC (cadernos,
  // gabaritos e respostas a recursos) vivem em www.ifsc.edu.br, incluindo
  // os endereços antigos /documents/177207/ da edição 2022.1. Proveniência
  // e hashes registados em ~/workspace/gabaru-ifs/ACERVO.md.
  if(source.protocol!=='https:'||source.hostname!=='www.ifsc.edu.br')throw new Error('Fonte não oficial: '+url);
  const folder=path.join('public','acervo','ifsc',e.id),file=path.join(folder,name+'.pdf');
  try{if(digest(await readFile(file))===hash)continue;}catch{}
  const response=await fetch(source,{signal:AbortSignal.timeout(60000),redirect:'error'});
  if(!response.ok)throw new Error(`IFSC ${e.id}/${name}: HTTP ${response.status}`);
  const bytes=Buffer.from(await response.arrayBuffer());
  if(bytes.subarray(0,4).toString()!=='%PDF'||digest(bytes)!==hash)throw new Error('PDF divergente da fonte conferida: '+file);
  await mkdir(folder,{recursive:true});await writeFile(file+'.tmp',bytes);await rename(file+'.tmp',file);
 }
}
console.log(`IFSC: ${exams.reduce((n,e)=>n+2+(e.extraMaterials?.length??0),0)} PDFs oficiais verificados; ${exams.reduce((n,e)=>n+e.questions.length,0)} questões.`);

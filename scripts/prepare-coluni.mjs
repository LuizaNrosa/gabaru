import {readFile,mkdir,writeFile,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const exams=JSON.parse(await readFile('src/data/coluni-exams.json','utf8'));
const digest=b=>createHash('sha256').update(b).digest('hex');
const ids=new Set(),hashes=new Set();
for(const e of exams){
 if(!/^\d{4}$/.test(e.id)||ids.has(e.id)||hashes.has(e.examSha256))throw new Error('Edição ou caderno duplicado/inválido: '+e.id);
 ids.add(e.id);hashes.add(e.examSha256);
 if(new Set(e.questions.map(q=>q.number)).size!==e.questions.length)throw new Error('Questões duplicadas: '+e.id);
 for(const [name,url,hash] of [['prova',e.examUrl,e.examSha256],['gabarito',e.answerUrl,e.answerSha256]]){
  const source=new URL(url);
  // Hosts oficiais: o portal PSE (edições 2022–2026) e o site da escola
  // (edições 2016–2021, cujos ficheiros vivem em coluni.ufv.br — alargado
  // na integração das edições antigas, 2026-11-03; proveniência e hashes
  // registados em ~/workspace/gabaru-coluni/PROVAS-ANTIGAS.md).
  if(source.protocol!=='https:'||!new Set(['www.pse.coluni.ufv.br','coluni.ufv.br']).has(source.hostname))throw new Error('Fonte não oficial: '+url);
  const folder=path.join('public','acervo','coluni',e.id),file=path.join(folder,name+'.pdf');
  try{if(digest(await readFile(file))===hash)continue;}catch{}
  const response=await fetch(source,{signal:AbortSignal.timeout(60000),redirect:'error'});
  if(!response.ok)throw new Error(`COLUNI ${e.id}/${name}: HTTP ${response.status}`);
  const bytes=Buffer.from(await response.arrayBuffer());
  if(bytes.subarray(0,4).toString()!=='%PDF'||digest(bytes)!==hash)throw new Error('PDF divergente da fonte conferida: '+file);
  await mkdir(folder,{recursive:true});await writeFile(file+'.tmp',bytes);await rename(file+'.tmp',file);
 }
}
console.log(`COLUNI: ${exams.length*2} PDFs oficiais verificados; ${exams.reduce((n,e)=>n+e.questions.length,0)} questões.`);

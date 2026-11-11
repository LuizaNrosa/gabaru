import {readFile,mkdir,writeFile,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const exams=JSON.parse(await readFile('src/data/ifsp-exams.json','utf8'));
const digest=b=>createHash('sha256').update(b).digest('hex');
const ids=new Set(),hashes=new Set();
// Fontes oficiais do acervo do IFSP: o portal de processos seletivos e o
// site institucional do IFSP e, para 2026.1, o portal da Fundação
// CEFETMINAS — banca nomeada no item 1.4 do Edital IFSP n.º 211/2025
// (o gabarito final dos Tipos 1 e 2 é o MESMO PDF para as duas provas,
// por isso examUrl/answerUrl se repetem entre essas duas entradas).
// Proveniência e hashes registados em ~/workspace/gabaru-ifsp/ACERVO.md.
const HOSTS=new Set(['processoseletivo.ifsp.edu.br','www.ifsp.edu.br','ifsp.edu.br','concurso30.fundacaocefetminas.org.br']);
for(const e of exams){
 if(!/^\d{4}-\d-(a|b|manha|tarde|tipo1|tipo2)$/.test(e.id)||ids.has(e.id)||hashes.has(e.examSha256))throw new Error('Edição ou caderno duplicado/inválido: '+e.id);
 ids.add(e.id);hashes.add(e.examSha256);
 if(new Set(e.questions.map(q=>q.number)).size!==e.questions.length)throw new Error('Questões duplicadas: '+e.id);
 const docs=[['prova',e.examUrl,e.examSha256],['gabarito',e.answerUrl,e.answerSha256],
  ...(e.extraMaterials??[]).map(x=>[x.file.replace(/\.pdf$/,''),x.url,x.sha256])];
 for(const [name,url,hash] of docs){
  if(!/^[a-zA-Z0-9_-]+$/.test(name))throw new Error('Nome de documento inválido');
  const source=new URL(url);
  if(source.protocol!=='https:'||!HOSTS.has(source.hostname))throw new Error('Fonte não oficial: '+url);
  const folder=path.join('public','acervo','ifsp',e.id),file=path.join(folder,name+'.pdf');
  try{if(digest(await readFile(file))===hash)continue;}catch{}
  const response=await fetch(source,{signal:AbortSignal.timeout(60000),redirect:'error',headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',Accept:'application/pdf,*/*'}});
  if(!response.ok)throw new Error(`IFSP ${e.id}/${name}: HTTP ${response.status}`);
  const bytes=Buffer.from(await response.arrayBuffer());
  if(bytes.subarray(0,4).toString()!=='%PDF'||digest(bytes)!==hash)throw new Error('PDF divergente da fonte conferida: '+file);
  await mkdir(folder,{recursive:true});await writeFile(file+'.tmp',bytes);await rename(file+'.tmp',file);
 }
}
console.log(`IFSP: ${exams.reduce((n,e)=>n+2+(e.extraMaterials?.length??0),0)} PDFs oficiais verificados; ${exams.reduce((n,e)=>n+e.questions.length,0)} questões.`);

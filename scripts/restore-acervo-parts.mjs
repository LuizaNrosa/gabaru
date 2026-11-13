import {readFile,mkdir,writeFile,rename,rm,realpath} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const validPdf=(bytes,hash)=>bytes.subarray(0,4).toString()==='%PDF'&&sha256(bytes)===hash;
export function validateManifest(manifest){
 if(!Array.isArray(manifest))throw new Error('Manifesto de partes inválido');
 const files=new Set(),parts=new Set();
 for(const entry of manifest){
  if(!entry||typeof entry.file!=='string')throw new Error('Arquivo de destino inválido');
  const match=/^public\/acervo\/(etec|coluni)\/([0-9][a-z0-9-]*)\/(prova|gabarito)\.pdf$/.exec(entry.file);
  if(!match||files.has(entry.file))throw new Error('Destino inválido ou duplicado: '+entry.file);
  files.add(entry.file);
  if(!/^[a-f0-9]{64}$/.test(entry.sha256??''))throw new Error('SHA256 inválido: '+entry.file);
  if(!Array.isArray(entry.parts)||entry.parts.length===0)throw new Error('Partes ausentes: '+entry.file);
  const base=`acervo-parts/${match[1]}/${match[2]}/${match[3]}.pdf.part`;
  for(let i=0;i<entry.parts.length;i++){
   const part=entry.parts[i];
   if(part!==base+i||parts.has(part))throw new Error('Parte inválida, duplicada ou fora de ordem: '+part);
   parts.add(part);
  }
 }
 return manifest;
}

export async function restoreParts(manifest,{root=process.cwd()}={}){
 validateManifest(manifest);
 const directory=await realpath(path.resolve(root));
 const inside=file=>file.startsWith(directory+path.sep);
 const safeExisting=async file=>{
  const actual=await realpath(file);
  if(!inside(actual))throw new Error('Caminho escapa do diretório de trabalho: '+file);
  return actual;
 };
 const safeParent=async folder=>{
  let ancestor=folder;
  for(;;){
   try{
    const actual=await realpath(ancestor);
    if(actual!==directory&&!inside(actual))throw new Error('Caminho escapa do diretório de trabalho: '+folder);
    return;
   }catch(error){if(error.code!=='ENOENT')throw error;}
   ancestor=path.dirname(ancestor);
  }
 };
 let restored=0,cached=0;
 for(const entry of manifest){
  const target=path.join(directory,entry.file);
  try{
   const actual=await safeExisting(target);
   if(validPdf(await readFile(actual),entry.sha256)){cached++;continue;}
  }catch(error){if(error.code!=='ENOENT')throw error;}
  const chunks=[];
  for(const part of entry.parts)chunks.push(await readFile(await safeExisting(path.join(directory,part))));
  const bytes=Buffer.concat(chunks);
  if(!validPdf(bytes,entry.sha256))throw new Error('PDF reconstruído divergente: '+entry.file);
  const folder=path.dirname(target);
  await safeParent(folder);
  await mkdir(folder,{recursive:true});
  await safeExisting(folder);
  const temporary=target+'.'+randomUUID()+'.tmp';
  try{await writeFile(temporary,bytes,{flag:'wx'});await rename(temporary,target);}finally{await rm(temporary,{force:true});}
  restored++;
 }
 return {restored,cached};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const manifest=JSON.parse(await readFile('src/data/acervo-parts.json','utf8'));
 const {restored,cached}=await restoreParts(manifest);
 console.log(`Acervo: ${restored} PDFs reconstruídos; ${cached} já íntegros.`);
}

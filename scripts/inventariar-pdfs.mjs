import { readdir,readFile,writeFile,mkdir } from 'node:fs/promises';
import { resolve,relative } from 'node:path';
import { createHash } from 'node:crypto';
const root=process.cwd();
async function walk(dir){const paths=[];try{for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);if(e.isDirectory())paths.push(...await walk(p));else if(e.name.toLowerCase().endsWith('.pdf'))paths.push(p);}}catch(e){if(e.code!=='ENOENT')throw e;}return paths;}
const files=[];
for(const file of [...await walk('public'),...await walk('.next/cache')].sort()){const data=await readFile(file);files.push({arquivo:relative(root,file),bytes:data.length,sha256:createHash('sha256').update(data).digest('hex'),assinaturaPdf:data.subarray(0,5).toString()==='%PDF-'});}
const datasets=JSON.parse(await readFile('src/data/enem-cadernos-paginados.json','utf8'));
const pending=[];
for(const e of datasets){const missing=[];for(let n=1;n<=e.pageCount;n++){try{await readFile(`public/acervo/enem/${e.id}/${String(n).padStart(2,'0')}.webp`);}catch{missing.push(n);}}
if(missing.length)pending.push({id:e.id,url:e.questionCopy,sha256:e.questionCopySha256,paginasAusentes:missing.length,source:e.questionSource,cached:files.some(f=>f.sha256===e.questionCopySha256)});}
await mkdir('docs/engenharia/fase2',{recursive:true});
await writeFile('docs/engenharia/fase2/inventario-pdfs.json',JSON.stringify({arquivos:files,pendenciasEnem:pending},null,2)+'\n');
console.log(JSON.stringify({pdfs:files.length,unicosPorSha256:new Set(files.map(f=>f.sha256)).size,publicos:files.filter(f=>f.arquivo.startsWith('public/')).length,cache:files.filter(f=>f.arquivo.startsWith('.next/')).length,primeirasPendencias:pending.slice(0,3)},null,2));

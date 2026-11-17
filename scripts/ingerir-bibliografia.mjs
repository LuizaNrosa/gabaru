// © 2026 Luiza Nascimento Rosa. Extração local; nenhum PDF é publicado.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {PDFParse} from 'pdf-parse';
import {z} from 'zod';
export const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export function atomic(file,data){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file+'.tmp',JSON.stringify(data,null,2)+'\n');fs.renameSync(file+'.tmp',file);}
export function readMap(root='bibliografia-pdfs'){
 const file=path.join(root,'MAPA-FONTES.json');
 return fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{versao:2,fontes:[],capitulos:[]};
}
const attribution=z.object({arquivo:z.string(),sha256:z.string().regex(/^[a-f0-9]{64}$/),titulo:z.string().min(3),autores:z.array(z.string().min(1)).min(1),url:z.url().refine(v=>['https:','http:'].includes(new URL(v).protocol)),licenca:z.string().min(1),evidenciaLicenca:z.string().min(3),usoComercialAutorizado:z.boolean(),paginasAutorizadas:z.array(z.number().int().positive()).optional()});
export async function ingerir(root='bibliografia-pdfs',output='work/bibliografia/indice.json'){
 if(!fs.existsSync(root))throw Error('Pasta de bibliografia inexistente: '+root);
 const map=readMap(root),authorizationsFile=path.join(root,'AUTORIZACOES.json');
 const authorizations=fs.existsSync(authorizationsFile)?z.array(attribution).parse(JSON.parse(fs.readFileSync(authorizationsFile,'utf8'))):[];
 const entries=[];
 function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isSymbolicLink())throw Error('Links simbólicos não são aceitos: '+file);if(e.isDirectory())walk(file);else if(/\.pdf$/i.test(e.name))entries.push(file);}}
 walk(root);const records=[];
 for(const file of entries.sort()){
  const rel=path.relative(root,file).replaceAll(path.sep,'/');
  const rule=map.fontes.find(f=>path.basename(file).toLowerCase().startsWith(f.prefixo));
  const legacy=rule?null:/^([a-z0-9]+(?:-[a-z0-9]+)*)\/([a-z0-9]+(?:-[a-z0-9]+)*)\.pdf$/i.exec(rel);
  if(!legacy&&!rule)throw Error('PDF sem prefixo cadastrado no MAPA-FONTES.json nem caminho <livro>/<capitulo>.pdf: '+rel);
  if(legacy&&records.some(d=>d.livro===legacy[1].toLowerCase()&&d.capitulo===legacy[2].toLowerCase()))throw Error('Slugs duplicados na bibliografia: '+rel);
  const bytes=fs.readFileSync(file),hash=sha(bytes);
  if(bytes.length>(legacy?32:64)*1024*1024||bytes.subarray(0,5).toString()!=='%PDF-')throw Error('PDF inválido ou maior que o limite de 32/64 MiB: '+rel);
  const found=authorizations.filter(a=>a.arquivo===rel);
  if(found.length>1)throw Error('Autorização duplicada: '+rel);
  if(found[0]&&found[0].sha256!==hash)throw Error('Autorização com SHA-256 divergente: '+rel);
  const parser=new PDFParse({data:new Uint8Array(bytes)});let result,total=0,extractionError;
  try{const info=await parser.getInfo();total=info.total;if(info.total>(legacy?30:1500))throw Error('PDF excede limite de páginas (30 por capítulo legado / 1500 por fonte mapeada): '+rel);result=await parser.getText();}catch(error){if(legacy)throw error;extractionError=String(error.message).slice(0,240);result={pages:[]};}finally{await parser.destroy();}
  const raw=result.pages.map((p,i)=>({pagina:p.num??i+1,texto:p.text.replace(/-- \d+ of \d+ --/g,'').trim()}));
  const bad=p=>p.texto.length<40||/[\uFFFD\u1200-\u139f\u0b00-\u0b7f\u0d00-\u0d7f]/u.test(p.texto);
  if(legacy&&raw.some(bad))throw Error('Página sem texto legível; faça OCR/revisão antes de gerar: '+rel);
  const pages=raw.filter(p=>!bad(p));const status=extractionError?'quarentena-extracao':!pages.length?'quarentena-ocr':'extraido';
  records.push({status,...(extractionError?{erro:extractionError}:{}),...(legacy?{livro:legacy[1].toLowerCase(),capitulo:legacy[2].toLowerCase()}:{}),arquivo:path.resolve(file),sha256:hash,paginas:pages,paginasOmitidas:raw.filter(bad).map(p=>p.pagina),totalPaginas:total||raw.length,prefixo:rule?.prefixo,destinos:legacy?[{livro:legacy[1].toLowerCase(),capitulo:legacy[2].toLowerCase()}]:map.capitulos.filter(c=>c.prefixos.includes(rule.prefixo)).map(c=>({livro:c.livro,capitulo:c.capitulo})),bibliografia:found[0]??null});
 }
 atomic(output,{versao:2,mapaSha256:fs.existsSync(path.join(root,'MAPA-FONTES.json'))?sha(fs.readFileSync(path.join(root,'MAPA-FONTES.json'))):null,documentos:records});
 console.log(JSON.stringify({pdfs:records.length,quarentena:records.filter(r=>r.status.startsWith('quarentena')).length,paginas:records.reduce((n,r)=>n+r.paginas.length,0),paginasOmitidas:records.reduce((n,r)=>n+r.paginasOmitidas.length,0),fontesSemAutorizacao:records.filter(r=>!r.bibliografia).length,indice:output}));return records;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){const args=Object.fromEntries(process.argv.slice(2).map(x=>x.replace(/^--/,'').split('=')));await ingerir(args.origem??'bibliografia-pdfs',args.saida??'work/bibliografia/indice.json');}

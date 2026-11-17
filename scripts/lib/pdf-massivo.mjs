// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import fs from 'node:fs';import {createHash} from 'node:crypto';import {execFileSync}from'node:child_process';import sharp from'sharp';import{PDFParse}from'pdf-parse';
export const sha=b=>createHash('sha256').update(b).digest('hex');
export const normalize=s=>String(s??'').normalize('NFKC').replace(/\u00ad/g,'').replace(/\s+/g,' ').trim();
export function parseOfficialKey(text,{bank,version='',count,start=1,cover=''}){
 let source=text.replace(/ANULAD[AO](?=ANULAD)/g,'ANULADA ');const map=new Map();let conflict=false;
 const add=(n,a)=>{n=Number(n);a=/ANULAD|\*/.test(a)?'ANULADA':a;if(n<start||n>=start+count)return;if(map.has(n)&&map.get(n)!==a)conflict=true;map.set(n,a);};
 if(bank==='etec'){const at=/Quest[ãa]o\s+Alternativa/i.exec(source);if(at)source=source.slice(at.index);}
 if(bank==='ifsp'){const type=/tipo\s*([12])/i.exec(version)?.[1];if(type){const at=new RegExp(`PROVA\\s+TIPO\\s+${type}`,'i').exec(source);if(!at)return null;source=source.slice(at.index);const end=/PROVA\s+TIPO\s+[12]/i.exec(source.slice(at[0].length));if(end)source=source.slice(0,at[0].length+end.index);}}
 if(bank==='coluni'&&/QUEST[ÃA]O\s+1\s+2\s+3\s+4/i.test(source)){const v=/G\s*ABARITO\s*([1-4])\b/i.exec(cover)?.[1];if(!v)return null;for(const m of source.matchAll(/\b(\d{1,3})\s+((?:(?:ANULADA|[A-D])\s*){4})(?=\s|$)/g)){const tokens=m[2].match(/ANULADA|[A-D]/g);if(tokens.length===4)add(m[1],tokens[Number(v)-1]);}}
 else if(bank==='fuvest'&&/PROVA\s+V1\s+PROVA\s+V2/i.test(source)){source=source.split('GABARITO DE CORRESPONDÊNCIA')[0];const v=/V([1-4])/i.exec(version)?.[1];if(!v)return null;for(const line of source.split('\n')){const pairs=[...line.matchAll(/\b(\d{1,3})\s+([A-E*])\b/g)];if(pairs.length===8)for(const p of pairs.slice((Number(v)-1)*2,Number(v)*2))add(p[1],p[2]);}}
 else{
  const at=bank==='fuvest'?source.toUpperCase().lastIndexOf('GABARITO'):-1;if(at>=0)source=source.slice(at);
  for(const line of source.split('\n'))for(const m of line.matchAll(/(?:^|\s)(\d{1,3})\s+(ANULADA|ANULADO|[A-E*])(?=\s|$)/g))add(m[1],m[2]);
  if(map.size<count){const lines=source.split('\n').map(l=>l.trim()).filter(Boolean);for(let i=0;i<lines.length-1;i++){const numbers=lines[i].split(/\s+/),letters=lines[i+1].split(/\s+/);if(numbers.length>=3&&numbers.every(v=>/^\d{1,3}$/.test(v))&&letters.length===numbers.length&&letters.every(v=>/^(?:[A-E*]|ANULADA)$/.test(v)))numbers.forEach((n,j)=>add(n,letters[j]));}}
 }
 return !conflict&&map.size===count?map:null;
}
export async function parsePdf(file, bank){
 if(!bank||['fuvest','unesp','unicamp'].includes(bank)){const parser=new PDFParse({data:new Uint8Array(fs.readFileSync(file))});try{return await parser.getText();}finally{await parser.destroy();}}
 // PDF object order is not reading order: ETEC question titles can follow their own choices.
 const {getDocument}=await import(new URL('../../node_modules/pdf-parse/node_modules/pdfjs-dist/legacy/build/pdf.mjs',import.meta.url).href);const task=getDocument({data:new Uint8Array(fs.readFileSync(file)),useSystemFonts:true});const doc=await task.promise;const pages=[];
 try{for(let n=1;n<=doc.numPages;n++){const page=await doc.getPage(n),viewport=page.getViewport({scale:1}),content=await page.getTextContent();const items=content.items.filter(i=>i.str?.trim());const columns=['fuvest','unesp','unicamp'].includes(bank)?2:1;let text=[];
 for(let col=0;col<columns;col++){const rows=[];for(const item of items.filter(i=>columns===1||(i.transform[4]<viewport.width/2?0:1)===col).sort((a,b)=>b.transform[5]-a.transform[5]||a.transform[4]-b.transform[4])){let row=rows.find(r=>Math.abs(r.y-item.transform[5])<1.5);if(!row){row={y:item.transform[5],items:[]};rows.push(row);}row.items.push(item);}text.push(rows.sort((a,b)=>b.y-a.y).map(r=>r.items.sort((a,b)=>a.transform[4]-b.transform[4]).map(i=>i.str).join(' ')).join('\n'));}pages.push({num:n,text:text.join('\n')});}return{pages,text:pages.map(p=>p.text).join('\n')};}finally{await task.destroy();}
}
export function cleanOption(text){return normalize(text.replace(/#####/g,'').split(/(?:Note e adote:|TEXTO PARA AS QUEST[ÕO]ES|Texto para responder|Texto para as quest[õo]es|MINISTÉRIO DA EDUCAÇÃO|Leia o texto para responder|Leia o Texto [IVX]+|TEXTO [IVX]+|Exame de Classificação|Concurso Vestibular FUVEST|VESTIBULINHO)/i)[0]).trim();}
export async function keyWithOcr(file,config){const parsed=await parsePdf(file);let key=parseOfficialKey(parsed.text,config);if(key)return {key,method:'texto-PDF'};
 const parser=new PDFParse({data:new Uint8Array(fs.readFileSync(file))});try{const images=await parser.getScreenshot({desiredWidth:1800});let texts=[];for(const p of images.pages){const path=`work/massivo/key-${sha(p.data).slice(0,16)}.png`;fs.writeFileSync(path,p.data);try{texts.push(execFileSync('tesseract',[path,'stdout','-l','eng','--psm','6'],{encoding:'utf8',stdio:['ignore','pipe','ignore'],timeout:60000}));}finally{fs.unlinkSync(path);}}key=parseOfficialKey(texts.join('\n'),config);return {key,method:'tesseract-5-psm6',ocrSha256:sha(texts.join('\n'))};}finally{await parser.destroy();}}
export function questionBlocks(pages,{bank,expected=5,max}){
 pages=pages.map(p=>({...p,text:p.text.replace(/^[ \t]*\{\s*(\d{1,3})\s*\}[ \t]*$/gm,'QUESTÃO $1')}));const all=pages.map(p=>p.text).join('\n'),patterns=bank==='enem'?/(?:^|\n)\s*QUEST[ÃA]O\s+(\d{1,3})\b/gim:/(?:^|\n)\s*(?:QUEST[ÃA]O\s*0*(\d{1,3})\b|0*(\d{1,3})[.)]\s)/gim;const markers=[...all.matchAll(patterns)].filter(m=>Number(m[1]??m[2])<=max);const result=new Map();let offset=0;const boundaries=pages.map(p=>{const at=offset;offset+=p.text.length+1;return at;});
 for(let i=0;i<markers.length;i++){const m=markers[i],number=Number(m[1]??m[2]);if(result.has(number))continue;const next=markers[i+1];if(next&&Number(next[1]??next[2])!==number+1)continue;const raw=all.slice(m.index+m[0].length,next?.index??all.length).replace(/^.*(?:VESTIBULINHO.*SEM|EXAME DE SELEÇÃO.*UFV|-- \d+ of \d+ --|Concurso Vestibular FUVEST|ENEM\d{4}(?:ENEM\d{4})+).*$/gm,'').trim();
 let options=[...raw.matchAll(/(?:\(([A-Ea-e])\)|^[ \t]*(?:([A-Ea-e])[.)]|([A-Ea-e])\s*[-–]|([A-E])))[ \t]*(?:\n|[ \t]+)/gm)];const explicit=options.filter(o=>o[1]||o[2]||o[3]);if(explicit.length>=expected)options=explicit;const last=options.slice(-expected),letter=x=>(x[1]??x[2]??x[3]??x[4]).toUpperCase();if(options.length!==expected||last.length!==expected||last.map(letter).join('')!=='ABCDE'.slice(0,expected))continue;let stem=normalize(raw.slice(0,last[0].index));const note=/Note e adote:([\s\S]*?)(?:#####|$)/i.exec(raw);if(note)stem+=' '+normalize(note[0].replace(/#####/g,''));if(/\([A-E]\)/.test(stem)||stem.length<20||/[�]|\?@|#=\[/.test(raw))continue;
 const page=Math.max(0,boundaries.findLastIndex(v=>v<=m.index)),endPage=Math.max(page,boundaries.findLastIndex(v=>v<(next?.index??all.length)));
 const alternativas=last.map((a,j)=>({letra:letter(a),texto:cleanOption(raw.slice(a.index+a[0].length,last[j+1]?.index??raw.length))||`Figura ${letter(a)} da questão ${number}, reproduzida na página oficial.`}));
 // A imagem original é autoridade para fórmulas, tabelas e alternativas visuais; OCR nunca inventa descrição.
 let prefix=all.slice(Math.max(0,boundaries[Math.max(0,page-2)]),m.index);const contextAt=[...prefix.matchAll(/(?:Leia\s+o\s+texto|TEXTO\s+[IVX]+|Texto\s+para\s+as?\s+quest[õo]es)/gi)].at(-1)?.index;let context='';if(contextAt!==undefined){context=prefix.slice(contextAt);const q=context.search(/\n\s*(?:QUEST[ÃA]O\s+\d+|\d+[.)]\s)/i);if(q>=0)context=context.slice(0,q);context=normalize(context);}
 result.set(number,{enunciado:stem,alternativas,page:page+1,endPage:endPage+1,context});
 }
 return result;
}
export async function originalImage({bank,id,year,version,page,pdf}){
 const candidates=[`/acervo/${bank}/${id}/pagina-${String(page).padStart(2,'0')}.webp`,`/acervo/${bank}/${year}/${String(version??'').toLowerCase()}/${String(page).padStart(2,'0')}.webp`,`/acervo/${bank}/${id}/${String(page).padStart(2,'0')}.webp`];let src=candidates.find(p=>fs.existsSync('public'+p));
 if(!src){src=`/acervo/${bank}/massivo-${id}/pagina-${String(page).padStart(2,'0')}.webp`;if(!fs.existsSync('public'+src)){const parser=new PDFParse({data:new Uint8Array(fs.readFileSync(pdf))});try{const r=await parser.getScreenshot({partial:[page],desiredWidth:1400});fs.mkdirSync('public'+src.slice(0,src.lastIndexOf('/')),{recursive:true});await sharp(r.pages[0].data).webp({quality:82}).toFile('public'+src);}finally{await parser.destroy();}}}
 const meta=await sharp('public'+src).metadata();return {src,width:meta.width,height:meta.height};
}

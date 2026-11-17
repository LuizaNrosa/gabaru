// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import fs from 'node:fs';import {createHash} from 'node:crypto';import {execFileSync} from 'node:child_process';import {PDFParse} from 'pdf-parse';
import {officialKey,normalized,textProof,tierFor} from './resgate-v3.mjs';import {contentFingerprint,questionQuality,N0} from './qualidade.mjs';
export const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));export const hash=b=>createHash('sha256').update(b).digest('hex');
export const tiers=c=>Object.fromEntries(['tier-2-completa','tier-1-gabarito-oficial','tier-0-quarentena'].map(t=>[t,c.questoes.filter(q=>tierFor(q.nivelQualidade)===t).length]));
export function reconstruir(q,record,pages,expected){
 const window=pages.slice(Math.max(0,record.page-1),record.page+1).map(p=>p.text).join('\n');
 const marker=n=>new RegExp(`(?:^|\\n)\\s*(?:QUEST[ÃA]O\\s*0*${n}\\b|0*${n}[.)]\\s)`,'i');const start=marker(record.number).exec(window);if(!start)return null;
 const rest=window.slice(start.index+start[0].length),end=marker(record.number+1).exec(rest);if(!end)return null;
 const block=rest.slice(0,end.index).replace(/^.*(?:VESTIBULINHO.*SEM|-- \d+ of \d+ --).*$/gm,'').trim();
 const markers=[...block.matchAll(/^[ \t]*(?:\(([A-E])\)|([A-E])[.)]|([A-E])\s*[-–])[ \t]*/gm)];
 if(markers.length!==expected||markers.map(m=>m[1]??m[2]??m[3]).join('')!=='ABCDE'.slice(0,expected))return null;
 const stem=normalized(block.slice(0,markers[0].index));
 // Não reconstrói contexto compartilhado, notação perdida nem conteúdo visual por inferência.
 if(stem.length<35||/\b(?:texto|trecho|figura|gráfico|tabela|imagem|esquema|tirinha|charge|mapa|ilustra|foto|observe|abaixo|acima|anterior|representad|mostrad|indicad)/iu.test(stem)||/[�=²³√∫]|\b(?:expoente|potência|equação)\b/iu.test(block))return null;
 const alternatives=markers.map((m,i)=>({letra:'ABCDE'[i],texto:normalized(block.slice(m.index+m[0].length,markers[i+1]?.index??block.length))}));
 if(alternatives.some(a=>a.texto.length<3||/�|QUEST[ÃA]O|-- \d+ of/.test(a.texto)))return null;
 return {...q,enunciado:stem,alternativas:alternatives};
}
async function parse(file){const p=new PDFParse({data:new Uint8Array(fs.readFileSync(file))});try{return await p.getText();}finally{await p.destroy();}}
export async function conferir(ids,{apply=false,reportFile}){
 const catalog=read('src/data/catalogo-v2.json'),overlay=read('src/data/editorial/resgate-v3.json'),selected=new Set(ids),rows=[];
 for(const bank of ['etec','coluni','ifsc','ifsp']){const file=`src/data/${bank}-exams.json`,source={file,sha256:hash(fs.readFileSync(file))};for(const exam of read(file)){
 const candidates=catalog.questoes.filter(q=>selected.has(q.id)&&q.nivelQualidade===N0&&q.edicao===`${bank}:${exam.id}`);if(!candidates.length)continue;
 const locate=n=>[`public/acervo/${bank}/${exam.id}/${n}.pdf`,`.next/cache/${bank}-pdfs/${exam.id}/${n}.pdf`].find(fs.existsSync);const pdf=locate('prova'),keyPdf=locate('gabarito');
 let reason=null,pages,key;if(!pdf||!keyPdf||hash(fs.readFileSync(pdf))!==exam.examSha256||hash(fs.readFileSync(keyPdf))!==exam.answerSha256)reason='documento-ausente-ou-hash-divergente';
 else{pages=(await parse(pdf)).pages;key=officialKey((await parse(keyPdf)).text,exam,bank);if(!key)reason='versao-gabarito-nao-confirmada';}
 for(const q of candidates){const raw=exam.questions.find(r=>r.number===q.numero);if(reason){rows.push({id:q.id,status:'retida',motivo:reason});continue;}const expected=bank==='coluni'?4:5;let proof=textProof(q,raw,pages),candidate=q;
 if(!proof.valid){candidate=reconstruir(q,raw,pages,expected);if(!candidate){rows.push({id:q.id,status:'retida',motivo:proof.reason});continue;}proof=textProof(candidate,raw,pages);}
 if(!proof.valid||key.get(q.numero)!==q.correta){rows.push({id:q.id,status:'retida',motivo:proof.reason??'gabarito-divergente'});continue;}
 const updates={enunciado:candidate.enunciado,alternativas:candidate.alternativas,proveniencia:{extracaoValidada:true,gabaritoConferido:true,pagina:raw.page,metodo:'Conferência offline: hashes + versão integral do gabarito + bloco textual e alternativas ordenadas',provaSha256:exam.examSha256,gabaritoSha256:exam.answerSha256,provaUrl:exam.examUrl,gabaritoUrl:exam.answerUrl}};
 const quality=questionQuality({...candidate,...updates},{gabaritoVerificado:true,textoConferido:true,expected});if(quality.nivelQualidade===N0){rows.push({id:q.id,status:'retida',motivo:quality.motivos.join(',')});continue;}
 rows.push({id:q.id,status:'aprovada',edicao:exam.id,banca:bank,alternativas:expected,pagina:raw.page,provaSha256:exam.examSha256,gabaritoSha256:exam.answerSha256});if(apply)overlay.records[q.id]={originalFingerprint:contentFingerprint(q),resultFingerprint:contentFingerprint({...q,...updates}),source,updates};
 }
 }}
 if(apply){fs.writeFileSync('src/data/editorial/resgate-v3.json',JSON.stringify(overlay,null,2)+'\n');execFileSync(process.execPath,['scripts/gerar-catalogo.mjs'],{stdio:'ignore'});execFileSync(process.execPath,['scripts/gerar-llms.mjs'],{stdio:'ignore'});}
 const after=read('src/data/catalogo-v2.json');const report={modo:apply?'aplicar':'dry-run',antes:tiers(catalog),depois:tiers(after),avaliadas:rows.length,aprovadas:rows.filter(r=>r.status==='aprovada').length,rows};fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,rows:undefined}));return report;
}

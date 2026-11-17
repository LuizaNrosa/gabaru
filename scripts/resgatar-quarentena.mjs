// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fontesEnemOffline} from './lib/fontes-enem-offline.mjs';
import {PDFParse} from 'pdf-parse';
import {contentFingerprint,N0} from './lib/qualidade.mjs';
import {tierFor,officialKey,textProof,normalizeExactNotation} from './lib/resgate-v3.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8')),hash=b=>createHash('sha256').update(b).digest('hex');
const catalog=read('src/data/catalogo-v2.json'),file='src/data/editorial/resgate-v3.json';
const previous=existsSync(file)?read(file):{records:{}};
const records={};for(const [id,item]of Object.entries(previous.records)){if(existsSync(item.source.file)&&hash(readFileSync(item.source.file))===item.source.sha256)records[id]=item;}
const counts=rows=>Object.fromEntries(['tier-0-quarentena','tier-1-gabarito-oficial','tier-2-completa'].map(t=>[t,rows.filter(q=>tierFor(q.nivelQualidade)===t).length]));
const before=counts(catalog.questoes),attempts=[],refusals={},increment=r=>refusals[r]=(refusals[r]??0)+1;
async function parse(file){const parser=new PDFParse({data:new Uint8Array(readFileSync(file))});try{return await parser.getText();}finally{await parser.destroy();}}
for(const bank of ['etec','coluni','ifsc','ifsp']){
 const sourceFile=`src/data/${bank}-exams.json`,sourceHash=hash(readFileSync(sourceFile));
 for(const exam of read(sourceFile)){
  const candidates=catalog.questoes.filter(q=>q.edicao===`${bank}:${exam.id}`&&q.nivelQualidade===N0&&q.motivos.length===1&&q.motivos[0]==='gabarito-sem-conferencia-documentada'&&!records[q.id]);
  if(!candidates.length)continue;
  const locate=name=>[`public/acervo/${bank}/${exam.id}/${name}.pdf`,`.next/cache/${bank}-pdfs/${exam.id}/${name}.pdf`].find(existsSync);
  const pdf=locate('prova'),answer=locate('gabarito');
  if(!pdf||!answer||hash(readFileSync(pdf))!==exam.examSha256||hash(readFileSync(answer))!==exam.answerSha256){candidates.forEach(()=>increment('pdf-local-ausente-ou-hash-divergente'));continue;}
  const key=officialKey((await parse(answer)).text,exam,bank);
  if(!key){candidates.forEach(()=>increment('gabarito-versao-ou-extracao-nao-confirmada'));continue;}
  const pages=(await parse(pdf)).pages;
  let rescued=0;
  for(const q of candidates){const raw=exam.questions.find(r=>r.number===q.numero);const proof=textProof(q,raw,pages);if(!proof.valid){increment(proof.reason);continue;}
   const stem=normalizeExactNotation(q.enunciado,q.disciplina),options=q.alternativas.map(a=>({...a,texto:normalizeExactNotation(a.texto,q.disciplina).text}));
   const updates={enunciado:stem.text,alternativas:options,proveniencia:{extracaoValidada:true,gabaritoConferido:true,metodo:'pdf-parse: SHA-256 dos documentos + versão integral do gabarito + coincidência textual ordenada no bloco da questão',pagina:proof.page,provaSha256:exam.examSha256,gabaritoSha256:exam.answerSha256,provaUrl:exam.examUrl,gabaritoUrl:exam.answerUrl}};
   records[q.id]={originalFingerprint:contentFingerprint(q),resultFingerprint:contentFingerprint({...q,...updates}),source:{file:sourceFile,sha256:sourceHash},updates};rescued++;
  }
  attempts.push({banca:bank,edicao:exam.id,candidatas:candidates.length,resgatadas:rescued});console.log(JSON.stringify(attempts.at(-1)));
 }
}
const manifestFile='src/data/fontes-abertas/manifest.json';
if(existsSync(manifestFile))for(const item of await fontesEnemOffline(read(manifestFile))){const q=catalog.questoes.find(q=>q.id===item.question.id);if(!q||q.banca!=='enem'||q.ano<2000||q.ano>2008||q.nivelQualidade!==N0||q.correta&&q.correta!==item.question.correta)continue;const updates={enunciado:item.question.enunciado,alternativas:item.question.alternativas,correta:item.question.correta,proveniencia:item.proveniencia};records[q.id]={originalFingerprint:contentFingerprint(q),resultFingerprint:contentFingerprint({...q,...updates}),source:item.source,updates};}
writeFileSync(file,JSON.stringify({baseline:previous.baseline??{total:catalog.questoes.length,tiers:before},records},null,2)+'\n');
execFileSync(process.execPath,['scripts/gerar-catalogo.mjs'],{stdio:'inherit'});
const afterCatalog=read('src/data/catalogo-v2.json'),after=counts(afterCatalog.questoes);
const report={baseline:previous.baseline??{total:catalog.questoes.length,tiers:before},antes:before,depois:after,promovidasNestaExecucao:{tier1:after['tier-1-gabarito-oficial']-before['tier-1-gabarito-oficial'],tier2:after['tier-2-completa']-before['tier-2-completa']},ondas:{estrutural:'Nenhum cabeçalho mecânico ou par bilíngue concatenado encontrado no diagnóstico; sem alteração especulativa.',fontesOficiais:attempts,exatas:'Conversões conservadoras após prova textual; cada fórmula validada pelo KaTeX.',classificacao:after},recusas:refusals,motivosRetencao:Object.fromEntries([...new Set(afterCatalog.questoes.filter(q=>q.nivelQualidade===N0).flatMap(q=>q.motivos))].map(r=>[r,afterCatalog.questoes.filter(q=>q.nivelQualidade===N0&&q.motivos.includes(r)).length])),fontes2000a2008:'Adapter offline disponível; nenhum dataset externo sem hash, licença e versão conferidos foi usado.'};
mkdirSync('docs/engenharia/v3',{recursive:true});writeFileSync('docs/engenharia/v3/lote-3-placar.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));

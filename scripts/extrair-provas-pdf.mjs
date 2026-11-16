import { readFile,writeFile,mkdir,rename } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve,basename } from 'node:path';
const args=Object.fromEntries(process.argv.slice(2).map(s=>s.replace(/^--/,'').split('=')));
const bank=args.banca??'etec',edition=args.edicao??'2026-2';
if(!['etec','coluni','ifsc','ifsp','enem'].includes(bank)||!/^\d{4}(?:-[a-z0-9]+)*$/.test(edition))throw new Error('Banca/edição inválidas');
const exams=args.manifest?[JSON.parse(await readFile(args.manifest,'utf8'))]:JSON.parse(await readFile(`src/data/${bank}-exams.json`,'utf8'));const exam=exams.find(e=>e.id===edition);if(!exam)throw new Error('Edição não cadastrada');
const inventory=JSON.parse(await readFile('docs/engenharia/fase2/inventario-pdfs.json','utf8'));
async function verified(name,expected){for(const path of [...new Set([`public/acervo/${bank}/${edition}/${name}.pdf`,`.next/cache/${bank}-pdfs/${edition}/${name}.pdf`,...inventory.arquivos.filter(f=>f.sha256===expected&&/^(public|\.next\/cache)\//.test(f.arquivo)&&!f.arquivo.split('/').includes('..')).map(f=>f.arquivo)])]){try{const bytes=await readFile(path);const sha=createHash('sha256').update(bytes).digest('hex');if(sha===expected&&bytes.subarray(0,5).toString()==='%PDF-')return {path:resolve(path),sha};}catch(e){if(e.code!=='ENOENT')throw e;}}throw new Error(`PDF local íntegro não encontrado: ${bank}/${edition}/${name}`);}
const pdf=await verified('prova',exam.examSha256),key=await verified('gabarito',exam.answerSha256);
const assets=`work/extracao/assets/${bank}/${edition}`;const publicAssets=`public/questoes/${bank}/${edition.slice(0,4)}/${edition}`;
const python=process.env.PDF_PYTHON??'python';
const result=spawnSync(python,['scripts/lib/extrair-layout.py'],{input:JSON.stringify({pdf:pdf.path,gabarito:key.path,assets,esperadas:exam.questions.length,numeroMaximo:Math.max(...exam.questions.map(q=>q.number)),todosAssets:args['rasterizar-todas']==='true'}),encoding:'utf8',maxBuffer:32*1024*1024});
if(result.status!==0){
 // Safe optional fallback: parse text locally, but do not claim geometry/key verification.
 const {PDFParse}=await import('pdf-parse');const parser=new PDFParse({data:await readFile(pdf.path)});try{const text=await parser.getText();await mkdir('work/extracao',{recursive:true});await writeFile(`work/extracao/${bank}-${edition}-node.txt`,text.text);}finally{await parser.destroy();}
 throw new Error(`PyMuPDF indisponível ou falhou. Texto Node salvo em work/extracao; promoção bloqueada. ${result.stderr?.slice(-1000)}`);
}
const data=JSON.parse(result.stdout),expectedLetters=exam.format?.alternatives??(bank==='coluni'?4:5);
let descriptions={};try{descriptions=JSON.parse(await readFile('src/data/editorial/imagens-pdf.json','utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
let contexts={};try{contexts=JSON.parse(await readFile('src/data/editorial/contextos-pdf.json','utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
let corrections={};try{corrections=JSON.parse(await readFile('src/data/editorial/correcoes-pdf.json','utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
const accepted={},quarantine=[];
for(const q of data.questoes){const id=`${bank}-${edition}-q${String(q.numero).padStart(3,'0')}`,original=exam.questions.find(x=>x.number===q.numero),reasons=[];
 if(corrections[id]?.revisadaContraPdf){q.enunciado=corrections[id].enunciado;q.alternativas=Object.fromEntries(corrections[id].alternativas.map(a=>[a.letra,a.texto]));}
 if(!original)reasons.push('numero-nao-cadastrado');
 if(data.questoes.filter(x=>x.numero===q.numero).length!==1)reasons.push('numero-duplicado-no-pdf');
 if(Object.keys(q.alternativas).join('')!=='ABCDE'.slice(0,expectedLetters))reasons.push('alternativas-incompletas-ou-duplicadas');
 if(!q.enunciado||(q.enunciado.length<35&&!q.textoBase)||/\ufffd/.test(q.enunciado))reasons.push('enunciado-curto-ou-caractere-corrompido');
 if(!q.gabaritoPdf||q.gabaritoPdf!==original?.answer)reasons.push('gabarito-divergente-ou-nao-extraido-do-pdf');
 if(Object.values(q.alternativas).some(t=>!t||!/[\p{L}\p{N}]/u.test(t)||t.length>1200||/Quest[ãa]o\s+\d/i.test(t)))reasons.push('alternativa-vazia-ou-contexto-misturado');
 const description=descriptions[id];if(q.contextoRaster&&!contexts[id]?.revisadaContraPdf)reasons.push('texto-base-raster-requer-transcricao-revisada');if(contexts[id])q.textoBase=contexts[id].texto;if(q.referenciaVisual&&!description)reasons.push('descricao-visual-requer-revisao');
 const images=!(description?.semRecursoVisual&&description?.revisadaContraPdf)&&(q.referenciaVisual||description)?q.imagensExtraidas.filter(a=>!description?.somenteBase||a.arquivo.includes('-base-')).map(a=>({src:'/'+publicAssets.replace(/^public\//,'')+'/'+basename(a.arquivo),arquivoCandidato:a.arquivo,alt:description?.alt??`Reprodução original referente a: ${q.enunciado.slice(0,160).replace(/\s+/g,' ')}`,caption:description?.caption??`Fonte: ${exam.source} · página ${a.pagina}`,pagina:a.pagina,bbox:a.bbox})):[];
 const record={id,numero:q.numero,enunciado:q.enunciado.replace(/\n/g,' '),...(q.textoBase?{textoBase:{texto:q.textoBase,fonte:exam.source}}:{}),tabelas:contexts[id]?.tabelas??q.tabelas,alternativas:Object.entries(q.alternativas).map(([letra,texto])=>({letra,texto:texto.replace(/\n/g,' ')})),correta:q.gabaritoPdf,imagens:images,proveniencia:{parser:data.parser,versao:data.versao,pdfSha256:pdf.sha,gabaritoSha256:key.sha,fonte:exam.source,provaUrl:exam.examUrl,gabaritoUrl:exam.answerUrl,paginas:q.paginas,colunas:q.layout,gabaritoConferido:!reasons.some(r=>r.startsWith('gabarito')),extracaoValidada:reasons.length===0},motivos:reasons};
 if(reasons.length)quarantine.push(record);else {await mkdir(publicAssets,{recursive:true});for(const image of images){const bytes=await readFile(image.arquivoCandidato);image.width=bytes.readUInt32BE(16);image.height=bytes.readUInt32BE(20);await rename(image.arquivoCandidato,'public'+image.src);delete image.arquivoCandidato;}accepted[id]=record;}
}
for(const q of exam.questions)if(!data.questoes.some(x=>x.numero===q.number))quarantine.push({id:`${bank}-${edition}-q${String(q.number).padStart(3,'0')}`,motivos:['questao-nao-localizada-no-pdf']});
await mkdir('src/data/ingestao',{recursive:true});await mkdir('docs/engenharia/fase2',{recursive:true});
await writeFile(`src/data/ingestao/${bank}-${edition}.json`,JSON.stringify({banca:bank,edicao:edition,provaSha256:pdf.sha,gabaritoSha256:key.sha,esperadas:exam.questions.length,aceitas:accepted},null,2)+'\n');
let previous=[];try{previous=JSON.parse(await readFile('docs/engenharia/quarentena-extracao.json','utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
previous=previous.filter(q=>!q.id.startsWith(`${bank}-${edition}-q`));await writeFile('docs/engenharia/quarentena-extracao.json',JSON.stringify([...previous,...quarantine],null,2)+'\n');
await writeFile(`docs/engenharia/fase2/layout-${bank}-${edition}.json`,JSON.stringify({paginas:data.paginas,gabarito:data.gabaritoExtraido,esperadas:exam.questions.length,extraidas:data.questoes.length,aceitas:Object.keys(accepted).length,quarentena:quarantine.length},null,2)+'\n');
await mkdir('work/extracao',{recursive:true});await writeFile(`work/extracao/${bank}-${edition}.json`,JSON.stringify(data,null,2));
console.log(JSON.stringify({banca:bank,edicao:edition,esperadas:exam.questions.length,extraidas:data.questoes.length,aceitas:Object.keys(accepted).length,quarentena:quarantine.map(q=>({id:q.id,motivos:q.motivos}))},null,2));

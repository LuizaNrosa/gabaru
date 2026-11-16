import {readFile,writeFile,rename,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolutionValid,contentFingerprint,N0} from './lib/qualidade.mjs';
const args=Object.fromEntries(process.argv.slice(2).map(x=>x.replace(/^--/,'').split('=')));
const catalog=JSON.parse(await readFile('src/data/catalogo-v2.json','utf8'));
const proposals=JSON.parse(await readFile(args.entrada??'src/data/editorial/piloto-fase2.json','utf8'));
async function read(path,fallback){try{return JSON.parse(await readFile(path,'utf8'));}catch(e){if(e.code==='ENOENT')return fallback;throw e;}}
const output=args.saida??'src/data/editorial/resolucoes-lotes.json',checkpoint=args.checkpoint??'docs/engenharia/progresso-resolucoes.json';
const saved=await read(output,{}),progress=await read(checkpoint,{versao:1,itens:{}});
async function atomic(path,value){await writeFile(path+'.tmp',JSON.stringify(value,null,2)+'\n');await rename(path+'.tmp',path);}
await mkdir('docs/engenharia',{recursive:true});
let accepted=0,rejected=0,skipped=0;
const limit=Number(args.lote??20);if(!Number.isInteger(limit)||limit<1||limit>100)throw Error('Lote deve ser de 1 a 100');
for(const [id,proposal] of Object.entries(proposals)){
 const q=catalog.questoes.find(q=>q.id===id);if(!q)throw Error('Questão inexistente: '+id);
 if(args.banca&&!args.banca.split(',').includes(q.banca)||args.ano&&!args.ano.split(',').includes(String(q.ano)))continue;
 const fingerprint=contentFingerprint(q);
 const hash=createHash('sha256').update(JSON.stringify([q.enunciado.replace(/\n+/g,' '),q.textoBase,q.alternativas,q.correta,proposal])).digest('hex');
 if(progress.itens[id]?.hash===hash&&saved[id]?.validacao?.fingerprint===fingerprint){skipped++;continue;}
 if(accepted+rejected>=limit)break;
 const valid=q.nivelQualidade!==N0&&resolutionValid(proposal.resolucaoEstruturada,q);
 progress.itens[id]={hash,status:valid?'validada':'rejeitada',motivo:valid?null:q.nivelQualidade===N0?'questao-sem-base-validada':'gabarito-ou-tres-blocos-invalidos'};
 if(valid){saved[id]={...proposal,validacao:{hash,fingerprint,fonte:q.fonte,gabarito:q.correta}};accepted++;}else{delete saved[id];rejected++;}
 await atomic(output,saved);await atomic(checkpoint,progress);
}
console.log(JSON.stringify({aceitas:accepted,rejeitadas:rejected,retomadas:skipped},null,2));
if(rejected)process.exitCode=1;

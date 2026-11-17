import nextEnv from '@next/env';
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {buildPublicCatalog,digest} from './lib/catalogo-seo.mjs';
nextEnv.loadEnvConfig(process.cwd(),false);
const {env}=await import('../src/env.mjs');
const file='src/data/seo-publico.json';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const readOptional=p=>{try{return read(p)}catch(error){if(error.code==='ENOENT')return undefined;throw error}};
function writeAtomic(file,text){
 const temporary=file+'.'+randomUUID()+'.tmp';
 try{fs.writeFileSync(temporary,text,{flag:'wx'});fs.renameSync(temporary,file)}
 finally{try{fs.unlinkSync(temporary)}catch(error){if(error.code!=='ENOENT')throw error}}
}
const git=args=>{try{return execFileSync('git',args,{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim()}catch{return ''}};
const planned=[...read('src/data/colecao-vestibulinho.json'),...read('src/data/livros-base.json')];
const merged=new Map(planned.map(b=>[b.slug,{...b,capitulos:[...b.capitulos]}]));
for(const b of read('src/data/livros-gerados.json')){const existing=merged.get(b.slug);if(existing){for(const c of b.capitulos)if(!existing.capitulos.some(x=>x.slug===c.slug))existing.capitulos.push(c)}else merged.set(b.slug,b);}
const dedup=[...merged.values()].map(b=>({...b,capitulos:b.capitulos.map(c=>{const file=path.join('content/livros',b.slug,c.slug+'.json');const published=fs.existsSync(file)&&read(file).status==='publicado';return {...c,status:published?'publicado':c.status??'preparacao'};}).filter(c=>planned.some(p=>p.slug===b.slug)||c.status==='publicado')})).filter(b=>b.capitulos.length);
const catalog=read('src/data/catalogo-v2.json');
const banks=JSON.stringify(catalog.bancas.map(b=>b.slug),null,2)+'\n';
writeAtomic('src/data/bancas-publicas.json',banks);
const primary=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(e.name==='page.tsx')primary.push(p)}}walk('src/app');
const shared=['src/app/layout.tsx','src/app/globals.css','src/components/site-header.tsx','src/components/site-footer.tsx','src/lib/seo.ts'];
const publicConfig={billing:env.NEXT_PUBLIC_BILLING_ENABLED==='true',support:env.NEXT_PUBLIC_SUPPORT_EMAIL};
const configFingerprint=digest(publicConfig);
const commonFingerprint=digest(shared.map(p=>fs.readFileSync(p,'utf8')));
const previous=readOptional(file);
const commitDate=git(['log','-1','--format=%cI','--','src','content/livros','scripts/gerar-llms.mjs']);
const epoch=Number(process.env.SOURCE_DATE_EPOCH);
// Vercel/source archives may omit .git. Unchanged fingerprints still preserve their dates.
let timestamp=commitDate?new Date(commitDate).getTime():Number.isFinite(epoch)&&epoch>0?epoch*1000:Date.now();
const dirty=[...git(['diff','--name-only','HEAD','--','src','content/livros']).split('\n'),...git(['ls-files','--others','--exclude-standard','src','content/livros']).split('\n')];
for(const p of dirty.filter(p=>p&&p!==file&&fs.existsSync(p)))timestamp=Math.max(timestamp,fs.statSync(p).mtimeMs);
const templates=primary.map(p=>({p,parts:p.replace(/^src\/app/,'').replace(/\/page.tsx$/,'').split('/').filter(Boolean),hash:digest(fs.readFileSync(p,'utf8'))}));
const paths=['/','/sobre','/privacidade','/termos','/reembolso','/enem','/vestibulinho','/vestibulares','/provas','/questoes','/videoaulas','/livros',...catalog.bancas.map(b=>'/banca/'+b.slug),...catalog.cadernos.map(e=>e.href),...catalog.questoes.flatMap(q=>['/questoes/'+q.slug,'/disciplina/'+q.disciplina,'/assunto/'+q.assunto])];
const pageFingerprints={};
for(const loc of new Set(paths.filter(Boolean))){const pieces=loc.split('/').filter(Boolean);const matches=templates.filter(t=>t.parts.length===pieces.length&&t.parts.every((s,i)=>s.startsWith('[')||s===pieces[i])).sort((a,b)=>a.parts.filter(s=>s.startsWith('[')).length-b.parts.filter(s=>s.startsWith('[')).length);const config=loc==='/livros'?{billing:publicConfig.billing}:['/termos','/reembolso'].includes(loc)?publicConfig:{};pageFingerprints[loc]=digest({source:matches[0]?.hash??'',config});}
if(previous?.configFingerprint&&previous.configFingerprint!==configFingerprint)timestamp=Math.max(timestamp,Date.now());
const manifest=buildPublicCatalog({catalog,books:dedup,previous,sourceDate:new Date(timestamp).toISOString(),pageFingerprints,commonFingerprint});
manifest.configFingerprint=configFingerprint;
writeAtomic(file,JSON.stringify(manifest,null,2)+'\n');
console.log('Catálogo público SEO:',Object.fromEntries(Object.entries(manifest.families).map(([k,v])=>[k,v.length])));

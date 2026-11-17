import { LinkChecker } from 'linkinator';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir, readdir, stat, statfs, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { createServer } from 'node:net';
import { join } from 'node:path';

export function localUrl(value, origin) {
 const url=new URL(value,origin);
 if(!['gabaru.com.br','www.gabaru.com.br',new URL(origin).host].includes(url.host))throw new Error(`Origem externa: ${url.host}`);
 return origin+url.pathname+url.search;
}
export function locations(xml){return [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map(m=>m[1].trim().replace(/&(amp|lt|gt|quot|apos);/g,(_,name)=>({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"}[name])));}
export async function expandSitemaps(origin, request=fetch){
 const seeds=new Map(),xmlSeen=new Set(),xmlStats={occurrences:0,validLastmod:0,duplicates:0};
 async function expand(url){
 const local=localUrl(url,origin);if(xmlSeen.has(local))throw new Error('Sitemap repetido ou circular: '+local);xmlSeen.add(local);
 const response=await request(local,{redirect:'manual',signal:AbortSignal.timeout(30000)});
 if(response.status!==200)throw new Error(`Sitemap ${local}: ${response.status}`);
 const xml=await response.text(), locs=locations(xml);
 if(!xml.includes('<sitemapindex')){const blocks=[...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)];if(blocks.length!==locs.length||blocks.length>2000)throw new Error('Estrutura/tamanho de sitemap inválido: '+local);for(const [,block]of blocks){xmlStats.occurrences++;const date=/<lastmod>([^<]+)<\/lastmod>/.exec(block)?.[1];if(!date||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.000Z$/.test(date)||Number.isNaN(Date.parse(date))||new Date(date).toISOString()!==date)throw new Error('Lastmod ausente/inválido: '+local);if(!/<changefreq>(always|hourly|daily|weekly|monthly|yearly|never)<\/changefreq>/.test(block)||!/<priority>(0(?:\.\d+)?|1(?:\.0+)?)<\/priority>/.test(block))throw new Error('Frequência/prioridade inválida: '+local);xmlStats.validLastmod++;}}
 if(!locs.length)throw new Error(`Sitemap vazio: ${local}`);
 for(const loc of locs){if(xml.includes('<sitemapindex'))await expand(loc);else{const key=localUrl(loc,origin);if(seeds.has(key)){xmlStats.duplicates++;throw new Error('URL duplicada entre sitemaps: '+key)}seeds.set(key,new Set([local]))}}
 }
 await expand(origin+'/sitemap.xml');
 return {seeds,xmlSeen,xmlStats};
}
// Evict only old, disposable ISR files; never touch compiled app files or source PDFs.
export async function pruneRouteCache(directory, olderThan=Date.now()-10_000){
 let entries;try{entries=await readdir(directory,{withFileTypes:true})}catch(e){if(e.code==='ENOENT')return;throw e}
 for(const entry of entries){const path=join(directory,entry.name);
  if(entry.isDirectory())await pruneRouteCache(path,olderThan);
  else if(entry.isFile()){try{if((await stat(path)).mtimeMs<olderThan)await rm(path,{force:true})}catch(e){if(e.code!=='ENOENT')throw e}}
 }
}
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export async function audit(){
 const origin=`http://127.0.0.1:${process.env.URL_AUDIT_PORT??3100}`;
 await mkdir('work/linker',{recursive:true});
 await new Promise((resolve,reject)=>{const probe=createServer();probe.once('error',reject);probe.listen(Number(new URL(origin).port),'127.0.0.1',()=>probe.close(resolve));});
 const server=spawn('npm',['run','start','--','--hostname','127.0.0.1','--port',new URL(origin).port],{detached:true,env:{...process.env,NODE_USE_ENV_PROXY:'1'},stdio:['ignore','pipe','pipe']});
 let housekeeping=Promise.resolve();
 const cacheTimer=setInterval(()=>{housekeeping=housekeeping.then(async()=>{const disk=await statfs('.');if(1-disk.bavail/disk.blocks>=0.77)await pruneRouteCache('.next/server/route-cache')}).catch(e=>console.error('Cache:',e.message));},5000);
 let log='';server.stdout.on('data',b=>{log=(log+b).slice(-100000)});server.stderr.on('data',b=>{log=(log+b).slice(-100000)});
 try{
 let ready=false;
 for(let i=0;i<120;i++){
 if(server.exitCode!==null)throw new Error(`Servidor encerrou: ${log}`);
 try{const r=await fetch(origin+'/robots.txt',{signal:AbortSignal.timeout(1000)});if(r.ok){ready=true;break}}catch{}
 await pause(250);
 }
 if(!ready)throw new Error('Servidor não ficou pronto em 30s');
 const {seeds,xmlSeen,xmlStats}=await expandSitemaps(origin);
 const catalog=JSON.parse(await readFile('src/data/catalogo-v2.json','utf8'));
 // Fixed public regression cases; local file contents cannot choose a network destination.
 const tier0Paths=['/questoes/etec-2025-2-q001','/questoes/etec-2025-2-q002','/questoes/etec-2025-2-q003'];
 for(const path of tier0Paths)if(!catalog.questoes.some(q=>'/questoes/'+q.slug===path&&q.tier==='tier-0-quarentena'))throw new Error('Atualize o caso de regressão Tier 0: '+path);
 const tier0=tier0Paths.map(path=>origin+path);
 for(const q of catalog.questoes.filter(q=>q.tier==='tier-0-quarentena'))if(seeds.has(origin+'/questoes/'+q.slug))throw new Error(`Tier 0 no sitemap: ${q.slug}`);
 const legacy=['/sitemaps/questoes/1.xml','/sitemaps/questoes/2.xml','/sitemap/questoes-1.xml','/sitemap-index.xml'];
 const checker=new LinkChecker(), rows=new Map(), redirected=new Set();let checked=0;
 checker.on('redirect',r=>redirected.add(r.url));
 checker.on('link',r=>{
 if(r.state==='SKIPPED')return;
 const key=r.url.split('#')[0];let row=rows.get(key);if(!row){row={url:key,status:r.status??0,sources:new Set(seeds.get(key)??[])};rows.set(key,row)}
 if(r.parent)row.sources.add(r.parent);
 if(++checked%250===0)console.log(`Linkinator: ${checked} resultados; ${rows.size} URLs internas`);
 });
 await checker.check({path:[...seeds.keys(),...tier0,origin+'/painel',...legacy.map(p=>origin+p)],recurse:true,concurrency:3,timeout:30000,retry:false,retryErrors:false,checkFragments:false,redirects:'warn',
 urlRewriteExpressions:[{pattern:/^https?:\/\/(?:www\.)?gabaru\.com\.br(?=\/|$)/,replacement:origin}],
 linksToSkip:async value=>{try{return new URL(value).origin!==origin}catch{return true}}
 });
 // Record actual first-hop status, rather than disguising redirects as final 200s.
 const redirects=[];
 for(const row of rows.values()){
 if(redirected.has(row.url)||row.url.includes('/painel')||row.url.includes('/livros/') ){
 const response=await fetch(row.url,{redirect:'manual',signal:AbortSignal.timeout(30000)});await response.body?.cancel();row.status=response.status;if(response.headers.has('location'))row.target=response.headers.get('location');
 }
 if(row.status>=300&&row.status<400)redirects.push(row);
 }
 const semantic=[];
 for(const path of legacy){const row=rows.get(origin+path),expected=path==='/sitemap-index.xml'?'/sitemap.xml':path==='/sitemaps/questoes/2.xml'?'/sitemap-questoes-1.xml':'/sitemap-questoes.xml';if(row?.status!==301||!row.target||new URL(row.target,origin).pathname!==expected)semantic.push('Alias legado sem 301 correto: '+path);}

 for(const url of tier0){const r=await fetch(url);const html=await r.text();if(r.status!==200||!/<meta\s+name="robots"\s+content="[^"]*noindex[^\"]*follow/i.test(html))semantic.push(`Tier 0 sem noindex/follow: ${url}`)}
 const auth=await fetch(origin+'/painel',{redirect:'manual'});await auth.body?.cancel();
 for(const row of rows.values())if(row.url.includes('/livros/')&&(row.status!==307||!row.target?.includes('/login')))semantic.push(`Proteção anônima do leitor inválida: ${row.url}`);
 if(auth.status!==307||!auth.headers.get('location')?.includes('/login'))semantic.push('Proteção anônima do painel inválida');
 for(const url of seeds.keys())if(!rows.has(url)||rows.get(url).status!==200)semantic.push(`URL de sitemap sem 200: ${url}`);
 const failures=[...rows.values()].filter(r=>r.status===0||r.status>=400);
 const canonical=s=>s.replaceAll(origin,'https://gabaru.com.br').replaceAll('|','%7C').replaceAll('\n',' ');
 const counts={sitemapUrls:seeds.size,sitemapOccurrences:xmlStats.occurrences,sitemapDuplicates:xmlStats.duplicates,validLastmod:xmlStats.validLastmod,sitemaps:xmlSeen.size,internalUrls:rows.size,ok:[...rows.values()].filter(r=>r.status===200).length,redirects:redirects.length,broken:failures.length,contractFailures:semantic.length,tier0Samples:tier0.length,protectedReaderSamples:[...rows.values()].filter(r=>r.url.includes('/livros/')).length,redirectStatuses:Object.fromEntries([...new Set(redirects.map(r=>r.status))].map(status=>[status,redirects.filter(r=>r.status===status).length]))};
 const report=`# Auditoria local integral de URLs\n\nExecução: ${new Date().toISOString()}. Next compilado iniciado e encerrado pelo auditor. Linkinator percorre páginas e recursos internos; links externos e fragmentos não são rastreados diretamente. Endpoints internos de PDF consultam suas fontes oficiais usando o proxy de rede do ambiente, com validação de integridade quando prevista no endpoint. Rotas protegidas são verificadas como visitante, sem simular sessão autenticada.\n\n\`\`\`json\n${JSON.stringify(counts,null,2)}\n\`\`\`\n\n${semantic.join('\n')}\n\n| URL | HTTP | Origem do link | Destino do redirecionamento |\n| --- | --- | --- | --- |\n`+[...rows.values()].sort((a,b)=>a.url.localeCompare(b.url)).map(r=>`| ${canonical(r.url)} | ${r.status} | ${[...r.sources].map(canonical).join('<br>')||'Amostra explícita'} | ${r.target?canonical(r.target):''} |`).join('\n')+'\n';
 await mkdir('docs/engenharia/v3',{recursive:true});await writeFile('docs/engenharia/v3/relatorio-urls-linker.md',report);
 await writeFile('work/linker/resultados.json',JSON.stringify({counts,failures:failures.map(r=>({...r,sources:[...r.sources]})),semantic},null,2));
 console.log(JSON.stringify(counts));
 if(failures.length||semantic.length)throw new Error('Auditoria encontrou falhas; consulte o relatório');
 }finally{
 clearInterval(cacheTimer);await housekeeping;
 try{process.kill(-server.pid,'SIGTERM')}catch{}
 await pruneRouteCache('.next/server/route-cache',Date.now());
 await writeFile('work/linker/next-server.log',log);
 }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)audit().catch(e=>{console.error(e);process.exitCode=1});

import test from 'node:test';
import assert from 'node:assert/strict';
import { localUrl, locations } from '../scripts/auditar-urls-linker.mjs';
test('remapeia somente a origem interna exata',()=>{
 assert.equal(localUrl('https://gabaru.com.br/questoes?q=a&b=1','http://127.0.0.1:3100'),'http://127.0.0.1:3100/questoes?q=a&b=1');
 assert.throws(()=>localUrl('https://gabaru.com.br.evil.test/a','http://127.0.0.1:3100'));
});
test('extrai todas as partes XML preservando parâmetros escapados',()=>{
 assert.deepEqual(locations('<loc>https://gabaru.com.br/a</loc><loc>https://gabaru.com.br/b?q=a&amp;x=2</loc>'),['https://gabaru.com.br/a','https://gabaru.com.br/b?q=a&x=2']);
});
import { expandSitemaps } from '../scripts/auditar-urls-linker.mjs';
test('expande índice e todas as partes e conserva origem XML',async()=>{
 const origin='http://127.0.0.1:3100', seen=[];
 const request=async url=>{seen.push(url);return new Response(url.endsWith('/sitemap.xml')?'<sitemapindex><loc>https://gabaru.com.br/one.xml</loc><loc>https://gabaru.com.br/two.xml</loc></sitemapindex>':`<urlset><loc>https://gabaru.com.br/${url.endsWith('one.xml')?'a':'b'}</loc></urlset>`)};
 const {seeds,xmlSeen}=await expandSitemaps(origin,request);
 assert.equal(xmlSeen.size,3);assert.equal(seeds.size,2);
 assert.deepEqual([...seeds.get(origin+'/b')],[origin+'/two.xml']);assert.equal(seen.length,3);
});
test('sitemap com status inválido interrompe cobertura em vez de ignorar',async()=>{
 await assert.rejects(expandSitemaps('http://127.0.0.1:3100',async()=>new Response('',{status:404})),/404/);
});
import { pruneRouteCache } from '../scripts/auditar-urls-linker.mjs';
import { mkdtemp, writeFile, utimes, access, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
test('limpeza do ISR preserva arquivos recentes',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'gabaru-isr-'));
 try{await writeFile(join(dir,'old.html'),'old');await writeFile(join(dir,'new.html'),'new');
 await utimes(join(dir,'old.html'),new Date(0),new Date(0));
 await pruneRouteCache(dir,Date.now()-10000);
 await assert.rejects(access(join(dir,'old.html')));await access(join(dir,'new.html'));
 }finally{await rm(dir,{recursive:true,force:true})}
});

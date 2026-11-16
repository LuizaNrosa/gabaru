import test from 'node:test';import assert from 'node:assert/strict';import {gzipSync,gunzipSync} from 'node:zlib';
import {chunks,serializeSitemap,serializeIndex} from '../src/lib/seo/sitemap-stream.ts';
test('4501 URLs viram três partes 2000/2000/501 sem perda e gzip reversível',async()=>{
 const entries=Array.from({length:4501},(_,i)=>({path:'/questoes/teste-'+i}));const groups=chunks(entries);assert.deepEqual(groups.map(g=>g.length),[2000,2000,501]);
 for(const part of groups){const xml=await serializeSitemap(part,'https://gabaru.com.br');assert.equal((xml.match(/<url>/g)??[]).length,part.length);assert.equal(gunzipSync(gzipSync(xml)).toString(),xml);}
 const index=await serializeIndex(groups.map((_,i)=>`https://gabaru.com.br/sitemaps/questoes/${i+1}.xml`));assert.equal((index.match(/<sitemap>/g)??[]).length,3);
 await assert.rejects(serializeSitemap(entries,'https://gabaru.com.br'),/2000/);
});

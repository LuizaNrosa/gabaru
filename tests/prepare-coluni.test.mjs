import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {validateExams,prepareExams} from '../scripts/prepare-coluni.mjs';
const pdf=Buffer.from('%PDF-fixture'),hash=createHash('sha256').update(pdf).digest('hex');
const fixture=()=>[{id:'2021',examUrl:'https://coluni.ufv.br/prova.pdf',answerUrl:'https://www.pse.coluni.ufv.br/gabarito.pdf',examSha256:hash,answerSha256:hash,pageCount:1,pages:[{number:1,text:''}],questions:[{number:1,page:1,pageMapped:true,answer:'ANULADA'}],answerKeyRevised:false}];
test('legados podem declarar revisão pós-recursos não comprovada',()=>assert.doesNotThrow(()=>validateExams(fixture())));
test('rejeita corrupção de catálogo antes de downloads',()=>{
 for(const mutate of [e=>e.questions[0].number=2,e=>e.questions[0].answer='E',e=>e.questions[0].page=2,e=>e.examUrl='https://coluni.ufv.br.evil.com/p.pdf',e=>e.pages=[],e=>e.examSha256='x']){
  const data=fixture();mutate(data[0]);assert.throws(()=>validateExams(data));
 }
 const data=fixture();data.push({...structuredClone(data[0]),id:'2020'});assert.throws(()=>validateExams(data),/duplicado por hash/);
});
test('cache íntegro dispensa rede, cache corrompido é substituído',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'coluni-'));
 try{
  const folder=path.join(root,'public/acervo/coluni/2021');await mkdir(folder,{recursive:true});
  await writeFile(path.join(folder,'prova.pdf'),pdf);await writeFile(path.join(folder,'gabarito.pdf'),'corrompido');
  let requests=0;await prepareExams(fixture(),{root,fetcher:async()=>{requests++;return new Response(pdf);}});
  assert.equal(requests,1);assert.deepEqual(await readFile(path.join(folder,'gabarito.pdf')),pdf);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('retry limitado a falhas transitórias; hash incorreto nunca publicado',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'coluni-'));
 try{
  let requests=0;await prepareExams(fixture(),{root,delay:async()=>{},fetcher:async()=>{requests++;return requests<=2?new Response('',{status:503}):new Response(pdf);}});
  assert.equal(requests,4);
  const badRoot=path.join(root,'bad');requests=0;
  await assert.rejects(prepareExams(fixture(),{root:badRoot,delay:async()=>{},fetcher:async()=>{requests++;return new Response('%PDF-wrong');}}));
  assert.equal(requests,2);await assert.rejects(readFile(path.join(badRoot,'public/acervo/coluni/2021/prova.pdf')));
 }finally{await rm(root,{recursive:true,force:true});}
});
test('limita a quatro downloads e não repete HTTP 404',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'coluni-'));
 try{
  let active=0,peak=0,calls=0;
  const data=Array.from({length:4},(_,i)=>{
   const e=fixture()[0],bytes=Buffer.from('%PDF-fixture-'+i);
   return {...e,id:String(2020+i),examSha256:createHash('sha256').update(bytes).digest('hex'),answerSha256:createHash('sha256').update(bytes).digest('hex'),examUrl:`https://coluni.ufv.br/${i}.pdf`,answerUrl:`https://coluni.ufv.br/${i}.pdf`};
  });
  await prepareExams(data,{root,fetcher:async url=>{
   active++;peak=Math.max(peak,active);await new Promise(r=>setTimeout(r,5));active--;
   return new Response('%PDF-fixture-'+new URL(url).pathname.slice(1,2));
  }});
  assert.equal(peak,4);
  await assert.rejects(prepareExams(fixture(),{root:path.join(root,'404'),fetcher:async()=>{calls++;return new Response('',{status:404});}}));
  assert.equal(calls,2);
 }finally{await rm(root,{recursive:true,force:true});}
});

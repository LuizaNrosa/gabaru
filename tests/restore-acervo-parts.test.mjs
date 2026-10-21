import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,readdir,rm,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {restoreParts,validateManifest} from '../scripts/restore-acervo-parts.mjs';
const bytes=Buffer.from('%PDF-1.7\nBinary\x00\xfffixture\n%%EOF','latin1');
const entry=()=>({file:'public/acervo/etec/2013-1/prova.pdf',sha256:createHash('sha256').update(bytes).digest('hex'),parts:['acervo-parts/etec/2013-1/prova.pdf.part0','acervo-parts/etec/2013-1/prova.pdf.part1']});
async function fixture(run){
 const root=await mkdtemp(path.join(tmpdir(),'acervo-parts-'));
 try{
  const e=entry();await mkdir(path.join(root,path.dirname(e.parts[0])),{recursive:true});
  await writeFile(path.join(root,e.parts[0]),bytes.subarray(0,8));
  await writeFile(path.join(root,e.parts[1]),bytes.subarray(8));
  await run(root,e);
 }finally{await rm(root,{recursive:true,force:true});}
}
test('reconstrói bytes idênticos e substitui cache corrompido atomicamente',()=>fixture(async(root,e)=>{
 const target=path.join(root,e.file);await mkdir(path.dirname(target),{recursive:true});await writeFile(target,'bad cache');
 assert.deepEqual(await restoreParts([e],{root}),{restored:1,cached:0});
 assert.deepEqual(await readFile(target),bytes);
 assert.deepEqual(await readdir(path.dirname(target)),['prova.pdf']);
}));
test('cache íntegro pula partes ausentes',()=>fixture(async(root,e)=>{
 await restoreParts([e],{root});await rm(path.join(root,'acervo-parts'),{recursive:true});
 assert.deepEqual(await restoreParts([e],{root}),{restored:0,cached:1});
}));
test('rejeita ordem, duplicatas e partes descontínuas',()=>{
 const e=entry();
 for(const parts of [[...e.parts].reverse(),[e.parts[0],e.parts[0]],[e.parts[0],e.parts[1].replace('part1','part2')],[]])assert.throws(()=>validateManifest([{...e,parts}]));
 assert.throws(()=>validateManifest([e,e]));
});
test('corrupção e ausência nunca sobrescrevem cache existente',()=>fixture(async(root,e)=>{
 const target=path.join(root,e.file);await mkdir(path.dirname(target),{recursive:true});await writeFile(target,'old');
 await writeFile(path.join(root,e.parts[1]),'corrupt');
 await assert.rejects(restoreParts([e],{root}),/divergente/);assert.equal(await readFile(target,'utf8'),'old');
 await rm(path.join(root,e.parts[1]));await assert.rejects(restoreParts([e],{root}),{code:'ENOENT'});
 assert.equal(await readFile(target,'utf8'),'old');
}));
test('hash válido de conteúdo não PDF é rejeitado',()=>fixture(async(root,e)=>{
 const notPdf=Buffer.from('HTML instead of PDF');await writeFile(path.join(root,e.parts[0]),notPdf);await writeFile(path.join(root,e.parts[1]),'');
 e.sha256=createHash('sha256').update(notPdf).digest('hex');await assert.rejects(restoreParts([e],{root}),/divergente/);
}));
test('bloqueia traversal, caminhos absolutos e fonte de outra instituição',()=>{
 for(const file of ['../escape.pdf','/public/acervo/etec/2013-1/prova.pdf','public/acervo/etec/../../prova.pdf','public/acervo/other/2013-1/prova.pdf'])assert.throws(()=>validateManifest([{...entry(),file}]));
 for(const part of ['../secret','/tmp/secret','acervo-parts/coluni/2013-1/prova.pdf.part0']){const e=entry();e.parts[0]=part;assert.throws(()=>validateManifest([e]));}
});
test('bloqueia escape por link simbólico das partes',()=>fixture(async(root,e)=>{
 const outside=await mkdtemp(path.join(tmpdir(),'outside-parts-'));
 try{await writeFile(path.join(outside,'part'),bytes.subarray(0,8));await rm(path.join(root,e.parts[0]));await symlink(path.join(outside,'part'),path.join(root,e.parts[0]));await assert.rejects(restoreParts([e],{root}),/escapa/);}
 finally{await rm(outside,{recursive:true,force:true});}
}));
test('bloqueia ancestral de destino simbólico antes de criar diretórios',()=>fixture(async(root,e)=>{
 const outside=await mkdtemp(path.join(tmpdir(),'outside-target-'));
 try{await symlink(outside,path.join(root,'public'));await assert.rejects(restoreParts([e],{root}),/escapa/);assert.deepEqual(await readdir(outside),[]);}
 finally{await rm(outside,{recursive:true,force:true});}
}));

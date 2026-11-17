import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const books=JSON.parse(fs.readFileSync('src/data/colecao-vestibulinho.json','utf8'));
const map=JSON.parse(fs.readFileSync('bibliografia-pdfs/MAPA-FONTES.json','utf8'));
test('coleção registra quatro livros, 23 capítulos únicos e exemplos estruturados',()=>{
 assert.deepEqual(books.map(b=>b.capitulos.length),[6,7,5,5]);
 assert.equal(new Set(books.map(b=>b.slug)).size,4);
 for(const b of books){assert.equal(new Set(b.capitulos.map(c=>c.slug)).size,b.capitulos.length);for(const c of b.capitulos){assert.ok(c.exemplo.passos.length>=3);assert.ok(c.topicos.length>=3);assert.ok(map.capitulos.some(m=>m.livro===b.slug&&m.capitulo===c.slug));}}
});
import os from 'node:os';
import path from 'node:path';
import { pdf } from './helpers/bibliografia-pdf.mjs';
import { ingerir, sha } from '../scripts/ingerir-bibliografia.mjs';
import { gerar } from '../scripts/gerar-capitulo-livro.mjs';
test('PDF por prefixo → trechos pertinentes, seis questões ETEC/IFs e referências; hash/licença protegidos',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'gabaru-colecao-'));
 try{
 const source=path.join(dir,'ibge-escalas.pdf');
 fs.writeFileSync(source,pdf('Razao proporcao regra de tres escalas distancia mapa velocidade tempo grandezas diretamente proporcionais unidades. O mapa em escala permite comparar distancias no terreno e no desenho.'));
 fs.writeFileSync(path.join(dir,'MAPA-FONTES.json'),JSON.stringify(map));
 const meta={arquivo:'ibge-escalas.pdf',sha256:sha(fs.readFileSync(source)),titulo:'Fonte didática de teste',autores:['Equipe de teste'],url:'https://example.org/fonte',licenca:'CC-BY-4.0',evidenciaLicenca:'https://example.org/licenca',usoComercialAutorizado:true};
 fs.writeFileSync(path.join(dir,'AUTORIZACOES.json'),JSON.stringify([meta]));
 const indice=path.join(dir,'indice.json');await ingerir(dir,indice);
 const opts={livro:'matematica-essencial-ifs-etec',capitulo:'razao-proporcao-escalas-e-regra-de-tres',indice,destino:path.join(dir,'content'),metadados:path.join(dir,'books.json'),mapa:path.join(dir,'MAPA-FONTES.json')};
 const c=gerar(opts),catalog=JSON.parse(fs.readFileSync('src/data/catalogo-v2.json'));
 assert.equal(c.status,'rascunho');assert.equal(c.questoes.length,6);assert.equal(new Set(c.questoes).size,6);
 for(const id of c.questoes)assert.ok(catalog.questoes.some(q=>q.id===id&&['etec','ifsp','ifsc'].includes(q.banca)&&q.tier!=='tier-0-quarentena'&&!q.anulada));
 assert.equal(c.bibliografia[0].sha256,meta.sha256);assert.deepEqual(c.bibliografia[0].paginas,[1]);assert.equal(c.exemplos[0].passos.length,3);
 const first=fs.readFileSync(path.join(opts.destino,opts.livro,opts.capitulo+'.json'),'utf8');gerar(opts);assert.equal(fs.readFileSync(path.join(opts.destino,opts.livro,opts.capitulo+'.json'),'utf8'),first);
 fs.appendFileSync(source,'changed');assert.throws(()=>gerar(opts),/SHA-256/);
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
import {validarFonte,selecionarExercicios} from '../scripts/gerar-capitulo-livro.mjs';
test('licença NC ou autorização ausente não libera adaptação comercial',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'gabaru-rights-'));
 try{const file=path.join(dir,'fonte.pdf');fs.writeFileSync(file,'source');const hash=sha(fs.readFileSync(file));const doc={arquivo:file,sha256:hash,bibliografia:{sha256:hash,usoComercialAutorizado:true,evidenciaLicenca:'licença da edição',licenca:'CC-BY-NC-SA-4.0'}};assert.throws(()=>validarFonte(doc),/licença/);assert.throws(()=>validarFonte({...doc,bibliografia:null}),/autorização/);}finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test('23 capítulos têm seis candidatas reais distintas; pertinência permanece sujeita à revisão',()=>{
 const catalog=JSON.parse(fs.readFileSync('src/data/catalogo-v2.json'));
 for(const b of books)for(const c of b.capitulos){const selected=selecionarExercicios(c,catalog);assert.equal(selected.length,6,c.slug);assert.equal(new Set(selected.map(r=>r.q.id)).size,6);assert.ok(selected.every(r=>r.q.tier!=='tier-0-quarentena'&&!r.q.anulada&&r.termos.length>=2));}
});
import {projectEditorialText} from '../src/lib/editorial-segments.ts';
test('fórmulas dos 23 planos e exemplos são válidas em KaTeX',()=>{
 for(const b of books)for(const c of b.capitulos)for(const text of [c.conceito,c.exemplo.enunciado,...c.exemplo.passos,c.exemplo.resposta])assert.doesNotThrow(()=>projectEditorialText(text),c.slug);
});
test('fonte mapeada sem camada de texto fica em quarentena sem bloquear as demais',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'gabaru-ocr-'));
 try{fs.writeFileSync(path.join(dir,'MAPA-FONTES.json'),JSON.stringify(map));fs.writeFileSync(path.join(dir,'ibge-scan.pdf'),pdf(' '));const docs=await ingerir(dir,path.join(dir,'indice.json'));assert.equal(docs.length,1);assert.equal(docs[0].status,'quarentena-ocr');assert.equal(docs[0].paginas.length,0);assert.deepEqual(docs[0].paginasOmitidas,[1]);}finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test('a disciplina do capítulo respeita Física, Química, Português e as áreas de Humanas',async()=>{
 const {disciplinaPrincipal}=await import('../scripts/gerar-capitulo-livro.mjs');
 assert.equal(disciplinaPrincipal('ciencias-natureza-ifs-etec','mecanica-fontes-de-energia-e-eletricidade-residencial'),'fisica');
 assert.equal(disciplinaPrincipal('ciencias-natureza-ifs-etec','materia-estados-fisicos-e-quimica-do-cotidiano'),'quimica');
 assert.equal(disciplinaPrincipal('ciencias-humanas-atualidades-etec','da-antiguidade-ao-iluminismo'),'historia');
 assert.equal(disciplinaPrincipal('ciencias-humanas-atualidades-etec','cartografia-paisagem-e-meio-fisico-brasileiro'),'geografia');
 assert.equal(disciplinaPrincipal('portugues-interpretacao-ifs-etec','semantica-e-figuras-de-linguagem'),'portugues');
});

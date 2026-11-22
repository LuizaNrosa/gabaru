// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {execFileSync} from 'node:child_process';
import {validarCapitulo} from '../scripts/lib/apostila-validar.mjs';
const indice=JSON.parse(fs.readFileSync('content/apostilas/matematica-etec/indice.json','utf8'));
test('apostila de Matemática tem os 13 capítulos, 15 fixações cada e 27 questões oficiais',()=>{
 assert.equal(indice.capitulos.length,13);
 assert.deepEqual(indice.capitulos.map(c=>c.numero),[1,2,3,4,5,6,7,8,9,10,11,12,13]);
 for(const c of indice.capitulos){assert.equal(c.fixacao,15,c.slug);assert.ok(c.questoes>=10,c.slug);assert.ok(c.objetivos.length>=4,c.slug);assert.match(c.sha256,/^[a-f0-9]{64}$/);assert.match(c.arquivo,/^\d{2}-[a-z0-9-]+\.html$/);}
 assert.equal(indice.capitulos.reduce((n,c)=>n+c.questoesEtec,0),27);
});
test('questões oficiais da ETEC só com número e link oficial (decisão de 22/11/2026)',()=>{assert.equal(indice.modoQuestoesEtec,'link');});
test('corpo pago da apostila nunca entra no Git (repositório público)',()=>{
 const versionados=execFileSync('git',['ls-files','content/apostilas'],{encoding:'utf8'}).split('\n').filter(Boolean);
 assert.deepEqual(versionados.filter(f=>!f.endsWith('indice.json')),[]);
});
test('validador recusa HTML ativo, links internos, enunciado oficial e sha diferente',()=>{
 const ok='<h1 id="titulo-capitulo">x</h1>'+['abertura','teoria','exemplos','exercicios','gabarito','fechamento'].map(i=>`<section id="${i}"></section>`).join('')+'<p>Abra o caderno oficial no link abaixo</p><a class="botao" href="https://fatweb.s3.amazonaws.com/x.pdf">x</a>';
 assert.deepEqual(validarCapitulo(ok,{questoesEtec:1}),[]);
 for(const ruim of ['<script>alert(1)</script>','<p onclick="x()">','<a href="/interno">','<iframe src="https://x">','(texto do caderno oficial)'])assert.ok(validarCapitulo(ok+ruim,{questoesEtec:1}).length,ruim);
 assert.ok(validarCapitulo(ok,{sha256:'0'.repeat(64)}).length);
});

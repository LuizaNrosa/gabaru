import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import katex from 'katex';
import {seoTitle,seoDescription} from '../src/lib/seo/metadata-contract.ts';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
test('metadados emitidos respeitam os limites inclusive com marca e entradas extremas',()=>{
 const c=read('src/data/catalogo-v2.json');const titles=['','A','ENEM','Sobre','T'.repeat(200),...c.bancas.map(b=>b.sigla+': provas por ano e questões'),...c.questoes.map(q=>`${q.banca.toUpperCase()} ${q.ano}, questão ${q.numero}: ${q.tema}`)];for(const t of titles){const title=seoTitle(t);assert.ok(title.length>=30&&title.length<=60,JSON.stringify({t,title}));}
 for(const d of ['',...c.bancas.map(b=>b.descricao??''),'a'.repeat(300)]){const v=seoDescription(d);assert.ok(v.length>=120&&v.length<=160,JSON.stringify({d,v}));}
});
test('as doze regras GEO são autossuficientes de 40–60 palavras, com exemplos e matemática válida',()=>{const geo=read('src/data/livros-geo.json');assert.equal(Object.values(geo).flat().length,12);for(const entries of Object.values(geo))for(const g of entries){const words=g.definicao.trim().split(/\s+/).length;assert.ok(words>=40&&words<=60);assert.ok(g.exemplo.passos.length>=3&&g.exemplo.resposta&&g.pegadinha);for(const text of [g.definicao,g.exemplo.enunciado,...g.exemplo.passos,g.exemplo.resposta,g.pegadinha])for(const [,math]of text.matchAll(/\$([^$]+)\$/g))assert.doesNotThrow(()=>katex.renderToString(math,{throwOnError:true}));}});
test('90 capas com paleta exclusiva, textos editáveis e geometria de carimbo preservada',()=>{const manifest=read('src/data/capas-manifesto.json');assert.equal(manifest.generated.length,90);for(const g of manifest.generated){const svg=fs.readFileSync(g.file,'utf8');assert.ok(svg.includes('<text ')&&svg.includes('font-weight="900"'));assert.ok(!/<(?:image|linearGradient|radialGradient)\b/i.test(svg));assert.ok(!/#(?:d7ee79|232323|f7f3ea)\b/i.test(svg));const colors=[...svg.matchAll(/#[a-f0-9]{6}\b/gi)].map(m=>m[0].toLowerCase());assert.ok(colors.every(c=>Object.values(manifest.palette).includes(c)));assert.ok(svg.includes('rotate(-4 28 28)'));if(g.file.includes('livro-')){assert.ok(svg.includes('rotate(-4 80 110)'));assert.ok(svg.includes(`fill="${manifest.palette.ochre}"`));}else{assert.ok(svg.includes('rotate(-9 190 100)'));}assert.ok(svg.includes('stroke-width="8"')&&svg.includes('stroke-width="2.5"'));assert.ok(svg.includes(`width="${g.width}" height="${g.height}"`));}assert.equal(read('src/data/disciplinas-capas.json').length,14);});
test('volumes planejados não ganham selos de edital validado ou conteúdo resolvido sem evidência',()=>{for(const s of read('src/data/disciplinas-capas.json')){const svg=fs.readFileSync(`public/capas/livro-${s.slug}.svg`,'utf8');assert.ok(svg.includes('PREPARAÇÃO'));assert.ok(!svg.includes('CONFERIDO')&&!svg.includes('RESOLVIDAS'));}});
test('contraste de leitura, ações e fundos da paleta editorial', () => {
 const tokens = fs.readFileSync('src/app/tokens.css', 'utf8');
 const color = name => tokens.match(new RegExp(`--color-${name}: #([a-f0-9]{6});`))[1];
 const luminance = name => color(name).match(/../g)
  .map(value => parseInt(value, 16) / 255)
  .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4)
  .reduce((total, value, i) => total + value * [.2126, .7152, .0722][i], 0);
 const contrast = (a, b) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + .05) / (dark + .05);
 };
 for (const [foreground, background, minimum] of [
  ['ink', 'paper', 7],
  ['ink-muted', 'paper', 4.5],
  ['stamp', 'paper', 4.5],
  ['stamp-ink', 'paper', 4.5],
  ['paper', 'forest', 7],
  ['ink', 'ochre', 4.5],
 ]) assert.ok(contrast(foreground, background) >= minimum, `${foreground} / ${background}`);
 for (const [name, value] of Object.entries(read('src/data/capas-manifesto.json').palette)) {
  assert.equal(value, '#' + color(name));
 }
});

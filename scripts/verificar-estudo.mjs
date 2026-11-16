import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const base=process.env.VERIFY_BASE_URL??'http://localhost:3000';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const results=[];
async function run(name,fn){await fn();results.push(name);console.log('PASS '+name);}
try {
 await run('HTML sem JavaScript contém enunciado, cinco alternativas, gabarito, comentário e MathML',async()=>{
  const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();
  await page.goto(base+'/questoes/enem-2011-d2-q141');
  assert.ok((await page.locator('main').innerText()).includes('Considere que 1 metro equivale'));
  assert.equal(await page.locator('main input[type=radio]').count(),5);
  assert.ok((await page.locator('main').textContent()).includes('11200'));
  assert.ok(await page.locator('main math').count()>0);
  const html=await (await page.request.get(base+'/questoes/enem-2011-d2-q141')).text();
  const prose=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
  assert.ok(prose.includes('A altitude de 6 000 metros corresponde'));
  await context.close();
 });
 await run('riscador, resposta imediata e progresso persistem após recarregar',async()=>{
  const context=await browser.newContext();const page=await context.newPage();await page.goto(base+'/questoes/enem-2011-d2-q138');
  await page.getByRole('button',{name:'Eliminar alternativa A da questão 138',exact:true}).click();
  assert.equal(await page.getByRole('radio',{name:/^A /}).isDisabled(),true);
  await page.getByRole('radio',{name:/^E /}).check();
  await page.reload();await page.getByRole('radio',{name:/^E /}).waitFor();
  await page.waitForFunction(()=>document.querySelector('input[type=radio][value=E]')?.checked);
  assert.equal(await page.getByRole('radio',{name:/^A /}).isDisabled(),true);
  await page.getByRole('button',{name:'Responder questão 138',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('[role=status]')?.textContent.includes('Resposta correta.'));
  assert.equal(await page.locator('.v2-solution').getAttribute('open'),'');
  await page.locator('a[href="/questoes/enem-2011-d2-q141"]').first().click();
  await page.getByRole('radio',{name:/^C /}).check();
  await page.getByRole('button',{name:'Responder questão 141',exact:true}).click();
  await page.locator('a[href="/questoes/enem-2011-d2-q138"]').first().click();
  await page.waitForFunction(()=>document.querySelector('input[type=radio][value=E]')?.checked);
  assert.equal(await page.getByRole('radio',{name:/^A /}).isDisabled(),true);
  await context.close();
 });
 await run('simulado preserva prazo, bloqueia resolução e finaliza com boletim e caderno de erros',async()=>{
  const context=await browser.newContext();const page=await context.newPage();await page.clock.install();await page.goto(base+'/questoes/enem-2011-d2-q138');
  await page.getByRole('button',{name:'Iniciar simulado de 5 min',exact:true}).click();
  assert.equal(await page.locator('.v2-solution').isVisible(),false);
  await page.getByRole('radio',{name:/^A /}).check();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('gabaru:v2:enem-2011-d2-q138')));
  assert.ok(saved.deadline>Date.now());
  await page.reload();await page.getByRole('timer').waitFor();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('gabaru:v2:enem-2011-d2-q138')).deadline),saved.deadline);
  await page.clock.fastForward(301000);
  await page.getByRole('heading',{name:'Seu desempenho'}).waitFor();
  assert.ok((await page.locator('#boletim-titulo').locator('..').innerText()).includes('1 erro'));
  assert.equal(await page.locator('.v2-solution').isVisible(),true);
  await page.getByRole('checkbox',{name:'Revisar apenas as erradas'}).check();
  assert.equal(await page.locator('article.v2-question:visible').count(),1);
  await context.close();
 });
 await run('atalhos são opcionais e respeitam campos de formulário',async()=>{
  const context=await browser.newContext();const page=await context.newPage();await page.goto(base+'/questoes/enem-2011-d2-q138');
  const article=page.locator('article.v2-question');await article.focus();await page.keyboard.press('e');assert.equal(await page.getByRole('radio',{name:/^E /}).isChecked(),false);
  await page.getByRole('checkbox',{name:/Ativar atalhos/}).check();await article.focus();await page.keyboard.press('e');assert.equal(await page.getByRole('radio',{name:/^E /}).isChecked(),true);
  await page.keyboard.press('Enter');await page.waitForFunction(()=>document.querySelector('[role=status]')?.textContent.includes('Resposta correta.'));
  await context.close();
 });
 await run('busca combina filtros, reflete URL e restaura resultados no SSR',async()=>{
  const context=await browser.newContext();const page=await context.newPage();await page.goto(base+'/questoes');
  await page.getByRole('combobox',{name:'Banca',exact:true}).selectOption('enem');await page.getByRole('combobox',{name:'Ano',exact:true}).selectOption('2011');await page.getByRole('combobox',{name:'Disciplina',exact:true}).selectOption('matematica');await page.getByRole('combobox',{name:'Assunto',exact:true}).selectOption('razao-proporcao-e-unidades');await page.getByLabel('Palavra-chave',{exact:true}).fill('pistao');
  await page.getByRole('status').filter({hasText:'1 questão encontrada'}).waitFor();
  assert.ok(page.url().includes('busca=pistao'));const shared=page.url();await page.reload();await page.getByRole('status').filter({hasText:'1 questão encontrada'}).waitFor();assert.equal(page.url(),shared);
  const disabled=await browser.newContext({javaScriptEnabled:false});const htmlPage=await disabled.newPage();await htmlPage.goto(shared);assert.equal(await htmlPage.locator('.v2-result').count(),1);assert.ok((await htmlPage.locator('meta[name=robots]').getAttribute('content')).includes('noindex'));await disabled.close();
  await context.close();
 });
 await run('limites responsivos de 320 px e ampliação de 200% preservam conteúdo',async()=>{
  const context=await browser.newContext();const page=await context.newPage();
  for(const route of ['/questoes/enem-2011-d2-q141','/banca/enem','/questoes']){await page.goto(base+route);await page.setViewportSize({width:320,height:800});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,route);await page.setViewportSize({width:1280,height:900});await page.evaluate(()=>document.documentElement.style.zoom='2');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,route+' zoom');await page.evaluate(()=>document.documentElement.style.zoom='');}
  await context.close();
 });
} finally {await browser.close();}
console.log(`${results.length} cenários funcionais passaram.`);

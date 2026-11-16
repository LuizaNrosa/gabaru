import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import htmlhint from 'htmlhint';
const { HTMLHint } = htmlhint;
import { mkdir, writeFile, readFile } from 'node:fs/promises';
const base=process.env.VERIFY_BASE_URL??'http://localhost:3000';
const output=process.env.VERIFY_OUTPUT??'work/verificacao';
const htmlRules=JSON.parse(await readFile('.htmlhintrc','utf8'));
const routes=(process.env.VERIFY_ROUTES??'/,/banca/enem,/provas/enem/enem-2011-d2,/questoes/enem-2011-d2-q138').split(',');
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const results=[];
try {
 for(const [index,route] of routes.entries()){
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await context.newPage();
  const response=await page.goto(base+route,{waitUntil:'networkidle'});const html=await response.text();
  const errors=HTMLHint.verify(html,htmlRules).map(({message,line,col,rule})=>({message,line,col,rule:rule.id}));
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  const severe=axe.violations.filter(v=>['critical','serious'].includes(v.impact));
  const headings=await page.locator('h1').count();const mains=await page.locator('main').count();
  const schemas=await page.locator('script[type="application/ld+json"]').evaluateAll(nodes=>nodes.map(n=>JSON.parse(n.textContent)));
  await page.screenshot({path:`${output}/${index}-desktop.png`,fullPage:false});
  await page.setViewportSize({width:390,height:844});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  await page.screenshot({path:`${output}/${index}-mobile.png`,fullPage:false});
  const item={route,status:response.status(),htmlhint:errors.length,axeSeriousCritical:severe.length,axeOther:axe.violations.length-severe.length,h1:headings,main:mains,mobileOverflow:overflow,schemas:schemas.length,errors,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))};
  results.push(item);await writeFile(`${output}/${index}.html`,html);console.log(JSON.stringify({...item,errors:errors.slice(0,4),violations:item.violations.slice(0,3)}));await context.close();
 }
} finally {await browser.close();}
await writeFile(`${output}/resultados.json`,JSON.stringify(results,null,2));
if(results.some(r=>r.status!==200||r.htmlhint||r.axeSeriousCritical||r.h1!==1||r.main!==1||r.mobileOverflow))process.exitCode=1;

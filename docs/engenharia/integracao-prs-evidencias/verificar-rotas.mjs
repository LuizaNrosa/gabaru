import {readFileSync,writeFileSync} from 'node:fs';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
const groups=['ifs-historicos','ifs-agentes','ifs-agentes-2','uerj-2013-2014','uerj-2015-2016'];
const routes=[...new Set(groups.flatMap(g=>JSON.parse(readFileSync('src/data/'+g+'.json')).map(e=>'/provas/'+(e.instituicao??'UERJ').toLowerCase()+'/'+e.id)))];routes.push('/provas/enem/enem-2024-d2','/materiais-gratuitos');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const context=await browser.newContext({viewport:{width:390,height:844}});const page=await context.newPage();await page.route('https://**',r=>r.abort());const results=[];
try{for(const route of routes){const r=await page.goto('http://localhost:3000'+route,{waitUntil:'domcontentloaded'});assert.equal(r.status(),200,route);await page.locator('main h1').waitFor();assert.equal(await page.locator('main h1').count(),1,route);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false,route);
const img=await page.locator('main img').first().getAttribute('src').catch(()=>null);if(img?.startsWith('/'))assert.equal((await page.request.get('http://localhost:3000'+img)).status(),200,route+' image');
const axe=await new AxeBuilder({page}).analyze();const violations=axe.violations.filter(v=>['critical','serious'].includes(v.impact));assert.deepEqual(violations.map(v=>v.id),[],route);results.push({route,status:r.status(),overflow,axeSeriousCritical:violations.length});console.log(route+' OK');}
writeFileSync('work/integracao-prs-browser.json',JSON.stringify(results,null,2)+'\n');}finally{await browser.close();}

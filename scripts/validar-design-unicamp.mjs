import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const base=process.env.DESIGN_BASE_URL || 'http://localhost:3000';
const browser=await chromium.launch({headless:true,args:['--no-sandbox'], ...(process.env.DESIGN_CHROME_PATH ? {executablePath:process.env.DESIGN_CHROME_PATH} : {})});
try {
 for (const width of [390,1440]) {
  const context=await browser.newContext({viewport:{width,height:900}});
  const page=await context.newPage();
  await page.route('**/api/v1/vestibulares/**',route=>route.abort());
  await page.goto(`${base}/provas/unicamp/2025`,{waitUntil:'domcontentloaded'});
  await page.locator('#folha').waitFor();
  if(await page.locator('html').getAttribute('lang')!=='pt-BR') throw new Error('Idioma principal deve ser pt-BR');
  const medidas=await page.locator('#folha [role="group"] label span:not(.sr-only)').evaluateAll(xs=>xs.map(x=>({width:x.getBoundingClientRect().width,height:x.getBoundingClientRect().height})));
  if(medidas.length!==4 || medidas.some(x=>x.width<44 || x.height<44)) throw new Error(`Alvos menores que 44px ou quantidade errada: ${JSON.stringify(medidas)}`);
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) throw new Error(`Transbordamento em ${width}px`);
  const result=await new AxeBuilder({page}).include('#folha').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  if(result.violations.length) throw new Error(JSON.stringify(result.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.length})),null,2));
  console.log(`${width}px: folha, idioma, alvos e axe-core OK`);await context.close();
 }
} finally {await browser.close()}

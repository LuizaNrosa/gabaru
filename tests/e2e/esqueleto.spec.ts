import {HTMLHint} from 'htmlhint';
import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
const manifest=JSON.parse(readFileSync('src/data/seo-publico.json','utf8')) as {families:{provas:{loc:string}[]}};
const fixture=process.env.V3_FIXTURE_FILE?JSON.parse(readFileSync(process.env.V3_FIXTURE_FILE,'utf8')) as {sessionCookie:string}:null;
test('filtros nuqs mantêm URL, voltar/avançar e canonical limpo',async({page,request})=>{
 await page.goto('/questoes?banca=etec');await expect(page.locator('select[name="banca"]')).toHaveValue('etec');
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://gabaru.com.br/questoes');
 await page.locator('select[name="banca"]').selectOption('ifsp');await expect(page).toHaveURL(/banca=ifsp/);
 await page.goBack();await expect(page.locator('select[name="banca"]')).toHaveValue('etec');
 await page.goto('/provas?banca=ifsp');await expect(page.getByRole('combobox',{name:'Banca da prova'})).toHaveValue('ifsp');await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://gabaru.com.br/provas');
 const bad=await request.get('/questoes?banca=INVALID&pagina=-1&foo=bar',{maxRedirects:0});expect(bad.status()).toBe(307);expect(bad.headers().location).toBe('/questoes');
});
test('esqueleto tem metadados, JSON-LD, semântica e axe sem violações sérias/críticas',async({page,context})=>{
 test.setTimeout(180000);
 const paths=['/','/sobre','/privacidade','/termos','/reembolso','/provas',manifest.families.provas[0].loc,'/questoes','/questoes/etec-2026-2-q001','/disciplina/matematica','/livros','/videoaulas'];
 if(fixture){await context.addCookies([{name:'__session',value:fixture.sessionCookie,url:'http://localhost:3000'}]);paths.push('/painel','/livros/enem-exatas-e-linguagens/funcoes-e-modelagem','/livros/matematica-essencial-ifs-etec/razao-proporcao-escalas-e-regra-de-tres');}
 for(const path of paths){const r=await page.goto(path,{waitUntil:'domcontentloaded'});expect(r?.status(),path).toBe(200);expect(HTMLHint.verify(await r!.text(),JSON.parse(readFileSync('.htmlhintrc','utf8'))),path).toEqual([]);await expect(page.locator('main')).toHaveCount(1);await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content','summary_large_image');expect(new URL((await page.locator('link[rel="canonical"]').getAttribute('href'))??'').href).toBe(new URL(path,'https://gabaru.com.br').href);const schemas=await page.locator('script[type="application/ld+json"]').allTextContents();expect(schemas.length).toBeGreaterThan(0);for(const json of schemas){const value=JSON.parse(json);expect(value['@context']).toBe('https://schema.org');for(const node of value['@graph']??[value])expect(typeof node['@type']==='string'||Array.isArray(node['@type'])).toBe(true);}const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(axe.violations.filter(v=>['serious','critical'].includes(v.impact??'')),path).toEqual([]);console.log(JSON.stringify({path,width:page.viewportSize()?.width,htmlErrors:0,seriasCriticas:0,schemas:schemas.length}));}
});
test('aliases de sitemap redirecionam e robots declara apenas o índice',async({request})=>{
 for(const path of ['/sitemaps/questoes/1.xml','/sitemap/questoes-1.xml']){const r=await request.get(path,{maxRedirects:0});expect(r.status()).toBe(301);expect(r.headers().location).toBe('/sitemap-questoes.xml');}
 const robots=await(await request.get('/robots.txt')).text();expect(robots.match(/^Sitemap:/gm)).toHaveLength(1);expect(robots).toContain('Sitemap: https://gabaru.com.br/sitemap.xml');
});

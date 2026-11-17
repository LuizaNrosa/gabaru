import {test,expect} from '@playwright/test';
import colecao from '../../src/data/colecao-vestibulinho.json';
test.use({javaScriptEnabled:false});
test('sumário público apresenta quatro livros e 23 capítulos sem JavaScript',async({page})=>{
 const response=await page.goto('/livros');expect(response?.status()).toBe(200);
 const shelf=page.locator('section[aria-labelledby="colecao-vestibulinho"]');
 await expect(shelf.locator('article')).toHaveCount(4);
 await expect(shelf.locator('article ol > li')).toHaveCount(23);
 for(const book of colecao)for(const c of book.capitulos)await expect(shelf.getByRole('link',{name:c.titulo,exact:true})).toHaveAttribute('href',`/livros/${book.slug}/${c.slug}`);
 await expect(page.locator('a[download],a[href$=".pdf"],a[href$=".epub"]')).toHaveCount(0);
});
test('23 leitores exigem sessão e não revelam o conteúdo no redirecionamento',async({request})=>{
 for(const book of colecao)for(const c of book.capitulos){const r=await request.get(`/livros/${book.slug}/${c.slug}`,{maxRedirects:0});expect(r.status()).toBe(307);expect(r.headers().location).toBe('/login');expect(await r.text()).not.toContain(c.conceito);}
});

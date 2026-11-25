// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
// Confere os campos que o Search Console cobra em "Listagens do comerciante" e "Snippets do produto".
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {produtoDigitalSchema} from '../src/lib/seo/produto-schema.mjs';
const SITE='https://gabaru.com.br';
const imagens=['1x1','4x3','16x9','capa'].map(v=>`/capas/apostila-matematica-etec-${v}.jpg`);
const base={siteUrl:SITE,url:SITE+'/apostilas/matematica-etec',nome:'Apostila',descricao:'d',imagens,precoCentavos:1500,vendaAberta:true};

test('Product tem image (crítico): URLs absolutas de arquivos que existem em public/',()=>{
 const p=produtoDigitalSchema(base);
 assert.ok(Array.isArray(p.image)&&p.image.length>=1);
 for(const u of p.image){assert.match(u,/^https:\/\/gabaru\.com\.br\/capas\/.+\.jpg$/);assert.ok(fs.existsSync('public'+u.slice(SITE.length)),u);}
});
test('imagens do produto têm 1200 px de largura e mais de 50 mil pixels',()=>{
 for(const u of imagens){
  const b=fs.readFileSync('public'+u);let i=2;let w=0,h=0;
  while(i<b.length){if(b[i]!==0xFF){i++;continue;}const m=b[i+1];if(m>=0xC0&&m<=0xC2){h=b.readUInt16BE(i+5);w=b.readUInt16BE(i+7);break;}i+=2+b.readUInt16BE(i+2);}
  assert.equal(w,1200,u);assert.ok(w*h>=50000,u);
 }
});
test('Offer tem preço, moeda, devolução de 7 dias (CDC art. 49, BR) e entrega digital imediata',()=>{
 const o=produtoDigitalSchema(base).offers;
 assert.equal(o.price,'15.00');assert.equal(o.priceCurrency,'BRL');
 const r=o.hasMerchantReturnPolicy;
 assert.equal(r.applicableCountry,'BR');assert.equal(r.returnPolicyCategory,'https://schema.org/MerchantReturnFiniteReturnWindow');assert.equal(r.merchantReturnDays,7);assert.equal(r.merchantReturnLink,SITE+'/reembolso');assert.equal(r.returnFees,'https://schema.org/FreeReturn');assert.equal(r.returnMethod,undefined);
 const s=o.shippingDetails;
 assert.equal(s.shippingRate.value,0);assert.equal(s.shippingRate.currency,'BRL');assert.equal(s.shippingDestination.addressCountry,'BR');
 assert.equal(s.deliveryTime.handlingTime.unitCode,'DAY');assert.equal(s.deliveryTime.transitTime.maxValue,0);
});
test('/reembolso continua declarando os 7 dias que o JSON-LD promete',()=>{
 assert.match(fs.readFileSync('src/app/reembolso/page.tsx','utf8'),/arrependimento de sete dias previsto no artigo 49/);
});
test('sem avaliações reais não há aggregateRating nem review (nada inventado)',()=>{
 const p=produtoDigitalSchema(base);assert.equal(p.aggregateRating,undefined);assert.equal(p.review,undefined);
 assert.equal(produtoDigitalSchema({...base,avaliacoes:{media:5,total:0}}).aggregateRating,undefined);
});
test('com a venda fechada não há Offer',()=>{assert.equal(produtoDigitalSchema({...base,vendaAberta:false}).offers,undefined);});
test('a página de venda usa o gerador e a imagem social própria',()=>{
 const s=fs.readFileSync('src/app/apostilas/matematica-etec/page.tsx','utf8');
 assert.match(s,/produtoDigitalSchema\(/);assert.match(s,/apostila-matematica-etec-og\.jpg/);assert.doesNotMatch(s,/aggregateRating|ratingValue/);
});
test('Product não usa propriedades fora do schema.org (inLanguage gerava aviso no validador)',()=>{
 assert.equal(produtoDigitalSchema(base).inLanguage,undefined);
 assert.equal(produtoDigitalSchema(base).offers.seller['@type'],'Organization');
});

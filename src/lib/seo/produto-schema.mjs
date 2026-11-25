// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
/**
 * JSON-LD de Product/Offer para produtos digitais vendidos no Gabaru.
 *
 * Regras (Google, "Merchant listing" e "Product snippet"):
 * - `image` é obrigatório: URLs absolutas, rastreáveis, da capa real do produto.
 * - `hasMerchantReturnPolicy` reflete a página /reembolso: direito de
 *   arrependimento de 7 dias (art. 49 do CDC), válido no Brasil.
 * - `shippingDetails` descreve a entrega digital: sem custo e acesso liberado
 *   na conta logo após a confirmação do Pix (0 dia de preparo e de trânsito).
 * - `aggregateRating`/`review` só entram se existirem avaliações reais
 *   coletadas no site. Hoje não existem; por isso ficam fora (são opcionais).
 */

/** Dias do direito de arrependimento (art. 49 do CDC), conforme /reembolso. */
export const DIAS_ARREPENDIMENTO = 7;

/**
 * @param {{siteUrl:string,url:string,nome:string,descricao:string,imagens:string[],
 *   precoCentavos:number,vendaAberta:boolean,avaliacoes?:{media:number,total:number}|null}} p
 */
export function produtoDigitalSchema(p){
 const abs=(u)=>u.startsWith('http')?u:p.siteUrl+u;
 const imagens=p.imagens.map(abs);
 const produto={'@type':'Product','@id':p.url+'#produto',name:p.nome,description:p.descricao,url:p.url,image:imagens,
  brand:{'@type':'Brand',name:'Gabaru'}};
 if(p.vendaAberta){
  produto.offers={'@type':'Offer',url:p.url,price:(p.precoCentavos/100).toFixed(2),priceCurrency:'BRL',
   availability:'https://schema.org/InStock',itemCondition:'https://schema.org/NewCondition',
   seller:{'@type':'Organization','@id':p.siteUrl+'/#organization',name:'Gabaru',url:p.siteUrl},
   hasMerchantReturnPolicy:{'@type':'MerchantReturnPolicy',applicableCountry:'BR',
    returnPolicyCategory:'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays:DIAS_ARREPENDIMENTO,merchantReturnLink:p.siteUrl+'/reembolso',
    // CDC art. 49, parágrafo único: valores devolvidos integralmente, sem custo ao consumidor.
    // returnMethod fica fora de propósito: as opções do Google (correio, loja, quiosque) não se aplicam a acesso digital.
    returnFees:'https://schema.org/FreeReturn'},
   shippingDetails:{'@type':'OfferShippingDetails',
    shippingRate:{'@type':'MonetaryAmount',value:0,currency:'BRL'},
    shippingDestination:{'@type':'DefinedRegion',addressCountry:'BR'},
    deliveryTime:{'@type':'ShippingDeliveryTime',
     handlingTime:{'@type':'QuantitativeValue',minValue:0,maxValue:0,unitCode:'DAY'},
     transitTime:{'@type':'QuantitativeValue',minValue:0,maxValue:0,unitCode:'DAY'}}}};
 }
 // Só com avaliações reais de compradores. Nunca preencher com valores fixos.
 if(p.avaliacoes&&p.avaliacoes.total>0){
  produto.aggregateRating={'@type':'AggregateRating',ratingValue:p.avaliacoes.media,reviewCount:p.avaliacoes.total,bestRating:5,worstRating:1};
 }
 return produto;
}

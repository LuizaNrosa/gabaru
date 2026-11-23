const fs=require('node:fs');
const manifest=JSON.parse(fs.readFileSync('src/data/seo-publico.json','utf8'));
const kind=process.env.GABARU_SITEMAP_KIND||'index';
const isIndex=kind==='index';
if(!isIndex&&!Object.hasOwn(manifest.families,kind))throw new Error('Família de sitemap inválida');
const children=Object.entries(manifest.families).flatMap(([name,entries])=>Array.from({length:Math.ceil(entries.length/2000)},(_,i)=>`${manifest.origin}/sitemap-${name}${i?'-'+i:''}.xml`));
const disallow=['/questoes/indice-busca','/painel','/painel/','/perfil','/perfil/','/login','/cadastro','/checkout','/checkout/','/api/','/*?*q=','/*?*sort=','/*?*page=','/*?*pagina=','/*?*busca=','/*?*banca=','/*?*disciplina=','/*?*assunto=','/*?*ano=','/*?*categoria=','/*?*status=','/*?*habilidade=','/*?*erros=','/*?*comentadas='];
/** @type {import('next-sitemap').IConfig} */
module.exports={
 siteUrl:'https://gabaru.com.br',generateRobotsTxt:isIndex,generateIndexSitemap:isIndex,sitemapSize:2000,autoLastmod:true,
 sitemapBaseFileName:isIndex?'sitemap':`sitemap-${kind}`,
 exclude:['/painel*','/perfil*','/login','/cadastro','/checkout*','/api/*','/questoes/*','/sitemaps/*','/sitemap*.xml'],
 // The business catalog is the sole allowlist, including dynamically rendered routes.
 transform:async()=>null,
 additionalPaths:async()=>isIndex?[]:manifest.families[kind].map(({loc,lastmod,changefreq,priority})=>({loc,lastmod,changefreq,priority})),
 robotsTxtOptions:{includeNonIndexSitemaps:false,additionalSitemaps:isIndex?children:[],policies:['*','Googlebot','Bingbot','OAI-SearchBot','ChatGPT-User','GPTBot','ClaudeBot','Claude-SearchBot','Google-Extended','PerplexityBot'].map(userAgent=>({userAgent,allow:'/',disallow})),
 // next-sitemap uses additionalSitemaps for the index too. Advertise only that index in robots.
 transformRobotsTxt:async(_config,robots)=>robots.split('\n').filter(line=>!line.startsWith('Sitemap:')).join('\n').trim()+'\n\nSitemap: https://gabaru.com.br/sitemap.xml\n'}
};

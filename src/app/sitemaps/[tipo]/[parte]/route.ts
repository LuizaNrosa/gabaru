import manifest from '@/data/seo-publico.json';
export async function GET(req:Request,{params}:{params:Promise<{tipo:string;parte:string}>}){
 const {tipo,parte}=await params;
 const match=/^([1-9]\d*)\.xml(?:\.gz)?$/.exec(parte);
 if(!match||!Object.hasOwn(manifest.families,tipo))return new Response('Parte não encontrada',{status:404});
 const family=manifest.families[tipo as keyof typeof manifest.families],number=Number(match[1]);
 if(number>Math.ceil(family.length/2000))return new Response('Parte não encontrada',{status:404});
 const path=`/sitemap-${tipo}${number>1?'-'+(number-1):''}.xml`;
 return new Response(null,{status:301,headers:{Location:path}});
}

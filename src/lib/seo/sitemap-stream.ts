import { Readable } from 'node:stream';
import { SitemapStream,SitemapIndexStream,streamToPromise,ErrorLevel } from 'sitemap';
export const MAX_SITEMAP_URLS=2000;
export type SitemapEntry={path:string;updated?:string;priority?:number};
export function chunks<T>(items:T[],size=MAX_SITEMAP_URLS):T[][]{if(!Number.isInteger(size)||size<1||size>50000)throw new Error('Limite inválido');return Array.from({length:Math.ceil(items.length/size)},(_,i)=>items.slice(i*size,(i+1)*size));}
export async function serializeSitemap(entries:SitemapEntry[],origin:string){if(entries.length>MAX_SITEMAP_URLS)throw new Error('Parte excede 2000 URLs');const stream=new SitemapStream({hostname:origin,level:ErrorLevel.THROW,xmlns:{news:false,xhtml:false,image:false,video:false}});return (await streamToPromise(Readable.from(entries.map(e=>({url:e.path,...(e.updated?{lastmod:e.updated}:{}),...(e.priority?{priority:e.priority}:{})}))).pipe(stream))).toString();}
export async function serializeIndex(urls:string[]){return (await streamToPromise(Readable.from(urls.map(url=>({url}))).pipe(new SitemapIndexStream({level:ErrorLevel.THROW})))).toString();}

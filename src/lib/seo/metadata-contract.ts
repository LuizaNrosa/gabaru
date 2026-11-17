/** Bounds apply to emitted metadata, including the brand suffix, never to visible headings. */
const compact=(value:string)=>value.replace(/\s+/g,' ').trim();
function fit(value:string,max:number){if(value.length<=max)return value;const cut=value.slice(0,max);return cut.replace(/\s+\S*$/,'').replace(/[\s:;,—–|.]+$/,'');}
export function seoTitle(value:string){let base=compact(value).replace(/\s*[·|]\s*gabaru$/i,'');if(base.length<21)base+=': provas e estudo';if(base.length<21)base+=' no Brasil';return fit(base,51)+' · GABARU';}
export function seoDescription(value:string){let text=compact(value);const additions=[' Consulte fontes e questões no Gabaru.',' Organize sua preparação e pratique com os recursos de estudo disponíveis na plataforma.'];for(const addition of additions)if(text.length<120)text+=addition;return text.length>160?fit(text,159).replace(/[.!?]+$/,'')+'.':text;}

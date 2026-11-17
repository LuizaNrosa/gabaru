export function isQuestionImagePath(value:unknown):value is string{
 if(typeof value!=='string'||value.length>512||!(value.startsWith('/questoes/')||/^\/acervo\/(?:etec|coluni|ifsc|ifsp|enem|fuvest|unesp|unicamp)\//.test(value)))return false;
 const parts=value.slice(value.startsWith('/questoes/')?'/questoes/'.length:'/acervo/'.length).split('/'),file=parts.pop()??'';
 return /^[a-zA-Z0-9_-]+\.(?:webp|png|jpe?g)$/i.test(file)&&parts.every(part=>/^[a-zA-Z0-9_-]+$/.test(part));
}

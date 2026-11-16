export function isQuestionImagePath(value:unknown):value is string{
 if(typeof value!=='string'||value.length>512||!value.startsWith('/questoes/'))return false;
 const parts=value.slice('/questoes/'.length).split('/'),file=parts.pop()??'';
 return /^[a-zA-Z0-9_-]+\.(?:webp|png|jpe?g)$/i.test(file)&&parts.every(part=>/^[a-zA-Z0-9_-]+$/.test(part));
}

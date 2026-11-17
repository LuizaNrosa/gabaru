import{mkdtempSync,writeFileSync,renameSync,rmSync}from'node:fs';import{dirname,join}from'node:path';
/** Staging exclusivo no mesmo volume; rename substitui o link de destino sem segui-lo. */
export function gravarJsonAtomico(file,value){const staging=mkdtempSync(join(dirname(file),'.resgate-'));try{const temporary=join(staging,'records.json');writeFileSync(temporary,JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o600});renameSync(temporary,file);}finally{rmSync(staging,{recursive:true,force:true});}}

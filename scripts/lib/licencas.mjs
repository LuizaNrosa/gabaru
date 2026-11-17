// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

// Lista explícita desta ordem. OR permite escolher uma alternativa autorizada;
// AND exige todas. WITH e identificadores desconhecidos exigem revisão.
const allowed=new Set(['MIT','Apache-2.0','ISC','MPL-2.0','Unlicense','0BSD','BSD-2-Clause','BSD-3-Clause','BSD-4-Clause']);
// Ampliação expressamente autorizada pelo usuário em 16/11/2026.
for(const license of ['CC0-1.0','BlueOak-1.0.0','Python-2.0','CC-BY-4.0','BSL-1.0','Zlib'])allowed.add(license);
const inherited=JSON.parse(readFileSync(new URL('./licencas-herdadas-v3.json',import.meta.url),'utf8'));
export function licenseSelection(expression){
 if(typeof expression!=='string'||!expression.trim()||expression.length>512)return null;
 const tokens=expression.match(/\(|\)|[A-Za-z0-9][A-Za-z0-9.+-]*/g)??[];
 if(tokens.length>128||tokens.join('')!==expression.replace(/\s/g,''))return null;
 let cursor=0;
 function atom(){
  const token=tokens[cursor++];
  if(token==='('){const value=or();if(tokens[cursor++]!==')')throw new Error('Parênteses inválidos');return value;}
  if(!token||['AND','OR',')'].includes(token))throw new Error('Expressão inválida');
  return allowed.has(token)?[token]:null;
 }
 function and(){let value=atom();while(tokens[cursor]==='AND'){cursor++;const other=atom();value=value&&other?[...new Set([...value,...other])]:null;}return value;}
 function or(){let value=and();while(tokens[cursor]==='OR'){cursor++;const other=and();value=value??other;}return value;}
 try{const selected=or();return cursor===tokens.length?selected:null;}catch{return null;}
}
export const approvedLicense=license=>licenseSelection(license)!==null;

export function auditLicenses(lock,{root=process.cwd(),readLicense=readFileSync}={}){
 if(!lock?.packages||typeof lock.packages!=='object'||Array.isArray(lock.packages)||!Object.keys(lock.packages).length)throw new Error('package-lock.json sem árvore packages válida');
 const packages=[];
 for(const [path,entry] of Object.entries(lock.packages??{})){
  if(!path)continue; // O projeto autoral não é uma dependência de terceiros.
  const row={path,version:entry.version,declared:entry.license??null,resolved:entry.license??null,source:'package-lock.json',dev:!!entry.dev,optional:!!entry.optional};
  // limiter@1.1.5 omite SPDX no manifesto, mas distribui a licença MIT.
  // Uma evidência de conteúdo exato evita aprovar arquivos arbitrários.
  if(!row.resolved&&path==='node_modules/limiter'&&entry.version==='1.1.5'){
   try{
    const bytes=readLicense(join(root,path,'LICENSE.txt'));
    const hash=createHash('sha256').update(bytes).digest('hex');
    if(hash===LIMITER_LICENSE_SHA256){row.resolved='MIT';row.source='node_modules/limiter/LICENSE.txt';row.sha256=hash;}
   }catch{/* Ausência de evidência permanece bloqueada. */}
  }
  row.selected=licenseSelection(row.resolved);row.approved=row.selected!==null;
  const exception=inherited.find(p=>p.path===path&&p.version===entry.version&&p.license===entry.license&&p.integrity===entry.integrity);
  if(!row.approved&&exception){row.approved=true;row.exception='Sharp/libvips herdado, autorizado explicitamente';row.baselineCommit=exception.baselineCommit;}
  packages.push(row);
 }
 return {policy:'v3-lista-explicita',checked:packages.length,approved:packages.filter(p=>p.approved).length,violations:packages.filter(p=>!p.approved),packages};
}

const LIMITER_LICENSE_SHA256='a3aebd11ea5598ef12949bf793311bf155ab7727181e3d373bd0b47813d41111';

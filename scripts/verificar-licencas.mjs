// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {auditLicenses} from './lib/licencas.mjs';

const source=readFileSync('package-lock.json','utf8');
const report=auditLicenses(JSON.parse(source));
mkdirSync('work/v3',{recursive:true});
writeFileSync('work/v3/licencas-build.json',JSON.stringify(report,null,2)+'\n');
for(const item of report.violations){
 const position=source.indexOf(JSON.stringify(item.path)+':');
 const line=source.slice(0,position).split('\n').length;
 console.error(`package-lock.json:${line}: ${item.path}@${item.version}: ${item.resolved??'licença ausente'} fora da política v3`);
}
console.log(`${report.approved}/${report.checked} dependências aprovadas; ${report.violations.length} bloqueadas.`);
if(report.violations.length)process.exitCode=1;

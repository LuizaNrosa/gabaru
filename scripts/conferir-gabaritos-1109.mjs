// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import fs from 'node:fs';import {execFileSync} from 'node:child_process';import {conferir,hash} from './lib/conferencia-oficial.mjs';
const base=JSON.parse(execFileSync('git',['show','1ae44ebe:src/data/catalogo-v2.json'],{maxBuffer:40*1024*1024}));const ids=base.questoes.filter(q=>q.motivos.length===1&&q.motivos[0]==='gabarito-sem-conferencia-documentada').map(q=>q.id).sort();if(ids.length!==1109)throw Error('Baseline divergente de 1109 IDs');
fs.mkdirSync('docs/engenharia/v3/frentes',{recursive:true});fs.writeFileSync('docs/engenharia/v3/frentes/selecao-1109.json',JSON.stringify({baseline:'1ae44ebe',sha256:hash(JSON.stringify(ids)),ids},null,2)+'\n');
await conferir(ids,{apply:process.argv.includes('--aplicar'),reportFile:'docs/engenharia/v3/frentes/conferencia-1109.json'});

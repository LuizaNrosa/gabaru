import {readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
// O teste de integração Firestore exige emulador e tem comando dedicado.
const files=readdirSync('tests').filter(f=>f.endsWith('.test.mjs')&&f!=='firestore-rules.test.mjs').sort().map(f=>'tests/'+f);
const result=spawnSync(process.execPath,['--test',...files],{stdio:'inherit'});
process.exitCode=result.status??1;

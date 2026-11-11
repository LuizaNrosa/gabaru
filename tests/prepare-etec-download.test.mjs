import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const script = fileURLToPath(new URL('../scripts/prepare-etec.mjs', import.meta.url));
const bytes = Buffer.from('%PDF-1.7\nverified-fixture');
async function run(mode) {
  const dir = await mkdtemp(join(tmpdir(), 'gabaru-download-'));
  await mkdir(join(dir, 'src/data'), { recursive: true });
  await writeFile(join(dir, 'src/data/etec-exams.json'), JSON.stringify([{
    id: 'fixture', examUrl: 'https://fatweb.s3.amazonaws.com/prova.pdf',
    answerUrl: 'https://fatweb.s3.amazonaws.com/gabarito.pdf',
    examSha256: createHash('sha256').update(bytes).digest('hex'),
    answerSha256: createHash('sha256').update(bytes).digest('hex'),
  }]));
  const hook = join(dir, 'mock.mjs');
  await writeFile(hook, `import {writeFileSync} from 'node:fs';
const bytes=Buffer.from(${JSON.stringify(bytes.toString('base64'))},'base64');
let calls=0;
globalThis.setTimeout=(callback)=>{queueMicrotask(callback);return 0;};
globalThis.fetch=async()=>{calls++;writeFileSync('calls.txt',String(calls));
if(${JSON.stringify(mode)}==='retry'&&calls===1)return new Response(null,{status:403});
return new Response(${JSON.stringify(mode)}==='corrupt'?Buffer.from('wrong bytes'):bytes);
};`);
  const result = spawnSync(process.execPath, ['--import', hook, script], { cwd: dir, encoding: 'utf8' });
  return { dir, result };
}
test('retries an access error and preserves the verified PDFs', async () => {
  const {dir,result}=await run('retry');
  try {
    assert.equal(result.status,0,result.stderr);
    assert.equal(await readFile(join(dir,'calls.txt'),'utf8'),'3');
    assert.deepEqual(await readFile(join(dir,'public/acervo/etec/fixture/prova.pdf')),bytes);
    assert.deepEqual(await readFile(join(dir,'public/acervo/etec/fixture/gabarito.pdf')),bytes);
  } finally { await rm(dir,{recursive:true,force:true}); }
});
test('fails on mismatched content without publishing an invalid PDF', async () => {
  const {dir,result}=await run('corrupt');
  try {
    assert.notEqual(result.status,0);
    assert.match(result.stderr,/integridade inválida/);
    await assert.rejects(readFile(join(dir,'public/acervo/etec/fixture/prova.pdf')));
  } finally { await rm(dir,{recursive:true,force:true}); }
});

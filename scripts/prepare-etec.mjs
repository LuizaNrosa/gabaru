import { readFile, mkdir, writeFile, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const exams = JSON.parse(await readFile('src/data/etec-exams.json', 'utf8'));
const jobs = exams.flatMap(e => [
  { id: e.id, name: 'prova', url: e.examUrl, hash: e.examSha256 },
  { id: e.id, name: 'gabarito', url: e.answerUrl, hash: e.answerSha256 },
]);
const digest = b => createHash('sha256').update(b).digest('hex');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
let complete = 0;
for (const job of jobs) {
  const dir = path.join('public', 'acervo', 'etec', job.id);
  const file = path.join(dir, job.name + '.pdf');
  try {
    if (digest(await readFile(file)) === job.hash) { complete++; continue; }
  } catch {}
  const url = new URL(job.url);
  if (url.protocol !== 'https:' || !['fatweb.s3.amazonaws.com', 'vestibulinho.etec.sp.gov.br'].includes(url.hostname))
    throw new Error('Fonte não permitida: ' + job.id);
  let bytes;
  for (let attempt = 0; attempt < 4; attempt++) {
    // The legacy archive can reject rapid parallel downloads from hosting IPs.
    if (url.hostname === 'vestibulinho.etec.sp.gov.br') await wait(1500);
    let response;
    try {
      response = await fetch(url, {
        signal: AbortSignal.timeout(45000),
        headers: {
          'User-Agent': 'Gabaru official examination archive (+https://gabaru.com.br)',
          'Referer': 'https://vestibulinho.etec.sp.gov.br/provas-gabaritos/',
        },
      });
      if (!response.ok) {
        await response.body?.cancel();
        throw new Error('HTTP ' + response.status);
      }
      bytes = Buffer.from(await response.arrayBuffer());
    } catch (error) {
      if (attempt === 3) throw new Error(`${job.id}/${job.name}: ${error.message}`);
      console.warn(`ETEC ${job.id}/${job.name}: nova tentativa após falha de acesso (${error.message}).`);
      await wait([5000, 15000, 30000][attempt]);
      continue;
    }
    if (bytes.subarray(0, 4).toString() !== '%PDF' || digest(bytes) !== job.hash)
      throw new Error(`${job.id}/${job.name}: integridade inválida`);
    break;
  }
  await mkdir(dir, { recursive: true });
  await writeFile(file + '.tmp', bytes);
  await rename(file + '.tmp', file);
  complete++;
  console.log(`ETEC ${complete}/${jobs.length}: ${job.id}/${job.name}`);
}
console.log(`ETEC: ${complete} PDFs oficiais verificados.`);

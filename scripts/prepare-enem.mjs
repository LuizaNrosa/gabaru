import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { paginateExam, readVerifiedSource } from './paginar-etec.mjs';

const exams = JSON.parse(await readFile('src/data/enem-cadernos-paginados.json', 'utf8'));
for (const exam of exams) {
  const allowedIds = [
    `enem-${exam.year}-regular-d1`,
    `enem-${exam.year}-regular-d2`,
    `enem-${exam.year}-ppl-azul-d2`,
    `enem-${exam.year}-digital-azul-d2`,
    `enem-${exam.year}-belem-azul-d2`,
    `enem-${exam.year}-reaplicacao-d2`,
    ...(exam.year === 2023 ? ['enem-2023-d2'] : []),
  ];
  if (!Number.isInteger(exam.year) || !allowedIds.includes(exam.id)) {
    throw new Error('Identificador ENEM inválido: ' + exam.id);
  }
  const directory = join('public', 'acervo', 'enem', exam.id);
  const pages = Array.from({ length: exam.pageCount }, (_, index) => {
    const number = index + 1;
    return { number, image: `/acervo/enem/${exam.id}/${String(number).padStart(2, '0')}.webp` };
  });
  const present = await Promise.all(pages.map(async page => {
    try {
      const image = await readFile(join('public', page.image));
      return image.toString('ascii', 0, 4) === 'RIFF' && image.toString('ascii', 8, 12) === 'WEBP';
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      return false;
    }
  }));
  if (present.every(Boolean)) continue;
  const source = new URL(exam.questionCopy);
  const trustedSource = ['www.curso-objetivo.br','guiadoestudante.abril.com.br'].includes(source.host) ||
    (source.host === 'www.acheprovas.com.br' &&
      /^\/arquivos\/academicas\/[a-f0-9-]{36}\/prova\.pdf$/.test(source.pathname));
  if (source.protocol !== 'https:' || !trustedSource ||
      source.username || source.password || !/^[a-f0-9]{64}$/.test(exam.questionCopySha256)) {
    throw new Error('Fonte ENEM sem cópia validada: ' + exam.id);
  }
  const cacheDir = join('.next', 'cache', 'enem-pdfs', exam.id);
  const cached = join(cacheDir, 'prova.pdf');
  if (!await readVerifiedSource(cached, cached, exam.questionCopySha256)) {
    let response;
    try {response = await fetch(source, { redirect: 'error', signal: AbortSignal.timeout(90_000) });}
    catch (error) {throw new Error(`ENEM ${exam.id}: falha no download ${source.href}: ${error.cause?.code??error.message}`,{cause:error});}
    if (!response.ok) throw new Error(`ENEM ${exam.id}: HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.toString('ascii', 0, 5) !== '%PDF-' ||
        createHash('sha256').update(bytes).digest('hex') !== exam.questionCopySha256) {
      throw new Error('Prova ENEM diverge da cópia conferida: ' + exam.id);
    }
    await mkdir(cacheDir, { recursive: true });
    await writeFile(cached + '.tmp', bytes);
    await rename(cached + '.tmp', cached);
  }
  await mkdir(directory, { recursive: true });
  await paginateExam({ ...exam, examSha256: exam.questionCopySha256, pages: pages.filter((_, index) => present[index]) }, 'enem', '');
  console.log(`${exam.id}: ${pages.length} páginas do caderno azul.`);
}

import { createCanvas } from '@napi-rs/canvas';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const pdfjs = dirname(dirname(dirname(fileURLToPath(import.meta.resolve('pdfjs-dist/legacy/build/pdf.mjs')))));
const cMapUrl = join(pdfjs, 'cmaps') + sep;
const standardFontDataUrl = join(pdfjs, 'standard_fonts') + sep;
const wasmUrl = join(pdfjs, 'wasm') + sep;

export const etecPdfCache = resolve('.next/cache/etec-pdfs');

export async function readVerifiedSource(publicPath, cachedPath, sha256) {
  for (const file of [publicPath, cachedPath]) {
    try {
      const bytes = await readFile(file);
      if (createHash('sha256').update(bytes).digest('hex') === sha256) return bytes;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return null;
}

export async function paginateExam(exam) {
  const dir = join('public', 'acervo', 'etec', exam.id);
  const examPdf = join(dir, 'prova.pdf');
  const keyPdf = join(dir, 'gabarito.pdf');
  const examCache = join(etecPdfCache, exam.id, 'prova.pdf');
  const keyCache = join(etecPdfCache, exam.id, 'gabarito.pdf');
  const bytes = await readVerifiedSource(examPdf, examCache, exam.examSha256);
  if (!bytes) throw new Error('Caderno sem PDF verificado: ' + exam.id);

  const task = getDocument({
    data: new Uint8Array(bytes),
    cMapUrl,
    standardFontDataUrl,
    wasmUrl,
    isEvalSupported: false,
    useSystemFonts: false,
  });

  try {
    const pdf = await task.promise;
    if (pdf.numPages !== exam.pageCount) throw new Error('Total de páginas divergente: ' + exam.id);
    const supplied = new Map(exam.pages.map(page => [page.number, page.image]));
    for (let number = 1; number <= pdf.numPages; number++) {
      const name = `pagina-${String(number).padStart(2, '0')}.webp`;
      const file = join(dir, name);
      if (supplied.get(number) === `/acervo/etec/${exam.id}/${name}` && await stat(file).then(s => s.size > 0, () => false)) continue;
      const page = await pdf.getPage(number);
      const original = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: 1150 / original.width });
      const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
      await page.render({ canvas, canvasContext: canvas.getContext('2d'), viewport }).promise;
      await writeFile(file + '.tmp', await canvas.encode('webp', 82));
      await rename(file + '.tmp', file);
      page.cleanup();
    }
  } finally {
    await task.destroy();
  }

  await mkdir(dirname(examCache), { recursive: true });
  for (const [file, cache] of [[examPdf, examCache], [keyPdf, keyCache]]) {
    await rename(file, cache).catch(error => {
      if (error.code !== 'ENOENT') throw error;
    });
  }
}

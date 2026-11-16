import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const catalogs = ['ifs-primeiros', 'ifs-2023', 'ifs-lote-2026', 'ifmt-2025-1', 'ifmt-2026-1', 'ifrs-2025-1', 'ifrs-2026-1', 'ifrn-2026'];
const exams = (await Promise.all(catalogs.map(async name =>
  JSON.parse(await readFile(`src/data/${name}.json`, 'utf8')),
))).flat();

for (const exam of exams) {
  if (!/^if[a-z]+-[a-z0-9-]+$/.test(exam.id)) throw new Error('Caderno inválido: ' + exam.id);
  const directory = join('public', 'acervo', exam.id);
  for (let number = 1; number <= exam.paginas; number++) {
    const page = join(directory, String(number).padStart(2, '0') + '.webp');
    if ((await readFile(page)).toString('ascii', 8, 12) !== 'WEBP') throw new Error('Página inválida: ' + page);
  }
  if (exam.gabarito && (exam.gabarito.length !== exam.total || exam.gabarito.some(answer =>
    answer !== '*' && [...answer].some(letter => !exam.alternativas.includes(letter)),
  ))) throw new Error('Gabarito inválido: ' + exam.id);
  // As imagens não substituem a proveniência documental. Preserve os PDFs
  // originais: testes de integridade e conferência dependem desses bytes.
}
console.log(`IFs: ${exams.length} cadernos publicados em páginas individuais.`);

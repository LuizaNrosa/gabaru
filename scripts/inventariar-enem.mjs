// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
// Inventário dos arquivos existentes; não certifica conteúdo nem gabaritos.
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const readJson = async path => JSON.parse(await readFile(join(root, path), 'utf8'));
const catalog = await readJson('src/data/enem-exams.json');
const indexed = new Set(catalog.map(exam => exam.id));
const folders = await readdir(join(root, 'content/enem'), { withFileTypes: true });
const orphaned = folders.filter(entry => entry.isDirectory() && !indexed.has(entry.name)).map(entry => entry.name).sort();
const exams = [];
for (const exam of catalog) {
  const data = await readJson(`content/enem/${exam.id}/dados.json`);
  const missing = [];
  for (const q of data.questoes) {
    const path = join(root, 'public/questoes', `${exam.id}-q${String(q.numero).padStart(3, '0')}.webp`);
    try { if (!(await stat(path)).isFile()) missing.push(q.numero); }
    catch (error) { if (error.code !== 'ENOENT') throw error; missing.push(q.numero); }
  }
  exams.push({ id: exam.id, ano: exam.year, dia: exam.day, descricao: exam.description,
    itens_catalogo: exam.total, itens_dados: data.questoes.length, imagens_ausentes: missing,
    fonte_oficial_especifica_registrada_no_catalogo: Boolean(exam.source || exam.sourceUrl || exam.examUrl),
    hash_pdf_registrado_no_catalogo: Boolean(exam.examSha256 || exam.sha256),
    observacao: 'Ausência de referência no catálogo não prova que a fonte ou o arquivo original não existam em outro lugar.' });
}
const result = {
  fonte_geral: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos',
  ressalva: 'Inventário de arquivos locais; não valida transcrições, gabaritos, proveniência nem completude do acervo oficial.',
  cadernos: exams.length,
  itens: exams.reduce((sum, exam) => sum + exam.itens_dados, 0),
  pastas_fora_do_catalogo: orphaned,
  exames: exams,
};
process.stdout.write(JSON.stringify(result, null, 2) + '\n');

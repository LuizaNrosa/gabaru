import { readFile } from 'node:fs/promises';
import { paginateExam } from './paginar-etec.mjs';

for (const institution of ['coluni', 'ifsc', 'ifsp']) {
  const exams = JSON.parse(await readFile(`src/data/${institution}-exams.json`, 'utf8'));
  for (const exam of exams) {
    if (!/^\d{4}(?:-\d(?:-[a-z0-9]+)?)?$/.test(exam.id)) {
      throw new Error('Identificador de caderno inválido: ' + exam.id);
    }
    await paginateExam(exam, institution);
  }
  console.log(`${institution.toUpperCase()}: ${exams.length} cadernos com páginas individuais.`);
}

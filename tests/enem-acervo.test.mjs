// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const exams = JSON.parse(await readFile(new URL('src/data/enem-exams.json', root), 'utf8'));

test('ENEM: catálogo possui identificadores únicos e seguros', () => {
  assert.ok(exams.length > 0);
  const ids = exams.map(exam => exam.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^enem-\d{4}(?:-ppl)?(?:-d[12])?$/);
});

for (const exam of exams) test(`ENEM ${exam.id}: dados e imagens das questões estão disponíveis`, async () => {
  const data = JSON.parse(await readFile(new URL(`content/enem/${exam.id}/dados.json`, root), 'utf8'));
  assert.equal(data.id, exam.id);
  assert.equal(data.ano, exam.year);
  assert.equal(data.dia, exam.day);
  assert.equal(data.total, data.questoes.length);
  assert.equal(exam.total, data.questoes.length);
  assert.equal(new Set(data.questoes.map(q => q.numero)).size, data.questoes.length);
  for (const question of data.questoes) {
    assert.ok(Number.isSafeInteger(question.numero) && question.numero > 0);
    assert.equal(typeof question.texto, 'string');
    const number = String(question.numero).padStart(3, '0');
    const image = await readFile(new URL(`public/questoes/${exam.id}-q${number}.webp`, root));
    assert.equal(image.toString('ascii', 0, 4), 'RIFF');
    assert.equal(image.toString('ascii', 8, 12), 'WEBP');
  }
});

test('ENEM: navegador e correção usam a numeração oficial nas duas línguas', async () => {
  const { enemDisplayNumber, selectEnemQuestions } = await import('../src/lib/enem-question-order.ts');
  const data = JSON.parse(await readFile(new URL('content/enem/enem-2025-d1/dados.json', root), 'utf8'));
  const wanted = Array.from({length: 90}, (_, index) => index + 1);
  for (const language of ['ingles', 'espanhol']) {
    const selected = selectEnemQuestions(data.questoes, language);
    assert.deepEqual(selected.map(enemDisplayNumber), wanted);
    assert.ok(selected.slice(0, 5).every(q => q.disciplina === language));
  }
  assert.equal(data.questoes.length, 95);
});

test('ENEM: cadernos paginados têm uma imagem por página e gabarito completo', async () => {
  const paginated = JSON.parse(await readFile(new URL('src/data/enem-cadernos-paginados.json', root), 'utf8'));
  for (const exam of paginated) {
    assert.equal(exam.total, exam.questions.length);
    assert.deepEqual(exam.numbers, exam.questions.map(q => q.numero));
    assert.equal(new Set(exam.numbers).size, exam.total);
    assert.ok(exam.questions.every(q => Number.isInteger(q.pagina) && q.pagina >= 1 &&
      q.pagina <= exam.pageCount && /^(?:[A-E]|ANULADA)$/.test(q.gabarito)));
    for (let page = 1; page <= exam.pageCount; page++) {
      const filepath = `public/acervo/enem/${exam.id}/${String(page).padStart(2,"0")}.webp`;
      const image = await readFile(new URL(filepath, root));
      assert.equal(image.toString('ascii', 8, 12), 'WEBP', filepath);
    }
  }
});

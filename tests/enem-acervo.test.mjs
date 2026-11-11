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

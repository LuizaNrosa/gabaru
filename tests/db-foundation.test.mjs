import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { runMigrations } from "../src/server/migrate.ts";
import { importEtecArchive } from "../src/server/import-etec.ts";
import { listPublicQuestions, getPublicQuestion } from "../src/server/questions-repository.ts";
import { evaluateAnswer } from "../src/server/correction-service.ts";
import { recordAttempt } from "../src/server/attempts-service.ts";
import { getStudentProgress } from "../src/server/progress-service.ts";

/**
 * Fundação da camada de dados, validada num Postgres real embutido
 * (PGlite — só testes). Prova:
 *  (a) a seleção pública nunca expõe gabarito;
 *  (b) a correção é calculada no servidor e gravada na tentativa;
 *  (c) o progresso agrega corretamente;
 *  (d) migração e importação são idempotentes.
 */

const exams = JSON.parse(
  readFileSync(new URL("../src/data/etec-exams.json", import.meta.url), "utf8"),
);
const picked = exams.filter((e) => ["2026-2", "2014-1"].includes(e.id));

const pglite = new PGlite();
const db = {
  query: async (text, params) => ({ rows: (await pglite.query(text, params)).rows }),
  exec: async (sql) => {
    await pglite.exec(sql);
  },
};

const count = async (table) =>
  Number((await db.query(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n);

before(async () => {
  await runMigrations(db);
  await runMigrations(db); // migração idempotente: segunda corrida não falha
  const result = await importEtecArchive(db, picked);
  assert.equal(result.sources, 2);
  assert.equal(result.questions, 100);
  assert.equal(result.annulled, 1); // 2014-1, questão 26
  await importEtecArchive(db, picked); // importação idempotente
});

test("migração e importação idempotentes não duplicam registos", async () => {
  assert.equal(await count("exam_sources"), 2);
  assert.equal(await count("questions"), 100);
  assert.equal(await count("question_answers"), 100);
  const src = (
    await db.query("SELECT exam_sha256, answer_sha256 FROM exam_sources WHERE id = 'etec-2026-2'")
  ).rows[0];
  const exam = exams.find((e) => e.id === "2026-2");
  assert.equal(src.exam_sha256, exam.examSha256);
  assert.equal(src.answer_sha256, exam.answerSha256);
});

test("(a) seleção pública não expõe gabarito", async () => {
  const list = await listPublicQuestions(db, { sourceId: "etec-2026-2", limit: 90 });
  assert.equal(list.length, 50);
  const publicKeys = [
    "id", "sourceId", "number", "page", "subject", "topic",
    "skill", "statement", "imageKey", "options", "contentSha256", "revision",
  ];
  for (const q of list) {
    assert.deepEqual(Object.keys(q).sort(), [...publicKeys].sort());
  }
  const payload = JSON.stringify(list);
  assert.ok(!payload.includes("answerKey") && !payload.includes("answer_key"));
  assert.ok(!payload.includes("gabarito"));

  const one = await getPublicQuestion(db, "etec-2026-2-q001");
  assert.equal(one.number, 1);
  assert.equal(one.revision, 1);
  assert.match(one.contentSha256, /^[0-9a-f]{64}$/);
});

test("(b) correção no servidor: certa, errada, anulada e inexistente", async () => {
  // 2026-2: gabarito oficial q1=C, q2=B, q3=E.
  assert.equal((await evaluateAnswer(db, "etec-2026-2-q001", "C")).correct, true);
  assert.equal((await evaluateAnswer(db, "etec-2026-2-q002", "A")).correct, false);
  const annulled = await evaluateAnswer(db, "etec-2014-1-q026", "A");
  assert.equal(annulled.answerStatus, "annulled");
  assert.equal(annulled.correct, null);
  assert.equal(await evaluateAnswer(db, "etec-2026-2-q999", "A"), null);
});

test("(b)+(c) tentativas gravam correct do servidor e o progresso agrega", async () => {
  const student = "aluno-teste-1";
  const mk = (questionId, selectedKey, elapsedMs) => ({
    id: randomUUID(),
    studentUid: student,
    questionId,
    selectedKey,
    elapsedMs,
  });

  const a1 = await recordAttempt(db, mk("etec-2026-2-q001", "C", 12000)); // certa
  const a2 = await recordAttempt(db, mk("etec-2026-2-q002", "A", 8000)); // errada (B)
  const a3 = await recordAttempt(db, mk("etec-2026-2-q003", "E", 15000)); // certa
  const a4 = await recordAttempt(db, mk("etec-2014-1-q026", "B", 5000)); // anulada
  assert.equal(a1.correct, true);
  assert.equal(a2.correct, false);
  assert.equal(a3.correct, true);
  assert.equal(a4.correct, null);
  assert.equal(a1.questionRevision, 1);
  assert.equal(a1.replayed, false);

  // O que ficou gravado na tabela é o veredito do servidor, não do cliente.
  const stored = (
    await db.query(
      "SELECT correct FROM attempts WHERE student_uid = $1 ORDER BY elapsed_ms DESC",
      [student],
    )
  ).rows.map((r) => r.correct);
  // elapsed DESC: 15000 (certa), 12000 (certa), 8000 (errada), 5000 (anulada)
  assert.deepEqual(stored, [true, true, false, null]);

  // Reenvio idempotente: mesmo id devolve o registo sem duplicar.
  const replay = await recordAttempt(db, { ...mk("etec-2026-2-q001", "C", 12000), id: a1.id });
  assert.equal(replay.replayed, true);
  assert.equal(await count("attempts"), 4);

  // Questão inexistente não grava nada.
  assert.equal(await recordAttempt(db, mk("etec-2026-2-q999", "A", 1000)), null);
  assert.equal(await count("attempts"), 4);

  const progress = await getStudentProgress(db, student);
  assert.equal(progress.totalAttempts, 4);
  assert.equal(progress.gradedAttempts, 3); // a anulada não entra no denominador
  assert.equal(progress.correctCount, 2);
  assert.equal(progress.accuracy, 2 / 3);
  assert.deepEqual(progress.bySubject, [
    { key: "nao-classificado", attempts: 4, correct: 2, accuracy: 2 / 3 },
  ]);
  assert.deepEqual(progress.byTopic, [
    { key: "nao-classificado", attempts: 4, correct: 2, accuracy: 2 / 3 },
  ]);

  const empty = await getStudentProgress(db, "aluno-sem-tentativas");
  assert.equal(empty.totalAttempts, 0);
  assert.equal(empty.accuracy, null);
  assert.deepEqual(empty.bySubject, []);
});

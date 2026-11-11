import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { runMigrations } from "../src/server/migrate.ts";
import { importEtecArchive } from "../src/server/import-etec.ts";
import { listPublicQuestions } from "../src/server/questions-repository.ts";
import { evaluateAnswer } from "../src/server/correction-service.ts";
import {
  recordAttempt,
  AttemptValidationError,
  MAX_ELAPSED_MS,
} from "../src/server/attempts-service.ts";
import { toPublicQuestion } from "../src/lib/questions-public.ts";
import { toPublicExamDetail } from "../src/lib/exam-public.ts";

/**
 * Endurecimento do back-end (auditoria 2026-11-03). Cada teste cobre uma
 * correção cujo comportamento anterior foi reproduzido antes da correção:
 *  F3 — elapsedMs acima do int4 estourava no Postgres (erro cru → 500).
 *  F4 — UUID de tentativa partilhado entre alunos violava a PK (→ 500).
 *  F8 — questões não publicadas eram corrigidas e aceitavam tentativas.
 *  Repo — limit/offset NaN ou fracionários quebravam no LIMIT (22P02).
 *  F1 — a seleção pública do ENEM devolvia o gabarito nos itens.
 *  F2 — o detalhe de edição ETEC/COLUNI devolvia o `answer` das questões.
 */

const exams = JSON.parse(
  readFileSync(new URL("../src/data/etec-exams.json", import.meta.url), "utf8"),
);

const pglite = new PGlite();
const db = {
  query: async (text, params) => ({ rows: (await pglite.query(text, params)).rows }),
  exec: async (sql) => {
    await pglite.exec(sql);
  },
};

before(async () => {
  await runMigrations(db);
  await importEtecArchive(db, exams.filter((e) => e.id === "2026-2"));
});

test("F3: elapsedMs no teto do int4 grava; acima dele é erro de validação", async () => {
  const ok = await recordAttempt(db, {
    id: randomUUID(),
    studentUid: "hardening-f3",
    questionId: "etec-2026-2-q001",
    selectedKey: "C",
    elapsedMs: MAX_ELAPSED_MS,
  });
  assert.equal(ok.elapsedMs, MAX_ELAPSED_MS);

  for (const bad of [MAX_ELAPSED_MS + 1, 3_000_000_000, -1, 1.5, Number.NaN]) {
    await assert.rejects(
      recordAttempt(db, {
        id: randomUUID(),
        studentUid: "hardening-f3",
        questionId: "etec-2026-2-q001",
        selectedKey: "C",
        elapsedMs: bad,
      }),
      AttemptValidationError,
      `elapsedMs=${bad} devia ser AttemptValidationError`,
    );
  }
});

test("F4: UUID de tentativa de outro aluno não derruba o pedido nem vaza o registo", async () => {
  const sharedId = randomUUID();
  const a = await recordAttempt(db, {
    id: sharedId,
    studentUid: "hardening-f4-A",
    questionId: "etec-2026-2-q001",
    selectedKey: "C",
    elapsedMs: 1000,
  });
  assert.equal(a.replayed, false);

  // Mesmo UUID, outro aluno: antes lançava 23505 (attempts_pkey) → 500.
  const b = await recordAttempt(db, {
    id: sharedId,
    studentUid: "hardening-f4-B",
    questionId: "etec-2026-2-q002",
    selectedKey: "B",
    elapsedMs: 1000,
  });
  assert.equal(b, null);

  const rows = (await db.query("SELECT student_uid FROM attempts WHERE id = $1", [sharedId])).rows;
  assert.deepEqual(rows.map((r) => r.student_uid), ["hardening-f4-A"]);

  // E o reenvio idempotente do próprio aluno continua a funcionar.
  const replay = await recordAttempt(db, {
    id: sharedId,
    studentUid: "hardening-f4-A",
    questionId: "etec-2026-2-q001",
    selectedKey: "C",
    elapsedMs: 1000,
  });
  assert.equal(replay.replayed, true);
});

test("F8: questão não publicada não é corrigida nem aceita tentativas", async () => {
  for (const [status, num] of [["draft", 999], ["withdrawn", 998]]) {
    const qid = `hardening-${status}-q1`;
    await db.query(
      `INSERT INTO questions (id, source_id, original_number, source_page, subject, topic, options, content_sha256, status)
       VALUES ($1, 'etec-2026-2', $3, 1, 'x', 'x', '[]', repeat('0', 64), $2)`,
      [qid, status, num],
    );
    await db.query(
      `INSERT INTO question_answers (question_id, answer_key, status) VALUES ($1, 'A', 'final')`,
      [qid],
    );
    assert.equal(await evaluateAnswer(db, qid, "A"), null, `evaluateAnswer (${status})`);
    assert.equal(
      await recordAttempt(db, {
        id: randomUUID(),
        studentUid: "hardening-f8",
        questionId: qid,
        selectedKey: "A",
        elapsedMs: 500,
      }),
      null,
      `recordAttempt (${status})`,
    );
  }
  // Sanidade: a publicada continua a corrigir.
  assert.equal((await evaluateAnswer(db, "etec-2026-2-q001", "C")).correct, true);
});

test("Repo: limit/offset NaN ou fracionários são sanitizados, não quebram", async () => {
  const padrao = await listPublicQuestions(db, { sourceId: "etec-2026-2", limit: Number.NaN });
  assert.equal(padrao.length, 30); // cai para o padrão 30

  const fracionario = await listPublicQuestions(db, { sourceId: "etec-2026-2", limit: 2.5 });
  assert.equal(fracionario.length, 2); // trunca para 2

  const offsetNaN = await listPublicQuestions(db, { sourceId: "etec-2026-2", offset: Number.NaN });
  assert.equal(offsetNaN[0].number, 1); // comporta-se como offset 0

  const offsetFrac = await listPublicQuestions(db, { sourceId: "etec-2026-2", limit: 1, offset: 3.9 });
  assert.equal(offsetFrac[0].number, 4); // trunca para 3 → quarta questão
});

test("F1: questão pública do ENEM nunca inclui o gabarito", () => {
  const interna = {
    id: "enem-2024-d1-q001",
    ano: 2024,
    dia: 1,
    numero: 1,
    disciplina: "ingles",
    subtopico: "compreensao",
    habilidade: "LC-H5",
    tema: "Cartazes",
    img: "/questoes/enem-2024-d1-q001.webp",
    w: 582,
    h: 1141,
    gabarito: "C",
  };
  const publica = toPublicQuestion(interna);
  assert.deepEqual(
    Object.keys(publica).sort(),
    ["ano", "dia", "disciplina", "h", "habilidade", "id", "img", "numero", "subtopico", "tema", "w"].sort(),
  );
  assert.ok(!JSON.stringify(publica).includes("gabarito"));
  assert.equal(interna.gabarito, "C"); // o objeto interno não é mutado
});

test("F2: detalhe público de edição não inclui `answer` nem o texto das páginas", () => {
  const exam = {
    id: "2099-1",
    title: "Prova teste",
    examSha256: "x".repeat(64),
    questions: [
      { number: 1, page: 3, pageMapped: true, answer: "B", statement: "Enunciado", options: { A: "1" } },
      { number: 2, page: 4, pageMapped: true, answer: "ANULADA" },
      { number: 3, page: 5, pageMapped: false, answer: "E" },
    ],
    pages: [
      { number: 3, image: "/p3.webp", text: "transcrição interna" },
      { number: 4, image: "/p4.webp", text: "outra" },
    ],
  };
  const detail = toPublicExamDetail(exam);
  const payload = JSON.stringify(detail);
  assert.ok(!payload.includes('"answer":'), "nenhum campo answer no payload");
  assert.ok(!payload.includes("transcrição interna"), "sem o text das páginas");

  assert.equal(detail.questions[0].annulled, false);
  assert.equal(detail.questions[1].annulled, true);
  assert.equal(detail.questions[2].annulled, false);
  assert.equal(detail.questions[0].statement, "Enunciado"); // conteúdo público preservado
  assert.deepEqual(detail.questions[0].options, { A: "1" });
  assert.equal(detail.pages[0].image, "/p3.webp");
  assert.equal(detail.title, "Prova teste");
  assert.equal(detail.examSha256, "x".repeat(64)); // proveniência continua pública

  assert.equal(exam.questions[0].answer, "B"); // entrada não é mutada
  assert.equal(exam.pages[0].text, "transcrição interna");
});

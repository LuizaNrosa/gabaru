import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { runMigrations } from "../src/server/migrate.ts";
import { importEtecArchive } from "../src/server/import-etec.ts";
import { recordAttempt, listAttempts } from "../src/server/attempts-service.ts";

/**
 * Histórico do aluno (GET /api/v1/attempts) — a página vem do serviço
 * `listAttempts`, provado aqui num Postgres embutido (PGlite):
 *  (a) ordenação por created_at DESC com JOIN de subject/topic;
 *  (b) paginação com total e nextOffset;
 *  (c) isolamento por aluno (o uid de outro aluno nunca vaza);
 *  (d) histórico vazio → página limpa (items [], nextOffset null).
 */

const exams = JSON.parse(
  readFileSync(new URL("../src/data/etec-exams.json", import.meta.url), "utf8"),
);
const picked = exams.filter((e) => e.id === "2026-2");

const pglite = new PGlite();
const db = {
  query: async (text, params) => ({ rows: (await pglite.query(text, params)).rows }),
  exec: async (sql) => {
    await pglite.exec(sql);
  },
};

const ALUNO_A = "uid-aluno-a";
const ALUNO_B = "uid-aluno-b";

async function tentativa(uid, n, letra) {
  const r = await recordAttempt(db, {
    id: randomUUID(),
    studentUid: uid,
    questionId: `etec-2026-2-q${String(n).padStart(3, "0")}`,
    selectedKey: letra,
    elapsedMs: 1000 + n,
  });
  assert.ok(r, `tentativa da questão ${n} deveria gravar`);
  return r;
}

before(async () => {
  await runMigrations(db);
  await importEtecArchive(db, picked);

  // Aluno A: 3 tentativas (questões 1, 2 e 3). Aluno B: 1 tentativa.
  await tentativa(ALUNO_A, 1, "A");
  await new Promise((r) => setTimeout(r, 5)); // created_at distinto (timestamptz)
  await tentativa(ALUNO_A, 2, "B");
  await new Promise((r) => setTimeout(r, 5));
  await tentativa(ALUNO_A, 3, "C");
  await tentativa(ALUNO_B, 1, "A");
});

test("(a) histórico vem com o mais recente primeiro e com disciplina/assunto", async () => {
  const pagina = await listAttempts(db, ALUNO_A, 20, 0);
  assert.equal(pagina.total, 3);
  assert.equal(pagina.items.length, 3);
  const numeros = pagina.items.map((i) => i.questionId);
  assert.deepEqual(numeros, [
    "etec-2026-2-q003",
    "etec-2026-2-q002",
    "etec-2026-2-q001",
  ]);
  // JOIN com questions trouxe subject/topic reais (não nulos).
  for (const item of pagina.items) {
    assert.equal(typeof item.subject, "string");
    assert.ok(item.subject.length > 0);
    assert.equal(typeof item.topic, "string");
    assert.equal(typeof item.correct, "boolean");
  }
});

test("(b) paginação: limit/offset com total e nextOffset coerentes", async () => {
  const pagina1 = await listAttempts(db, ALUNO_A, 2, 0);
  assert.equal(pagina1.items.length, 2);
  assert.equal(pagina1.total, 3);
  assert.equal(pagina1.nextOffset, 2);

  const pagina2 = await listAttempts(db, ALUNO_A, 2, 2);
  assert.equal(pagina2.items.length, 1);
  assert.equal(pagina2.nextOffset, null); // acabou
  assert.deepEqual(
    pagina2.items.map((i) => i.questionId),
    ["etec-2026-2-q001"],
  );
});

test("(c) isolamento: o histórico de A nunca inclui tentativas de B", async () => {
  const a = await listAttempts(db, ALUNO_A, 50, 0);
  const b = await listAttempts(db, ALUNO_B, 50, 0);
  assert.equal(a.total, 3);
  assert.equal(b.total, 1);
  const uids = new Set([...a.items, ...b.items].map((i) => i.questionId));
  assert.ok(uids.has("etec-2026-2-q001"));
});

test("(d) aluno sem tentativas → página limpa", async () => {
  const vazia = await listAttempts(db, "uid-ninguem", 20, 0);
  assert.deepEqual(vazia.items, []);
  assert.equal(vazia.total, 0);
  assert.equal(vazia.nextOffset, null);
});

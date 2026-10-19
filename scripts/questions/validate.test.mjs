import test from "node:test";
import assert from "node:assert/strict";
import { validateBatch } from "./validate.mjs";
const q = () => ({
  id: "etec-2025-1-q001",
  year: 2025,
  number: 1,
  institution: "etec",
  edition: "2025-1",
  booklet: "principal",
  subject: "matematica",
  topic: "proporcao",
  statement: "Exemplo sintético exclusivo para testar o validador.",
  options: [
    { key: "A", text: "1" },
    { key: "B", text: "2" },
  ],
  source: {
    examUrl: "https://example.org/prova.pdf",
    answerUrl: "https://example.org/gabarito.pdf",
    page: 2,
    sha256: "a".repeat(64),
    answerSha256: "b".repeat(64),
  },
  answer: { status: "final", key: "A" },
  rights: { status: "cleared", basis: "fixture de teste" },
  review: {
    statement: "approved",
    answer: "approved",
    reviewer: "test",
    reviewedAt: "2026-10-19",
  },
  status: "published",
});
test("aprova lote revisado", () =>
  assert.deepEqual(validateBatch({ version: 1, items: [q()] }), []));
test("bloqueia gabarito preliminar e direitos pendentes", () => {
  const x = q();
  x.answer.status = "preliminary";
  x.rights.status = "pending";
  assert.equal(validateBatch({ version: 1, items: [x] }).length, 2);
});
test("bloqueia duplicação e alternativa inexistente", () => {
  const x = q();
  x.answer.key = "Z";
  const errors = validateBatch({ version: 1, items: [x, x] });
  assert(errors.some((x) => x.includes("duplicado")));
  assert(errors.some((x) => x.includes("fora das alternativas")));
});
test("bloqueia revisão incompleta e origem ausente", () => {
  const x = q();
  delete x.source.answerSha256;
  x.review.answer = "pending";
  assert.equal(validateBatch({ version: 1, items: [x] }).length, 2);
});

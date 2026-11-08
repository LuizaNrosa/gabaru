import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CorpoTentativa,
  ConsultaHistorico,
  ConsultaQuestoes,
  mensagemDeErro,
  MAX_ELAPSED_MS,
} from "../src/lib/validation.ts";

/**
 * Esquemas de entrada das rotas (Zod) — a fronteira HTTP valida tudo aqui.
 * Estes testes provam os limites que protegem o banco: UUID, A–E, teto do
 * int4 (elapsedMs), tamanhos de string e coerção/domingo de limit/offset.
 */

const base = {
  id: "0d3f7a1e-8e2c-4c6a-9b1f-2f5a6d7c8e9a",
  questionId: "etec-2026-2-q001",
  selectedKey: "C",
  elapsedMs: 1234,
};

test("CorpoTentativa aceita um corpo válido", () => {
  const r = CorpoTentativa.safeParse(base);
  assert.equal(r.success, true);
});

test("CorpoTentativa rejeita selectedKey fora de A–E e UUID malformado", () => {
  assert.equal(CorpoTentativa.safeParse({ ...base, selectedKey: "F" }).success, false);
  assert.equal(CorpoTentativa.safeParse({ ...base, id: "nao-e-uuid" }).success, false);
  assert.equal(CorpoTentativa.safeParse({ ...base, questionId: "" }).success, false);
  assert.equal(
    CorpoTentativa.safeParse({ ...base, questionId: "x".repeat(201) }).success,
    false,
  );
});

test("CorpoTentativa aplica o teto do int4 em elapsedMs", () => {
  assert.equal(
    CorpoTentativa.safeParse({ ...base, elapsedMs: MAX_ELAPSED_MS }).success,
    true,
  );
  assert.equal(
    CorpoTentativa.safeParse({ ...base, elapsedMs: MAX_ELAPSED_MS + 1 }).success,
    false,
  );
  assert.equal(CorpoTentativa.safeParse({ ...base, elapsedMs: 1.5 }).success, false);
  assert.equal(CorpoTentativa.safeParse({ ...base, elapsedMs: -1 }).success, false);
});

test("ConsultaHistorico faz coerção e limita a página", () => {
  const ok = ConsultaHistorico.parse(Object.fromEntries(new URLSearchParams({ limit: "10", offset: "5" })));
  assert.deepEqual(ok, { limit: 10, offset: 5 });
  const padrao = ConsultaHistorico.parse({});
  assert.deepEqual(padrao, { limit: 20, offset: 0 });
  assert.equal(
    ConsultaHistorico.safeParse({ limit: "51" }).success,
    false,
  );
  assert.equal(
    ConsultaHistorico.safeParse({ limit: "abc" }).success,
    false,
  );
  assert.equal(
    ConsultaHistorico.safeParse({ offset: "-1" }).success,
    false,
  );
});

test("ConsultaHistorico rejeita chaves repetidas em searchParams multi-valor", () => {
  // Na prática a rota converte com Object.fromEntries, que mantém a última
  // ocorrência; repetir limit na URL não pode confundir o esquema.
  const sp = new URLSearchParams("limit=10&limit=abc");
  assert.equal(ConsultaHistorico.safeParse(Object.fromEntries(sp)).success, false);
});

test("ConsultaQuestoes valida ano de quatro dígitos e limit 1–90", () => {
  assert.equal(ConsultaQuestoes.safeParse({ ano: "2024" }).success, true);
  assert.equal(ConsultaQuestoes.safeParse({ ano: "24" }).success, false);
  assert.equal(ConsultaQuestoes.safeParse({ limit: "91" }).success, false);
  assert.equal(ConsultaQuestoes.safeParse({ offset: "3.5" }).success, false);
  assert.equal(ConsultaQuestoes.safeParse({ offset: "NaN" }).success, false);
});

test("mensagemDeErro produz mensagem única em pt-BR com campo", () => {
  const r = CorpoTentativa.safeParse({ ...base, selectedKey: "Z" });
  assert.equal(r.success, false);
  if (r.success) return;
  const msg = mensagemDeErro(r.error);
  assert.ok(msg.includes("selectedKey"), `mensagem sem campo: ${msg}`);
  assert.ok(msg.length < 200, "mensagem longa demais para o cliente");
});

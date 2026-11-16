import { test } from "node:test";
import assert from "node:assert/strict";
import { decidirEvento } from "../src/server/entitlements-decisao.ts";

/**
 * Decisão pura do webhook Stripe (entitlements) — sem I/O.
 * Prova o mapeamento evento → ação e a extração do uid, exatamente como
 * desenhado na auditoria de 2026-11-03.
 */

const uid = "firebase-uid-123";
const customer = "cus_ABC123";
const subscription = "sub_XYZ789";

const sessaoCheckout = {
  client_reference_id: uid,
  customer,
  subscription,
  metadata: { firebaseUid: uid },
};

test("checkout.session.completed com uid → ativar, com ids mapeados", () => {
  const d = decidirEvento("checkout.session.completed", sessaoCheckout);
  assert.equal(d.acao, "ativar");
  assert.equal(d.uid, uid);
  assert.equal(d.stripeCustomerId, customer);
  assert.equal(d.subscriptionId, subscription);
  assert.equal(d.motivo, "checkout.session.completed");
});

test("checkout.session.completed SEM uid → ignorar (nunca ativar às cegas)", () => {
  const d = decidirEvento("checkout.session.completed", { customer });
  assert.equal(d.acao, "ignorar");
  assert.equal(d.uid, null);
});

test("uid vem de metadata.firebaseUid quando client_reference_id falta", () => {
  const d = decidirEvento("checkout.session.completed", {
    customer,
    metadata: { firebaseUid: uid },
  });
  assert.equal(d.acao, "ativar");
  assert.equal(d.uid, uid);
});

test("subscription_details.metadata também resolve o uid", () => {
  const d = decidirEvento("customer.subscription.deleted", {
    customer,
    subscription_details: { metadata: { firebaseUid: uid } },
  });
  assert.equal(d.acao, "desativar");
  assert.equal(d.uid, uid);
});

test("eventos de corte → desativar", () => {
  for (const tipo of [
    "customer.subscription.deleted",
    "charge.refunded",
    "charge.dispute.created",
  ]) {
    const d = decidirEvento(tipo, { customer });
    assert.equal(d.acao, "desativar", tipo);
    assert.equal(d.stripeCustomerId, customer);
  }
});

test("invoice.payment_failed → marcar (o corte vem da subscription)", () => {
  const d = decidirEvento("invoice.payment_failed", { customer });
  assert.equal(d.acao, "marcar");
});

test("evento desconhecido → ignorar, sem lançar", () => {
  const d = decidirEvento("invoice.paid", null);
  assert.equal(d.acao, "ignorar");
  assert.equal(d.uid, null);
  assert.equal(d.stripeCustomerId, null);
});

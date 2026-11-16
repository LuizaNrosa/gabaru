/**
 * Decisão PURA de entitlements — sem I/O, sem "server-only".
 *
 * Mapeia o tipo do evento Stripe para a ação de acesso. Vive num módulo
 * separado para poder ser testada em node:test (o módulo irmão,
 * entitlements.ts, importa "server-only" e só corre no servidor).
 *
 * Regras (docs/AUDITORIA-BACKEND-2026-11-03.md, "desenho mínimo"):
 *  - ativar ........ checkout.session.completed COM uid identificável
 *  - desativar ..... subscription.deleted, charge.refunded, dispute.created
 *  - marcar ........ invoice.payment_failed (o corte vem da subscription)
 *  - ignorar ....... qualquer outro evento; ou ativação sem uid
 */

export type AcaoEntitlement = "ativar" | "desativar" | "marcar" | "ignorar";

export interface DecisaoEvento {
  acao: AcaoEntitlement;
  /** uid direto do payload (checkout), quando presente. */
  uid: string | null;
  stripeCustomerId: string | null;
  subscriptionId: string | null;
  /** evento que motivou a decisão (vira `motivo` no Firestore). */
  motivo: string;
}

/** Campos de sessão/evento que a decisão lê — só o necessário. */
export interface ObjetoEvento {
  client_reference_id?: string | null;
  customer?: string | null;
  subscription?: string | null;
  subscription_details?: { metadata?: Record<string, string> | null } | null;
  metadata?: Record<string, string> | null;
}

export function decidirEvento(
  type: string,
  objeto: ObjetoEvento | null | undefined,
): DecisaoEvento {
  const metadata = objeto?.metadata ?? objeto?.subscription_details?.metadata ?? null;
  const uidDireto =
    (typeof objeto?.client_reference_id === "string" && objeto.client_reference_id) ||
    (typeof metadata?.firebaseUid === "string" && metadata.firebaseUid) ||
    null;

  const base: DecisaoEvento = {
    acao: "ignorar",
    uid: uidDireto,
    stripeCustomerId:
      typeof objeto?.customer === "string" ? objeto.customer : null,
    subscriptionId:
      typeof objeto?.subscription === "string" ? objeto.subscription : null,
    motivo: type,
  };

  switch (type) {
    case "checkout.session.completed":
      return { ...base, acao: uidDireto ? "ativar" : "ignorar" };
    case "customer.subscription.deleted":
    case "charge.refunded":
    case "charge.dispute.created":
      return { ...base, acao: "desativar" };
    case "invoice.payment_failed":
      return { ...base, acao: "marcar" };
    default:
      return base;
  }
}

import "server-only";
import type Stripe from "stripe";
import { adminAuth, adminFirestore } from "@/lib/firebase/admin";
import type { Firestore } from "firebase-admin/firestore";
import {
  decidirEvento,
  type AcaoEntitlement,
  type DecisaoEvento,
  type ObjetoEvento,
} from "./entitlements-decisao";

export { decidirEvento };
export type { AcaoEntitlement, DecisaoEvento, ObjetoEvento };

/**
 * Entitlements — o direito de acesso pago do aluno.
 *
 * Completa o TODO deixado pela auditoria de 2026-11-03 (seção "Webhook do
 * Stripe — desenho mínimo"), seguindo as decisões anotadas lá:
 *
 *  1. Fonte da verdade: Firestore `users/{uid}.acesso` (o Admin SDK já está
 *     no servidor). O cliente NUNCA afirma o próprio acesso: a leitura que
 *     decide é `lerEntitlement()`, no servidor, pela rota /api/v1/entitlement.
 *  2. Eventos tratados (resposta 200 a todos os verificados):
 *       - checkout.session.completed ........ ativa
 *       - customer.subscription.deleted ..... desativa
 *       - charge.refunded ................... desativa
 *       - charge.dispute.created ............ desativa
 *       - invoice.payment_failed ............ marca (o acesso cai só quando
 *         o Stripe esgota as retentativas e emite subscription.deleted)
 *  3. Idempotência: `stripe_events/{event.id}` gravado ANTES do efeito, em
 *     transação — o Stripe reenvia eventos e a ordem não é garantida.
 *  4. Identidade: `client_reference_id`/`metadata.firebaseUid` (gravados
 *     pelo checkout). Em eventos de desativação, resolve por
 *     `stripe_customers/{customerId}.uid`, gravado na ativação. Sem uid
 *     resolvível → log e 200, nunca falha ruidosa.
 *  5. Custom claim `acesso` (best-effort) para leituras baratas no token.
 *
 * Falhas de configuração (FIREBASE_ADMIN_* ausente, Firestore fora) são
 * logadas e NÃO derrubam o webhook: reenvios do Stripe voltam a tentar.
 */

interface AcessoFirestore {
  ativo: boolean;
  desde?: string;
  ate?: string;
  origem: "stripe";
  stripeCustomerId?: string;
  subscriptionId?: string;
  motivo?: string;
  pagamentoFalhou?: boolean;
  atualizadoEm: string;
}

/** Mapa customerId → uid, gravado na ativação para resolver desativações. */
async function uidPorCustomer(
  fs: Firestore,
  customerId: string | null,
): Promise<string | null> {
  if (!customerId) return null;
  const snap = await fs.collection("stripe_customers").doc(customerId).get();
  if (!snap.exists) return null;
  const dados = snap.data() as { uid?: string } | undefined;
  return typeof dados?.uid === "string" ? dados.uid : null;
}

async function gravarAcesso(
  fs: Firestore,
  uid: string,
  parcial: Partial<AcessoFirestore>,
): Promise<void> {
  await fs.collection("users").doc(uid).set(
    {
      acesso: {
        origem: "stripe",
        ...parcial,
        atualizadoEm: new Date().toISOString(),
      },
    },
    { merge: true },
  );
  // Custom claim best-effort: o token do aluno passa a carregar `acesso`,
  // mas a decisão do servidor SEMPRE reconfere no Firestore.
  try {
    await adminAuth().setCustomUserClaims(uid, { acesso: Boolean(parcial.ativo) });
  } catch (err) {
    console.error("[entitlements] custom claim não aplicado:", err);
  }
}

/**
 * Aplica o evento verificado do Stripe. Nunca lança: qualquer falha de
 * I/O é logada e devolvida como ação "falhou" — o webhook responde 200
 * e o reenvio do Stripe repete (a idempotência por event.id protege).
 */
export async function aplicarEventoStripe(
  evento: Pick<Stripe.Event, "id" | "type" | "data">,
): Promise<{ acao: string; uid: string | null }> {
  let fs: Firestore;
  try {
    fs = adminFirestore();
  } catch (err) {
    console.error("[entitlements] Firestore indisponível:", err);
    return { acao: "falhou-configuracao", uid: null };
  }

  const decisao = decidirEvento(evento.type, evento.data.object as ObjetoEvento);

  // Idempotência: marcar o evento ANTES de aplicar o efeito (transação).
  try {
    const ref = fs.collection("stripe_events").doc(evento.id);
    const novo = await fs.runTransaction(async (tx) => {
      const ja = await tx.get(ref);
      if (ja.exists) return false;
      tx.set(ref, {
        type: evento.type,
        acao: decisao.acao,
        recebidoEm: new Date().toISOString(),
      });
      return true;
    });
    if (!novo) return { acao: "replay-ignorado", uid: decisao.uid };
  } catch (err) {
    console.error("[entitlements] idempotência falhou:", err);
    return { acao: "falhou-idempotencia", uid: decisao.uid };
  }

  try {
    const agora = new Date().toISOString();

    if (decisao.acao === "ativar") {
      const uid = decisao.uid!;
      if (decisao.stripeCustomerId) {
        await fs
          .collection("stripe_customers")
          .doc(decisao.stripeCustomerId)
          .set({ uid }, { merge: true });
      }
      await gravarAcesso(fs, uid, {
        ativo: true,
        desde: agora,
        stripeCustomerId: decisao.stripeCustomerId ?? undefined,
        subscriptionId: decisao.subscriptionId ?? undefined,
        motivo: decisao.motivo,
      });
      return { acao: "ativado", uid };
    }

    // Desativação / marcação: resolve o uid (direto → mapa de customers).
    const uid =
      decisao.uid ?? (await uidPorCustomer(fs, decisao.stripeCustomerId));
    if (!uid) {
      console.error(
        `[entitlements] ${evento.type} sem uid resolvível (customer=${decisao.stripeCustomerId}); nada a fazer.`,
      );
      return { acao: "sem-uid", uid: null };
    }
    if (decisao.acao === "desativar") {
      await gravarAcesso(fs, uid, { ativo: false, ate: agora, motivo: decisao.motivo });
      return { acao: "desativado", uid };
    }
    if (decisao.acao === "marcar") {
      await gravarAcesso(fs, uid, { pagamentoFalhou: true, motivo: decisao.motivo });
      return { acao: "marcado", uid };
    }
    return { acao: "ignorado", uid };
  } catch (err) {
    console.error("[entitlements] falha ao aplicar efeito:", err);
    return { acao: "falhou-efeito", uid: decisao.uid };
  }
}

export interface Entitlement {
  ativo: boolean;
  desde: string | null;
  ate: string | null;
  pagamentoFalhou: boolean;
}

/**
 * Leitura do direito de acesso, SEMPRE no servidor (fail-closed).
 * Sem Firebase Admin configurado ou sem documento → { ativo: false }.
 */
export async function lerEntitlement(uid: string): Promise<Entitlement> {
  const vazio: Entitlement = {
    ativo: false,
    desde: null,
    ate: null,
    pagamentoFalhou: false,
  };
  let fs: Firestore;
  try {
    fs = adminFirestore();
  } catch {
    return vazio; // fail-closed
  }
  try {
    const snap = await fs.collection("users").doc(uid).get();
    const acesso = (snap.data() as { acesso?: Partial<AcessoFirestore> } | undefined)
      ?.acesso;
    if (!acesso) return vazio;
    return {
      ativo: acesso.ativo === true,
      desde: acesso.desde ?? null,
      ate: acesso.ate ?? null,
      pagamentoFalhou: acesso.pagamentoFalhou === true,
    };
  } catch (err) {
    console.error("[entitlements] leitura falhou:", err);
    return vazio; // fail-closed
  }
}

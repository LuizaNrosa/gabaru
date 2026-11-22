// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import 'server-only';
import {adminDb} from '@/lib/firebase/admin';
import type {ProdutoId} from '@/lib/billing/types';
import {hasPremiumAccess} from './subscriptions';

/**
 * Compra avulsa confirmada no gateway (gravada só pelo webhook em billing_entitlements, que as
 * regras do Firestore fecham para o cliente). Assinatura premium ativa também dá acesso.
 */
export async function temProduto(uid: string, produto: ProdutoId) {
  try {
    const doc = (await (await adminDb()).collection('billing_entitlements').doc(uid).get()).data();
    const compra = doc?.produtos?.[produto];
    if (compra && typeof compra.grantedAt === 'number') return true;
  } catch {
    return false;
  }
  return hasPremiumAccess(uid);
}

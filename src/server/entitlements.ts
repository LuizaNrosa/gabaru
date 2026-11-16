// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import "server-only";
import {adminDb} from "@/lib/firebase/admin";
import {isSubscriptionActive} from "@/lib/security/subscription";
export interface Entitlement {ativo:boolean;desde:string|null;ate:string|null;pagamentoFalhou:boolean}
/** Usa a mesma assinatura validada pelo painel; nunca confia no perfil editável. */
export async function lerEntitlement(uid:string):Promise<Entitlement>{
 const vazio:Entitlement={ativo:false,desde:null,ate:null,pagamentoFalhou:false};
 try{const value=(await (await adminDb()).collection('subscriptions').doc(uid).get()).data();
 return {...vazio,ativo:isSubscriptionActive(value,Date.now()),ate:typeof value?.planExpiresAt==='number'&&Number.isFinite(value.planExpiresAt)?new Date(value.planExpiresAt).toISOString():null,pagamentoFalhou:value?.subscriptionStatus==='past_due'};
 }catch{return vazio;}
}

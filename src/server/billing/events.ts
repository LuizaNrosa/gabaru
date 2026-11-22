import type {Firestore} from 'firebase-admin/firestore';import type {BillingNotification,BillingSnapshot,BillingOrder} from '@/lib/billing/types';
export function periodEnd(start:number,days:number,months?:number){if(!months)return start+days*86400000;const d=new Date(start),day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+months);const end=new Date(d);end.setUTCMonth(end.getUTCMonth()+1);end.setUTCDate(0);d.setUTCDate(Math.min(day,end.getUTCDate()));return d.getTime();}
const grantKeyOf=(provider:string,resourceId:string)=>provider+'_'+resourceId;
/** Estado atual confirmado no gateway; não usa status ou UID do corpo recebido. */
export async function applyBillingEvent(db:Firestore,event:BillingNotification,snapshot:BillingSnapshot,collectorId:string,now=Date.now(),providerName:'mercadopago'|'pagarme'='mercadopago'){
 if(snapshot.collectorId!==collectorId||!/^[a-f0-9]{64}$/.test(snapshot.orderId))throw Error('billing-owner-mismatch');
 const eventRef=db.collection('billing_events').doc(event.eventId),orderRef=db.collection('billing_orders').doc(snapshot.orderId);
 return db.runTransaction(async tx=>{const seen=await tx.get(eventRef);if(seen.exists)return {replayed:true};const orderDoc=await tx.get(orderRef);if(!orderDoc.exists)throw Error('billing-order-not-found');const order=orderDoc.data() as BillingOrder;
 if(order.provider!==providerName||!order.resourceId)throw Error('billing-order-not-linked');
 if(order.method==='pix'&&(snapshot.kind!=='payment'||snapshot.resourceId!==order.resourceId)||order.method==='card'&&snapshot.subscriptionId!==order.resourceId)throw Error('billing-resource-mismatch');
 const ownerRef=db.collection('subscriptions').doc(order.uid),profileRef=db.collection('users').doc(order.uid);
 if(snapshot.kind==='subscription'){tx.update(orderRef,{renewalStatus:snapshot.status});tx.create(eventRef,{provider:order.provider,type:event.type,resourceId:event.resourceId,processedAt:now});return {replayed:false,accessGranted:false};}
 if(snapshot.amountCents!==order.amountCents||snapshot.currency!=='BRL')throw Error('billing-amount-mismatch');
 const paymentRef=db.collection('billing_payments').doc(providerName+'_'+snapshot.resourceId),entitlementsRef=db.collection('billing_entitlements').doc(order.uid);
 const paid=await tx.get(paymentRef),entitlements=await tx.get(entitlementsRef),owner=await tx.get(ownerRef);if(paid.exists&&paid.data()?.orderId!==order.id)throw Error('billing-payment-owner-mismatch');
 // Produto avulso (compra única): libera só o produto; nunca mexe no plano premium nem nos grants da assinatura.
 if(order.plan==='produto'){
  if(!order.produto||order.method!=='pix')throw Error('billing-product-invalid');
  const produtos:Record<string,{grantedAt:number;orderId:string;paymentId:string}>=Object.assign(Object.create(null),entitlements.data()?.produtos??{});
  const atual=produtos[order.produto];
  if(snapshot.status==='approved'){
   if(!snapshot.paidAt||!Number.isFinite(snapshot.paidAt)||snapshot.paidAt>now+300000)throw Error('billing-payment-date-invalid');
   if(!atual)produtos[order.produto]={grantedAt:now,orderId:order.id,paymentId:grantKeyOf(providerName,snapshot.resourceId)};
  }else if(['refunded','charged_back','cancelled'].includes(snapshot.status)&&atual?.paymentId===grantKeyOf(providerName,snapshot.resourceId)){delete produtos[order.produto];}
  const liberado=Boolean(produtos[order.produto]);
  tx.set(paymentRef,{orderId:order.id,uid:order.uid,status:snapshot.status,produto:order.produto,grantedAt:paid.data()?.grantedAt??(snapshot.status==='approved'?now:null),updatedAt:now});
  tx.set(entitlementsRef,{produtos},{mergeFields:['produtos']});
  tx.update(orderRef,{status:snapshot.status,updatedAt:now});tx.create(eventRef,{provider:order.provider,type:event.type,resourceId:event.resourceId,processedAt:now});
  return {replayed:false,accessGranted:liberado};
 }
 // Uma conta com Stripe ativo não é migrada ou cobrada duas vezes silenciosamente.
 if(owner.data()?.stripeCustomerId&&owner.data()?.paymentProvider!==providerName&&Number(owner.data()?.planExpiresAt)>now)throw Error('legacy-subscription-active');
 const grantKey=grantKeyOf(providerName,snapshot.resourceId);
 const grants:Record<string,number>=Object.assign(Object.create(null),entitlements.data()?.grants??{});let validUntil=Number(paid.data()?.validUntil??0);
 if(snapshot.status==='approved'){
  if(!snapshot.paidAt||!Number.isFinite(snapshot.paidAt)||snapshot.paidAt>now+300000)throw Error('billing-payment-date-invalid');
  if(!paid.data()?.grantedAt){const existing=Math.max(now,snapshot.paidAt,...Object.values(grants));validUntil=periodEnd(existing,order.days,order.months);}
  // Mesmo pagamento com outro eventId não prolonga acesso novamente.
  if(validUntil>now)grants[grantKey]=validUntil;
 }else if(['refunded','charged_back','cancelled'].includes(snapshot.status)){delete grants[grantKey];}
 for(const [id,expiry]of Object.entries(grants))if(!Number.isFinite(expiry)||expiry<=now)delete grants[id];
 const planExpiresAt=Math.max(0,...Object.values(grants)),active=planExpiresAt>now;
 tx.set(paymentRef,{orderId:order.id,uid:order.uid,status:snapshot.status,validUntil,grantedAt:paid.data()?.grantedAt??(snapshot.status==='approved'?now:null),updatedAt:now});tx.set(entitlementsRef,{grants},{mergeFields:['grants']});
 const state={plan:active?'premium':'free',subscriptionStatus:active?'active':'inactive',planExpiresAt,paymentProvider:providerName,billingOrderId:order.id,billingMethod:order.method,providerSubscriptionId:order.method==='card'?order.resourceId:null};
 tx.set(ownerRef,state,{merge:true});tx.set(profileRef,state,{merge:true});tx.update(orderRef,{status:snapshot.status,updatedAt:now});tx.create(eventRef,{provider:order.provider,type:event.type,resourceId:event.resourceId,processedAt:now});return {replayed:false,accessGranted:active};});
}

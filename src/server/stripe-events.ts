import type {Firestore} from 'firebase-admin/firestore';
type SubscriptionState={id:string;uid:string;customerId:string;status:string;expiresAt:number|null;priceId:string};
export async function applyStripeEvent(db:Firestore,event:{id:string;type:string;created:number},state?:SubscriptionState){
 const eventRef=db.collection('processed_stripe_events').doc(event.id);
 return db.runTransaction(async tx=>{
  const canonicalEventRef=db.collection('stripe_events').doc(event.id);const canonical=await tx.get(canonicalEventRef);if(canonical.exists)return {replayed:true};const processed=await tx.get(eventRef);if(processed.exists)return {replayed:true};
  if(state){const subRef=db.collection('stripe_subscriptions').doc(state.id),ownerRef=db.collection('subscriptions').doc(state.uid);const sub=await tx.get(subRef),owner=await tx.get(ownerRef);if(sub.exists&&sub.data()?.uid!==state.uid)throw Error('subscription-owner-mismatch');
   const active=['active','trialing'].includes(state.status);const previous=owner.data();
   tx.set(subRef,{...state,lastEventCreated:event.created});
   // Cancellation of an older subscription must never revoke a newer one.
   if(active||!previous?.subscriptionId||previous.subscriptionId===state.id){const profile={subscriptionId:state.id,stripeCustomerId:state.customerId,subscriptionStatus:state.status,plan:active?'premium':'free',planExpiresAt:state.expiresAt,priceId:state.priceId};tx.set(db.collection('users').doc(state.uid),profile,{merge:true});tx.set(ownerRef,{subscriptionId:state.id,stripeCustomerId:state.customerId,subscriptionStatus:state.status,plan:active?'premium':'free',planExpiresAt:state.expiresAt,priceId:state.priceId});}
  }
  tx.create(canonicalEventRef,{type:event.type,created:event.created,processedAt:Date.now()});tx.create(eventRef,{type:event.type,created:event.created,processedAt:Date.now()});return {replayed:false};
 });
}

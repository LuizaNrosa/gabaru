import {getServerEnv} from '../../../../env.mjs';
import {NextResponse} from 'next/server';import type Stripe from 'stripe';
import {getStripe} from '@/lib/stripe';import {adminDb} from '@/lib/firebase/admin';import {uidInput,readLimitedText} from '@/lib/security/input';import {applyStripeEvent} from '@/server/stripe-events';
export const runtime='nodejs';
export async function POST(req:Request){
 const signature=req.headers.get('stripe-signature'),secret=getServerEnv().STRIPE_WEBHOOK_SECRET;
 if(!signature||!secret)return NextResponse.json({error:'Assinatura exigida.'},{status:400});
 let event:Stripe.Event;try{event=getStripe().webhooks.constructEvent(await readLimitedText(req,1048576),signature,secret);}catch{return NextResponse.json({error:'Assinatura inválida.'},{status:400});}
 if(!/^evt_[a-zA-Z0-9]+$/.test(event.id))return NextResponse.json({error:'Evento inválido.'},{status:400});
 try{
  const db=await adminDb();const processed=await db.collection('processed_stripe_events').doc(event.id).get();if(processed.exists)return NextResponse.json({received:true,replayed:true});
  let subId:string|undefined,uid:string|undefined;
  if(event.type==='checkout.session.completed'||event.type==='checkout.session.async_payment_succeeded'){
   const session=event.data.object as Stripe.Checkout.Session;if(session.mode==='subscription'&&typeof session.subscription==='string'){subId=session.subscription;uid=uidInput.parse(session.client_reference_id);if(session.metadata?.firebaseUid!==uid)throw Error('owner-mismatch');}
  }else if(event.type==='customer.subscription.updated'||event.type==='customer.subscription.deleted'){
   subId=(event.data.object as Stripe.Subscription).id;uid=(await db.collection('stripe_subscriptions').doc(subId).get()).data()?.uid;
   // Out-of-order delivery before checkout: retry; never acknowledge a lost activation.
   if(!uid)throw Error('owner-not-yet-linked');
  }
  if(subId&&uid){uid=uidInput.parse(uid);if(!/^sub_[a-zA-Z0-9]+$/.test(subId))throw Error('subscription-id');const subscription=await getStripe().subscriptions.retrieve(subId);const price=getServerEnv().STRIPE_PRICE_ID;if(!price||!subscription.items.data.some(item=>item.price.id===price))throw Error('price-mismatch');
   await applyStripeEvent(db,event,{id:subId,uid,customerId:typeof subscription.customer==='string'?subscription.customer:subscription.customer.id,status:subscription.status,expiresAt:subscription.current_period_end?subscription.current_period_end*1000:null,priceId:price});
  }else await applyStripeEvent(db,event);
  return NextResponse.json({received:true});
 }catch{return NextResponse.json({error:'Evento verificado, mas não processado. Reenvio necessário.'},{status:503});}
}

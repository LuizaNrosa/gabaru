// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
export type BillingPlan='pix-30'|'pix-90'|'pix-365'|'cartao-mensal'|'cartao-anual';
export type PlanConfig={id:BillingPlan;method:'pix'|'card';amountCents:number;days:number;months?:number};
export type BillingOrder={id:string;uid:string;plan:BillingPlan;method:'pix'|'card';amountCents:number;days:number;months?:number;email:string;provider:'mercadopago'|'pagarme';resourceId?:string;status:string;checkout?:CheckoutResult;createdAt:number};
export type CheckoutResult={resourceId:string;kind:'pix'|'card';qrCode?:string;qrCodeBase64?:string;checkoutUrl?:string};
export type BillingNotification={eventId:string;type:'payment'|'subscription_preapproval'|'subscription_authorized_payment';resourceId:string};
export type BillingSnapshot={kind:'payment'|'subscription';resourceId:string;orderId:string;status:string;amountCents:number;currency:string;collectorId:string;paidAt:number|null;subscriptionId?:string};
export interface BillingProvider {readonly name:'mercadopago'|'pagarme';readonly accountId:string;createCheckout(order:BillingOrder):Promise<CheckoutResult>;verifyNotification(req:Request,body:unknown,now?:number):BillingNotification;getSnapshot(event:BillingNotification):Promise<BillingSnapshot>;cancel(subscriptionId:string,idempotencyKey:string):Promise<void>;}

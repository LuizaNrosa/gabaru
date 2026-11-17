import {NextResponse} from 'next/server';
import {verifyRequestUser} from '@/lib/firebase/admin';
import {origemPermitida} from '@/lib/seguranca';
import {checkoutInput,readJsonBody} from '@/lib/security/input';
import {getStripe} from '@/lib/stripe';
import {ORIGIN} from '@/lib/seo/schema-graph';
export const runtime='nodejs';
export async function POST(req:Request){
 if(!origemPermitida(req))return NextResponse.json({error:'Origem não permitida.'},{status:403});
 const user=await verifyRequestUser(req);if(!user)return NextResponse.json({error:'Não autenticado.'},{status:401});
 let input;try{input=checkoutInput.parse(await readJsonBody(req));}catch{return NextResponse.json({error:'Informe plano premium e requestId válido. Preços não são aceitos.'},{status:400});}
 if(process.env.BILLING_ENABLED==='1')return NextResponse.json({error:'Use os meios de pagamento atuais na página de planos.'},{status:409});
 const price=process.env.STRIPE_PRICE_ID;
 if(process.env.STRIPE_CHECKOUT_ENABLED!=='1'||!price||!process.env.STRIPE_WEBHOOK_SECRET)return NextResponse.json({error:'Assinatura ainda indisponível.'},{status:503});
 try{const session=await getStripe().checkout.sessions.create({mode:'subscription',client_reference_id:user.uid,metadata:{firebaseUid:user.uid},subscription_data:{metadata:{firebaseUid:user.uid}},line_items:[{price,quantity:1}],success_url:ORIGIN+'/painel?checkout=recebido',cancel_url:ORIGIN+'/planos',...(user.email?{customer_email:user.email}:{})},{idempotencyKey:`checkout:${user.uid}:${input.requestId}`});return NextResponse.json({url:session.url},{headers:{'Cache-Control':'no-store'}});}catch{return NextResponse.json({error:'Não foi possível iniciar a assinatura. Tente novamente.'},{status:503});}
}

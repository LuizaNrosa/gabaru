// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import {getServerEnv} from '../../../../env.mjs';
import {NextResponse} from 'next/server';
import {createHash} from 'node:crypto';
import {verifyRequestUser,adminDb} from '@/lib/firebase/admin';
import {origemPermitida} from '@/lib/seguranca';
import {readJsonBody} from '@/lib/security/input';
import {getBillingProvider} from '@/lib/billing/provider';
import {compraSchema,produtos} from '@/lib/loja/produtos';
import type {BillingOrder} from '@/lib/billing/types';
export const runtime='nodejs';

/** Compra única por Pix. Preço, descrição e produto vêm do catálogo do servidor; o corpo só escolhe o id. */
export async function POST(req:Request){
 if(!origemPermitida(req))return NextResponse.json({error:'Origem não permitida.'},{status:403});
 const user=await verifyRequestUser(req);if(!user)return NextResponse.json({error:'Entre na sua conta.'},{status:401});
 let input;try{input=compraSchema.parse(await readJsonBody(req));}catch{return NextResponse.json({error:'Produto ou identificação inválidos. Preço não é aceito do navegador.'},{status:400});}
 if(!user.email)return NextResponse.json({error:'Sua conta precisa de um e-mail.'},{status:400});
 try{
  if(getServerEnv().LOJA_ENABLED!=='1')throw Error('loja-indisponivel');
  const produto=produtos[input.produto],provider=getBillingProvider(),db=await adminDb();
  const id=createHash('sha256').update(user.uid+':produto:'+input.requestId).digest('hex'),ref=db.collection('billing_orders').doc(id);
  const ja=(await db.collection('billing_entitlements').doc(user.uid).get()).data()?.produtos?.[produto.id];
  if(ja)return NextResponse.json({comprado:true},{headers:{'Cache-Control':'no-store'}});
  const order=await db.runTransaction(async tx=>{const previous=await tx.get(ref);if(previous.exists){const old=previous.data() as BillingOrder;if(old.uid!==user.uid||old.produto!==produto.id||old.amountCents!==produto.precoCentavos)throw Error('checkout-conflict');return old;}
   const value:BillingOrder={id,uid:user.uid,plan:'produto',produto:produto.id,descricao:produto.descricaoPix,method:'pix',amountCents:produto.precoCentavos,days:0,email:user.email!,provider:provider.name,status:'creating',createdAt:Date.now()};tx.create(ref,value);return value;});
  if(order.checkout)return NextResponse.json(order.checkout,{headers:{'Cache-Control':'no-store'}});
  const checkout=await provider.createCheckout(order);await ref.set({resourceId:checkout.resourceId,checkout,status:'pending'},{merge:true});
  return NextResponse.json(checkout,{headers:{'Cache-Control':'no-store'}});
 }catch(e){const conflict=e instanceof Error&&e.message==='checkout-conflict';const off=e instanceof Error&&e.message==='loja-indisponivel';
  return NextResponse.json({error:conflict?'Este pedido conflita com um pedido existente.':off?'A venda ainda não foi aberta.':'Não foi possível iniciar o pagamento. Tente novamente.'},{status:conflict?409:503});}
}

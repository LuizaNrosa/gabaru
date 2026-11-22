// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import {NextResponse} from 'next/server';
import {verifyRequestUser} from '@/lib/firebase/admin';
import {produtos} from '@/lib/loja/produtos';
import {temProduto} from '@/server/produtos';
import type {ProdutoId} from '@/lib/billing/types';

/** O navegador consulta depois de pagar o Pix; a liberação em si só acontece no webhook. */
export async function GET(req:Request){
 const user=await verifyRequestUser(req);if(!user)return NextResponse.json({error:'Entre na sua conta.'},{status:401});
 const id=new URL(req.url).searchParams.get('produto');
 if(!id||!Object.hasOwn(produtos,id))return NextResponse.json({error:'Produto inválido.'},{status:400});
 return NextResponse.json({comprado:await temProduto(user.uid,id as ProdutoId)},{headers:{'Cache-Control':'no-store'}});
}

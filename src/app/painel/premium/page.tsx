import {billingEnabled} from '@/lib/billing/config';
import {BillingAccount} from '@/components/billing-account';
import {cookies} from 'next/headers';import {redirect} from 'next/navigation';import {verifySessionCookie} from '@/lib/firebase/admin';
import {hasPremiumAccess} from '@/server/subscriptions';
export default async function Page(){const cookie=(await cookies()).get('__session')?.value,user=cookie?await verifySessionCookie(cookie):null;if(!user)redirect('/login');if(!billingEnabled)redirect('/painel');const active=await hasPremiumAccess(user.uid);if(!active)redirect('/planos');return <main id="conteudo-principal" className="gb-container v2-page"><h1 className="gb-page-title">Sua assinatura</h1><p>Assinatura ativa e conferida no servidor. As provas públicas e o seu progresso continuam disponíveis na área de estudo.</p><BillingAccount/></main>;}

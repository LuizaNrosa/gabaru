// © 2026 Luiza Nascimento Rosa. Todos os direitos reservados.
import 'server-only';
import {cookies} from 'next/headers';import {redirect} from 'next/navigation';
import {verifySessionCookie} from '@/lib/firebase/admin';import {hasPremiumAccess} from '@/server/subscriptions';
export async function exigirAssinatura(){const value=(await cookies()).get('__session')?.value;const user=value?await verifySessionCookie(value):null;if(!user)redirect('/login');if(!await hasPremiumAccess(user.uid))redirect('/planos');return user;}
